# 🛠️ AuctionQuest: Relational Bidding System

A high-performance bidding backend built using **Python**, **Django REST Framework**, and **SQLAlchemy Core**, backed by **PostgreSQL**. This project demonstrates advanced database concepts including ACID transactions, relational mapping, and custom security.

## 🚀 Key Features

- **4-Table Relational Schema:** Users, Categories, Auctions, and Bids.
- **ACID Compliant Bidding:** Uses database transactions to ensure bid integrity and prevent race conditions.
- **Custom Authentication:** Implements password hashing using `pbkdf2_sha256` without relying on Django's built-in User model.
- **RESTful API:** Clean JSON endpoints for listing auctions, placing bids, and viewing user-specific dashboards.
- **Advanced Filtering:** Capability to filter auctions by seller and track individual bidding histories.

---

## 🏗️ Database Architecture

The project uses **SQLAlchemy Core** for direct control over SQL queries and schema definition.

### Table Descriptions:

1. **Users:** Stores identity and wallet balance.
2. **Categories:** Logical grouping for auction items.
3. **Auctions:** Primary entity containing timing logic and price tracking.
4. **Bids:** Join table tracking the many-to-many relationship between Users and Auctions.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.x, Django 6.0
- **API Framework:** Django REST Framework (DRF)
- **Database Tooling:** SQLAlchemy Core
- **Database:** PostgreSQL
- **Security:** Passlib (PBKDF2-SHA256)

---

## 🚦 API Endpoints

### Auctions

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| `GET` | `/api/auctions/` | List all active auctions |
| `GET` | `/api/my-auctions/<user_id>/` | List auctions created by a specific user |

### Bidding

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| `POST` | `/api/bids/place/` | Place a new bid (Validates balance & price) |
| `GET` | `/api/my-bids/<user_id>/` | View all auctions a user has participated in |

---

## 🔧 Installation & Setup

1. **Clone the project**
2. **Create a Virtual Environment:**Bash
    
    `python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate`
    
3. **Install Dependencies:**Bash
    
    `pip install django djangorestframework sqlalchemy psycopg2 passlib`
    
4. Setup Database:Bash
    
    Update core_db/engine.py with your PostgreSQL credentials and run:
    
    `python create_table.py`
    
5. **Run the Server:**Bash
    
    `python manage.py runserver`
    

---

## 🛡️ Business Logic Rules (The "Bidding Guardrails")

The system strictly enforces the following rules at the database level:

- Users cannot bid on their own auctions.
- Bids must be higher than the `current_highest_bid`.
- Users must have a `balance` greater than or equal to their bid amount.
- Bids are rejected if the `end_time` has passed.
