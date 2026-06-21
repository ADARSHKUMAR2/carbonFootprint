"""add_profiles_table_and_auth_trigger

Revision ID: 464d56d28c7e
Revises:
Create Date: 2026-06-18 15:30:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "464d56d28c7e"
down_revision = (
    "2a885248bf2a"  # If you have previous migrations, put the previous ID here!
)
branch_labels = None
depends_on = None


def upgrade():
    # 1. Drop the table if it exists so we can recreate it cleanly
    op.execute("DROP TABLE IF EXISTS profiles CASCADE;")

    # 2. Create the profiles table
    op.create_table(
        "profiles",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")
        ),
    )

    # 3. Create the SQL function to handle new users
    op.execute("""
        create or replace function public.handle_new_user()
        returns trigger
        language plpgsql
        security definer set search_path = public
        as $$
        begin
          insert into public.profiles (id, email)
          values (new.id, new.email);
          return new;
        end;
        $$;
    """)

    # 4. Drop the trigger if it exists before creating it
    op.execute("drop trigger if exists on_auth_user_created on auth.users;")

    # 5. Create the trigger
    op.execute("""
        create trigger on_auth_user_created
          after insert on auth.users
          for each row execute procedure public.handle_new_user();
    """)


def downgrade():
    # Reverse the changes
    op.execute("drop trigger if exists on_auth_user_created on auth.users;")
    op.execute("drop function if exists public.handle_new_user();")
    op.drop_table("profiles")
