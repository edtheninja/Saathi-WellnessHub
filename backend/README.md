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
- Helmet security headers, CORS allow-listing, request-size limits, and rate limits
- Explicit community room/message/feed APIs in addition to the compatibility data API
- Socket.IO authentication and room presence events

The server creates the `saathi_users` and `saathi_records` tables on startup. Set `PGSSLMODE=require` when your hosted PostgreSQL provider requires TLS.

Run `npm run check` for a backend syntax check.

## Fitbit setup

Create a Fitbit developer application and set its callback URL to the exact value in `FITBIT_REDIRECT_URI`.

Set these variables in `.env`:

```env
FITBIT_CLIENT_ID=your-fitbit-client-id
FITBIT_CLIENT_SECRET=your-fitbit-client-secret
FITBIT_REDIRECT_URI=http://localhost:4000/api/integrations/fitbit/callback
```

The Fitbit flow syncs daily steps, calories, distance, exercise minutes, resting heart rate, and sleep hours. Access and refresh tokens remain server-side and are never sent to the frontend. Apple Health, Android Health Connect, Samsung Health, and Garmin still require their native SDK/OAuth setup.

## AI chat setup

Choose one provider in `.env`:

```env
AI_PROVIDER=groq
GROQ_API_KEY=your-groq-key
GROQ_MODEL=llama-3.1-8b-instant
```

Or use Gemini:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.0-flash
```

Keys stay on the backend. When no provider key is configured, the app uses a safe built-in wellness fallback instead of exposing an error to users.

For production, set `VITE_API_URL` to the deployed API origin and set `CLIENT_ORIGIN` to the deployed frontend origin. Do not expose database credentials or `JWT_SECRET` to the frontend.
