import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import SessionLocal
from app.database.models import Profile

security = HTTPBearer()

# Asymmetrically signed JWTs are validated against a JSON Web Key Set (JWKS).
# The public keys are fetched from this public endpoint. This was likely the
# original intent, as it's more secure and flexible than using a shared secret.
jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
jwks_client = PyJWKClient(jwks_url)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Profile:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # ADD THIS TO DEBUG:
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        print(f"DEBUG: Token payload is: {unverified_payload}")
        print(f"DEBUG: Token header is: {jwt.get_unverified_header(token)}")

        # Fetch the signing key from the JWKS endpoint.
        # This is the standard approach for RS256-signed tokens.
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode the token using the fetched public key
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=[
                "ES256"
            ],  # The error indicates the token uses an algorithm other than HS256
            audience="authenticated",
            options={
                "verify_aud": False,
                "verify_iss": False,  # Temporarily relax issuer check to rule it out
            },
        )

        user_id: str = payload.get("sub")
        if user_id is None:
            print("🚨 JWT Error: Token payload is missing the 'sub' field.")
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidAudienceError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect audience",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        # This will catch errors from get_signing_key_from_jwt if the token is malformed
        # or if there's an issue fetching/finding the key.
        print(f"🚨 JWT Error: {str(e)}")
        raise credentials_exception

    # Verify the user actually exists in our local database
    user = db.query(Profile).filter(Profile.id == user_id).first()
    if not user:
        print(f"🚨 DB Error: User {user_id} is missing from the local database!")
        raise HTTPException(
            status_code=404, detail="User profile not found in database."
        )

    return user
