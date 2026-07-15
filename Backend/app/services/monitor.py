"""
monitor.py — Background thread that monitors live stock prices and triggers email alerts.
  1. Profit Alert       — when stock rises above the user's profit target %
  2. Stop-Loss          — when stock drops below the user's stop-loss trigger price → auto-sell + email
  3. Opportunity Scan   — AI scans market for buy opportunities and emails users
"""
import time
import threading
from datetime import datetime
from app import db, mail
from app.models.stock import Stock
from app.models.user import User
from app.models.opportunity import OpportunityAlert
from app.services.stock_service import get_stock_price
from app.services.email_service import send_profit_alert_email, send_stop_loss_email, send_opportunity_email
from app.services.opportunity_engine import scan_all_opportunities
from flask import current_app

# Track loop count for opportunity scan interval
_loop_count = 0


def check_prices(app):
    """
    Background worker loop. We pass in the Flask app instance so we can push an app_context,
    allowing us to query SQLAlchemy and use Flask-Mail.
    """
    global _loop_count

    with app.app_context():
        while True:
            _loop_count += 1

            try:
                # Refresh session state to ensure we read recent changes made by the API
                db.session.expire_all()
                db.session.commit()

                # ───────────────────────────────────────────
                # 1) PROFIT ALERTS  (stock going UP)
                # ───────────────────────────────────────────
                profit_stocks = (
                    db.session.query(Stock, User)
                    .join(User)
                    .filter(Stock.profit_alert_pct != None)
                    .all()
                )

                for stock, user in profit_stocks:
                    price_data = get_stock_price(stock.stock_name)
                    if not price_data:
                        continue

                    current_price = price_data.get('price')

                    if current_price and stock.purchase_price > 0:
                        profit_pct = ((current_price - stock.purchase_price) / stock.purchase_price) * 100
                        target_pct = stock.profit_alert_pct

                        if target_pct >= 0:
                            is_triggered = (profit_pct >= target_pct)
                        else:
                            is_triggered = (profit_pct <= target_pct)

                        if is_triggered:
                            should_notify = False
                            if stock.last_notified_profit_pct is None:
                                should_notify = True
                            elif target_pct >= 0 and profit_pct >= (stock.last_notified_profit_pct + 1.5):
                                should_notify = True
                            elif target_pct < 0 and profit_pct <= (stock.last_notified_profit_pct - 1.5):
                                should_notify = True

                            if should_notify:
                                print(f"[MONITOR] Target hit! {stock.stock_name} {profit_pct:.2f}% (Target: {target_pct}%)")
                                success = send_profit_alert_email(
                                    recipient_email=user.email,
                                    user_name=f"{user.first_name} {user.last_name}",
                                    stock_symbol=stock.stock_name,
                                    profit_pct=profit_pct,
                                    current_price=current_price,
                                    target_pct=target_pct,
                                    buy_price=stock.purchase_price
                                )
                                if success:
                                    stock.last_notified_profit_pct = profit_pct
                                    db.session.commit()

                # ───────────────────────────────────────────
                # 2) STOP-LOSS CHECK  (stock going DOWN → auto-sell)
                # ───────────────────────────────────────────
                sl_stocks = (
                    db.session.query(Stock, User)
                    .join(User)
                    .filter(Stock.stop_loss_pct != None)
                    .filter(Stock.stop_loss_triggered == False)
                    .all()
                )

                for stock, user in sl_stocks:
                    price_data = get_stock_price(stock.stock_name)
                    if not price_data:
                        continue

                    current_price = price_data.get('price')

                    if current_price and stock.purchase_price > 0:
                        trigger_price = stock.purchase_price * (1 - stock.stop_loss_pct / 100)

                        if current_price <= trigger_price:
                            print(f"[MONITOR] Stop-loss triggered! {stock.stock_name} at ${current_price:.2f} (Trigger: ${trigger_price:.2f})")

                            # Send email
                            send_stop_loss_email(
                                recipient_email=user.email,
                                user_name=f"{user.first_name} {user.last_name}",
                                stock_symbol=stock.stock_name,
                                buy_price=stock.purchase_price,
                                current_price=current_price,
                                stop_loss_pct=stock.stop_loss_pct,
                                quantity=stock.quantity
                            )

                            # Auto-sell: delete the stock from portfolio
                            db.session.delete(stock)
                            db.session.commit()
                            print(f"[MONITOR] Auto-sold {stock.stock_name} — removed from portfolio.")

                # ───────────────────────────────────────────
                # 3) OPPORTUNITY SCAN  (every 5th loop = ~5 min)
                # ───────────────────────────────────────────
                if _loop_count % 5 == 1:
                    print("[OPPORTUNITY] Running AI opportunity scan...")
                    try:
                        raw_opportunities = scan_all_opportunities()
                        if raw_opportunities:
                            # Get all verified users
                            users = User.query.filter_by(is_verified=True).all()
                            for user in users:
                                for opp in raw_opportunities:
                                    # De-duplicate: skip if same stock+signal in last 24 hrs
                                    recent = (
                                        OpportunityAlert.query
                                        .filter_by(
                                            user_id=user.id,
                                            stock_symbol=opp['stock_symbol'],
                                            signal_type=opp['signal_type'],
                                        )
                                        .order_by(OpportunityAlert.created_at.desc())
                                        .first()
                                    )
                                    if recent and (datetime.utcnow() - recent.created_at).total_seconds() < 86400:
                                        continue

                                    alert = OpportunityAlert(
                                        user_id=user.id,
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

                                    # Send email notification
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
                                    except Exception as email_err:
                                        print(f"[OPPORTUNITY] Email error for {user.email}: {email_err}")

                            db.session.commit()
                            print(f"[OPPORTUNITY] Scan complete — {len(raw_opportunities)} opportunities found.")
                        else:
                            print("[OPPORTUNITY] Scan complete — no opportunities detected this cycle.")
                    except Exception as opp_err:
                        print(f"[OPPORTUNITY] Scan error: {opp_err}")
                        db.session.rollback()

            except Exception as e:
                print(f"[MONITOR THREAD ERROR] loop exception: {e}")
                db.session.rollback()

            # Wait 60 seconds before next check
            time.sleep(60)


def start_monitor_thread(app):
    """Starts the background thread."""
    thread = threading.Thread(target=check_prices, args=(app,), daemon=True)
    thread.start()
    print("[MONITOR] Stock Price Monitor thread started (Profit Alerts + Stop-Loss + Opportunities).")
