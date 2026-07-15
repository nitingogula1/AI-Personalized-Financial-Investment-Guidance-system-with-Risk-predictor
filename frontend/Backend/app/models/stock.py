"""
Stock model — user's portfolio holdings.
"""
from app import db
from datetime import datetime


class Stock(db.Model):
    __tablename__ = 'stocks'

    id             = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id        = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stock_name     = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Added columns for profit alerts
    profit_alert_pct = db.Column(db.Float, nullable=True)
    last_notified_profit_pct = db.Column(db.Float, nullable=True)

    # Stop-loss columns
    stop_loss_pct = db.Column(db.Float, nullable=True)
    stop_loss_triggered = db.Column(db.Boolean, default=False)

    # Relationship to risk predictions
    predictions = db.relationship('RiskPrediction', backref='stock', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stock_name': self.stock_name,
            'quantity': self.quantity,
            'purchase_price': self.purchase_price,
            'purchase_date': self.purchase_date.strftime('%Y-%m-%d') if self.purchase_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'profit_alert_pct': self.profit_alert_pct,
            'last_notified_profit_pct': self.last_notified_profit_pct,
            'stop_loss_pct': self.stop_loss_pct,
            'stop_loss_triggered': self.stop_loss_triggered,
        }
