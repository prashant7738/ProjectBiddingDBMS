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
- Clients post projects with description, budget, and deadline
- Freelancers browse projects and submit bids
- Clients review and accept bids

---

## 🛠️ Tech Stack

**Backend:** Python 3.8+, Django, SQLAlchemy Core (raw SQL), PostgreSQL, Django REST Framework  
**Frontend:** HTML5, CSS3, JavaScript (React), Vercel  
**DevOps:** GitHub Actions, Vercel, Git

---

## ✨ Features

- User registration/login (Client/Freelancer)
- Role-based access control
- Clients: post/edit/delete projects
- Freelancers: submit bids, track bids
- Dashboard for both roles
- Only one accepted bid per project

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

**PostgreSQL** with **SQLAlchemy Core** (raw SQL):

### `users`
| Column         | Type         | Constraint                  |
| -------------- | ------------ | --------------------------- |
| user_id        | SERIAL       | PRIMARY KEY                 |
| username       | VARCHAR(50)  | NOT NULL, UNIQUE            |
| email          | VARCHAR(100) | NOT NULL, UNIQUE            |
| password_hash  | VARCHAR(255) | NOT NULL                    |
| role           | VARCHAR(20)  | NOT NULL (client/freelancer)|
| created_at     | TIMESTAMP    | DEFAULT NOW()               |

### `projects`
| Column        | Type           | Constraint                  |
| ------------- | -------------- | --------------------------- |
| project_id    | SERIAL         | PRIMARY KEY                 |
| client_id     | INTEGER        | FOREIGN KEY → users         |
| title         | VARCHAR(200)   | NOT NULL                    |
| description   | TEXT           | NOT NULL                    |
| budget_min    | DECIMAL(10,2)  | NOT NULL                    |
| budget_max    | DECIMAL(10,2)  | NOT NULL                    |
| deadline      | DATE           | NOT NULL                    |
| status        | VARCHAR(20)    | DEFAULT 'open'              |
| created_at    | TIMESTAMP      | DEFAULT NOW()               |

### `bids`
| Column        | Type           | Constraint                  |
| ------------- | -------------- | --------------------------- |
| bid_id        | SERIAL         | PRIMARY KEY                 |
| project_id    | INTEGER        | FOREIGN KEY → projects      |
| freelancer_id | INTEGER        | FOREIGN KEY → users         |
| bid_amount    | DECIMAL(10,2)  | NOT NULL                    |
| delivery_days | INTEGER        | NOT NULL                    |
| proposal      | TEXT           | NOT NULL                    |
| status        | VARCHAR(20)    | DEFAULT 'pending'           |
| created_at    | TIMESTAMP      | DEFAULT NOW()               |

**Entity Relationships:**
```
users (client)    ──< projects
users (freelancer) ──< bids
projects           ──< bids
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

### Projects
| Method | Endpoint              | Auth         | Description         |
| ------ | --------------------- | ------------ | ------------------- |
| GET    | /api/projects/        | No           | List open projects  |
| GET    | /api/projects/:id/    | No           | Project details     |
| POST   | /api/projects/        | Yes (Client) | Create project      |
| PUT    | /api/projects/:id/    | Yes (Owner)  | Update project      |
| DELETE | /api/projects/:id/    | Yes (Owner)  | Delete project      |

### Bids
| Method | Endpoint                      | Auth           | Description           |
| ------ | ----------------------------- | -------------- | --------------------- |
| GET    | /api/projects/:id/bids/       | Yes            | Get bids for project  |
| POST   | /api/projects/:id/bids/       | Yes (Freelancer)| Submit bid           |
| PUT    | /api/bids/:id/accept/         | Yes (Client)   | Accept bid            |
| PUT    | /api/bids/:id/reject/         | Yes (Client)   | Reject bid            |
| GET    | /api/bids/my/                 | Yes (Freelancer)| My submitted bids    |

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

