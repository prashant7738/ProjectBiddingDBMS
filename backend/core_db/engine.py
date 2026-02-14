from sqlalchemy import create_engine


import os
from dotenv import load_dotenv

load_dotenv()

# This is python engine that connects with url of database
 


DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL , echo=False)