import asyncio
from app.database.session import SessionLocal
from app.database.models import Profile
from app.sustainability.agents import lead_carbon_coach, CarbonAgentDeps
from app.core.config import settings


async def test_pydantic_ai():
    # 1. Setup Mock User Context
    # We use the same test user from your database test
    test_user_id = "test-auth-uuid-123"

    print("\n🟢 Initializing Database Session...")
    db = SessionLocal()

    try:
        # Retrieve the user profile to satisfy the dependency
        current_user = db.query(Profile).filter(Profile.id == test_user_id).first()
        if not current_user:
            print("❌ User profile not found. Did you run test_db.py?")
            return

        print(f"✅ Found User: {current_user.email}")

        # Inject dependencies
        deps = CarbonAgentDeps(db=db, current_user=current_user)

        # 2. Define the Test Query
        # This query mentions 'driving' and 'beef', which should trigger the tool
        test_message = (
            "I drove 50 miles today in my car, and I ate 2 kg of beef for dinner."
        )
        print(f"\n💬 User Message: '{test_message}'")

        # 3. Execute the Agent
        print("🧠 Agent is thinking (watch for tool calls)...")

        # We use 'run' instead of 'run_stream' for easier testing in the console
        result = await lead_carbon_coach.run(test_message, deps=deps)

        # 4. Print the Results
        print("\n✅ Agent Execution Complete!\n")
        print("--- Final Structured Output ---")

        # The result.data is guaranteed to be a CarbonAnalysisResponse Pydantic object
        final_data = result.output

        print(f"Total CO2: {final_data.total_co2_kg} kg")
        print(f"Largest Source: {final_data.largest_emission_source}")
        print("\nCategory Breakdown:")
        for category, amount in final_data.category_breakdown.items():
            print(f"  - {category}: {amount} kg")

        print(f"\nSummary Message: {final_data.summary_message}")

        print("\nAction Plan:")
        for i, step in enumerate(final_data.personalized_action_plan, 1):
            print(f"  {i}. {step}")

    except Exception as e:
        print(f"❌ Agent test failed: {e}")
    finally:
        db.close()
        print("\n🏁 Test session closed.")


if __name__ == "__main__":
    # PydanticAI uses asynchronous execution
    asyncio.run(test_pydantic_ai())
