"""
Seed the database with the communities and stories from data.py.
Editor accounts are created with a placeholder password — change before going live.
"""
from datetime import datetime
from database import init_db, SessionLocal
from models import User, Community, Story
from data import communities as seed_communities
import bcrypt

PLACEHOLDER_PASSWORD = "changeme123"


def run():
    init_db()
    db = SessionLocal()

    try:
        # Create one user account per unique editor
        editor_accounts = {}
        for c in seed_communities:
            editor_name = c["editor"]["name"]
            if editor_name not in editor_accounts:
                username = editor_name.lower().replace(" ", "_")
                user = User(
                    username=username,
                    email=f"{username}@example.com",
                    hashed_password=bcrypt.hashpw(PLACEHOLDER_PASSWORD.encode(), bcrypt.gensalt()).decode(),
                )
                db.add(user)
                db.flush()
                editor_accounts[editor_name] = user

        # Create communities
        for c in seed_communities:
            editor = editor_accounts[c["editor"]["name"]]
            community = Community(
                id=c["id"],
                name=c["name"],
                tagline=c["tagline"],
                description=c["description"],
                editor_id=editor.id,
            )
            db.add(community)
            db.flush()

            # Create stories
            for s in c["stories"]:
                story = Story(
                    title=s["title"],
                    excerpt=s["excerpt"],
                    word_count=s.get("word_count"),
                    community_id=community.id,
                    author_id=editor.id,  # placeholder: editor as author
                    status="approved",
                    featured=s.get("featured", False),
                    votes=s.get("votes", 0),
                    published_at=datetime.strptime(s["date_published"], "%Y-%m-%d"),
                )
                db.add(story)

        db.commit()
        print("Seeded successfully.")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run()
