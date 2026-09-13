from sqlalchemy import insert, delete, select, and_, func
from .engine import engine
from .schemas import auction_watchlist, auctions, users, categories, bids


def add_to_watchlist(user_id, auction_id):
    with engine.connect() as conn:
        existing = select(auction_watchlist).where(
            and_(
                auction_watchlist.c.user_id == user_id,
                auction_watchlist.c.auction_id == auction_id,
            )
        )
        if conn.execute(existing).first():
            return "Success: Already saved"

        conn.execute(insert(auction_watchlist).values(user_id=user_id, auction_id=auction_id))
        conn.commit()
        return "Success: Auction saved"


def remove_from_watchlist(user_id, auction_id):
    with engine.connect() as conn:
        stmt = delete(auction_watchlist).where(
            and_(
                auction_watchlist.c.user_id == user_id,
                auction_watchlist.c.auction_id == auction_id,
            )
        )
        conn.execute(stmt)
        conn.commit()
        return "Success: Auction removed"


def get_user_watchlist(user_id):
    """
    Auctions a user has saved, in the same list-card shape the rest of the
    API returns (seller/category names, bid_count) so the frontend can reuse
    its existing normalizeAuction/AuctionCard for this list.
    """
    with engine.connect() as conn:
        bid_counts = (
            select(
                bids.c.auction_id,
                func.count(bids.c.id).label('bid_count')
            )
            .group_by(bids.c.auction_id)
            .subquery()
        )

        j = (
            auction_watchlist
            .join(auctions, auction_watchlist.c.auction_id == auctions.c.id)
            .join(users, auctions.c.seller_id == users.c.id)
            .outerjoin(categories, auctions.c.category_id == categories.c.id)
            .outerjoin(bid_counts, auctions.c.id == bid_counts.c.auction_id)
        )

        query = (
            select(
                auctions,
                users.c.name.label('seller_name'),
                categories.c.name.label('category_name'),
                bid_counts.c.bid_count,
            )
            .select_from(j)
            .where(auction_watchlist.c.user_id == user_id)
            .order_by(auction_watchlist.c.created_at.desc())
        )

        result = conn.execute(query)
        return [dict(row._mapping) for row in result]
