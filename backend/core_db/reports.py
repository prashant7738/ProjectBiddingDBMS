from datetime import timedelta

from sqlalchemy import select, func
from django.utils import timezone

from .engine import engine
from .schemas import auctions, bids, users, categories

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


def get_daily_activity(days=14):
    """
    Auctions created and bids placed per day over the trailing window, plus
    a category breakdown — feeds the admin dashboard's activity sparkline
    and category donut without the frontend needing to fetch every auction.
    """
    with engine.connect() as conn:
        since = timezone.now() - timedelta(days=days)

        auctions_by_day = conn.execute(
            select(
                func.date(auctions.c.start_time).label('day'),
                func.count(auctions.c.id).label('count'),
            )
            .where(auctions.c.start_time >= since)
            .group_by(func.date(auctions.c.start_time))
        ).fetchall()

        bids_by_day = conn.execute(
            select(
                func.date(bids.c.bid_time).label('day'),
                func.count(bids.c.id).label('count'),
            )
            .where(bids.c.bid_time >= since)
            .group_by(func.date(bids.c.bid_time))
        ).fetchall()

        category_breakdown = conn.execute(
            select(
                categories.c.name,
                func.count(auctions.c.id).label('count'),
            )
            .select_from(auctions.outerjoin(categories, auctions.c.category_id == categories.c.id))
            .group_by(categories.c.name)
        ).fetchall()

        return {
            "auctions_by_day": [{"day": str(r.day), "count": r.count} for r in auctions_by_day],
            "bids_by_day": [{"day": str(r.day), "count": r.count} for r in bids_by_day],
            "category_breakdown": [
                {"category": r.name or "Uncategorized", "count": r.count} for r in category_breakdown
            ],
        }