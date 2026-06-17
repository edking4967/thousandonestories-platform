"""
post_daily.py — manage the draft queue and publish one story per day.

MODES
─────
  python3 post_daily.py --import   Fetch all public posts from both WP.com
                                    sites and store them as drafts in the DB.
                                    Run this once (or again to pick up new posts).

  python3 post_daily.py            Publish the next draft, alternating between
                                    oldthous (og-*) and coffeebreakreads (cbr-*).
                                    Run this daily via cron.

  python3 post_daily.py --dry-run  Show what would be published without writing.

  python3 post_daily.py --list     List the full draft queue.

CRON
────
  0 9 * * * cd /path/to/thousandone-claude/backend && python3 post_daily.py >> post_daily.log 2>&1
"""

import argparse
import json
import os
import re
import sqlite3
from datetime import date
from html.parser import HTMLParser
from urllib.request import urlopen, Request
from urllib.error import URLError

# ── Config ─────────────────────────────────────────────────────────────────────

WPCOM_API = "https://public-api.wordpress.com/rest/v1.1/sites"

SOURCES = [
    {
        "site":      "thousandonestories.com",
        "community": "thousandone-classic",
        "prefix":    "og",
    },
    {
        "site":      "coffeebreakreads.com",
        "community": "coffeebreakreads",
        "prefix":    "cbr",
    },
]

DB_PATH    = os.path.join(os.path.dirname(__file__), "thousandone.db")
STATE_PATH = os.path.join(os.path.dirname(__file__), "post_daily_state.json")

# Local image directory (relative to this script)
LOCAL_IMAGE_DIR = os.path.join(
    os.path.dirname(__file__), "..", "frontend", "public", "images", "og"
)
IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"]

# WP categories that are administrative, not genre tags
SKIP_WP_CATS = {
    "stories", "stories-paid", "stories-triggerwarning",
    "blog", "news", "promotion", "outside-works", "outside works",
    "uncategorized",
}


# ── HTML stripping ─────────────────────────────────────────────────────────────

BLOCK_TAGS = {"p", "div", "br", "h1", "h2", "h3", "h4", "h5", "h6",
              "li", "blockquote", "hr"}

class _Stripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() in BLOCK_TAGS:
            self.parts.append("\n\n")

    def handle_endtag(self, tag):
        if tag.lower() in BLOCK_TAGS:
            self.parts.append("\n\n")

    def handle_data(self, data):
        self.parts.append(data)

    def get_text(self):
        return re.sub(r"\n{3,}", "\n\n", "".join(self.parts)).strip()


def strip_html(html: str) -> str:
    s = _Stripper()
    s.feed(html or "")
    return s.get_text()


def make_excerpt(body: str, length: int = 280) -> str:
    if len(body) <= length:
        return body
    return body[:length].rsplit(" ", 1)[0] + "\u2026"


# ── Image helpers ─────────────────────────────────────────────────────────────

def local_image_url(numeric_id: str) -> str | None:
    """Return the served path if a local OG image exists, else None."""
    for ext in IMAGE_EXTS:
        path = os.path.join(LOCAL_IMAGE_DIR, f"{numeric_id}{ext}")
        if os.path.exists(path):
            return f"/images/og/{numeric_id}{ext}"
    return None


# ── WordPress.com API ─────────────────────────────────────────────────────────

def _get_json(url: str) -> object:
    req = Request(url, headers={"User-Agent": "thousandone-poster/1.0"})
    with urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode())


def fetch_drafts_from_site(source: dict) -> list[dict]:
    """
    Fetch all published posts from a WordPress.com site and return them
    as story dicts ready to insert as drafts.
    """
    site    = source["site"]
    prefix  = source["prefix"]
    stories = []
    offset  = 0

    print(f"  Fetching {site} …", end="", flush=True)

    while True:
        url = (
            f"{WPCOM_API}/{site}/posts"
            f"?status=publish&number=100&offset={offset}"
            f"&fields=ID,title,content,date,author,post_thumbnail,categories"
        )
        try:
            data = _get_json(url)
        except URLError as e:
            print(f"\n  Warning: could not reach {site}: {e}")
            break

        posts = data.get("posts", [])
        if not posts:
            break

        for post in posts:
            raw_id     = str(post.get("ID", ""))
            title      = post.get("title", "").strip()
            body_html  = post.get("content", "")
            body       = strip_html(body_html)
            word_count = len(body.split())

            if word_count < 50:
                continue

            excerpt        = make_excerpt(body)
            date_published = (post.get("date") or "")[:10]
            author         = (post.get("author") or {}).get("name", "")

            # Image: prefer local file for og-*, else use WP.com CDN thumbnail
            thumbnail_url = (post.get("post_thumbnail") or {}).get("URL") or None
            if prefix == "og":
                image_url = local_image_url(raw_id) or thumbnail_url
            else:
                image_url = thumbnail_url

            # Tags: WP categories minus administrative ones
            raw_cats = post.get("categories") or {}
            tags = ",".join(
                slug.lower()
                for slug in raw_cats.keys()
                if slug.lower() not in SKIP_WP_CATS
            )

            stories.append({
                "id":             f"{prefix}-{raw_id}",
                "title":          title,
                "author":         author,
                "body":           body,
                "excerpt":        excerpt,
                "word_count":     word_count,
                "date_published": date_published,
                "image_url":      image_url,
                "tags":           tags,
                "community":      source["community"],
                "prefix":         prefix,
            })

        if len(posts) < 100:
            break
        offset += 100

    print(f" {len(stories)} posts found.")
    return stories


# ── DB helpers ────────────────────────────────────────────────────────────────

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_community(conn: sqlite3.Connection, source: dict):
    cid = source["community"]
    exists = conn.execute(
        "SELECT 1 FROM communities WHERE id = ?", (cid,)
    ).fetchone()
    if not exists:
        print(f"  Creating community '{cid}' …")
        conn.execute(
            "INSERT INTO communities (id, name, tagline, description, editor_name, editor_bio) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                cid,
                source["site"],
                f"Stories from {source['site']}",
                f"Public stories imported from {source['site']}.",
                "Edward King",
                "",
            ),
        )
        conn.commit()


def insert_as_draft(conn: sqlite3.Connection, story: dict) -> bool:
    """Insert story as a draft. Returns True if inserted, False if already existed."""
    exists = conn.execute(
        "SELECT 1 FROM stories WHERE id = ?", (story["id"],)
    ).fetchone()
    if exists:
        return False

    conn.execute(
        "INSERT INTO stories "
        "(id, community_id, title, author, excerpt, body, word_count, "
        " date_published, featured, votes, image_url, status, tags) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'draft', ?)",
        (
            story["id"],
            story["community"],
            story["title"],
            story["author"],
            story["excerpt"],
            story["body"],
            story["word_count"],
            story["date_published"],
            story["image_url"],
            story.get("tags", ""),
        ),
    )
    conn.commit()
    return True


# ── State file ────────────────────────────────────────────────────────────────

def load_state() -> dict:
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH) as f:
            return json.load(f)
    return {"last_source": None}


def save_state(state: dict):
    with open(STATE_PATH, "w") as f:
        json.dump(state, f, indent=2)


# ── Modes ─────────────────────────────────────────────────────────────────────

def cmd_import():
    """Fetch all public posts from both sites and store as drafts."""
    conn = _get_conn()
    total_new = 0

    for source in SOURCES:
        ensure_community(conn, source)
        stories = fetch_drafts_from_site(source)
        new = 0
        for s in stories:
            if insert_as_draft(conn, s):
                new += 1
        print(f"  {source['site']}: {new} new drafts added ({len(stories) - new} already existed).")
        total_new += new

    conn.close()
    print(f"\nDone. {total_new} new drafts added to DB.")


def cmd_list():
    """Print the full draft queue."""
    conn = _get_conn()
    rows = conn.execute(
        "SELECT id, title, date_published FROM stories WHERE status = 'draft' ORDER BY date_published ASC"
    ).fetchall()
    conn.close()

    if not rows:
        print("Draft queue is empty.")
        return

    print(f"{len(rows)} stories in draft queue (oldest first):\n")
    for i, r in enumerate(rows, 1):
        prefix = "og" if r["id"].startswith("og-") else "cbr"
        label  = "oldthous" if prefix == "og" else "coffeebreakreads"
        print(f"  {i:>4}.  [{r['date_published']}]  {r['title'][:55]:<55}  ({label})")


def cmd_publish(dry_run: bool = False):
    """Publish the next draft, alternating between og and cbr sources."""
    state       = load_state()
    last_source = state.get("last_source")  # "og" | "cbr" | None

    # Pick the opposite source from last time
    next_prefix = "cbr" if last_source == "og" else "og"

    conn = _get_conn()

    def next_draft(prefix: str):
        return conn.execute(
            "SELECT * FROM stories WHERE status = 'draft' AND id LIKE ? "
            "ORDER BY date_published ASC LIMIT 1",
            (f"{prefix}-%",),
        ).fetchone()

    story = next_draft(next_prefix)

    # If that source is exhausted, try the other
    if story is None:
        alt_prefix = "cbr" if next_prefix == "og" else "og"
        story = next_draft(alt_prefix)
        if story is not None:
            next_prefix = alt_prefix
            print(f"  Note: no more '{next_prefix}' drafts, falling back to '{alt_prefix}'.")

    if story is None:
        print("Draft queue is empty — nothing to publish.")
        conn.close()
        return

    source_label = "oldthous" if next_prefix == "og" else "coffeebreakreads"
    print(f"Next story to publish ({source_label}):")
    print(f"  ID:    {story['id']}")
    print(f"  Title: {story['title']}")
    print(f"  Words: {story['word_count']}")
    print(f"  Image: {story['image_url'] or '(none — will use quote card)'}")

    remaining_og  = conn.execute("SELECT COUNT(*) FROM stories WHERE status='draft' AND id LIKE 'og-%'").fetchone()[0]
    remaining_cbr = conn.execute("SELECT COUNT(*) FROM stories WHERE status='draft' AND id LIKE 'cbr-%'").fetchone()[0]
    print(f"  Queue: {remaining_og} oldthous + {remaining_cbr} coffeebreakreads drafts remaining")

    if dry_run:
        print("\n--dry-run: nothing written.")
        conn.close()
        return

    today = date.today().isoformat()
    conn.execute(
        "UPDATE stories SET status = 'published', date_published = ? WHERE id = ?",
        (today, story["id"]),
    )
    conn.commit()
    conn.close()

    state["last_source"] = next_prefix
    save_state(state)

    print(f"\nPublished: \"{story['title']}\" on {today}")


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Draft queue and daily publisher.")
    parser.add_argument("--import",   dest="do_import", action="store_true",
                        help="Fetch posts from both sites and store as drafts.")
    parser.add_argument("--list",     action="store_true",
                        help="List all drafts in queue order.")
    parser.add_argument("--dry-run",  action="store_true",
                        help="Show what would be published without writing.")
    args = parser.parse_args()

    if args.do_import:
        cmd_import()
    elif args.list:
        cmd_list()
    else:
        cmd_publish(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
