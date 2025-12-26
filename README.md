# ProjectBiddingDBMS
This is the dbms project of our 6th sem

Tables 

1. Users 
2. Auctions(The items) : what is being sold
3. Bids :  Real-Time Transactions (one to many) one auction has many relationship
4. notifications (the event log) : in real time we need to track when someone is outbid or auction closes   COLUMNS: id, user, message , is_read , created at . 
5. Auctions results (final ledger) final state of auction


File ROOT for backend:

bidding_project/
│
├── [manage.py](http://manage.py/)
├── bidding_project/          # Project Configuration
│   ├── **init**.py
│   ├── [settings.py](http://settings.py/)           # Database credentials go here
│   ├── [urls.py](http://urls.py/)               # Main routing
│   └── [wsgi.py](http://wsgi.py/)
│
├── core_db/                  # <--- YOUR NEW DATABASE LAYER
│   ├── __init**__**.py
│   ├── engine.py       # Setup the SQLAlchemy engine & connection pool
│   ├── [schemas.py](http://schemas.py/)            # Define your Tables (Users, Auctions, Bids, etc.)
│   └── operations/           # Python functions that run the SQL
│       ├── **init**.py
│       ├── user_ops.py       # SQL logic for Users
│       ├── auction_ops.py    # SQL logic for Auctions
│       └── bid_ops.py         # SQL logic for Bidding & Transactions
│
├── api/                      # <--- YOUR DJANGO REST FRAMEWORK LAYER
│   ├── **init**.py
│   ├── [urls.py](http://urls.py/)               # API endpoints
│   ├── [views.py](http://views.py/)              # Logic to connect DRF to SQLAlchemy operations
│   ├── [serializers.py](http://serializers.py/)        # Maps SQL results to JSON
│   └── [authenticators.py](http://authenticators.py/)     # Custom Auth logic (since you're not using ORM)
│
└── requirements.txt          # sqlalchemy, psycopg2-binary, djangorestframework

DATABASE:

*create database bidding_system;*  // This is the code to run in terminal to   create Database (which should run locally)

[engine.py](http://engine.py) —> This file links with database running locally

[schemas.py](http://schemas.py) —> This file creates all the database table

create_table.py —> It is temporary file which when run execute database of  [schemas.py](http://schemas.py) (used to do                                      any changes in database)
