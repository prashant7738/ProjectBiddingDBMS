# this is where all database table are created

from sqlalchemy import MetaData , Table , Column, Integer, String, Numeric, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func


# NOTE : Numeric is float
# Metadata is the container which hold all table info
metadata = MetaData()
# User Table

users= Table(
    "users", metadata,
    Column("id",Integer , primary_key=True),
    Column("name", String(50), unique=True , nullable = False),
    Column("email", String(100), unique=True),
    Column("password", String(200), nullable= False),
    Column("balance", Numeric(10,2), server_default="0.00")
)

auctions = Table(
    "auctions", metadata,
    Column("id", Integer, primary_key=True),
    Column("seller_id", ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("title", String(255), nullable=False),
    Column("description", String(500)),
    Column("starting_price", Numeric(12, 2), nullable=False),
    Column("current_highest_bid", Numeric(12, 2)), # Helps track price easily
    Column("end_time", DateTime, nullable=False),
    Column("is_active", Boolean, server_default="true"), # To mark finished auctions
)

bids = Table(
    "bids", metadata,
    Column("id", Integer, primary_key=True),
    Column("auction_id", ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False),
    Column("bidder_id", ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("amount", Numeric(12, 2), nullable=False),
    Column("bid_time", DateTime, server_default=func.now()), # Records exactly when bid was placed
)