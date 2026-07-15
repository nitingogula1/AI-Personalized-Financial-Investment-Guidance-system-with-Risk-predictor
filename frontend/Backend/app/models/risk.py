"""
RiskPrediction model — AI-generated risk score per stock.
"""
from app import db
from datetime import datetime


class RiskPrediction(db.Model):
    __tablename__ = 'risk_predictions'

    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    stock_id   = db.Column(db.Integer, db.ForeignKey('stocks.id'), nullable=False)
    risk_score = db.Column(db.Numeric(5, 2), nullable=False)
    risk_level = db.Column(db.Enum('Low', 'Medium', 'High'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'stock_id': self.stock_id,
            'risk_score': float(self.risk_score),
            'risk_level': self.risk_level,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
