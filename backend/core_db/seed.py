from sqlalchemy import insert

from .schemas import categories
from .engine import engine


def seed_categories():
    with engine.connect() as conn:
        items = [
            {"name": "Electronics"},
            {"name": "Home & Garden"},
            {"name": "Fashion"},
            {"name": "Others"},
        ]
        conn.execute(insert(categories), items)
        conn.commit()
