"""
User model — stores registration data and OTP verification state.
"""
from app import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'users'

    id           = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name   = db.Column(db.String(100), nullable=False)
    last_name    = db.Column(db.String(100), nullable=False)
    email        = db.Column(db.String(255), unique=True, nullable=False)
    password     = db.Column(db.String(255), nullable=False)  # bcrypt hash
    otp_code     = db.Column(db.String(10), nullable=True)
    otp_expiry   = db.Column(db.DateTime, nullable=True)
    is_verified  = db.Column(db.Boolean, default=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to stocks
    stocks = db.relationship('Stock', backref='owner', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """Serialize user to JSON-safe dict (excludes password & OTP)."""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
