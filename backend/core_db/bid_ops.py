from sqlalchemy import insert , select , and_ , update
from decimal import Decimal
from django.utils import timezone
from sqlalchemy.sql import func
from .engine import engine 
from .schemas import bids , auctions , users, auction_registrations

def place_bid(bidder_id , auction_id , bid_amount):
    # Convert bid_amount to Decimal for precise comparison
    bid_amount = Decimal(str(bid_amount))
    
    # Get current time in UTC timezone
    current_time = timezone.now()
    
    with engine.connect() as conn:
        with conn.begin():
            
            # Lock the auction row to prevent race conditions
            # FOR UPDATE means: lock this row until transaction commits
            auction_q = select(auctions).where(auctions.c.id == auction_id).with_for_update()
            auction = conn.execute(auction_q).first()
            
            # if auction exists
            if not auction:
                return "Error : Auction Not Found"
            
            # Check if auction times are set properly
            if not auction.start_time or not auction.end_time:
                return "ERROR : Auction times are not properly configured"
            
            # Check if user is registered for this auction
            registration_q = select(auction_registrations).where(
                and_(
                    auction_registrations.c.user_id == bidder_id,
                    auction_registrations.c.auction_id == auction_id
                )
            )
            if not conn.execute(registration_q).first():
                return "Error: You are not registered for this auction. Please register first."
            
            # to check if auction is started or not (now comparing timezone-aware datetimes)
            if current_time < auction.start_time:
                return "ERROR : the time is not started"
            
            # Check if auction is still open
            if current_time >= auction.end_time:
                return "ERROR : the time is finished"
            
            # Check if bid is high enough - Convert current_highest_bid to Decimal for comparison
            current_highest = Decimal(str(auction.current_highest_bid or 0))
            
            if bid_amount <= current_highest:
                return f"Error : bid amount should be higher than {current_highest}"
            
            # Finally Insert this bid into record
            conn.execute(insert(bids).values(
                auction_id = auction_id,
                bidder_id = bidder_id,
                amount = bid_amount
            ))
            
            # Update the Auction table with new highest bid
            
            conn.execute(update(auctions).where(auctions.c.id == auction_id).values(
                current_highest_bid = bid_amount
            ))
            
            return "Success : Bid Placed!"
        
        
def get_user_bidding_history(user_id):
    with engine.connect() as conn:
        
        j = auctions.join(bids , auctions.c.id == bids.c.auction_id)
        query = select(auctions).select_from(j).where(bids.c.bidder_id == user_id)
        
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]