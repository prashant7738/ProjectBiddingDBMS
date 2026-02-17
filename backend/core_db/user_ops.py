# This is where all User Work are done.

from sqlalchemy import insert , select, delete
from passlib.hash import pbkdf2_sha256  # Professional hashing algorithm
from .engine import engine
from .schemas import users

def hash_password(password):
    return pbkdf2_sha256.hash(password)

def verify_password(password , hashed_password):
    return pbkdf2_sha256.verify(password , hashed_password)


def register_user(name , email , raw_password , initial_balance = 0.0):
    hashed_psw = hash_password(raw_password)
    
    with engine.connect() as conn:
        stmt = insert(users).values(
            name = name,
            email = email,
            password = hashed_psw,
            balance = initial_balance
            
        )
        
        result = conn.execute(stmt)
        conn.commit()
        return result.inserted_primary_key[0]


def authenticate_user(email , typed_pass):
    
    with engine.connect() as conn:
        query = select(users).where(users.c.email == email)
        result = conn.execute(query).first()
        
        if result and verify_password(typed_pass , result.password):
            return dict(result._mapping)
        return None


def get_all_users():
    """Get all users for admin panel."""
    with engine.connect() as conn:
        query = select(users).order_by(users.c.id)
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]


def update_user_balance(user_id, new_balance):
    """Update user balance (admin only)."""
    from sqlalchemy import update
    with engine.connect() as conn:
        # Check if user exists
        user_query = select(users).where(users.c.id == user_id)
        user = conn.execute(user_query).first()
        if not user:
            return None
        
        # Update balance
        stmt = update(users).where(users.c.id == user_id).values(balance=new_balance)
        conn.execute(stmt)
        conn.commit()
        
        # Return updated user
        updated = conn.execute(user_query).first()
        return dict(updated._mapping)


def get_user_balance(user_id):
    """Get user's current balance."""
    with engine.connect() as conn:
        query = select(users.c.balance).where(users.c.id == user_id)
        result = conn.execute(query).first()
        return float(result.balance) if result else None


def delete_user_by_id(user_id):
    """Delete user by id. Returns True if deleted, else False."""
    with engine.connect() as conn:
        exists_query = select(users.c.id).where(users.c.id == user_id)
        existing = conn.execute(exists_query).first()
        if not existing:
            return False

        stmt = delete(users).where(users.c.id == user_id)
        conn.execute(stmt)
        conn.commit()
        return True