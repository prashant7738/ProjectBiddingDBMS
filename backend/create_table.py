# Idempotent table initializer for SQLAlchemy metadata.
# Creates only missing tables and seeds categories only for a brand-new DB.

from sqlalchemy import inspect

from core_db.engine import engine
from core_db.schemas import metadata
from testday3 import seed_categories


def _managed_table_names():
    return {table.name for table in metadata.sorted_tables}


print("Connecting to PostgreSQL and creating tables...")
try:
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    managed_tables = _managed_table_names()

    has_any_managed_table = bool(existing_tables & managed_tables)
    missing_tables = managed_tables - existing_tables

    if not missing_tables:
        print("All tables already exist. Skipping creation.")
    else:
        metadata.create_all(engine, checkfirst=True)
        print(f"Created missing tables: {', '.join(sorted(missing_tables))}")

        # Seed default categories only when DB is initialized for first time.
        if not has_any_managed_table:
            seed_categories()
            print("Initial category seed completed.")
        else:
            print("Database already existed. Skipping category seed.")

except Exception as e:
    print(f"Error: {e}")
    