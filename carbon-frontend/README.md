# Carbon Frontend

Vite + React + TypeScript UI for the **Personal Carbon Footprint AI Dashboard**.

It provides:
- Supabase auth (JWT via `supabase.ts`)
- Carbon coach chat UI that calls the backend streaming endpoint

---

## Prerequisites
- Node.js 18+
- A running backend (`carbon-backend`) and its API URL
- A Supabase project (URL + anon key)

---

## Environment Variables
Create a `.env` file in `carbon-frontend/`.

> Note: The exact variable names depend on how `src/lib/supabase.ts` is implemented. If your app fails to start, mirror the keys expected by `supabase.ts`.

Common keys you may need:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Backend base URL for API requests
VITE_API_BASE_URL="http://localhost:8000/api/v1"
```

If your code uses different names, update them accordingly.

---

## Install & Run (Local)

From repo root:

```bash
cd carbon-frontend
npm install
npm run dev
```

By default Vite serves on:
- `http://localhost:5173`

---

## Build

```bash
cd carbon-frontend
npm run build
```

---

## Backend Integration

The frontend calls the backend streaming endpoint exposed by:
- `POST /api/v1/carbon/stream`

CORS is configured in the backend for Vite dev ports:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

---

## UI Pages / Components

- `src/components/Auth.tsx`
  - Supabase sign-in/up UI and session handling
- `src/components/carbonChat.tsx`
  - Chat input + message rendering
  - Calls the backend and updates the UI with the streamed AI response

---

## Expected Response Shape

The backend returns a strict `CarbonAnalysisResponse` contract.
Your UI should be prepared to read:
- `total_co2_kg`
- `category_breakdown` (transport/diet/energy/waste)
- `largest_emission_source`
- `summary_message`
- `personalized_action_plan` (3 strings)

---

## Troubleshooting

- **CORS errors**: ensure the backend is running and allow origins include your Vite dev URL.
- **401 / auth errors**: ensure you are logged in via Supabase and your JWT is attached to requests.
- **Missing env vars**: check `src/lib/supabase.ts` for required environment variable names.

