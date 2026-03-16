from passlib.context import CryptContext
import secrets
import hashlib
import hmac

# Strong hashing configuration with Argon2 (recommended by OWASP)
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto",
    argon2__time_cost=3,      # Number of iterations
    argon2__memory_cost=65536, # Memory usage in KB (64MB)
    argon2__parallelism=4,    # Number of parallel threads
    argon2__hash_len=32,      # Hash length in bytes
    argon2__salt_len=16       # Salt length in bytes
)


def hash_password(password: str) -> str:
    """
    Hash password using Argon2 with strong parameters.
    No truncation - Argon2 handles long passwords properly.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against hash using Argon2.
    """
    return pwd_context.verify(plain_password, hashed_password)


def generate_secure_token(length: int = 32) -> str:
    """
    Generate cryptographically secure random token.
    """
    return secrets.token_urlsafe(length)


def hash_api_key(api_key: str) -> str:
    """
    Hash API keys using SHA-256 for secure storage.
    """
    return hashlib.sha256(api_key.encode()).hexdigest()


def verify_api_key(api_key: str, hashed_key: str) -> bool:
    """
    Verify API key against stored hash.
    """
    return hmac.compare_digest(
        hashlib.sha256(api_key.encode()).hexdigest(),
        hashed_key
    )


def generate_session_token() -> str:
    """
    Generate secure session token for JWT or sessions.
    """
    return secrets.token_hex(32)
