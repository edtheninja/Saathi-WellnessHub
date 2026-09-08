# Saathi Wellness Backend

Express + PostgreSQL API for the Saathi frontend. The frontend keeps its existing data-access calls, but `src/supabaseClient.js` now translates those calls to this API.

## Setup

1. Install PostgreSQL and start it locally, or set `DATABASE_URL` to a PostgreSQL deployment.
2. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`.
3. From this folder run `npm install`.
4. Start the API with `npm run dev` or `npm start`.
5. Start the frontend from `Saathi-WellnessHub` with `npm run dev`.

The API listens on `http://localhost:4000`; Vite proxies `/api` to it on `http://localhost:5173`.

## API coverage

- Authentication: signup, login, session lookup, password update, account deletion
- Wellness data: profiles, journals, moods, meditation sessions, goals
- Persistence for device connections, health metrics, notifications, activity history, chat, community posts/comments/reactions, and mantra sessions
- Every record is scoped to the authenticated user

The server creates the `saathi_users` and `saathi_records` tables on startup. Set `PGSSLMODE=require` when your hosted PostgreSQL provider requires TLS.

For production, set `VITE_API_URL` to the deployed API origin and set `CLIENT_ORIGIN` to the deployed frontend origin. Do not expose database credentials or `JWT_SECRET` to the frontend.
