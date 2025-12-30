import os
import django
from datetime import datetime, timedelta
from decimal import Decimal

# 1. Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_main.settings')
django.setup()

from core_db.user_ops import register_user
from core_db.auction_ops import create_auction
from core_db.bid_ops import place_bid



from sqlalchemy import insert
from core_db.schemas import categories
from core_db.engine import engine


def seed_categories():
    with engine.connect() as conn:
        items = [
            {"name": "Electronics"},
            {"name": "Home & Garden"},
            {"name": "Fashion"},
            {"name": "Collectibles"}
        ]
        conn.execute(insert(categories), items)
        conn.commit()
        print("Categories added!")
        
        
def run_day3_test():
    print("--- STARTING DAY 3: BIDDING SYSTEM TEST ---")

    # STEP 1: Setup Users (Seller and two Bidders)
    try:
        seller_id = register_user("apple_seller", "apple@store.com", "pass123", 0)
        bidder_one_id = register_user("bidder_one", "one@test.com", "pass123", 500.00)
        bidder_two_id = register_user("bidder_two", "two@test.com", "pass123", 1000.00)
        print("✅ Users created successfully.")
    except Exception as e:
        print(f"⚠️ User setup note: {e} (Likely already exist)")
        # In a real test, you'd fetch existing IDs here, 
        # but since we reset the DB, this will work fine.

    # STEP 2: Create an Auction
    # We set this to end in 1 hour
    expiry = datetime.now() + timedelta(hours = 30)
    auction_id = create_auction(
        seller_id=seller_id,
        title="iPhone 17 Pro",
        description="Brand new, sealed.",
        category_id= 1 ,
        starting_price=Decimal("700.00"),
        end_time=expiry
    )
    print(f"✅ Auction created with ID: {auction_id}. Starting price: $700")

    # STEP 3: Test Validation - Bid too low
    print("\nTest 1: Placing a bid of $600 (Lower than starting price)...")
    result1 = place_bid(bidder_one_id, auction_id, Decimal("600.00"))
    print(f"Result: {result1}") 

    # STEP 4: Test Validation - Successful Bid
    print("\nTest 2: Placing a valid bid of $750...")
    result2 = place_bid(bidder_one_id, auction_id, Decimal("750.00"))
    print(f"Result: {result2}")

    # STEP 5: Test Validation - Outbidding someone
    print("\nTest 3: Bidder Two tries to bid $800...")
    result3 = place_bid(bidder_two_id, auction_id, Decimal("800.00"))
    print(f"Result: {result3}")
    
  
  
def run_day_4():
    print("--- STARTING DAY 3: BIDDING SYSTEM TEST ---")

    # STEP 2: Create an Auction
    # We set this to 30 days
    expiry = datetime.now() + timedelta(days = 30)
    auction_id = create_auction(
        seller_id= 1,
        title="iPhone 7 Pro",
        description="Old But used by obama.",
        category_id= 1 ,
        starting_price=Decimal("70.00"),
        end_time=expiry
    )
    print(f"✅ Auction created with ID: {auction_id}. Starting price: $70")
    
  
# seed_categories()  
# run_day3_test()

run_day_4()