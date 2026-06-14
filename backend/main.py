import json
import os
import re
import time
from datetime import date
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from data import communities as _seed_communities

COMMUNITIES_FILE = os.path.join(os.path.dirname(__file__), "communities.json")
SUBMISSIONS_FILE = os.path.join(os.path.dirname(__file__), "submissions.json")
STORIES_FILE = os.path.join(os.path.dirname(__file__), "stories.json")


# ---------- file helpers ----------

def _load_extra_stories() -> dict:
    """Returns {community_id: [story, ...]} for accepted submissions."""
    if not os.path.exists(STORIES_FILE):
        return {}
    with open(STORIES_FILE, "r") as f:
        return json.load(f)


def _save_extra_stories(data: dict) -> None:
    with open(STORIES_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _load_communities() -> list:
    extra_stories = _load_extra_stories()
    seed = [dict(c, stories=list(c["stories"]) + extra_stories.get(c["id"], [])) for c in _seed_communities]
    if not os.path.exists(COMMUNITIES_FILE):
        return seed
    with open(COMMUNITIES_FILE, "r") as f:
        created = json.load(f)
    seed_ids = {c["id"] for c in seed}
    created_merged = [
        dict(c, stories=list(c.get("stories", [])) + extra_stories.get(c["id"], []))
        for c in created if c["id"] not in seed_ids
    ]
    return seed + created_merged


def _save_community(community: dict) -> None:
    existing = []
    if os.path.exists(COMMUNITIES_FILE):
        with open(COMMUNITIES_FILE, "r") as f:
            existing = json.load(f)
    existing.append(community)
    with open(COMMUNITIES_FILE, "w") as f:
        json.dump(existing, f, indent=2)


def _load_submissions() -> list:
    if not os.path.exists(SUBMISSIONS_FILE):
        return []
    with open(SUBMISSIONS_FILE, "r") as f:
        return json.load(f)


def _save_submissions(submissions: list) -> None:
    with open(SUBMISSIONS_FILE, "w") as f:
        json.dump(submissions, f, indent=2)


def _slugify(name: str) -> str:
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', name.lower())).strip('-')


def _community_summary(c: dict) -> dict:
    featured = next((s for s in c["stories"] if s.get("featured")), None)
    return {
        "id": c["id"],
        "name": c["name"],
        "tagline": c["tagline"],
        "editor": c["editor"],
        "story_count": len(c["stories"]),
        "featured_story": featured,
    }


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
    return [_community_summary(c) for c in _load_communities()]


@app.get("/api/communities/{community_id}")
def get_community(community_id: str):
    community = next((c for c in _load_communities() if c["id"] == community_id), None)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return community


class NewCommunityRequest(BaseModel):
    name: str
    tagline: str
    description: str
    editor_name: str
    editor_bio: str


@app.post("/api/communities", status_code=201)
def create_community(body: NewCommunityRequest):
    slug = _slugify(body.name)
    if any(c["id"] == slug for c in _load_communities()):
        raise HTTPException(status_code=409, detail="A community with that name already exists")
    community = {
        "id": slug,
        "name": body.name,
        "tagline": body.tagline,
        "description": body.description,
        "editor": {"name": body.editor_name, "bio": body.editor_bio},
        "stories": [],
    }
    _save_community(community)
    return community


# ---------- votes ----------

@app.post("/api/communities/{community_id}/stories/{story_id}/vote")
def vote_story(community_id: str, story_id: str):
    community = next((c for c in _load_communities() if c["id"] == community_id), None)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    story = next((s for s in community["stories"] if s["id"] == story_id), None)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    story["votes"] = story.get("votes", 0) + 1
    return {"votes": story["votes"]}


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
    community = next((c for c in _load_communities() if c["id"] == submission.community_id), None)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    submissions = _load_submissions()
    entry = submission.model_dump()
    entry["id"] = f"sub-{int(time.time() * 1000)}"
    submissions.append(entry)
    _save_submissions(submissions)
    return {"ok": True}


@app.get("/api/communities/{community_id}/submissions")
def get_submissions(community_id: str):
    community = next((c for c in _load_communities() if c["id"] == community_id), None)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return [s for s in _load_submissions() if s["community_id"] == community_id]


@app.post("/api/communities/{community_id}/submissions/{submission_id}/accept")
def accept_submission(community_id: str, submission_id: str):
    submissions = _load_submissions()
    sub = next((s for s in submissions if s["id"] == submission_id and s["community_id"] == community_id), None)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    story = {
        "id": f"{community_id}-{int(time.time() * 1000)}",
        "title": sub["title"],
        "author": sub["author_name"],
        "excerpt": sub["body"][:300].rsplit(" ", 1)[0] + "…" if len(sub["body"]) > 300 else sub["body"],
        "body": sub["body"],
        "word_count": len(sub["body"].split()),
        "date_published": date.today().isoformat(),
        "featured": False,
        "votes": 0,
    }

    extra = _load_extra_stories()
    extra.setdefault(community_id, []).append(story)
    _save_extra_stories(extra)

    _save_submissions([s for s in submissions if s["id"] != submission_id])
    return story


@app.post("/api/communities/{community_id}/submissions/{submission_id}/reject")
def reject_submission(community_id: str, submission_id: str):
    submissions = _load_submissions()
    if not any(s["id"] == submission_id and s["community_id"] == community_id for s in submissions):
        raise HTTPException(status_code=404, detail="Submission not found")
    _save_submissions([s for s in submissions if s["id"] != submission_id])
    return {"ok": True}
