"""
config.py — Flask configuration loaded from .env
"""
import os
from dotenv import load_dotenv

load_dotenv()


def _split_csv(value):
    return [item.strip() for item in value.split(',') if item.strip()]


class Config:
    """Base configuration."""

    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-fallback-secret')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'

    # Local SQLite Database (use absolute path to avoid confusion)
    db_path = os.path.join(os.path.dirname(__file__), 'finvest_ai.db')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-fallback-secret')
    JWT_EXPIRY_HOURS = int(os.getenv('JWT_EXPIRY_HOURS', '24'))

    # Flask-Mail (SMTP)
    MAIL_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('SMTP_PORT', '587'))
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv('SMTP_USER', '')
    MAIL_PASSWORD = os.getenv('SMTP_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', '')

    # CORS
    FRONTEND_URL = os.getenv(
        'FRONTEND_URL',
        'https://ai-personalized-financial-investment-guidance-system-m5em83xcf.vercel.app,http://localhost:5173'
    )
    FRONTEND_URLS = _split_csv(FRONTEND_URL)
