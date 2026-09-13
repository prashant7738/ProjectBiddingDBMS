# One-off, idempotent script to add the indexes declared in core_db/schemas.py
# to a database that was already provisioned before they were added.
# create_table.py only creates missing *tables*, not indexes on existing ones,
# so run this once against an existing DB: `python apply_indexes.py`

from sqlalchemy import Index

from core_db.engine import engine
from core_db.schemas import auctions, bids, auction_registrations

INDEXES = [
    Index("ix_auctions_end_time", auctions.c.end_time),
    Index("ix_auctions_is_active", auctions.c.is_active),
    Index("ix_bids_auction_id", bids.c.auction_id),
    Index("ix_bids_bidder_id", bids.c.bidder_id),
    Index("ix_auction_registrations_auction_id", auction_registrations.c.auction_id),
    Index("ix_auction_registrations_user_id", auction_registrations.c.user_id),
]

print("Applying indexes...")
for index in INDEXES:
    index.create(bind=engine, checkfirst=True)
    print(f"  ok: {index.name}")
print("Done.")
