# Smart Campus Ecosystem (MERN)

A fast, hackathon-ready MERN app scaffold for a "Smart Campus" platform with:
- Lost & Found
- Event Management
- Feedback & Grievance
- Club Dashboards
- Role-based Auth (Student, Faculty, Admin)
- Real-time notifications (Socket.IO)
- Bonus: Gemini chatbot (backend proxy)

## Monorepo Structure

- `server/` — Node.js + Express + MongoDB API
- `client/` — React + Vite + Chakra UI frontend
- `render.yaml` — Render deployment config (backend + static frontend)

## Quick Start (Windows PowerShell)

1) Backend

```powershell
cd server
npm install
npm run dev
```

2) Frontend (new terminal)

```powershell
cd client
npm install
npm run dev
```

- API: http://localhost:5000
- Web: will print in Vite output (usually http://localhost:5173)

Create `.env` files from the provided `.env.example` files before running.

## Environment Variables

- `server/.env`
  - `PORT=5000`
  - `MONGODB_URI=your_mongodb_atlas_connection_string`
  - `JWT_SECRET=change_this_in_prod`
  - `CLIENT_URL=http://localhost:5173`
  - `GEMINI_API_KEY=your_google_generative_ai_key_optional`

- `client/.env`
  - `VITE_API_BASE_URL=http://localhost:5000`

## Render Deployment (Free Tier)

- Backend (Web Service): Node runtime, builds and starts from `server/`
- Frontend (Static Site): Builds from `client/` and publishes `client/dist`

Adjust `render.yaml` with your service names and environment variables. After deploy, update `client`'s `VITE_API_BASE_URL` to your Render backend URL and rebuild.

## Next Steps

- Implement auth (JWT, roles)
- Build Lost & Found, Events, Feedback, Clubs APIs
- Wire Socket.IO events for real-time toasts
- Add Gemini proxy route `/api/chatbot`
- Flesh out React pages and API hooks

Good luck at the hackathon — ship early, iterate fast, demo confidently!
