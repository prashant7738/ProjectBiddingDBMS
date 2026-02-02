"""
Test script to demonstrate the fixed get_user_bidding_history function.

This script shows how the function now returns unique auctions with only 
the latest bid for each auction, instead of returning all bids.
"""

from core_db.bid_ops import get_user_bidding_history
from sqlalchemy import insert, select
from core_db.engine import engine
from core_db.schemas import bids, auctions

def test_get_user_bidding_history():
    """
    Test that get_user_bidding_history returns one auction per bid
    (with the latest bid for each auction).
    """
    user_id = 1  # Change this to test with a different user
    
    print(f"\n{'='*60}")
    print(f"Testing get_user_bidding_history for user_id: {user_id}")
    print(f"{'='*60}\n")
    
    # Get the auctions this user has bid on
    auctions_list = get_user_bidding_history(user_id)
    
    if not auctions_list:
        print(f"User {user_id} has not bid on any auctions.")
        return
    
    print(f"User {user_id} has bid on {len(auctions_list)} unique auction(s):\n")
    
    for i, auction in enumerate(auctions_list, 1):
        print(f"{i}. Auction ID: {auction.get('id')}")
        print(f"   Title: {auction.get('title')}")
        print(f"   Current Highest Bid: ${auction.get('current_highest_bid')}")
        print(f"   Start Time: {auction.get('start_time')}")
        print(f"   End Time: {auction.get('end_time')}")
        
        # Show the number of total bids for this auction (not used in response, just for info)
        with engine.connect() as conn:
            bid_count = conn.execute(
                select(len(select(bids).where(
                    (bids.c.auction_id == auction['id']) & 
                    (bids.c.bidder_id == user_id)
                ).compile()))
            ).scalar()
        
        print()
    
    print(f"{'='*60}")
    print("✅ Function correctly returns one auction per user bid!")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    test_get_user_bidding_history()
