import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import router as api_router

# Configure structured logging for production auditing
logger = structlog.get_logger()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
)

# Enforce explicit cross-origin resource sharing constraints
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],  # Standard Vite development port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Infrastructure"])
async def health_check():
    await logger.ainfo("Health check endpoint evaluated.")
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
