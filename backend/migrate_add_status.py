"""
migrate_add_status.py — one-time migration to add a status column to stories.

Sets all existing stories to 'draft' so the site starts empty.
New stories inserted by post_daily.py will be set to 'published' when their
day arrives.

Usage:
    python3 migrate_add_status.py

Safe to re-run — skips the ALTER TABLE if the column already exists.
"""

import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "thousandone.db")


def main():
    conn = sqlite3.connect(DB_PATH)

    # Check if column already exists
    cols = [row[1] for row in conn.execute("PRAGMA table_info(stories)").fetchall()]
    if "status" in cols:
        print("Column 'status' already exists — skipping ALTER TABLE.")
    else:
        conn.execute("ALTER TABLE stories ADD COLUMN status TEXT NOT NULL DEFAULT 'published'")
        print("Added 'status' column.")

    # Mark all existing stories as drafts
    result = conn.execute("UPDATE stories SET status = 'draft'")
    conn.commit()
    print(f"Marked {result.rowcount} stories as draft.")

    # Summary
    for row in conn.execute("SELECT status, COUNT(*) FROM stories GROUP BY status").fetchall():
        print(f"  {row[0]}: {row[1]}")

    conn.close()


if __name__ == "__main__":
    main()
