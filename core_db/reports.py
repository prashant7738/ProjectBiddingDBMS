from sqlalchemy import select, func
from .engine import engine
from .schemas import auctions, bids, users

# core_db/reports.py
def get_system_stats():
    with engine.connect() as conn:
        # We use .scalar() to get the single number result
        total_users = conn.execute(select(func.count(users.c.id))).scalar()
        total_bids = conn.execute(select(func.count(bids.c.id))).scalar()
        total_volume = conn.execute(select(func.sum(auctions.c.current_highest_bid))).scalar()
        
        # Ensure we return 0 instead of None if no auctions exist
        return {
            "total_users": total_users or 0,
            "total_bids": total_bids or 0,
            "total_money_in_play": float(total_volume) if total_volume else 0.0
        }