# day1_test.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_main.settings')
django.setup()

from core_db.user_ops import register_user, authenticate_user

# 1. Test Registration
print("--- Registering User ---")
try:
    user_id = register_user("bidder_one", "one@example.com", "secret123", 100.00)
    print(f"Registered user with ID: {user_id}")
except Exception as e:
    print(f"Error: {e}")

# 2. Test Login
print("\n--- Testing Login ---")
user = authenticate_user("bidder_one", "secret123")
if user:
    print(f"Login Successful! Welcome {user['name']}. Your balance is {user['balance']}")
else:
    print("Login Failed: Incorrect username or password.")