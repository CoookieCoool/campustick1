# CampusTick — Backend

Node.js + Express + MongoDB REST API.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

## API Base URL
`http://localhost:5000/api`

## Health Check
`GET /api/health` → `{ "status": "ok" }`

## Routes
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/events | List events |
| POST | /api/events | Create event |
| GET | /api/events/:id | Event details |
| POST | /api/tickets | Purchase ticket |
| GET | /api/tickets/my | My tickets |
| POST | /api/tickets/scan | Scan/verify ticket |
