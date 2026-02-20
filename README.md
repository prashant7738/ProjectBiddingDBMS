# 🏷️ Live Bid — Real-Time Online Auction Platform

> A full-stack real-time auction platform where users can create auctions, place competitive bids, and win items. Built with Django, SQLAlchemy Core, PostgreSQL, React, and WebSockets.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://project-bidding-dbms.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.1.4-green)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791)](https://www.postgresql.org/)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributors](#contributors)
- [License](#license)

---

## 📖 Overview

**Live Bid** is a comprehensive online auction platform that enables real-time bidding experiences. The platform supports:

- **Sellers**: Create and manage auctions with detailed descriptions, images, categories, and time windows
- **Bidders**: Browse auctions, register to participate, place competitive bids, and track winning items
- **Real-time Updates**: WebSocket-based live bid updates and auction status changes
- **Admin Dashboard**: Complete platform management with reports, user management, and analytics

The project demonstrates advanced database management concepts using **raw SQL via SQLAlchemy Core** (no ORM), PostgreSQL with proper normalization, and a modern React frontend with JWT authentication.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (User, Seller, Admin)
- Secure password hashing
- Token refresh and blacklist on logout

### 💼 User Features
- Complete user registration and profile management
- Balance management (deposit/withdraw)
- Browse all active auctions with search and pagination
- View auction details with real-time bid updates
- Register for auctions before placing bids
- Place competitive bids with instant validation
- Track personal bid history
- View won items and auction results
- Manage created auctions (sellers)

### 🏪 Auction Management
- Create auctions with:
  - Title, description, and image upload
  - Category selection
  - Starting price and time window (start/end time)
- Real-time highest bid tracking
- Automatic auction status management (active/expired)
- Edit and delete own auctions
- View all bids received on auctions

### 📊 Admin Dashboard
- Admin authentication with separate login
- User management and overview
- Category CRUD operations
- Platform-wide analytics:
  - Top sellers by auction count
  - Top bidders by bid activity
  - Category-wise auction distribution
  - Platform revenue tracking
- Manual auction expiration control

### ⚡ Real-Time Features
- WebSocket integration via Django Channels
- Live bid updates without page refresh
- Real-time auction status changes
- Instant notifications for outbid scenarios

### 🎨 UI/UX
- Responsive design with Tailwind CSS
- Smooth navigation with React Router
- Loading states and error handling
- Image optimization and lazy loading
- Mobile-friendly interface

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Core language |
| Django | 5.1.4 | Web framework |
| Django REST Framework | 3.15.2 | API development |
| SQLAlchemy | 2.0.36 | Database abstraction (Core only) |
| PostgreSQL | 13+ | Production database |
| Django Channels | 4.2.0 | WebSocket support |
| Daphne | 4.1.2 | ASGI server |
| djangorestframework-simplejwt | 5.4.0 | JWT authentication |
| Pillow | 11.0.0 | Image processing |
| psycopg2 | 2.9.10 | PostgreSQL adapter |
| python-dotenv | 1.0.1 | Environment variables |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI library |
| Vite | 6.0.3 | Build tool |
| React Router | 7.1.1 | Client-side routing |
| Axios | 1.7.9 | HTTP client |
| Tailwind CSS | 3.4.17 | Styling |

### DevOps & Deployment
- **Version Control**: Git, GitHub
- **CI/CD**: GitHub Actions (keep-alive workflow)
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway/Render/AWS (with Daphne)
- **Database**: Neon/Supabase PostgreSQL

---

## 🏗️ Project Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   React SPA     │◄───────►│  Django Backend │
│  (Vite + React) │  HTTP   │  (DRF + JWT)    │
└─────────────────┘  WebSocket └────────┬────────┘
                                        │
                              ┌─────────▼─────────┐
                              │  SQLAlchemy Core  │
                              │  (Raw SQL)        │
                              └─────────┬─────────┘
                                        │
                              ┌─────────▼─────────┐
                              │   PostgreSQL      │
                              │   Database        │
                              └───────────────────┘
```

### Backend Architecture
- **API Layer** (`api/`): Django REST Framework views, serializers, authentication
- **Database Layer** (`core_db/`): SQLAlchemy Core with raw SQL queries
- **WebSocket Layer**: Django Channels consumers for real-time features
- **Media Storage**: File uploads handled by Django media system

### Frontend Architecture
- **Context API**: Global state management (Auth, App)
- **Component-based**: Reusable UI components
- **Protected Routes**: Authentication guards for private pages
- **API Layer**: Axios with JWT interceptors

---

## 🗄️ Database Schema

The project uses **5 normalized tables** with proper foreign key relationships and constraints:

### 1. `users`
Stores user account information and balance.

| Column   | Type          | Constraints |
|----------|---------------|-------------|
| id       | INTEGER       | PRIMARY KEY |
| name     | VARCHAR(50)   | NOT NULL |
| email    | VARCHAR(100)  | UNIQUE, NOT NULL |
| password | VARCHAR(200)  | NOT NULL (bcrypt hashed) |
| balance  | NUMERIC(10,2) | DEFAULT 0.00, CHECK >= 0 |

### 2. `categories`
Stores auction categories for classification.

| Column | Type         | Constraints |
|--------|--------------|-------------|
| id     | INTEGER      | PRIMARY KEY |
| name   | VARCHAR(100) | UNIQUE, NOT NULL |

### 3. `auctions`
Stores auction listings with metadata and status.

| Column              | Type          | Constraints |
|---------------------|---------------|-------------|
| id                  | INTEGER       | PRIMARY KEY |
| seller_id           | INTEGER       | FK → users(id) CASCADE |
| title               | VARCHAR(255)  | NOT NULL |
| description         | VARCHAR(500)  | - |
| image_url           | VARCHAR(500)  | Path to uploaded image |
| category_id         | INTEGER       | FK → categories(id) SET NULL |
| starting_price      | NUMERIC(12,2) | NOT NULL |
| current_highest_bid | NUMERIC(12,2) | Tracks latest bid |
| start_time          | TIMESTAMP     | NOT NULL, with timezone |
| end_time            | TIMESTAMP     | NOT NULL, with timezone |
| is_active           | BOOLEAN       | DEFAULT TRUE |

### 4. `bids`
Stores all bids placed on auctions with timestamps.

| Column     | Type          | Constraints |
|------------|---------------|-------------|
| id         | INTEGER       | PRIMARY KEY |
| auction_id | INTEGER       | FK → auctions(id) CASCADE |
| bidder_id  | INTEGER       | FK → users(id) CASCADE |
| amount     | NUMERIC(12,2) | NOT NULL |
| bid_time   | TIMESTAMP     | DEFAULT NOW(), with timezone |

### 5. `auction_registrations`
Tracks user registrations for auctions (required before bidding).

| Column        | Type      | Constraints |
|---------------|-----------|-------------|
| id            | INTEGER   | PRIMARY KEY |
| auction_id    | INTEGER   | FK → auctions(id) CASCADE |
| user_id       | INTEGER   | FK → users(id) CASCADE |
| registered_at | TIMESTAMP | DEFAULT NOW(), with timezone |

### Entity Relationship Diagram

```
┌──────────┐
│  users   │
└────┬─────┘
     │
     ├─────1:N────┐
     │            │
     │      ┌─────▼──────┐
     │      │  auctions  │◄────N:1────┌────────────┐
     │      └─────┬──────┘            │ categories │
     │            │                   └────────────┘
     │            │
     ├─────1:N────┼───────1:N─────┐
     │            │               │
┌────▼────┐  ┌───▼────┐   ┌──────▼──────────────┐
│  bids   │  │  bids  │   │ auction_registrations│
└─────────┘  └────────┘   └─────────────────────┘
```

**Relationships:**
- `users` → `auctions` (1:N) - A user can create multiple auctions
- `users` → `bids` (1:N) - A user can place multiple bids
- `users` → `auction_registrations` (1:N) - A user can register for multiple auctions
- `auctions` → `bids` (1:N) - An auction can have multiple bids
- `auctions` → `auction_registrations` (1:N) - An auction can have multiple registrations
- `categories` → `auctions` (1:N) - A category can have multiple auctions

---

## 🔌 API Documentation

Base URL: `http://localhost:8000/api/`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}

Response: 201 Created
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "balance": "0.00"
}
```

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Logout
```http
POST /api/auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: 200 OK
{
  "message": "Logout successful"
}
```

#### Get Profile
```http
GET /api/auth/profile/
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "balance": "100.50"
}
```

#### Deposit Balance
```http
POST /api/auth/deposit/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 50.00
}

Response: 200 OK
{
  "message": "Deposit successful",
  "new_balance": "150.50"
}
```

#### Withdraw Balance
```http
POST /api/auth/withdraw/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 25.00
}

Response: 200 OK
{
  "message": "Withdrawal successful",
  "new_balance": "125.50"
}
```

### Auction Endpoints

#### List All Auctions (Paginated)
```http
GET /api/auctions/?page=1&page_size=10
Optional Query Params: ?search=keyword

Response: 200 OK
{
  "count": 45,
  "next": "http://localhost:8000/api/auctions/?page=2",
  "previous": null,
  "results": [...]
}
```

#### Get Auction Detail
```http
GET /api/auctions/{id}/

Response: 200 OK
{
  "id": 1,
  "seller": {...},
  "title": "Vintage Camera",
  "description": "...",
  "image_url": "/media/auctions/camera.jpg",
  "category": {...},
  "starting_price": "100.00",
  "current_highest_bid": "150.00",
  "start_time": "2024-02-20T10:00:00Z",
  "end_time": "2024-02-27T10:00:00Z",
  "is_active": true,
  "bid_count": 8
}
```

#### Create Auction
```http
POST /api/auctions/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "title": "Vintage Camera",
  "description": "Rare vintage camera...",
  "image": <file>,
  "category_id": 2,
  "starting_price": 100.00,
  "start_time": "2024-02-20T10:00:00Z",
  "end_time": "2024-02-27T10:00:00Z"
}

Response: 201 Created
```

#### Update Auction
```http
PUT /api/auctions/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}

Response: 200 OK
```

#### Delete Auction
```http
DELETE /api/auctions/{id}/
Authorization: Bearer <access_token>

Response: 204 No Content
```

#### Get My Auctions
```http
GET /api/auctions/my/
Authorization: Bearer <access_token>

Response: 200 OK
[...]
```

#### Register for Auction
```http
POST /api/auctions/{id}/register/
Authorization: Bearer <access_token>

Response: 201 Created
{
  "message": "Successfully registered for auction"
}
```

#### Get Auction Registrations
```http
GET /api/auctions/{id}/registrations/
Authorization: Bearer <access_token>

Response: 200 OK
[
  {
    "user": {...},
    "registered_at": "2024-02-20T15:30:00Z"
  }
]
```

### Bid Endpoints

#### Place Bid
```http
POST /api/auctions/{id}/bids/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 175.00
}

Response: 201 Created
{
  "id": 15,
  "auction_id": 1,
  "bidder": {...},
  "amount": "175.00",
  "bid_time": "2024-02-20T16:45:00Z"
}
```

#### Get Bids for Auction
```http
GET /api/auctions/{id}/bids/
Authorization: Bearer <access_token>

Response: 200 OK
[
  {
    "id": 15,
    "bidder": {...},
    "amount": "175.00",
    "bid_time": "2024-02-20T16:45:00Z"
  }
]
```

#### Get My Bids
```http
GET /api/bids/my/
Authorization: Bearer <access_token>

Response: 200 OK
[...]
```

#### Get Won Items
```http
GET /api/bids/won/
Authorization: Bearer <access_token>

Response: 200 OK
[
  {
    "auction": {...},
    "winning_bid": "250.00",
    "won_at": "2024-02-20T18:00:00Z"
  }
]
```

### Category Endpoints

#### List Categories
```http
GET /api/categories/

Response: 200 OK
[
  {
    "id": 1,
    "name": "Electronics"
  },
  {
    "id": 2,
    "name": "Collectibles"
  }
]
```

#### Create Category (Admin)
```http
POST /api/categories/
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "name": "Art"
}

Response: 201 Created
```

#### Update Category (Admin)
```http
PUT /api/categories/{id}/
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "name": "Fine Art"
}

Response: 200 OK
```

#### Delete Category (Admin)
```http
DELETE /api/categories/{id}/
Authorization: Bearer <admin_access_token>

Response: 204 No Content
```

### Admin & Reports Endpoints

#### Admin Login
```http
POST /api/admin/login/
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "adminpass"
}

Response: 200 OK
{
  "access": "...",
  "refresh": "..."
}
```

#### Get All Users (Admin)
```http
GET /api/admin/users/
Authorization: Bearer <admin_access_token>

Response: 200 OK
[...]
```

#### Top Sellers Report
```http
GET /api/reports/top-sellers/
Authorization: Bearer <admin_access_token>

Response: 200 OK
[
  {
    "seller_id": 5,
    "seller_name": "John Doe",
    "auction_count": 12
  }
]
```

#### Top Bidders Report
```http
GET /api/reports/top-bidders/
Authorization: Bearer <admin_access_token>

Response: 200 OK
[
  {
    "bidder_id": 8,
    "bidder_name": "Jane Smith",
    "bid_count": 45
  }
]
```

#### Category Statistics
```http
GET /api/reports/categories/
Authorization: Bearer <admin_access_token>

Response: 200 OK
[
  {
    "category_name": "Electronics",
    "auction_count": 25
  }
]
```

#### Revenue Report
```http
GET /api/reports/revenue/
Authorization: Bearer <admin_access_token>

Response: 200 OK
{
  "total_revenue": "15750.50",
  "total_auctions": 45,
  "total_bids": 234
}
```

#### Expire Auctions (Admin)
```http
POST /api/admin/expire/
Authorization: Bearer <admin_access_token>

Response: 200 OK
{
  "message": "Expired 8 auctions"
}
```

---

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Python 3.8+**: [Download](https://www.python.org/downloads/)
- **Node.js 16+**: [Download](https://nodejs.org/)
- **PostgreSQL 13+**: [Download](https://www.postgresql.org/download/)
- **Git**: [Download](https://git-scm.com/downloads/)

### 1. Clone the Repository

```bash
git clone https://github.com/prashant7738/ProjectBiddingDBMS.git
cd ProjectBiddingDBMS
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Configure PostgreSQL

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE project_bidding;

# Exit
\q
```

#### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL)
DB_NAME=project_bidding
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=1440  # minutes (1 day)
```

#### Create Database Tables

```bash
# Run the SQLAlchemy table creation script
python create_table.py

# Run Django migrations (for admin and other Django apps)
python manage.py makemigrations
python manage.py migrate
```

#### Create Admin User (Optional)

```bash
python manage.py createsuperuser
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

#### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

---

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate on Linux/macOS
python manage.py runserver

# Server running at: http://localhost:8000
```

### Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev

# Server running at: http://localhost:5173
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

---

## 🌐 Deployment

### Frontend (Vercel)

The frontend is deployed on Vercel with automatic deployments from GitHub.

**Configuration** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Deploy Steps**:
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variable: `VITE_API_URL=your-backend-url`
4. Deploy

### Backend (Railway/Render/AWS)

**Using Daphne (for WebSocket support)**:

```bash
pip install daphne gunicorn
daphne -b 0.0.0.0 -p $PORT project_main.asgi:application
```

**Procfile** (for Railway/Render):
```
web: daphne -b 0.0.0.0 -p $PORT project_main.asgi:application
```

**Environment Variables** (Production):
```env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://user:pass@host:port/dbname
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Database (Neon/Supabase)

Use a managed PostgreSQL service like:
- **Neon**: https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app

### CI/CD (GitHub Actions)

The project includes a keep-alive workflow (`.github/workflows/keep_alive.yml`) that pings the backend every 14 minutes to prevent free-tier hosting sleep.

---

## 📁 Project Structure

```
ProjectBiddingDBMS/
│
├── README.md                      # This file
├── .github/
│   └── workflows/
│       └── keep_alive.yml         # CI/CD keep-alive job
│
├── backend/                       # Django backend
│   ├── manage.py                  # Django management script
│   ├── requirements.txt           # Python dependencies
│   ├── create_table.py            # SQLAlchemy table creation
│   ├── Procfile                   # Deployment config
│   ├── .env                       # Environment variables (not in git)
│   ├── .envexample                # Example environment variables
│   │
│   ├── api/                       # Main Django app
│   │   ├── views.py               # Auction, bid, category endpoints
│   │   ├── auth_views.py          # Auth & user endpoints
│   │   ├── serializers.py         # DRF serializers
│   │   ├── urls.py                # API URL routing
│   │   ├── authenticate.py        # Custom JWT authentication
│   │   ├── permissions.py         # Custom permissions (IsOwner)
│   │   ├── paginations.py         # Pagination classes
│   │   ├── consumers.py           # WebSocket consumers
│   │   ├── routing.py             # WebSocket routing
│   │   ├── admin_utils.py         # Admin helper functions
│   │   └── models.py              # Django models (minimal)
│   │
│   ├── core_db/                   # SQLAlchemy Core layer
│   │   ├── schemas.py             # Table definitions
│   │   ├── engine.py              # Database engine & connection
│   │   ├── user_ops.py            # User CRUD operations
│   │   ├── auction_ops.py         # Auction CRUD operations
│   │   ├── bid_ops.py             # Bid operations
│   │   └── reports.py             # Analytics & report queries
│   │
│   ├── project_main/              # Django project settings
│   │   ├── settings.py            # Django settings
│   │   ├── urls.py                # Root URL config
│   │   ├── asgi.py                # ASGI config (Channels)
│   │   └── wsgi.py                # WSGI config
│   │
│   └── media/                     # User-uploaded files
│       └── auctions/              # Auction images
│
├── frontend/                      # React frontend
│   ├── package.json               # npm dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── vercel.json                # Vercel deployment config
│   ├── index.html                 # HTML entry point
│   ├── .env                       # Environment variables
│   │
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Main app component
│   │   ├── App.css                # Global styles
│   │   ├── index.css              # Tailwind imports
│   │   │
│   │   ├── api/
│   │   │   └── auth.js            # Axios instance with JWT
│   │   │
│   │   ├── components/            # Reusable components
│   │   │   ├── Header.jsx         # Navigation header
│   │   │   ├── Footer.jsx         # Footer
│   │   │   ├── AuctionCard.jsx    # Auction card component
│   │   │   ├── AuctionPage.jsx    # Auction detail page
│   │   │   ├── NavigationTabs.jsx # Tab navigation
│   │   │   ├── PrivateRoute.jsx   # Auth route guard
│   │   │   └── AdminRoute.jsx     # Admin route guard
│   │   │
│   │   ├── context/               # React Context
│   │   │   ├── AuthContext.jsx    # Auth state management
│   │   │   └── AppContext.jsx     # Global app state
│   │   │
│   │   ├── pages/                 # Page components
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration page
│   │   │   ├── Profile.jsx        # User profile
│   │   │   ├── AllAuctions.jsx    # Browse auctions
│   │   │   ├── CreateAuction.jsx  # Create auction form
│   │   │   ├── MyAuctions.jsx     # User's auctions
│   │   │   ├── MyBids.jsx         # User's bids
│   │   │   ├── MyItems.jsx        # User's items
│   │   │   ├── WonItems.jsx       # User's won auctions
│   │   │   ├── PriceResults.jsx   # Auction results
│   │   │   ├── AdminLogin.jsx     # Admin login
│   │   │   └── AdminDashboard.jsx # Admin dashboard
│   │   │
│   │   ├── data/                  # Mock data (dev)
│   │   │   ├── mockAuctions.js
│   │   │   └── mockPriceResult.js
│   │   │
│   │   └── assets/                # Static assets
│   │       ├── fonts/             # Custom fonts
│   │       └── assets.js          # Asset exports
│   │
│   └── public/                    # Public static files
│
└── .gitignore                     # Git ignore rules
```

---

## 👥 Contributors

| Name | Role | GitHub |
|------|------|--------|
| **Prashant Kafle** | Full-Stack Developer | [@prashant7738](https://github.com/prashant7738) |
| **Roshan Poudel** | Full-Stack Developer | [@ros4n](https://github.com/ros4n) |

---

## 🎓 Academic Context

This project was developed as part of the **6th Semester Database Management Systems (DBMS)** course, demonstrating:

### Database Concepts
- ✅ Relational database design with proper normalization (3NF)
- ✅ Entity-Relationship modeling
- ✅ Foreign key relationships and referential integrity
- ✅ CHECK constraints for data validation
- ✅ Efficient indexing strategies

### SQL & Query Optimization
- ✅ Raw SQL queries using SQLAlchemy Core (no ORM)
- ✅ Complex JOIN operations across multiple tables
- ✅ Aggregate functions (COUNT, MAX, SUM)
- ✅ Subqueries and CTEs for analytics
- ✅ Transaction management

### Backend Development
- ✅ RESTful API design principles
- ✅ JWT-based stateless authentication
- ✅ Role-based access control (RBAC)
- ✅ File upload and media handling
- ✅ Real-time communication via WebSockets
- ✅ Pagination and filtering strategies

### Frontend Development
- ✅ Modern React with hooks
- ✅ Context API for state management
- ✅ Protected routes and authentication flows
- ✅ Responsive UI with Tailwind CSS
- ✅ Real-time updates with WebSocket integration

### Software Engineering
- ✅ Clean code architecture
- ✅ Separation of concerns (layered architecture)
- ✅ Git version control
- ✅ Environment-based configuration
- ✅ Deployment to production services

---

## 📄 License

This project is developed for educational purposes as part of academic coursework.

---

## 🙏 Acknowledgments

- **Course**: Database Management Systems (DBMS)
- **Institution**: Thapathali Campus
- **Semester**: 5th Semester
- **Instructor**: Rajad Shakya

---

## 📞 Contact

For questions or support, reach out to:
- **Prashant Kafle**: prashant7738@example.com
- **Roshan Poudel**: ros4n@example.com

---

<div align="center">
  <p>Built with ❤️ for learning and excellence</p>
  <p>© 2025 Live Bid Platform. All rights reserved.</p>
</div>