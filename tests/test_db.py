from app.database.session import SessionLocal
from app.database.models import Profile, EmissionFactor


def test_database():
    # Open a local session to Supabase
    db = SessionLocal()
    try:
        print("🟢 Connection established.")

        # --- TEST 1: Standard Relational Insertion ---
        test_user_id = "test-auth-uuid-123"
        existing_profile = db.query(Profile).filter(Profile.id == test_user_id).first()

        if not existing_profile:
            new_profile = Profile(id=test_user_id, email="test@example.com")
            db.add(new_profile)
            db.commit()
            print("✅ Successfully inserted Profile.")
        else:
            print("✅ Profile test passed (already exists).")

        # --- TEST 2: Complex Vector Insertion ---
        test_tag = "TEST-VECTOR-01"
        existing_factor = (
            db.query(EmissionFactor)
            .filter(EmissionFactor.registry_tag == test_tag)
            .first()
        )

        if not existing_factor:
            # Create a dummy 1536-dimensional vector (simulating OpenAI's output)
            dummy_vector = [0.015] * 1536

            new_factor = EmissionFactor(
                registry_tag=test_tag,
                category="transport",
                unit_type="miles",
                description="A test vector insertion",
                embedding=dummy_vector,
            )
            db.add(new_factor)
            db.commit()
            print("✅ Successfully inserted EmissionFactor with 1536-D Vector.")
        else:
            print("✅ Vector test passed (already exists).")

        # --- TEST 3: Retrieval ---
        retrieved = (
            db.query(EmissionFactor)
            .filter(EmissionFactor.registry_tag == test_tag)
            .first()
        )
        print(
            f"🔍 Retrieved from DB: {retrieved.registry_tag} | Category: {retrieved.category}"
        )

    except Exception as e:
        print(f"❌ Database test failed: {e}")
        db.rollback()  # Revert changes if something broke
    finally:
        db.close()
        print("🏁 Test complete. Session closed.")


if __name__ == "__main__":
    test_database()
