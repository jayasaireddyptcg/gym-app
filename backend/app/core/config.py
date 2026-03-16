from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str
    jwt_secret: str
    jwt_algorithm: str
    access_token_expire_minutes: int

    aws_region: str
    aws_bucket_name: str
    aws_access_key_id: str
    aws_secret_access_key: str
    equipment_prefix: str
    food_prefix: str
    avatar_folder: str
    openai_api_key: str

    db_user: str
    db_password: str
    db_host: str
    db_port: int
    db_name: str

    # Email Configuration
    smtp_server: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    email_from: str
    email_from_name: str

    class Config:
        env_file = ".env"

settings = Settings()
