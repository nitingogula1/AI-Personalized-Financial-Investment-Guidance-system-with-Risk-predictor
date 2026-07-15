"""
helpers.py — JWT token helpers + OTP generation.
"""
import jwt
import random
import string
from datetime import datetime, timedelta
from flask import current_app


def generate_otp(length=6):
    """Generate a secure random 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=length))


def get_otp_expiry(minutes=5):
    """Return a datetime that is `minutes` in the future."""
    return datetime.utcnow() + timedelta(minutes=minutes)


def create_jwt_token(user_id, email):
    """Create a JWT token containing user id and email."""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(
            hours=current_app.config['JWT_EXPIRY_HOURS']
        ),
        'iat': datetime.utcnow(),
    }
    token = jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256',
    )
    return token


def decode_jwt_token(token):
    """Decode and validate a JWT token. Returns payload or None."""
    try:
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256'],
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
