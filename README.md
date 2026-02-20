# 🏷️ Live Bid — Project Bidding System

> A full-stack project bidding platform built as a 6th Semester DBMS project, connecting clients with freelancers through a competitive bidding system.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://project-bidding-dbms.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-REST-green?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributors](#-contributors)

---

## 📖 Overview

**Live Bid** is a web application where:

- 👔 **Clients** post projects with a description, budget, and deadline
- 💻 **Freelancers** browse open projects and submit competitive bids
- ✅ **Clients** review bids and accept the best one

The project demonstrates core DBMS concepts including relational schema design, normalization, transactions, and complex SQL queries using **PostgreSQL** with **SQLAlchemy Core** (raw SQL — no ORM) inside a **Django** backend.

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Language | Python 3.8+ |
| Web Framework | Django |
| DB Interface | SQLAlchemy Core (raw SQL, no ORM) |
| Database | PostgreSQL |
| Auth | Django Sessions / JWT |
| API | Django REST Framework |

### Frontend
| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 |
| Logic | Vanilla JavaScript |
| Hosting | Vercel |

### DevOps
| Tool | Purpose |
|------|---------|
| GitHub Actions | CI/CD automation |
| Vercel | Frontend deployment |
| Git | Version control |

---

## ✨ Features

### 👤 User Management
- Register as a **Client** or **Freelancer**
- Secure login with hashed passwords
- Role-based access control

### 📁 Project Management
- Clients can **post, edit, and delete** projects
- Set budget range, deadline, and description
- Projects transition through statuses: `Open → Assigned → Completed`

### 💰 Bidding System
- Freelancers submit bids with proposed price and delivery time
- Clients view all bids on their projects
- Accept or reject individual bids
- Only **one bid can be accepted** per project

### 📊 Dashboard
- Client: View posted projects, received bids, completed work
- Freelancer: Track active bids, won projects, bid history

---

## 📂 Project Structure

```
ProjectBiddingDBMS/
├── backend/
│   ├── app/
│   │   ├── db.py             # SQLAlchemy engine & connection setup
│   │   ├── queries.py        # Raw SQL query functions
│   │   ├── views.py          # Django views / API handlers
│   │   ├── urls.py           # URL routing
│   │   └── serializers.py    # DRF serializers
│   ├── config/
│   │   ├── settings.py       # Django settings
│   │   ├── urls.py           # Root URL config
│   │   └── wsgi.py           # WSGI entry point
│   ├── manage.py             # Django management CLI
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── index.html            # Main HTML entry
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript modules
│   └── assets/               # Images and icons
├── .github/
│   └── workflows/            # GitHub Actions CI/CD
├── package-lock.json
└── README.md
```

---

## 🗄️ Database Schema

The application uses **PostgreSQL** with **SQLAlchemy Core** — all queries are written as raw SQL executed through SQLAlchemy's `engine.connect()`. No ORM models are used. Here are the core tables:

### `users`
| Column | Type | Constraint |
|--------|------|-----------|
| `user_id` | SERIAL | PRIMARY KEY |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `role` | VARCHAR(20) | NOT NULL (`client` / `freelancer`) |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### `projects`
| Column | Type | Constraint |
|--------|------|-----------|
| `project_id` | SERIAL | PRIMARY KEY |
| `client_id` | INTEGER | FOREIGN KEY → users |
| `title` | VARCHAR(200) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `budget_min` | DECIMAL(10,2) | NOT NULL |
| `budget_max` | DECIMAL(10,2) | NOT NULL |
| `deadline` | DATE | NOT NULL |
| `status` | VARCHAR(20) | DEFAULT `open` |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### `bids`
| Column | Type | Constraint |
|--------|------|-----------|
| `bid_id` | SERIAL | PRIMARY KEY |
| `project_id` | INTEGER | FOREIGN KEY → projects |
| `freelancer_id` | INTEGER | FOREIGN KEY → users |
| `bid_amount` | DECIMAL(10,2) | NOT NULL |
| `delivery_days` | INTEGER | NOT NULL |
| `proposal` | TEXT | NOT NULL |
| `status` | VARCHAR(20) | DEFAULT `pending` |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### SQLAlchemy Core — How Queries Are Written

Instead of ORM models, raw SQL is executed directly using SQLAlchemy's engine:

```python
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://user:password@localhost/project_bidding")

# Example: Fetch all open projects
with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM projects WHERE status = 'open'"))
    projects = result.fetchall()

# Example: Insert a new bid
with engine.connect() as conn:
    conn.execute(text("""
        INSERT INTO bids (project_id, freelancer_id, bid_amount, delivery_days, proposal)
        VALUES (:project_id, :freelancer_id, :bid_amount, :delivery_days, :proposal)
    """), {
        "project_id": 1,
        "freelancer_id": 5,
        "bid_amount": 500.00,
        "delivery_days": 14,
        "proposal": "I can deliver this in 2 weeks..."
    })
    conn.commit()
```

### Entity Relationships
```
users (client)    ──< projects
users (freelancer) ──< bids
projects           ──< bids
```

---

## 🔌 API Endpoints

All endpoints return JSON. Authenticated routes require a Bearer token.

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login, receive token |
| `POST` | `/api/auth/logout` | Yes | Logout current session |
| `GET` | `/api/auth/profile` | Yes | Get user profile |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/projects/` | No | List all open projects |
| `GET` | `/api/projects/:id/` | No | Get project details |
| `POST` | `/api/projects/` | Yes (Client) | Create new project |
| `PUT` | `/api/projects/:id/` | Yes (Owner) | Update project |
| `DELETE` | `/api/projects/:id/` | Yes (Owner) | Delete project |

### Bids
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/projects/:id/bids/` | Yes | Get bids for a project |
| `POST` | `/api/projects/:id/bids/` | Yes (Freelancer) | Submit a bid |
| `PUT` | `/api/bids/:id/accept/` | Yes (Client) | Accept a bid |
| `PUT` | `/api/bids/:id/reject/` | Yes (Client) | Reject a bid |
| `GET` | `/api/bids/my/` | Yes (Freelancer) | My submitted bids |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL 13+
- Node.js 16+ (for frontend)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/prashant7738/ProjectBiddingDBMS.git
cd ProjectBiddingDBMS
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure PostgreSQL

```bash
# Create a PostgreSQL database
psql -U postgres
CREATE DATABASE project_bidding;
\q
```

### 4. Set Environment Variables

```bash
cp .env.example .env
# Fill in your values (see Environment Variables section below)
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 7. Start the Backend Server

```bash
python manage.py runserver
# API available at http://localhost:8000
```

### 8. Frontend Setup

```bash
cd ../frontend
# Open index.html directly in browser, or serve with:
npx serve .
# Frontend available at http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Django
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/project_bidding
DB_NAME=project_bidding
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🌐 Deployment

### Frontend — Vercel

The frontend is live at: **[project-bidding-dbms.vercel.app](https://project-bidding-dbms.vercel.app)**

Deployments trigger automatically on every push to `main` via GitHub Actions.

### Backend — Production

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

> Recommended platforms: **Railway**, **Render**, **AWS EC2**, or **Heroku**  
> Don't forget to set `DEBUG=False` and configure `ALLOWED_HOSTS` in production.

---

## 👥 Contributors

| Name | GitHub |
|------|--------|
| Prashant | [@prashant7738](https://github.com/prashant7738) |

---

## 🎓 Academic Context

This project was built as part of the **6th Semester DBMS course** to demonstrate:

- Relational database design & normalization
- Raw SQL queries via SQLAlchemy Core (no ORM)
- PostgreSQL as the production database
- Django REST Framework API development
- Full-stack web development & deployment

---

