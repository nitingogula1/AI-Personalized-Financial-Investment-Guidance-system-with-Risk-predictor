"""
opportunities.py — API routes for AI opportunity alerts.
  GET    /api/opportunities          → Fetch user's alerts (newest first)
  PUT    /api/opportunities/<id>/read → Mark an alert as read
  GET    /api/opportunities/latest   → Unread count
  POST   /api/opportunities/scan     → Manually trigger a scan (dev/debug)
"""
from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime

from app import db
from app.models.opportunity import OpportunityAlert
from app.models.user import User
from app.utils.helpers import decode_jwt_token
from app.services.opportunity_engine import scan_all_opportunities
from app.services.email_service import send_opportunity_email

opportunities_bp = Blueprint('opportunities', __name__)


def token_required(f):
    """Decorator that enforces JWT auth on a route."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        if not token:
            return jsonify({'success': False, 'message': 'Token is missing.'}), 401
        payload = decode_jwt_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Token is invalid or expired.'}), 401
        kwargs['current_user_id'] = payload['user_id']
        return f(*args, **kwargs)
    return decorated


# ─────────────────────────────────────────────
# GET /api/opportunities
# ─────────────────────────────────────────────
@opportunities_bp.route('/opportunities', methods=['GET'])
@token_required
def get_opportunities(current_user_id):
    """Fetch all opportunity alerts for the authenticated user, newest first."""
    alerts = (
        OpportunityAlert.query
        .filter_by(user_id=current_user_id)
        .order_by(OpportunityAlert.created_at.desc())
        .limit(50)
        .all()
    )
    return jsonify({
        'success': True,
        'opportunities': [a.to_dict() for a in alerts],
    }), 200


# ─────────────────────────────────────────────
# PUT /api/opportunities/<id>/read
# ─────────────────────────────────────────────
@opportunities_bp.route('/opportunities/<int:alert_id>/read', methods=['PUT'])
@token_required
def mark_read(alert_id, current_user_id):
    """Mark an opportunity alert as read."""
    alert = OpportunityAlert.query.filter_by(id=alert_id, user_id=current_user_id).first()
    if not alert:
        return jsonify({'success': False, 'message': 'Alert not found.'}), 404
    alert.is_read = True
    db.session.commit()
    return jsonify({'success': True, 'message': 'Marked as read.'}), 200


# ─────────────────────────────────────────────
# GET /api/opportunities/latest
# ─────────────────────────────────────────────
@opportunities_bp.route('/opportunities/latest', methods=['GET'])
@token_required
def get_latest(current_user_id):
    """Return count of unread alerts."""
    count = (
        OpportunityAlert.query
        .filter_by(user_id=current_user_id, is_read=False)
        .count()
    )
    return jsonify({'success': True, 'unread_count': count}), 200


# ─────────────────────────────────────────────
# POST /api/opportunities/scan  (dev / manual)
# ─────────────────────────────────────────────
@opportunities_bp.route('/opportunities/scan', methods=['POST'])
@token_required
def manual_scan(current_user_id):
    """
    Manually trigger an opportunity scan for the current user.
    Saves results to DB and optionally sends emails.
    """
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

    raw_opportunities = scan_all_opportunities()
    saved = []

    for opp in raw_opportunities:
        # De-duplicate: skip if same stock+signal was alerted in last 24 hrs
        recent = (
            OpportunityAlert.query
            .filter_by(
                user_id=current_user_id,
                stock_symbol=opp['stock_symbol'],
                signal_type=opp['signal_type'],
            )
            .order_by(OpportunityAlert.created_at.desc())
            .first()
        )
        if recent and (datetime.utcnow() - recent.created_at).total_seconds() < 86400:
            continue  # already alerted within 24 hrs

        alert = OpportunityAlert(
            user_id=current_user_id,
            stock_symbol=opp['stock_symbol'],
            signal_type=opp['signal_type'],
            score=opp['score'],
            expected_profit_min=opp['expected_profit_min'],
            expected_profit_max=opp['expected_profit_max'],
            reasoning=opp['reasoning'],
            current_price=opp['current_price'],
            risk_level=opp['risk_level'],
            notified_at=datetime.utcnow(),
        )
        db.session.add(alert)
        saved.append(alert)

        # Send email
        try:
            send_opportunity_email(
                recipient_email=user.email,
                user_name=f"{user.first_name} {user.last_name}",
                stock_symbol=opp['stock_symbol'],
                signal_type=opp['signal_type'],
                score=opp['score'],
                profit_min=opp['expected_profit_min'],
                profit_max=opp['expected_profit_max'],
                reasoning=opp['reasoning'],
                current_price=opp['current_price'],
                risk_level=opp['risk_level'],
            )
        except Exception as e:
            print(f"[OPPORTUNITY] Email error: {e}")

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Scan complete. {len(saved)} new opportunities found.',
        'opportunities': [a.to_dict() for a in saved],
    }), 200
