"""
app/__init__.py — Flask application factory
Creates and configures the Flask app with extensions.
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_cors import CORS

# ── Extension instances (shared across the app) ──
db = SQLAlchemy()
mail = Mail()


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Load configuration from config.py
    app.config.from_object('config.Config')

    # ── Initialize extensions ──
    db.init_app(app)
    mail.init_app(app)

    # Enable CORS for React frontend
    CORS(app, resources={r"/api/*": {"origins": app.config['FRONTEND_URL']}},
         supports_credentials=True)

    # ── Register blueprints (routes) ──
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api')

    from app.routes.stocks import stocks_bp
    app.register_blueprint(stocks_bp, url_prefix='/api')

    from app.routes.opportunities import opportunities_bp
    app.register_blueprint(opportunities_bp, url_prefix='/api')

    # ── Create tables if they don't exist ──
    with app.app_context():
        from app.models.user import User                    # noqa: F401
        from app.models.stock import Stock                   # noqa: F401
        from app.models.risk import RiskPrediction           # noqa: F401
        from app.models.opportunity import OpportunityAlert  # noqa: F401
        db.create_all()

    # ── Start Background Tasks ──
    from app.services.monitor import start_monitor_thread
    start_monitor_thread(app)

    return app
