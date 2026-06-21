# Carbon Backend

FastAPI backend for the **Personal Carbon Footprint AI Dashboard**.

It provides:
- Supabase JWT auth (JWKS-based)
- A streaming AI endpoint that returns a strict `CarbonAnalysisResponse` JSON contract
- Postgres models for profiles, chat threads/messages, carbon logs, and emission factors (pgvector)

---

## Tech Stack
- **FastAPI** (API)
- **SQLAlchemy** + **pgvector** + **Alembic** (database)
- **PydanticAI** + **OpenAI** (carbon coach agent)
- **Supabase** (JWT + Postgres)

---

## Prerequisites
- Python **3.12+**
- A Postgres instance (Supabase recommended)
- Supabase project configured with JWT auth enabled
- OpenAI API key

---

## Environment Variables
Create a `.env` file inside `carbon-backend/`.

The backend reads these settings from `app/core/config.py`:

```env
# Application
PROJECT_NAME="Personal Carbon Footprint AI Dashboard"
ENVIRONMENT="development"
API_V1_STR="/api/v1"

# Infrastructure
DATABASE_URL="postgresql+psycopg2://USER:PASSWORD@HOST:5432/DBNAME"

# Supabase JWT validation
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# AI
OPENAI_API_KEY="your-openai-api-key"
```

Notes:
- Auth verification pulls signing keys from:
  - `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`
- The agent requires `OPENAI_API_KEY`.

---

## Install & Run (Local)

From repo root:

```bash
cd carbon-backend
pip install -r requirements.txt  # if you have one
# or use your preferred dependency manager
```

Recommended (if using uv):
```bash
cd carbon-backend
uv sync
uv run python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend default endpoints:
- `GET /api/v1/health` (health check)
- `POST /api/v1/carbon/stream` (AI carbon coach streaming)

---

## Database Migrations
Use Alembic to apply schema changes.

```bash
cd carbon-backend
uv run alembic upgrade head
```

Existing migrations are stored in:
- `carbon-backend/alembic/versions/`

---

## Run Test Scripts

### 1) Database connectivity + inserts
```bash
cd carbon-backend
uv run python tests/test_db.py
```

This script:
- Ensures a `Profile` exists for `test-auth-uuid-123`
- Inserts a dummy `EmissionFactor` with a 1536-d embedding

### 2) Agent test (console)
```bash
cd carbon-backend
uv run python tests/test_agent.py
```

This script:
- Loads `Profile(id="test-auth-uuid-123")`
- Runs the `lead_carbon_coach` agent with a sample message
- Prints the resulting `CarbonAnalysisResponse`

---

## API Reference

### `POST /api/v1/carbon/stream`
Streams back a JSON object (single chunk) matching `CarbonAnalysisResponse`.

**Auth required**
- Uses `Authorization: Bearer <supabase_jwt>`
- User must exist in local `profiles` table.

**Request Body**

```json
{
  "messages": [
    {
      "role": "user",
      "parts": [
        { "type": "text", "text": "I drove 50 miles and ate 2 kg of beef." }
      ]
    }
  ],
  "thread_id": null
}
```

Implementation detail:
- The server concatenates all `parts` where `type == "text"`.
- It then sends only the **latest user message** content to the agent.

**Response Schema (`CarbonAnalysisResponse`)**
- `total_co2_kg: float`
- `category_breakdown: { "transport": float, "diet": float, "energy": float, "waste": float }`
- `largest_emission_source: string` (dominant category)
- `summary_message: string` (empathetic, second person)
- `personalized_action_plan: string[]` (**exactly 3** steps)

---

## CORS
CORS is configured for Vite dev server:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

---

## Project Notes
- `CarbonAnalysisResponse` is a strict Pydantic contract; the AI is configured to output only this schema.
- `EmissionFactor` supports:
  - pgvector embeddings (1536 dims)
  - Postgres full-text search (`search_vector`) for future semantic retrieval.

---

## Suggested Next Improvements
- Replace the current mock `get_emission_factor()` mapping with real DB/pgvector retrieval.
- Store AI conversations in `chat_threads` / `chat_messages`.

