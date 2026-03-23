# LIVE BIDDING NP — Real-Time Auction Platform

A full-stack auction system with live bidding, cookie-based JWT auth, role-aware admin controls, and SQL-first data access.

- **Frontend**: React + Vite + Tailwind
- **Backend**: Django + DRF + Channels
- **Data layer**: SQLAlchemy Core (no Django ORM models for business tables)
- **Database**: PostgreSQL
- **Live updates**: WebSockets per auction room

**Live frontend**: https://project-bidding-dbms.vercel.app  
**Live backend API**: https://projectbiddingdbms.onrender.com/api/

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Business Rules](#business-rules)
- [API Overview](#api-overview)
- [WebSocket Protocol](#websocket-protocol)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Deployment Notes](#deployment-notes)
- [Project Structure](#project-structure)
- [Known Notes](#known-notes)

---

## Features

### User-side
- User registration and login with JWT in **HttpOnly cookies** (`access_token`, `refresh_token`)
- View active and ended auctions with pagination
- Auction detail view with bid history and seller/category metadata
- Register for an auction before bidding
- Place bids with strict server-side validation
- My auctions, my bids, won items, and profile pages
- Poll-based notifications (started, ended, outbid, won)

### Seller-side
- Create auctions with image upload
- Edit/delete own auctions
- Track bids and auction status

### Admin-side
- Dedicated admin login endpoint
- Manage all auctions
- Close expired auctions manually
- Manage users (balance update, delete user)
- Admin access controlled by `ADMIN_EMAILS` / `ADMIN_USER_IDS`

### Real-time
- WebSocket room per auction: `ws/auctions/<auction_id>/`
- Broadcasts current auction state on connect
- Broadcasts bid updates after successful bid placement
- Read-only socket access for unregistered users; bidding allowed only for registered participants

---

## Tech Stack

### Backend
- Python
- Django `6.0`
- Django REST Framework `3.16.1`
- Django Channels `4.1.0`
- Daphne `4.1.2`
- SQLAlchemy `2.0.45`
- SimpleJWT `5.5.1`
- Passlib (PBKDF2 password hashing)
- **Supabase Postgres** (`DATABASE_URL`)
- Cloudinary (`django-cloudinary-storage`) for production media

### Frontend
- React `19`
- Vite (via `rolldown-vite`)
- React Router DOM `7`
- Axios
- Tailwind CSS `4`

---

## Architecture

```text
React (Vite SPA)
    |
    | HTTP (REST, cookies)
    v
Django + DRF API
    |
    | SQLAlchemy Core queries
    v
PostgreSQL

WebSocket path (Channels):
React <-> /ws/auctions/<id>/ <-> AuctionBidConsumer
```

### Data model (SQLAlchemy Core)
Defined in `backend/core_db/schemas.py`:
- `users`
- `categories`
- `auctions`
- `bids`
- `auction_registrations`

> This project intentionally uses SQLAlchemy Core for business tables and query logic in `backend/core_db/*`.

---

## Business Rules

Enforced server-side (API + data layer):

- Sellers cannot bid on their own auctions
- User must register for an auction before bidding
- Bid must be greater than `current_highest_bid`
- Bidder must have sufficient balance
- Auction must be within valid time window (`start_time <= now < end_time`)
- Expired auctions can be closed in batch (`close_expired_auctions`) with winner/seller balance settlement
- Winner tie-break: latest bid wins among equal highest bids

---

## API Overview

Base URL (local): `http://localhost:8000/api/`

### Auth
- `POST /register/`
- `POST /login/`
- `POST /admin/login/`
- `POST /logout/`
- `POST /token/refresh/`
- `GET /profile/`

### Auctions & bidding
- `GET /auctions/`
- `GET /auctions/ended/`
- `GET /auctions/<auction_id>/`
- `POST /create-auction/` (auth)
- `POST /auctions/<auction_id>/register/` (auth)
- `GET /auctions/<auction_id>/registered-users/` (auth)
- `GET /auctions/<auction_id>/users/<user_id>/` (auth, scoped)
- `GET /auctions/<auction_id>/bids/`
- `POST /bids/place/` (auth)

### User scoped
- `GET /my-auctions/<user_id>/` (auth + owner scoped)
- `PATCH /my-auctions/<user_id>/` (auth + owner scoped)
- `DELETE /my-auctions/<user_id>/` (auth + owner scoped)
- `GET /my-bids/<user_id>/` (auth + owner scoped)
- `GET /win-items/<user_id>/` (auth + owner scoped)
- `GET /notifications/<user_id>/?since=<iso_datetime>` (auth + owner scoped)

### Admin
- `GET /admin/auctions/`
- `DELETE /admin/auctions/<auction_id>/`
- `POST /admin/auctions/close-expired/`
- `GET /admin/users/`
- `PATCH /admin/users/<user_id>/`
- `DELETE /admin/users/<user_id>/`

### Utilities
- `GET /keep-alive/` (requires `X-Cron-Key` header)

---

## WebSocket Protocol

### Endpoint
- `ws://localhost:8000/ws/auctions/<auction_id>/`

### Incoming message
```json
{
  "type": "place_bid",
  "amount": 1250
}
```

### Outgoing messages
- Auction snapshot on connect:
```json
{
  "type": "auction_state",
  "auction_id": 1,
  "current_highest_bid": 1200,
  "starting_price": 1000,
  "end_time": "2026-03-01T10:00:00+00:00"
}
```

- Successful bid broadcast:
```json
{
  "type": "bid_update",
  "auction_id": 1,
  "bidder_id": 8,
  "bidder_name": "Prashant",
  "amount": 1300,
  "current_highest_bid": 1300
}
```

- Validation/auth error:
```json
{
  "type": "error",
  "message": "Register for this auction to place bids"
}
```

---

## Local Setup

## 1) Clone repository 
```bash
git clone git@github.com:prashant7738/ProjectBiddingDBMS.git
cd BiddingDBMS
```

## 2) Backend setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create environment file:
```bash
cp .envexample .env
```

Update `.env` values (see [Environment Variables](#environment-variables)).

### Initialize database schema
```bash
python create_table.py
```

> `create_table.py` currently runs `drop_all()` then `create_all()`. Use carefully: it resets tables.

### Run backend
```bash
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

## 3) Frontend setup
From project root:
```bash
cd frontend
npm install
```

Create/update frontend env:
```dotenv
VITE_API_URL=http://localhost:8000/api/
```

Run frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)
Required/important:

```dotenv
SECRET_KEY=change-me
DEBUG=True

# Supabase Postgres connection string
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/postgres?sslmode=require

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
ALLOWED_HOSTS=localhost,127.0.0.1

ADMIN_EMAILS=admin@example.com
ADMIN_USER_IDS=1

# For keep-alive endpoint protection
CRON_SECRET=your-secret

# Optional Cloudinary in production
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=auctions
```

### Frontend (`frontend/.env`)
```dotenv
VITE_API_URL=http://localhost:8000/api/
```

---

## Deployment Notes

- Database is hosted on **Supabase Postgres** via `DATABASE_URL`.
- Ensure SSL is enabled in DB connection (`sslmode=require`).
- Frontend is configured for SPA rewrites in `frontend/vercel.json`
- Backend process command in `backend/Procfile`:
  - `web: daphne -b 0.0.0.0 -p $PORT project_main.asgi:application`
- Keep-alive workflow: `.github/workflows/keep_alive.yml` pings:
  - `GET /api/keep-alive/` with `X-Cron-Key: $CRON_SECRET`

For production (`DEBUG=False`), ensure:
- `FRONTEND_URL`, `BACKEND_URL`, and `ALLOWED_HOSTS` are set
- CORS/CSRF origins match deployed domains
- Secure cookie behavior is preserved (`SameSite=None`, `Secure=True`)

---

## Project Structure

```text
BiddingDBMS/
├── backend/
│   ├── api/                 # DRF views, auth views, websocket consumer, routing
│   ├── core_db/             # SQLAlchemy Core engine, schemas, query operations
│   ├── project_main/        # Django settings, ASGI/WSGI, URL config
│   ├── create_table.py      # SQLAlchemy schema bootstrap (drop/create)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client + endpoint helpers
│   │   ├── context/         # Auth and app-level state
│   │   ├── components/      # Route guards, shared UI, auction page
│   │   └── pages/           # User/admin screens
│   └── package.json
└── README.md
```

---

## Known Notes

- Admin auth in frontend currently stores an `adminToken` flag in localStorage for route UX, while server auth still relies on HttpOnly cookies.
- Notification delivery is polling-based (every few seconds) from the frontend, while bidding itself is real-time via WebSocket.
- SQLite files exist in repo, but runtime backend configuration uses `DATABASE_URL` (PostgreSQL expected).

## 📄 License

This project is developed for educational purposes as part of academic coursework.

---



## 📞 Contact

For questions or support, reach out to:
- **Prashant Kafle**: prashantkafle7738@gmail.com
- **Roshan Poudel**: roshanp2197@gmail.com
