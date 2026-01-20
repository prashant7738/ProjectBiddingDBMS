# day2_test.py
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_main.settings')
django.setup()

from core_db.auction_ops import create_auction, get_active_auctions
from core_db.user_ops import authenticate_user

# 1. Login a user first (to get their ID)
user = authenticate_user("bidder_one", "secret123")

if user:
    print(f"User {user['name']} is creating an auction...")
    
    # 2. Create an auction that ends in 24 hours
    expiry = datetime.now() + timedelta(hours=24)
    auction_id = create_auction(
        seller_id=user['id'],
        title="Gaming Laptop",
        description="Used for 1 year, RTX 3060",
        starting_price=800.00,
        end_time=expiry
    )
    print(f"Auction created! ID: {auction_id}")

    # 3. List all active auctions
    print("\n--- Active Auctions ---")
    items = get_active_auctions()
    for item in items:
        print(f"Item: {item['title']} | Price: ${item['current_highest_bid']} | Ends: {item['end_time']}")