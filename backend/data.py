from datetime import date

communities = [
    {
        "id": "flash-fiction",
        "name": "Flash Fiction",
        "tagline": "Stories under 1,000 words",
        "description": "Complete stories told in the space of a breath. Precision, compression, surprise.",
        "editor": {
            "name": "Margot Vance",
            "bio": "Former fiction editor at Ploughshares. Writes flash and teaches at NYU."
        },
        "stories": [
            {
                "id": "ff-1",
                "title": "The Last Cartographer",
                "author": "Priya Mehta",
                "excerpt": "She drew maps of places that no longer existed, which was, she said, the only honest kind of cartography.",
                "word_count": 740,
                "date_published": "2026-05-28",
                "featured": True,
                "votes": 312
            },
            {
                "id": "ff-2",
                "title": "Night Shift",
                "author": "James Okafor",
                "excerpt": "The overnight nurse counted her patients by their breathing — steady, ragged, gone.",
                "word_count": 890,
                "date_published": "2026-05-20",
                "featured": False,
                "votes": 178
            },
            {
                "id": "ff-3",
                "title": "Inheritance",
                "author": "Soledad Ríos",
                "excerpt": "My mother left me her silence, and her mother before her, all the way back to someone who had good reason to go quiet.",
                "word_count": 620,
                "date_published": "2026-05-14",
                "featured": False,
                "votes": 245
            }
        ]
    },
    {
        "id": "noir",
        "name": "Noir",
        "tagline": "Crime, shadow, moral ambiguity",
        "description": "The city at 3am. Rain on a fire escape. Someone always knows something they shouldn't.",
        "editor": {
            "name": "Dale Fincher",
            "bio": "Crime writer. Published in Ellery Queen's and Alfred Hitchcock's. Chicago-based."
        },
        "stories": [
            {
                "id": "noir-1",
                "title": "The Arsonist's Daughter",
                "author": "Elena Caruso",
                "excerpt": "They brought me in because I was good at finding patterns. What I found was that every fire had started in a room with a working smoke alarm.",
                "word_count": 4200,
                "date_published": "2026-06-01",
                "featured": True,
                "votes": 481
            },
            {
                "id": "noir-2",
                "title": "Soft Money",
                "author": "Vincent Pratt",
                "excerpt": "The accountant had kept two sets of books his whole career. The third set was the one that got him killed.",
                "word_count": 3100,
                "date_published": "2026-05-18",
                "featured": False,
                "votes": 203
            }
        ]
    },
    {
        "id": "speculative",
        "name": "Speculative",
        "tagline": "Slipstream, strange realism, the uncanny",
        "description": "Not quite science fiction, not quite fantasy. Stories where reality has one loose thread.",
        "editor": {
            "name": "Anika Bhatt",
            "bio": "Speculative fiction writer and editor. Her debut collection comes out in fall 2026."
        },
        "stories": [
            {
                "id": "spec-1",
                "title": "What the Mirror Learned",
                "author": "Tom Weiss",
                "excerpt": "By the third year the mirror had stopped showing what was in front of it. We assumed it was broken. We were wrong about that.",
                "word_count": 2800,
                "date_published": "2026-06-03",
                "featured": True,
                "votes": 594
            },
            {
                "id": "spec-2",
                "title": "Every Version of This Afternoon",
                "author": "Yuki Tanaka",
                "excerpt": "She kept a journal of all the ways the conversation could have gone. By August she had filled eleven notebooks.",
                "word_count": 3300,
                "date_published": "2026-05-25",
                "featured": False,
                "votes": 387
            },
            {
                "id": "spec-3",
                "title": "Landline",
                "author": "Marcus Bell",
                "excerpt": "The phone in the empty house rang every day at 4pm. We stopped answering it after we found out my father had been dead since March.",
                "word_count": 1900,
                "date_published": "2026-05-10",
                "featured": False,
                "votes": 441
            }
        ]
    },
    {
        "id": "personal-essay",
        "name": "Personal Essay",
        "tagline": "True stories told with craft",
        "description": "Memoir, lyric essay, reported personal. The self as subject, rigorously examined.",
        "editor": {
            "name": "Rachel Ng",
            "bio": "Essays in The Sun, Guernica, Kenyon Review. MFA from Iowa Nonfiction program."
        },
        "stories": [
            {
                "id": "pe-1",
                "title": "Learning to Drive at Thirty-Four",
                "author": "Darius Cole",
                "excerpt": "Every immigrant I know has a version of this story. Mine involves a parking lot in Naperville, my cousin's patience, and something I finally understood about my father.",
                "word_count": 2200,
                "date_published": "2026-05-30",
                "featured": True,
                "votes": 712
            },
            {
                "id": "pe-2",
                "title": "The Hospital Parking Garage",
                "author": "Leah Kim",
                "excerpt": "I spent three weeks memorizing the levels: P1 was hope, P2 was waiting, P3 was where you went when you had been there too long.",
                "word_count": 1600,
                "date_published": "2026-05-22",
                "featured": False,
                "votes": 289
            }
        ]
    },
    {
        "id": "international-voices",
        "name": "International Voices",
        "tagline": "Fiction from outside the Anglosphere",
        "description": "Stories in translation and from writers working in English from non-Western traditions.",
        "editor": {
            "name": "Fatou Diallo",
            "bio": "Translator and editor. Based in Dakar and London. Translates from French and Wolof."
        },
        "stories": [
            {
                "id": "iv-1",
                "title": "The Goat Market",
                "author": "Hamidou Traoré (tr. Fatou Diallo)",
                "excerpt": "My uncle sold goats the same way he sold stories — with an eye for what the buyer needed to believe.",
                "word_count": 3600,
                "date_published": "2026-06-02",
                "featured": True,
                "votes": 328
            }
        ]
    }
]
