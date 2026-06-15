"""
Seed script: creates backend/thousandone.db and populates it from data.py
and any existing JSON migration files.  Safe to run multiple times (idempotent).
"""

import json
import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "thousandone.db")
COMMUNITIES_FILE = os.path.join(os.path.dirname(__file__), "communities.json")
STORIES_FILE = os.path.join(os.path.dirname(__file__), "stories.json")
SUBMISSIONS_FILE = os.path.join(os.path.dirname(__file__), "submissions.json")


# ---------- schema ----------

SCHEMA = """
CREATE TABLE IF NOT EXISTS communities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    editor_name TEXT NOT NULL,
    editor_bio TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    community_id TEXT NOT NULL REFERENCES communities(id),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    date_published TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    votes INTEGER NOT NULL DEFAULT 0,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    community_id TEXT NOT NULL REFERENCES communities(id),
    title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    body TEXT NOT NULL,
    cover_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
);
"""


# ---------- helpers ----------

def _insert_community(cur, c, editor):
    cur.execute(
        "INSERT OR IGNORE INTO communities (id, name, tagline, description, editor_name, editor_bio) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (c["id"], c["name"], c["tagline"], c["description"],
         editor["name"], editor["bio"]),
    )


def _insert_story(cur, community_id, s):
    # Some seed stories have no body field — fall back to excerpt.
    body = s.get("body") or s.get("excerpt", "")
    excerpt = s.get("excerpt") or (body[:300].rsplit(" ", 1)[0] + "\u2026" if len(body) > 300 else body)
    image_url = s.get("image_url")
    # Normalise Python None / string "None"
    if image_url == "None" or image_url is None:
        image_url = None
    cur.execute(
        "INSERT OR IGNORE INTO stories "
        "(id, community_id, title, author, excerpt, body, word_count, date_published, featured, votes, image_url) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            s["id"],
            community_id,
            s["title"],
            s["author"],
            excerpt,
            body,
            s.get("word_count", len(body.split())),
            s.get("date_published", ""),
            1 if s.get("featured") else 0,
            s.get("votes", 0),
            image_url,
        ),
    )


def _insert_submission(cur, sub):
    cur.execute(
        "INSERT OR IGNORE INTO submissions "
        "(id, community_id, title, author_name, author_email, body, cover_note, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            sub["id"],
            sub.get("community_id", ""),
            sub["title"],
            sub.get("author_name", ""),
            sub.get("author_email", ""),
            sub.get("body", ""),
            sub.get("cover_note", ""),
            sub.get("created_at", ""),
        ),
    )


# ---------- main ----------

def seed():
    from data import communities as seed_communities

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executescript(SCHEMA)

    # 1. Seed from data.py (includes thousandone-classic with og_stories)
    for c in seed_communities:
        editor = c.get("editor", {})
        _insert_community(cur, c, editor)
        for s in c.get("stories", []):
            _insert_story(cur, c["id"], s)

    # 2. Migrate communities.json (API-created communities)
    if os.path.exists(COMMUNITIES_FILE):
        with open(COMMUNITIES_FILE) as f:
            created = json.load(f)
        for c in created:
            editor = c.get("editor", {})
            _insert_community(cur, c, editor)
            for s in c.get("stories", []):
                _insert_story(cur, c["id"], s)

    # 3. Migrate stories.json  (accepted submissions keyed by community_id)
    if os.path.exists(STORIES_FILE):
        with open(STORIES_FILE) as f:
            extra = json.load(f)
        for community_id, stories in extra.items():
            for s in stories:
                _insert_story(cur, community_id, s)

    # 4. Migrate submissions.json
    if os.path.exists(SUBMISSIONS_FILE):
        with open(SUBMISSIONS_FILE) as f:
            subs = json.load(f)
        for sub in subs:
            _insert_submission(cur, sub)

    conn.commit()
    conn.close()
    print(f"Seeding complete -> {DB_PATH}")


if __name__ == "__main__":
    seed()
