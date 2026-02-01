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


def get_user_bid_for_auction(user_id, auction_id):
    """
    Get the user's highest bid for a specific auction.
    Returns the bid amount or None if user hasn't bid.
    """
    with engine.connect() as conn:
        query = select(bids).where(
            and_(
                bids.c.bidder_id == user_id,
                bids.c.auction_id == auction_id
            )
        ).order_by(bids.c.amount.desc()).limit(1)
        
        result = conn.execute(query).first()
        if result:
            return {
                'amount': float(result.amount),
                'bid_time': result.bid_time,
                'auction_id': result.auction_id
            }
        return None


def get_auction_bid_history(auction_id):
    """
    Get all bids for a specific auction ordered by amount (highest first).
    Returns list of bids with bidder info.
    """
    with engine.connect() as conn:
        # Join bids with users to get bidder names
        j = bids.join(users, bids.c.bidder_id == users.c.id)
        query = select(
            bids.c.id,
            bids.c.amount,
            bids.c.bid_time,
            bids.c.bidder_id,
            users.c.name.label('bidder_name')
        ).select_from(j).where(
            bids.c.auction_id == auction_id
        ).order_by(bids.c.amount.desc())
        
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]