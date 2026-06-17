"""
migrate_add_tags.py — one-time migration to add a tags column to stories.

Usage:
    python3 migrate_add_tags.py

Safe to re-run.
"""

import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "thousandone.db")


def main():
    conn = sqlite3.connect(DB_PATH)
    cols = [row[1] for row in conn.execute("PRAGMA table_info(stories)").fetchall()]
    if "tags" in cols:
        print("Column 'tags' already exists — skipping.")
    else:
        conn.execute("ALTER TABLE stories ADD COLUMN tags TEXT NOT NULL DEFAULT ''")
        conn.commit()
        print("Added 'tags' column.")

    count = conn.execute("SELECT COUNT(*) FROM stories WHERE tags != ''").fetchone()[0]
    print(f"{count} stories already have tags.")
    conn.close()


if __name__ == "__main__":
    main()
