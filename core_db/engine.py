from sqlalchemy import create_engine
from django.config import settings 

# This is python engine that connects with url of database
 
db = settings.DB_CONFIG

DATABASE_URL = f"postgresql://{db['DB_USER']}:{db['DB_PASS']}@{db['DB_HOST']}:{db['DB_PORT']}/{db['DB_NAME']}"

engine = create_engine(DATABASE_URL , echo=True)