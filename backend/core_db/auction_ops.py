from sqlalchemy import insert , select, and_, update
from datetime import datetime
from .engine import engine
from .schemas import auctions, auction_registrations, users

def create_auction(seller_id , title , description, category_id, starting_price , end_time, image_url=None):
    # saves a new auction to the database
    with engine.connect() as conn:
        stmt = insert(auctions).values(
            seller_id = seller_id,
            title = title,
            description = description,
            category_id = category_id,
            starting_price = starting_price,
            end_time = end_time,
            current_highest_bid = starting_price,
            image_url = image_url
        )
        result = conn.execute(stmt)
        conn.commit()
        return f"Sucess! Auction id: {result.inserted_primary_key[0]}"
    
    
    
def get_active_auctions():
    """
    SQL: SELECT * FROM auctions WHERE end_time > NOW() AND is_active = true
    """
    with engine.connect() as conn:
        now = datetime.now()
        query = select(auctions).where(
            and_(
                auctions.c.end_time > now,
                auctions.c.is_active == True
            )
        )
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]
    
    

def get_auction_by_id(auction_id):
    """
    Get a specific auction by ID
    """
    with engine.connect() as conn:
        query = select(auctions).where(auctions.c.id == auction_id)
        result = conn.execute(query)
        row = result.first()
        return dict(row._mapping) if row else None


def get_auctions_by_seller(seller_id):
    with engine.connect() as conn:
        query = select(auctions).where(auctions.c.seller_id == seller_id)
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]
    
    
# This fuction is a maintiance type function which set is_active to false if the time is finished for the auciton 
def close_expired_auctions():
    with engine.connect() as conn:
        now = datetime.now()
        stmt = update(auctions).where(
            and_(auctions.c.end_time < now,
                 auctions.c.is_active == True
                 )
        ).values(is_active = False)
        
        result = conn.execute(stmt)
        conn.commit()
        # TO return how many auctions has been closed out
        return result.rowcount 


def register_user_for_auction(user_id, auction_id):
    """
    Register a user for an auction.
    Returns success message or error.
    """
    with engine.connect() as conn:
        with conn.begin():
            # Check if user exists
            user_query = select(users).where(users.c.id == user_id)
            user = conn.execute(user_query).first()
            if not user:
                return "Error: User not found"
            
            # Check if auction exists
            auction_query = select(auctions).where(auctions.c.id == auction_id)
            auction = conn.execute(auction_query).first()

            if not auction:
                return "Error: Auction not found"
            
            # Check if user is already registered
            
            existing = select(auction_registrations).where(
                and_(
                    auction_registrations.c.user_id == user_id,
                    auction_registrations.c.auction_id == auction_id
                )
            )
            if conn.execute(existing).first():
                return "Error: User is already registered for this auction"
            
            # Register user for auction
            conn.execute(insert(auction_registrations).values(
                user_id=user_id,
                auction_id=auction_id
            ))
            
            return "Success: User registered for auction"


def is_user_registered_for_auction(user_id, auction_id):
    """
    Check if a user is registered for a specific auction.
    Returns True if registered, False otherwise.
    """
    with engine.connect() as conn:
        query = select(auction_registrations).where(
            and_(
                auction_registrations.c.user_id == user_id,
                auction_registrations.c.auction_id == auction_id
            )
        )
        result = conn.execute(query).first()
        return result is not None


def get_auction_registrations(auction_id):
    """
    Get all users registered for a specific auction.
    """
    with engine.connect() as conn:
        query = select(users).select_from(
            auction_registrations.join(users, auction_registrations.c.user_id == users.c.id)
        ).where(auction_registrations.c.auction_id == auction_id)
        
        result = conn.execute(query)
        return [dict(row._mapping) for row in result] 