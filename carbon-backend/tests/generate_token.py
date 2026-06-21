import time
import jwt
from app.core.config import settings


def mint_test_token():
    # The payload mimics exactly what Supabase Auth generates
    payload = {
        "aud": "authenticated",
        "exp": int(time.time()) + 3600,  # Expires in 1 hour
        "sub": "test-auth-uuid-123",  # MUST match a Profile.id in your database
        "email": "test@example.com",
        "role": "authenticated",
    }

    # Sign it using your secret project key
    token = jwt.encode(
        payload, settings.SUPABASE_JWT_SECRET.get_secret_value(), algorithm="HS256"
    )

    print("\n🟢 YOUR TEST JWT:\n")
    print(token)
    print("\nUse this in Postman, Swagger UI, or cURL!\n")


if __name__ == "__main__":
    mint_test_token()
