# 🏷️ Live Bid — Project Bidding System

> A full-stack project bidding platform connecting clients and freelancers through competitive bidding. Built for a DBMS course.

[Live Demo](https://project-bidding-dbms.vercel.app)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Contributors](#contributors)
- [Academic Context](#academic-context)

---

## 📖 Overview

**Live Bid** is a web app where:
- Clients post projects/auctions with description, budget, and deadline
- Freelancers/bidders browse auctions and submit bids
- Clients review and accept bids

---

## 🛠️ Tech Stack

**Backend:** Python 3.8+, Django, SQLAlchemy Core (raw SQL), PostgreSQL, Django REST Framework  
**Frontend:** HTML5, CSS3, JavaScript (React), Vercel  
**DevOps:** GitHub Actions, Vercel, Git

---

## ✨ Features

- User registration/login
- Role-based access control
- Clients: post/edit/delete auctions
- Freelancers: submit bids, track bids, register for auctions
- Dashboard for both roles
- Only one accepted bid per auction

---

## 📂 Project Structure

```
ProjectBiddingDBMS/
├── backend/
│   ├── api/           # Django app: views, serializers, models, auth
│   ├── core_db/       # SQLAlchemy core logic: auction_ops, bid_ops, reports
│   ├── project_main/  # Django project: settings, urls, wsgi/asgi
│   ├── media/         # Uploaded files
│   ├── manage.py      # Django CLI
│   ├── requirements.txt
├── frontend/
│   ├── src/           # React components, pages, context, assets
│   ├── public/        # Static files
│   ├── index.html
│   ├── package.json
├── .github/
│   └── workflows/     # CI/CD
└── README.md
```

---

## 🗄️ Database Schema

Your project uses **five main tables**:

### `users`
| Column    | Type         | Constraint                    |
|-----------|--------------|------------------------------|
| id        | Integer      | PRIMARY KEY                  |
| name      | String(50)   | NOT NULL                     |
| email     | String(100)  | UNIQUE, NOT NULL             |
| password  | String(200)  | NOT NULL                     |
| balance   | Numeric(10,2)| DEFAULT 0.00, >= 0           |

### `categories`
| Column    | Type         | Constraint                    |
|-----------|--------------|------------------------------|
| id        | Integer      | PRIMARY KEY                  |
| name      | String(100)  | UNIQUE, NOT NULL             |

### `auctions`
| Column              | Type           | Constraint                        |
|---------------------|----------------|-----------------------------------|
| id                  | Integer        | PRIMARY KEY                       |
| seller_id           | Integer        | FK → users(id), NOT NULL          |
| title               | String(255)    | NOT NULL                          |
| description         | String(500)    |                                   |
| image_url           | String(500)    |                                   |
| category_id         | Integer        | FK → categories(id), nullable     |
| starting_price      | Numeric(12,2)  | NOT NULL                          |
| current_highest_bid | Numeric(12,2)  |                                   |
| start_time          | DateTime       | NOT NULL                          |
| end_time            | DateTime       | NOT NULL                          |
| is_active           | Boolean        | DEFAULT true                      |

### `bids`
| Column    | Type           | Constraint                        |
|-----------|----------------|-----------------------------------|
| id        | Integer        | PRIMARY KEY                       |
| auction_id| Integer        | FK → auctions(id), NOT NULL       |
| bidder_id | Integer        | FK → users(id), NOT NULL          |
| amount    | Numeric(12,2)  | NOT NULL                          |
| bid_time  | DateTime       | DEFAULT now()                     |

### `auction_registrations`
| Column        | Type      | Constraint                        |
|---------------|-----------|-----------------------------------|
| id            | Integer   | PRIMARY KEY                       |
| auction_id    | Integer   | FK → auctions(id), NOT NULL       |
| user_id       | Integer   | FK → users(id), NOT NULL          |
| registered_at | DateTime  | DEFAULT now()                     |

**Entity Relationships:**
```
users ──< auctions
users ──< bids
users ──< auction_registrations
categories ──< auctions
auctions ──< bids
auctions ──< auction_registrations
```

---

## 🔌 API Endpoints

All endpoints return JSON. Auth required for some routes.

### Auth
| Method | Endpoint              | Auth | Description           |
| ------ | --------------------- | ---- | --------------------- |
| POST   | /api/auth/register    | No   | Register new user     |
| POST   | /api/auth/login       | No   | Login, receive token  |
| POST   | /api/auth/logout      | Yes  | Logout                |
| GET    | /api/auth/profile     | Yes  | Get user profile      |

### Auctions
| Method | Endpoint              | Auth         | Description         |
| ------ | --------------------- | ------------ | ------------------- |
| GET    | /api/auctions/        | No           | List open auctions  |
| GET    | /api/auctions/:id/    | No           | Auction details     |
| POST   | /api/auctions/        | Yes (Seller) | Create auction      |
| PUT    | /api/auctions/:id/    | Yes (Owner)  | Update auction      |
| DELETE | /api/auctions/:id/    | Yes (Owner)  | Delete auction      |

### Bids
| Method | Endpoint                      | Auth           | Description           |
| ------ | ----------------------------- | -------------- | --------------------- |
| GET    | /api/auctions/:id/bids/       | Yes            | Get bids for auction  |
| POST   | /api/auctions/:id/bids/       | Yes (Bidder)   | Submit bid            |
| PUT    | /api/bids/:id/accept/         | Yes (Seller)   | Accept bid            |
| PUT    | /api/bids/:id/reject/         | Yes (Seller)   | Reject bid            |
| GET    | /api/bids/my/                 | Yes (Bidder)   | My submitted bids     |

### Categories
| Method | Endpoint              | Auth | Description           |
| ------ | --------------------- | ---- | --------------------- |
| GET    | /api/categories/      | No   | List categories       |

### Auction Registrations
| Method | Endpoint                              | Auth         | Description                |
| ------ | ------------------------------------- | ------------ | -------------------------- |
| POST   | /api/auctions/:id/register/           | Yes (User)   | Register for auction       |
| GET    | /api/auctions/:id/registrations/      | Yes (Seller) | List registered users      |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- PostgreSQL 13+
- Node.js 16+
- Git

### 1. Clone the Repository
```sh
git clone https://github.com/prashant7738/ProjectBiddingDBMS.git
cd ProjectBiddingDBMS
```

### 2. Backend Setup
```sh
cd backend
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows
pip install -r requirements.txt
```

### 3. Configure PostgreSQL
```sh
psql -U postgres
CREATE DATABASE project_bidding;
\q
```

### 4. Run Migrations
```sh
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Optional)
```sh
python manage.py createsuperuser
```

### 6. Start Backend Server
```sh
python manage.py runserver
# API at http://localhost:8000
```

### 7. Frontend Setup
```sh
cd ../frontend
npx serve .
# Frontend at http://localhost:3000
```

---

## 🌐 Deployment

**Frontend:** Vercel ([project-bidding-dbms.vercel.app](https://project-bidding-dbms.vercel.app))  
**Backend:** Gunicorn, Railway/Render/AWS/Heroku

```sh
pip install gunicorn
gunicorn project_main.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

---

## 👥 Contributors

| Name     | GitHub                       |
| -------- | ---------------------------- |
| Prashant | [@prashant7738](https://github.com/prashant7738) |

---

## 🎓 Academic Context

Built for 6th Semester DBMS course:
- Relational DB design & normalization
- Raw SQL via SQLAlchemy Core
- PostgreSQL production DB
- Django REST API
- Full-stack web development

---

