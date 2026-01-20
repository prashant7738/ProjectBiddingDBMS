from sqlalchemy import insert , select, and_, update
from datetime import datetime
from .engine import engine
from .schemas import auctions

def create_auction(seller_id , title , description, category_id, starting_price , end_time):
    # saves a new auction to the database
    with engine.connect() as conn:
        stmt = insert(auctions).values(
            seller_id = seller_id,
            title = title,
            description = description,
            category_id = category_id,
            starting_price = starting_price,
            end_time = end_time,
            current_highest_bid = starting_price
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