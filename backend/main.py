import os
import re
import sqlite3
import time
from datetime import date

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_PATH = os.path.join(os.path.dirname(__file__), "thousandone.db")


# ---------- database ----------

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _story_dict(row: sqlite3.Row) -> dict:
    """Convert a stories row to the API shape."""
    return {
        "id": row["id"],
        "title": row["title"],
        "author": row["author"],
        "excerpt": row["excerpt"],
        "body": row["body"],
        "word_count": row["word_count"],
        "date_published": row["date_published"],
        "featured": bool(row["featured"]),
        "votes": row["votes"],
        "image_url": row["image_url"],  # already NULL in DB when absent
    }


def _submission_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "community_id": row["community_id"],
        "title": row["title"],
        "author_name": row["author_name"],
        "author_email": row["author_email"],
        "body": row["body"],
        "cover_note": row["cover_note"],
        "created_at": row["created_at"],
    }


def _community_row_to_summary(row: sqlite3.Row, story_count: int, featured_story) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "tagline": row["tagline"],
        "editor": {"name": row["editor_name"], "bio": row["editor_bio"]},
        "story_count": story_count,
        "featured_story": featured_story,
        "hide_authors": bool(row["hide_authors"]),
    }


def _community_row_to_full(row: sqlite3.Row, stories: list) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "tagline": row["tagline"],
        "description": row["description"],
        "editor": {"name": row["editor_name"], "bio": row["editor_bio"]},
        "stories": stories,
        "hide_authors": bool(row["hide_authors"]),
    }


def _get_featured_story(conn: sqlite3.Connection, community_id: str):
    """Return the featured story, or the most recent one if none is featured."""
    row = conn.execute(
        "SELECT * FROM stories WHERE community_id = ? AND featured = 1 LIMIT 1",
        (community_id,),
    ).fetchone()
    if row is None:
        row = conn.execute(
            "SELECT * FROM stories WHERE community_id = ? ORDER BY date_published DESC LIMIT 1",
            (community_id,),
        ).fetchone()
    return _story_dict(row) if row else None


# ---------- slugify ----------

def _slugify(name: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", name.lower())).strip("-")


# ---------- app ----------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- communities ----------

@app.get("/api/communities")
def get_communities():
    conn = _get_conn()
    communities = conn.execute("SELECT * FROM communities").fetchall()
    result = []
    for c in communities:
        count = conn.execute(
            "SELECT COUNT(*) FROM stories WHERE community_id = ?", (c["id"],)
        ).fetchone()[0]
        featured = _get_featured_story(conn, c["id"])
        result.append(_community_row_to_summary(c, count, featured))
    conn.close()
    return result


@app.get("/api/communities/{community_id}")
def get_community(community_id: str):
    conn = _get_conn()
    row = conn.execute(
        "SELECT * FROM communities WHERE id = ?", (community_id,)
    ).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Community not found")
    stories = [
        _story_dict(s)
        for s in conn.execute(
            "SELECT * FROM stories WHERE community_id = ? ORDER BY date_published DESC",
            (community_id,),
        ).fetchall()
    ]
    result = _community_row_to_full(row, stories)
    conn.close()
    return result


class NewCommunityRequest(BaseModel):
    name: str
    tagline: str
    description: str
    editor_name: str
    editor_bio: str


@app.post("/api/communities", status_code=201)
def create_community(body: NewCommunityRequest):
    slug = _slugify(body.name)
    conn = _get_conn()
    existing = conn.execute(
        "SELECT id FROM communities WHERE id = ?", (slug,)
    ).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=409, detail="A community with that name already exists")
    conn.execute(
        "INSERT INTO communities (id, name, tagline, description, editor_name, editor_bio) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (slug, body.name, body.tagline, body.description, body.editor_name, body.editor_bio),
    )
    conn.commit()
    conn.close()
    return {
        "id": slug,
        "name": body.name,
        "tagline": body.tagline,
        "description": body.description,
        "editor": {"name": body.editor_name, "bio": body.editor_bio},
        "stories": [],
    }


# ---------- votes ----------

@app.post("/api/communities/{community_id}/stories/{story_id}/vote")
def vote_story(community_id: str, story_id: str):
    conn = _get_conn()
    community = conn.execute(
        "SELECT id FROM communities WHERE id = ?", (community_id,)
    ).fetchone()
    if not community:
        conn.close()
        raise HTTPException(status_code=404, detail="Community not found")
    story = conn.execute(
        "SELECT id, votes FROM stories WHERE id = ? AND community_id = ?",
        (story_id, community_id),
    ).fetchone()
    if not story:
        conn.close()
        raise HTTPException(status_code=404, detail="Story not found")
    conn.execute(
        "UPDATE stories SET votes = votes + 1 WHERE id = ?", (story_id,)
    )
    conn.commit()
    new_votes = conn.execute(
        "SELECT votes FROM stories WHERE id = ?", (story_id,)
    ).fetchone()[0]
    conn.close()
    return {"votes": new_votes}


# ---------- submissions ----------

class SubmissionRequest(BaseModel):
    community_id: str
    title: str
    author_name: str
    author_email: str
    body: str
    cover_note: str = ""


@app.post("/api/submissions")
def create_submission(submission: SubmissionRequest):
    conn = _get_conn()
    community = conn.execute(
        "SELECT id FROM communities WHERE id = ?", (submission.community_id,)
    ).fetchone()
    if not community:
        conn.close()
        raise HTTPException(status_code=404, detail="Community not found")
    sub_id = f"sub-{int(time.time() * 1000)}"
    created_at = date.today().isoformat()
    conn.execute(
        "INSERT INTO submissions (id, community_id, title, author_name, author_email, body, cover_note, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            sub_id,
            submission.community_id,
            submission.title,
            submission.author_name,
            submission.author_email,
            submission.body,
            submission.cover_note,
            created_at,
        ),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/api/communities/{community_id}/submissions")
def get_submissions(community_id: str):
    conn = _get_conn()
    community = conn.execute(
        "SELECT id FROM communities WHERE id = ?", (community_id,)
    ).fetchone()
    if not community:
        conn.close()
        raise HTTPException(status_code=404, detail="Community not found")
    rows = conn.execute(
        "SELECT * FROM submissions WHERE community_id = ?", (community_id,)
    ).fetchall()
    result = [_submission_dict(r) for r in rows]
    conn.close()
    return result


@app.post("/api/communities/{community_id}/submissions/{submission_id}/accept")
def accept_submission(community_id: str, submission_id: str):
    conn = _get_conn()
    sub = conn.execute(
        "SELECT * FROM submissions WHERE id = ? AND community_id = ?",
        (submission_id, community_id),
    ).fetchone()
    if not sub:
        conn.close()
        raise HTTPException(status_code=404, detail="Submission not found")

    body = sub["body"]
    excerpt = body[:300].rsplit(" ", 1)[0] + "\u2026" if len(body) > 300 else body
    story_id = f"{community_id}-{int(time.time() * 1000)}"
    today = date.today().isoformat()

    conn.execute(
        "INSERT INTO stories (id, community_id, title, author, excerpt, body, word_count, date_published, featured, votes) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)",
        (
            story_id,
            community_id,
            sub["title"],
            sub["author_name"],
            excerpt,
            body,
            len(body.split()),
            today,
        ),
    )
    conn.execute("DELETE FROM submissions WHERE id = ?", (submission_id,))
    conn.commit()

    story = _story_dict(conn.execute(
        "SELECT * FROM stories WHERE id = ?", (story_id,)
    ).fetchone())
    conn.close()
    return story


@app.post("/api/communities/{community_id}/submissions/{submission_id}/reject")
def reject_submission(community_id: str, submission_id: str):
    conn = _get_conn()
    row = conn.execute(
        "SELECT id FROM submissions WHERE id = ? AND community_id = ?",
        (submission_id, community_id),
    ).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Submission not found")
    conn.execute("DELETE FROM submissions WHERE id = ?", (submission_id,))
    conn.commit()
    conn.close()
    return {"ok": True}
