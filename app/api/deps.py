import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import SessionLocal
from app.database.models import Profile

# This tells FastAPI to look for an "Authorization: Bearer <token>" header in incoming requests
security = HTTPBearer()


def get_db():
    """
    Yields a database session for the duration of a single web request,
    ensuring it safely closes as soon as the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Profile:
    """
    Intercepts the JWT token, verifies it against the Supabase Secret,
    and returns the authorized user's database Profile.
    """
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Supabase signs all JWTs using your project's unique secret and the HS256 algorithm
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET.get_secret_value(),
            algorithms=["HS256"],
            options={"verify_aud": False},
        )

        # 'sub' (subject) is the standard JWT field where Supabase stores the auth.users.id
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

    except jwt.PyJWTError:
        raise credentials_exception

    # Verify the user actually exists in our local profiles table
    user = db.query(Profile).filter(Profile.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404, detail="User profile not found in database."
        )

    return user
