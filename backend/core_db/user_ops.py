# This is where all User Work are done.

from sqlalchemy import insert , select
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