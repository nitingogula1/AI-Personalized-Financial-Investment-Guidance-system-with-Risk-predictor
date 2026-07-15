"""
OpportunityAlert model — AI-detected investment opportunities.
"""
from app import db
from datetime import datetime


class OpportunityAlert(db.Model):
    __tablename__ = 'opportunity_alerts'

    id               = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id          = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stock_symbol     = db.Column(db.String(20), nullable=False)
    signal_type      = db.Column(db.String(30), nullable=False)       # growth_momentum | undervalued_dip | low_volatility_steady
    score            = db.Column(db.Float, nullable=False)            # 0–100
    expected_profit_min = db.Column(db.Float, nullable=False)         # conservative %
    expected_profit_max = db.Column(db.Float, nullable=False)         # optimistic %
    reasoning        = db.Column(db.Text, nullable=False)             # plain-English explanation
    current_price    = db.Column(db.Float, nullable=False)
    risk_level       = db.Column(db.String(10), nullable=False)       # Low / Medium / High
    notified_at      = db.Column(db.DateTime, nullable=True)
    is_read          = db.Column(db.Boolean, default=False)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    user = db.relationship('User', backref=db.backref('opportunity_alerts', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stock_symbol': self.stock_symbol,
            'signal_type': self.signal_type,
            'score': self.score,
            'expected_profit_min': self.expected_profit_min,
            'expected_profit_max': self.expected_profit_max,
            'reasoning': self.reasoning,
            'current_price': self.current_price,
            'risk_level': self.risk_level,
            'notified_at': self.notified_at.isoformat() if self.notified_at else None,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
