from sqlalchemy import create_engine


import os
from dotenv import load_dotenv

load_dotenv()

# This is python engine that connects with url of database
 


DATABASE_URL = os.getenv("DATABASE_URL")

# Render (like Heroku) hands out connection strings starting with
# "postgres://", but SQLAlchemy 2.0 dropped that dialect alias and only
# recognizes "postgresql://" — without this, every SQLAlchemy-backed
# endpoint (login, auctions, bids, ...) fails with NoSuchModuleError.
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL , echo=False)