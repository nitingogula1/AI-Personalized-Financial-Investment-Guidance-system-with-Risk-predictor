"""
stocks.py — Stock portfolio CRUD routes (protected by JWT).
  GET    /api/stocks       → Fetch user's portfolio
  POST   /api/stocks       → Add stock
  PUT    /api/stocks/<id>   → Update stock
  DELETE /api/stocks/<id>   → Delete stock
"""
from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime, date

from app import db
from app.models.stock import Stock
from app.utils.helpers import decode_jwt_token
from app.services.stock_service import get_market_data, get_detailed_stock_info, get_stock_price, get_stock_history

stocks_bp = Blueprint('stocks', __name__)


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

        # Attach user info to kwargs
        kwargs['current_user_id'] = payload['user_id']
        return f(*args, **kwargs)
    return decorated


# ─────────────────────────────────────────────
# GET /api/stocks
# ─────────────────────────────────────────────
@stocks_bp.route('/stocks', methods=['GET'])
@token_required
def get_stocks(current_user_id):
    """Fetch all stocks for the authenticated user."""
    stocks = Stock.query.filter_by(user_id=current_user_id).all()
    return jsonify({
        'success': True,
        'stocks': [s.to_dict() for s in stocks],
    }), 200


# ─────────────────────────────────────────────
# POST /api/stocks
# ─────────────────────────────────────────────
@stocks_bp.route('/stocks', methods=['POST'])
@token_required
def add_stock(current_user_id):
    """Add a new stock to the user's portfolio."""
    data = request.get_json()

    required = ['stock_name', 'quantity', 'purchase_price', 'purchase_date']
    for field in required:
        if not data or not data.get(field):
            return jsonify({'success': False, 'message': f'{field} is required.'}), 400

    # Parse purchase_date string to Python date object (SQLite requires date objects)
    try:
        purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Invalid purchase_date format. Use YYYY-MM-DD.'}), 400

    stock = Stock(
        user_id=current_user_id,
        stock_name=data['stock_name'].upper(),
        quantity=int(data['quantity']),
        purchase_price=float(data['purchase_price']),
        purchase_date=purchase_date,
    )
    db.session.add(stock)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Stock added successfully.',
        'stock': stock.to_dict(),
    }), 201


# ─────────────────────────────────────────────
# POST /api/stocks/sell
# ─────────────────────────────────────────────
@stocks_bp.route('/stocks/sell', methods=['POST'])
@token_required
def sell_stock(current_user_id):
    """Sell shares from the user's portfolio."""
    data = request.get_json()

    stock_name = (data.get('stock_name') or '').upper()
    sell_qty = int(data.get('quantity', 0))

    if not stock_name or sell_qty < 1:
        return jsonify({'success': False, 'message': 'stock_name and quantity are required.'}), 400

    # Find hold for this stock
    holding = Stock.query.filter_by(user_id=current_user_id, stock_name=stock_name).first()
    if not holding:
        return jsonify({'success': False, 'message': f'You do not own any {stock_name} shares.'}), 400

    if sell_qty > holding.quantity:
        return jsonify({
            'success': False,
            'message': f'You only own {holding.quantity} shares of {stock_name}.'
        }), 400

    if sell_qty == holding.quantity:
        db.session.delete(holding)
    else:
        holding.quantity -= sell_qty

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Sold {sell_qty} shares of {stock_name} successfully.',
    }), 200


# ─────────────────────────────────────────────
# PUT /api/stocks/<id>
# ─────────────────────────────────────────────
@stocks_bp.route('/stocks/<int:stock_id>', methods=['PUT'])
@token_required
def update_stock(stock_id, current_user_id):
    """Update a stock in the user's portfolio."""
    stock = Stock.query.filter_by(id=stock_id, user_id=current_user_id).first()
    if not stock:
        return jsonify({'success': False, 'message': 'Stock not found.'}), 404

    data = request.get_json()
    if data.get('stock_name'):
        stock.stock_name = data['stock_name'].upper()
    if data.get('quantity'):
        stock.quantity = int(data['quantity'])
    if data.get('purchase_price'):
        stock.purchase_price = float(data['purchase_price'])
    if data.get('purchase_date'):
        stock.purchase_date = data['purchase_date']
    if 'profit_alert_pct' in data:
        pct = data['profit_alert_pct']
        stock.profit_alert_pct = float(pct) if pct is not None else None
    if 'stop_loss_pct' in data:
        pct = data['stop_loss_pct']
        stock.stop_loss_pct = float(pct) if pct is not None else None
        stock.stop_loss_triggered = False  # Reset trigger when user changes %

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Stock updated successfully.',
        'stock': stock.to_dict(),
    }), 200


# ─────────────────────────────────────────────
# DELETE /api/stocks/<id>
# ─────────────────────────────────────────────
@stocks_bp.route('/stocks/<int:stock_id>', methods=['DELETE'])
@token_required
def delete_stock(stock_id, current_user_id):
    """Delete a stock from the user's portfolio."""
    stock = Stock.query.filter_by(id=stock_id, user_id=current_user_id).first()
    if not stock:
        return jsonify({'success': False, 'message': 'Stock not found.'}), 404

    db.session.delete(stock)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Stock deleted successfully.',
    }), 200

@stocks_bp.route('/market-data', methods=['GET'])
def get_market_overview():
    """Fetch live data for top market stocks."""
    tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'RELIANCE.NS', 'TCS.NS']
    data = get_market_data(tickers)
    return jsonify({
        'success': True,
        'stocks': data
    }), 200

@stocks_bp.route('/stock/<symbol>', methods=['GET'])
def get_stock_detail(symbol):
    """Fetch detailed live data for a specific stock."""
    data = get_detailed_stock_info(symbol)
    if not data:
        return jsonify({'success': False, 'message': 'Stock data not found.'}), 404
    return jsonify({
        'success': True,
        'stock': data
    }), 200

@stocks_bp.route('/stock-history/<symbol>', methods=['GET'])
def get_stock_history_route(symbol):
    """Fetch historical data for a specific stock."""
    period = request.args.get('period', '1mo')
    interval = request.args.get('interval', '1d')
    data = get_stock_history(symbol, period, interval)
    return jsonify({
        'success': True,
        'history': data
    }), 200

@stocks_bp.route('/market', methods=['GET'])
def get_market():
    """Fetch real-time data for a set of major stocks."""
    tickers = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN', 'NVDA', 'RELIANCE.NS', 'TCS.NS']
    data = get_market_data(tickers)
    return jsonify({
        'success': True,
        'stocks': data
    }), 200

@stocks_bp.route('/price/<ticker>', methods=['GET'])
def get_price(ticker):
    """Fetch real-time data for a specific ticker."""
    data = get_detailed_stock_info(ticker)
    if not data:
        return jsonify({'success': False, 'message': 'Stock data not found.'}), 404
    return jsonify({
        'success': True,
        'stock': data
    }), 200
