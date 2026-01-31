from sqlalchemy import insert , select , and_ , update
from datetime import datetime
from .engine import engine 
from .schemas import bids , auctions , users, auction_registrations

def place_bid(bidder_id , auction_id , bid_amount):
    with engine.connect() as conn:
        with conn.begin():
            
            auction_q = select(auctions).where(auctions.c.id == auction_id)
            auction = conn.execute(auction_q).first()
            
            # if auction exists
            if not auction:
                return "Error : Auction Not Found"
            
            # Check if user is registered for this auction
            registration_q = select(auction_registrations).where(
                and_(
                    auction_registrations.c.user_id == bidder_id,
                    auction_registrations.c.auction_id == auction_id
                )
            )
            if not conn.execute(registration_q).first():
                return "Error: You are not registered for this auction. Please register first."
            
            # to check if auction is started or not
            if datetime.now() <= auction.start_time:
                return "ERROR : the time is not started"
            
            # Check if auction is still open
            if datetime.now() >= auction.end_time:
                return "ERROR : the time is finished"
            
            
            # Check if bid is high enough
            
            if bid_amount <= (auction.current_highest_bid or 0):
                return f"Error : bid amount should be higher than {auction.current_highest_bid}"
            
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