from sqlalchemy import insert , select, and_, update, func
from django.utils import timezone
from .engine import engine
from .schemas import auctions, auction_registrations, users, bids, categories


def _winning_bids_subquery():
    max_amount_per_auction = (
        select(
            bids.c.auction_id,
            func.max(bids.c.amount).label('max_amount')
        )
        .group_by(bids.c.auction_id)
        .subquery()
    )

    latest_max_bid_time = (
        select(
            bids.c.auction_id,
            func.max(bids.c.bid_time).label('latest_bid_time')
        )
        .select_from(
            bids.join(
                max_amount_per_auction,
                and_(
                    bids.c.auction_id == max_amount_per_auction.c.auction_id,
                    bids.c.amount == max_amount_per_auction.c.max_amount
                )
            )
        )
        .group_by(bids.c.auction_id)
        .subquery()
    )

    winning_bids = (
        select(
            bids.c.auction_id,
            bids.c.bidder_id.label('winner_id'),
            bids.c.amount.label('winning_amount'),
            bids.c.bid_time.label('winning_bid_time')
        )
        .select_from(
            bids.join(
                max_amount_per_auction,
                and_(
                    bids.c.auction_id == max_amount_per_auction.c.auction_id,
                    bids.c.amount == max_amount_per_auction.c.max_amount
                )
            )
            .join(
                latest_max_bid_time,
                and_(
                    bids.c.auction_id == latest_max_bid_time.c.auction_id,
                    bids.c.bid_time == latest_max_bid_time.c.latest_bid_time
                )
            )
        )
        .subquery()
    )

    return winning_bids

def create_auction(seller_id , title , description, category_id, starting_price , end_time,start_time=None, image_url=None ):
    # If start_time is not provided, use current time
    if start_time is None:
        start_time = timezone.now()
    
    # saves a new auction to the database
    with engine.connect() as conn:
        stmt = insert(auctions).values(
            seller_id = seller_id,
            title = title,
            description = description,
            category_id = category_id,
            starting_price = starting_price,
            start_time = start_time,
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
        now = timezone.now()
        bid_counts = (
            select(
                bids.c.auction_id,
                func.count(bids.c.id).label('bid_count')
            )
            .group_by(bids.c.auction_id)
            .subquery()
        )
        j = (
            auctions
            .join(users, auctions.c.seller_id == users.c.id)
            .outerjoin(categories, auctions.c.category_id == categories.c.id)
            .outerjoin(bid_counts, auctions.c.id == bid_counts.c.auction_id)
        )
        query = (
            select(
                auctions,
                users.c.name.label('seller_name'),
                categories.c.name.label('category_name'),
                bid_counts.c.bid_count
            )
            .select_from(j)
            .where(
                and_(
                    auctions.c.end_time > now,
                    auctions.c.is_active == True
                )
            )
        )
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]


def get_ended_auctions():
    """
    SQL: SELECT * FROM auctions WHERE end_time <= NOW()
    """
    with engine.connect() as conn:
        now = timezone.now()
        seller = users.alias('seller')
        winner = users.alias('winner')
        winning_bids = _winning_bids_subquery()
        bid_counts = (
            select(
                bids.c.auction_id,
                func.count(bids.c.id).label('bid_count')
            )
            .group_by(bids.c.auction_id)
            .subquery()
        )
        j = (
            auctions
            .join(seller, auctions.c.seller_id == seller.c.id)
            .outerjoin(categories, auctions.c.category_id == categories.c.id)
            .outerjoin(winning_bids, auctions.c.id == winning_bids.c.auction_id)
            .outerjoin(winner, winning_bids.c.winner_id == winner.c.id)
            .outerjoin(bid_counts, auctions.c.id == bid_counts.c.auction_id)
        )
        query = (
            select(
                auctions,
                seller.c.name.label('seller_name'),
                winner.c.name.label('winner_name'),
                categories.c.name.label('category_name'),
                bid_counts.c.bid_count
            )
            .select_from(j)
            .where(auctions.c.end_time <= now)
        )
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]
    
    

def get_auction_by_id(auction_id):
    """
    Get a specific auction by ID
    """
    with engine.connect() as conn:
        seller = users.alias('seller')
        winner = users.alias('winner')
        winning_bids = _winning_bids_subquery()
        bid_counts = (
            select(
                bids.c.auction_id,
                func.count(bids.c.id).label('bid_count')
            )
            .group_by(bids.c.auction_id)
            .subquery()
        )
        j = (
            auctions
            .join(seller, auctions.c.seller_id == seller.c.id)
            .outerjoin(categories, auctions.c.category_id == categories.c.id)
            .outerjoin(winning_bids, auctions.c.id == winning_bids.c.auction_id)
            .outerjoin(winner, winning_bids.c.winner_id == winner.c.id)
            .outerjoin(bid_counts, auctions.c.id == bid_counts.c.auction_id)
        )
        query = (
            select(
                auctions,
                seller.c.name.label('seller_name'),
                winner.c.name.label('winner_name'),
                categories.c.name.label('category_name'),
                bid_counts.c.bid_count
            )
            .select_from(j)
            .where(auctions.c.id == auction_id)
        )
        result = conn.execute(query)
        row = result.first()
        return dict(row._mapping) if row else None


def get_auctions_by_seller(seller_id):
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
            auctions
            .outerjoin(categories, auctions.c.category_id == categories.c.id)
            .outerjoin(bid_counts, auctions.c.id == bid_counts.c.auction_id)
        )
        
        query = (
            select(
                auctions,
                categories.c.name.label('category_name'),
                bid_counts.c.bid_count
            )
            .select_from(j)
            .where(auctions.c.seller_id == seller_id)
            .order_by(auctions.c.start_time.desc())
        )
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]


def get_all_auctions_admin():
    with engine.connect() as conn:
        seller = users.alias('seller')
        winner = users.alias('winner')
        winning_bids = _winning_bids_subquery()
        bid_counts = (
            select(
                bids.c.auction_id,
                func.count(bids.c.id).label('bid_count')
            )
            .group_by(bids.c.auction_id)
            .subquery()
        )

        j = (
            auctions
            .join(seller, auctions.c.seller_id == seller.c.id)
            .outerjoin(categories, auctions.c.category_id == categories.c.id)
            .outerjoin(winning_bids, auctions.c.id == winning_bids.c.auction_id)
            .outerjoin(winner, winning_bids.c.winner_id == winner.c.id)
            .outerjoin(bid_counts, auctions.c.id == bid_counts.c.auction_id)
        )

        query = (
            select(
                auctions,
                seller.c.name.label('seller_name'),
                seller.c.email.label('seller_email'),
                seller.c.balance.label('seller_balance'),
                winner.c.name.label('winner_name'),
                winner.c.email.label('winner_email'),
                winner.c.balance.label('winner_balance'),
                categories.c.name.label('category_name'),
                bid_counts.c.bid_count
            )
            .select_from(j)
        )

        result = conn.execute(query)
        return [dict(row._mapping) for row in result]
    
    
# This fuction is a maintiance type function which set is_active to false if the time is finished for the auciton 
def close_expired_auctions():
    with engine.connect() as conn:
        now = timezone.now()
        winning_bids = _winning_bids_subquery()

        ended_query = (
            select(
                auctions.c.id,
                auctions.c.seller_id,
                winning_bids.c.winner_id,
                winning_bids.c.winning_amount
            )
            .select_from(
                auctions.outerjoin(winning_bids, auctions.c.id == winning_bids.c.auction_id)
            )
            .where(
                and_(
                    auctions.c.end_time < now,
                    auctions.c.is_active == True
                )
            )
        )

        closed_count = 0
        with conn.begin():
            for row in conn.execute(ended_query):
                auction_id = row.id
                seller_id = row.seller_id
                winner_id = row.winner_id
                winning_amount = row.winning_amount

                # Settle balances if there is a winner
                if winner_id and winning_amount:
                    buyer_balance = conn.execute(
                        select(users.c.balance).where(users.c.id == winner_id)
                    ).scalar()

                    if buyer_balance is not None and buyer_balance >= winning_amount:
                        conn.execute(
                            update(users)
                            .where(users.c.id == winner_id)
                            .values(balance=users.c.balance - winning_amount)
                        )
                        conn.execute(
                            update(users)
                            .where(users.c.id == seller_id)
                            .values(balance=users.c.balance + winning_amount)
                        )

                conn.execute(
                    update(auctions)
                    .where(auctions.c.id == auction_id)
                    .values(is_active=False)
                )
                closed_count += 1

        return closed_count


def delete_auction(auction_id):
    with engine.connect() as conn:
        stmt = auctions.delete().where(auctions.c.id == auction_id)
        result = conn.execute(stmt)
        conn.commit()
        return result.rowcount


def update_auction(auction_id, **kwargs):
    """
    Update auction fields. Only updates provided fields.
    kwargs can include: title, description, category_id, starting_price, end_time, image_url
    """
    with engine.connect() as conn:
        # Only update fields that are provided
        update_data = {k: v for k, v in kwargs.items() if v is not None}
        
        if not update_data:
            return None
        
        stmt = update(auctions).where(auctions.c.id == auction_id).values(**update_data)
        result = conn.execute(stmt)
        conn.commit()
        
        if result.rowcount > 0:
            # Return updated auction
            return get_auction_by_id(auction_id)
        return None


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