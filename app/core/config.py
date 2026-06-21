from pydantic import PostgresDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Application Settings
    PROJECT_NAME: str = "Personal Carbon Footprint AI Dashboard"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"

    # Infrastructure Gateways
    DATABASE_URL: PostgresDsn
    SUPABASE_JWT_SECRET: SecretStr
    OPENAI_API_KEY: SecretStr
    SUPABASE_ANON_KEY: SecretStr
    SUPABASE_URL: str


# Global instantiation to import across the app layer
settings = Settings()
