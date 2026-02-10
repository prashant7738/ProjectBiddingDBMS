from sqlalchemy import insert , select , and_ , update
from decimal import Decimal
from datetime import timedelta
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
            
            # Check if user has enough balance
            user_q = select(users).where(users.c.id == bidder_id)
            user = conn.execute(user_q).first()
            if not user:
                return "Error: User not found"
            
            user_balance = Decimal(str(user.balance or 0))
            if user_balance < bid_amount:
                return f"Error: Insufficient balance. Your balance: Rs {user_balance}, Required: Rs {bid_amount}"
            
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
    """
    Get all auctions that a user has bid on.
    Returns one auction per bid (the latest bid for each auction).
    """
    with engine.connect() as conn:
        # Subquery to get the latest bid time for each auction by this user
        latest_bid_per_auction = (
            select(
                bids.c.auction_id,
                func.max(bids.c.bid_time).label('latest_bid_time')
            )
            .where(bids.c.bidder_id == user_id)
            .group_by(bids.c.auction_id)
            .subquery()
        )
        
        # Join auctions with the latest bids and seller info
        j = (
            auctions
            .join(latest_bid_per_auction, auctions.c.id == latest_bid_per_auction.c.auction_id)
            .join(users, auctions.c.seller_id == users.c.id)
        )
        
        query = (
            select(auctions, users.c.name.label('seller_name'))
            .select_from(j)
            .order_by(auctions.c.start_time.desc())
        )
        
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


def get_won_items(user_id):
    """
    Get auctions that the user has won (highest bid after auction end).
    If multiple bids have the same highest amount, the latest bid wins.
    """
    with engine.connect() as conn:
        now = timezone.now()

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

        j = (
            auctions
            .join(winning_bids, auctions.c.id == bids.c.auction_id)
            .join(users, auctions.c.seller_id == users.c.id)
        )

        query = (
            select(
                auctions,
                users.c.name.label('seller_name')
            )
            .select_from(j)
            .where(
                and_(
                    bids.c.bidder_id == user_id,
                    auctions.c.end_time < now
                )
            )
            .order_by(auctions.c.end_time.desc())
        )

        result = conn.execute(query)
        return [dict(row._mapping) for row in result]


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


def get_user_notifications(user_id, since=None):
    """
    Build notification list for a user since a given datetime.
    Notifications include: auction started/ended (registered), outbid, and won.
    """
    now = timezone.now()
    since_time = since or (now - timedelta(days=7))

    notifications = []

    with engine.connect() as conn:
        # Auction started/ended for registered users
        reg_join = auction_registrations.join(auctions, auction_registrations.c.auction_id == auctions.c.id)
        reg_query = select(
            auctions.c.id.label('auction_id'),
            auctions.c.title.label('title'),
            auctions.c.start_time,
            auctions.c.end_time
        ).select_from(reg_join).where(auction_registrations.c.user_id == user_id)

        for row in conn.execute(reg_query):
            if row.start_time and since_time < row.start_time <= now:
                notifications.append({
                    'id': f"start:{row.auction_id}:{int(row.start_time.timestamp())}",
                    'type': 'auction_started',
                    'auction_id': row.auction_id,
                    'message': f"Auction started: {row.title}",
                    'time': row.start_time.isoformat(),
                    'read': False,
                })
            if row.end_time and since_time < row.end_time <= now:
                notifications.append({
                    'id': f"end:{row.auction_id}:{int(row.end_time.timestamp())}",
                    'type': 'auction_ended',
                    'auction_id': row.auction_id,
                    'message': f"Auction ended: {row.title}",
                    'time': row.end_time.isoformat(),
                    'read': False,
                })

        # Outbid notifications
        user_last_bid = (
            select(
                bids.c.auction_id,
                func.max(bids.c.bid_time).label('user_last_bid_time')
            )
            .where(bids.c.bidder_id == user_id)
            .group_by(bids.c.auction_id)
            .subquery()
        )

        latest_bid = (
            select(
                bids.c.auction_id,
                func.max(bids.c.bid_time).label('latest_bid_time')
            )
            .group_by(bids.c.auction_id)
            .subquery()
        )

        latest_bid_row = bids.alias('latest_bid_row')
        outbid_join = (
            latest_bid
            .join(latest_bid_row, and_(
                latest_bid_row.c.auction_id == latest_bid.c.auction_id,
                latest_bid_row.c.bid_time == latest_bid.c.latest_bid_time
            ))
            .join(user_last_bid, user_last_bid.c.auction_id == latest_bid.c.auction_id)
            .join(auctions, auctions.c.id == latest_bid.c.auction_id)
        )

        outbid_query = select(
            latest_bid.c.auction_id,
            latest_bid.c.latest_bid_time,
            latest_bid_row.c.bidder_id,
            latest_bid_row.c.amount,
            auctions.c.title.label('title')
        ).select_from(outbid_join).where(
            and_(
                latest_bid_row.c.bidder_id != user_id,
                latest_bid.c.latest_bid_time > user_last_bid.c.user_last_bid_time,
                latest_bid.c.latest_bid_time > since_time,
            )
        )

        for row in conn.execute(outbid_query):
            notifications.append({
                'id': f"outbid:{row.auction_id}:{int(row.latest_bid_time.timestamp())}",
                'type': 'outbid',
                'auction_id': row.auction_id,
                'message': f"You've been outbid on {row.title}",
                'time': row.latest_bid_time.isoformat(),
                'read': False,
            })

        # Won notifications
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

        win_join = winning_bids.join(auctions, auctions.c.id == winning_bids.c.auction_id)
        win_query = select(
            winning_bids.c.auction_id,
            winning_bids.c.winning_bid_time,
            auctions.c.title.label('title'),
            auctions.c.end_time
        ).select_from(win_join).where(
            and_(
                winning_bids.c.winner_id == user_id,
                auctions.c.end_time <= now,
                auctions.c.end_time > since_time,
            )
        )

        for row in conn.execute(win_query):
            win_time = row.end_time or row.winning_bid_time or now
            notifications.append({
                'id': f"win:{row.auction_id}:{int(win_time.timestamp())}",
                'type': 'won',
                'auction_id': row.auction_id,
                'message': f"You won {row.title}",
                'time': win_time.isoformat(),
                'read': False,
            })

    notifications.sort(key=lambda n: n.get('time', ''), reverse=True)
    return notifications