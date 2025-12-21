# this is where all database table are created

from sqlalchemy import MetaData , Table , Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.sql import func


# NOTE : Numeric is float
# Metadata is the container which hold all table info
metadata = MetaData()
# User Table

users= Table(
    "users", metadata,
    Column("id",Integer , primary_key=True),
    Column("username", String(50), unique=True , nullable = False),
    Column("email", String(100), unique=True),
    Column("password", String(20), nullable= False),
    Column("balance", Numeric(10,2), server_default="0.00")
)