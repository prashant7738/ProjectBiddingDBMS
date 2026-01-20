# It is temporary File to run schemas.py file 

import os
import sys
# import django

# Add the current directory to the path so Python can find project_main
sys.path.append(os.getcwd())

# CHANGE THIS LINE to match your actual folder name found in your file path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_main.settings')

# django.setup()

from core_db.engine import engine
from core_db.schemas import metadata

print("Connecting to PostgreSQL and creating tables...")
try:
    metadata.drop_all(engine)
    metadata.create_all(engine)
    print("Success! Tables created.")
except Exception as e:
    print(f"Error: {e}")
    