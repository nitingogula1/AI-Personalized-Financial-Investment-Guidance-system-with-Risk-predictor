"""
email_service.py — Send OTP verification emails via Flask-Mail SMTP.
"""
from flask_mail import Message
from app import mail


def send_otp_email(recipient_email, otp_code, user_name="User"):
    """
    Send a 6-digit OTP to the user's email.
    Returns True on success, False on failure.
    """
    try:
        msg = Message(
            subject="FinVest AI — Email Verification Code",
            recipients=[recipient_email],
        )
        msg.html = f"""
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;
                    background: #0D2137; border-radius: 16px; padding: 2rem; color: #E8ECF1;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px;
                            background: linear-gradient(135deg, #2ECC71, #00D4AA);
                            line-height: 48px; font-weight: 800; font-size: 1.1rem; color: #fff;">
                    FV
                </div>
                <h2 style="margin: 0.5rem 0 0; font-size: 1.3rem;">FinVest AI</h2>
            </div>
            <p>Hi <strong>{user_name}</strong>,</p>
            <p>Your email verification code is:</p>
            <div style="text-align: center; margin: 1.5rem 0;">
                <span style="display: inline-block; font-size: 2rem; font-weight: 800;
                             letter-spacing: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 12px;
                             background: rgba(46,204,113,0.15); color: #2ECC71;">
                    {otp_code}
                </span>
            </div>
            <p style="color: #7B8FA3; font-size: 0.85rem;">
                This code expires in <strong>5 minutes</strong>. Do not share it with anyone.
            </p>
            <hr style="border: none; border-top: 1px solid #1C3A56; margin: 1.5rem 0;">
            <p style="color: #7B8FA3; font-size: 0.75rem; text-align: center;">
                If you didn't request this, please ignore this email.<br>
                &copy; 2026 FinVest AI
            </p>
        </div>
        """
        mail.send(msg)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send OTP to {recipient_email}: {e}")
        return False

def send_profit_alert_email(recipient_email, user_name, stock_symbol, profit_pct, current_price, target_pct, buy_price):
    """
    Send an email notifying the user that a stock has hit their profit target.
    """
    target_price = buy_price * (1 + target_pct / 100)
    try:
        msg = Message(
            subject=f"FinVest AI — Profit Alert for {stock_symbol} 🚀",
            recipients=[recipient_email],
        )
        msg.html = f"""
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;
                    background: #0D2137; border-radius: 16px; padding: 2rem; color: #E8ECF1;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px;
                            background: linear-gradient(135deg, #2ECC71, #00D4AA);
                            line-height: 48px; font-weight: 800; font-size: 1.1rem; color: #fff;">
                    FV
                </div>
                <h2 style="margin: 0.5rem 0 0; font-size: 1.3rem;">FinVest AI Alert</h2>
            </div>
            <p>Hi <strong>{user_name}</strong>,</p>
            <p>Great news! Your shares of <strong>{stock_symbol}</strong> have hit your profit alert target of <strong>{target_pct}%</strong> (Target Price: <strong>${target_price:.2f}</strong>).</p>
            <div style="text-align: center; margin: 1.5rem 0;">
                <p style="margin: 0; color: #7B8FA3; font-size: 0.9rem;">Current Profit</p>
                <div style="display: inline-block; font-size: 2rem; font-weight: 800;
                             padding: 0.75rem 1.5rem; border-radius: 12px;
                             background: rgba(46,204,113,0.15); color: #2ECC71;">
                    +{profit_pct:.2f}%
                </div>
                <p style="margin-top: 0.5rem; font-size: 1.1rem;">Current Price: <strong>${current_price:.2f}</strong></p>
                <p style="color: #7B8FA3; font-size: 0.85rem; margin-top: 0.25rem;">Bought at: ${buy_price:.2f}</p>
            </div>
            <p style="color: #7B8FA3; font-size: 0.85rem;">
                Log into your FinVest AI dashboard to review your portfolio or adjust your profit targets.
            </p>
            <hr style="border: none; border-top: 1px solid #1C3A56; margin: 1.5rem 0;">
            <p style="color: #7B8FA3; font-size: 0.75rem; text-align: center;">
                You are receiving this because you configured a Profit Alert for this stock.<br>
                &copy; 2026 FinVest AI
            </p>
        </div>
        """
        mail.send(msg)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send Profit Alert to {recipient_email}: {e}")
        return False


def send_stop_loss_email(recipient_email, user_name, stock_symbol, buy_price, current_price, stop_loss_pct, quantity):
    """
    Send an email notifying the user that a stock has been sold because
    it hit the stop-loss trigger price.
    """
    try:
        trigger_price = buy_price * (1 - stop_loss_pct / 100)
        loss_pct = ((current_price - buy_price) / buy_price) * 100
        total_loss = (buy_price - current_price) * quantity

        msg = Message(
            subject=f"FinVest AI — Stop-Loss Triggered: {stock_symbol} Sold ⚠️",
            recipients=[recipient_email],
        )
        msg.html = f"""
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto;
                    background: #0D2137; border-radius: 16px; padding: 2rem; color: #E8ECF1;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px;
                            background: linear-gradient(135deg, #e74c3c, #c0392b);
                            line-height: 48px; font-weight: 800; font-size: 1.1rem; color: #fff;">
                    FV
                </div>
                <h2 style="margin: 0.5rem 0 0; font-size: 1.3rem;">FinVest AI — Stock Sold</h2>
            </div>
            <p>Hi <strong>{user_name}</strong>,</p>
            <p>Your <strong>{quantity}</strong> share(s) of <strong>{stock_symbol}</strong> have been
               <strong style="color: #e74c3c;">automatically sold</strong> because the current price
               dropped below your stop-loss trigger price.</p>

            <div style="background: rgba(231,76,60,0.1); border-radius: 12px; padding: 1rem; margin: 1rem 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
                    <tr>
                        <td style="padding: 6px 0; color: #7B8FA3;">Buy Price</td>
                        <td style="padding: 6px 0; text-align: right; font-weight: 700;">${buy_price:.2f}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #7B8FA3;">Stop-Loss %</td>
                        <td style="padding: 6px 0; text-align: right; font-weight: 700;">{stop_loss_pct}%</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #7B8FA3;">Trigger Price</td>
                        <td style="padding: 6px 0; text-align: right; font-weight: 700;">${trigger_price:.2f}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #7B8FA3;">Sold At</td>
                        <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #e74c3c;">${current_price:.2f}</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; margin: 1.5rem 0;">
                <p style="margin: 0; color: #7B8FA3; font-size: 0.9rem;">Loss</p>
                <div style="display: inline-block; font-size: 2rem; font-weight: 800;
                             padding: 0.75rem 1.5rem; border-radius: 12px;
                             background: rgba(231,76,60,0.15); color: #e74c3c;">
                    {loss_pct:.2f}%
                </div>
                <p style="margin-top: 0.5rem; font-size: 1rem; color: #e74c3c;">
                    Total: -${total_loss:.2f} ({quantity} shares)
                </p>
            </div>

            <p style="color: #7B8FA3; font-size: 0.85rem;">
                Log into your FinVest AI dashboard to review your portfolio.
            </p>
            <hr style="border: none; border-top: 1px solid #1C3A56; margin: 1.5rem 0;">
            <p style="color: #7B8FA3; font-size: 0.75rem; text-align: center;">
                You are receiving this because your stop-loss was triggered for this stock.<br>
                &copy; 2026 FinVest AI
            </p>
        </div>
        """
        mail.send(msg)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send Stop-Loss email to {recipient_email}: {e}")
        return False


def send_opportunity_email(recipient_email, user_name, stock_symbol, signal_type,
                           score, profit_min, profit_max, reasoning, current_price, risk_level):
    """
    Send a beautifully designed email notifying the user about a new
    AI-detected investment opportunity.
    """
    signal_labels = {
        'growth_momentum': ('📈 Growth Momentum', '#2ECC71', 'rgba(46,204,113,0.15)'),
        'undervalued_dip': ('💎 Undervalued Dip', '#3498DB', 'rgba(52,152,219,0.15)'),
        'low_volatility_steady': ('🛡️ Low-Vol Steady', '#9B59B6', 'rgba(155,89,182,0.15)'),
    }
    label, color, bg = signal_labels.get(signal_type, ('🔔 Opportunity', '#F39C12', 'rgba(243,156,18,0.15)'))

    risk_colors = {'Low': '#2ECC71', 'Medium': '#F39C12', 'High': '#E74C3C'}
    risk_color = risk_colors.get(risk_level, '#F39C12')

    try:
        msg = Message(
            subject=f"FinVest AI — New Opportunity: {stock_symbol} {label.split(' ')[0]}",
            recipients=[recipient_email],
        )
        msg.html = f"""
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto;
                    background: #0D2137; border-radius: 16px; padding: 2rem; color: #E8ECF1;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px;
                            background: linear-gradient(135deg, #2ECC71, #00D4AA);
                            line-height: 48px; font-weight: 800; font-size: 1.1rem; color: #fff;">
                    FV
                </div>
                <h2 style="margin: 0.5rem 0 0; font-size: 1.3rem;">FinVest AI — Opportunity Detected</h2>
            </div>

            <p>Hi <strong>{user_name}</strong>,</p>
            <p>Our AI scanner has identified a promising investment opportunity for you:</p>

            <!-- Signal Badge -->
            <div style="text-align: center; margin: 1rem 0;">
                <span style="display: inline-block; padding: 0.4rem 1rem; border-radius: 20px;
                             background: {bg}; color: {color}; font-weight: 700; font-size: 0.9rem;">
                    {label}
                </span>
            </div>

            <!-- Stock Details -->
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 1.25rem; margin: 1rem 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
                    <tr>
                        <td style="padding: 8px 0; color: #7B8FA3;">Stock</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 700; font-size: 1.1rem;">{stock_symbol}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #7B8FA3;">Current Price</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 700;">${current_price:.2f}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #7B8FA3;">AI Score</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 700; color: {color};">{score:.0f}/100</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #7B8FA3;">Risk Level</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 700; color: {risk_color};">{risk_level}</td>
                    </tr>
                </table>
            </div>

            <!-- Profit Range -->
            <div style="text-align: center; margin: 1.5rem 0;">
                <p style="margin: 0; color: #7B8FA3; font-size: 0.85rem;">Expected Profit Range</p>
                <div style="display: inline-block; font-size: 1.8rem; font-weight: 800;
                             padding: 0.75rem 1.5rem; border-radius: 12px;
                             background: rgba(46,204,113,0.15); color: #2ECC71; margin-top: 0.3rem;">
                    +{profit_min:.1f}% to +{profit_max:.1f}%
                </div>
            </div>

            <!-- Reasoning -->
            <div style="background: rgba(255,255,255,0.03); border-left: 3px solid {color};
                        padding: 1rem; border-radius: 0 8px 8px 0; margin: 1rem 0;">
                <p style="margin: 0; font-size: 0.9rem; line-height: 1.6; color: #B0BEC5;">
                    <strong style="color: #E8ECF1;">Why this pick?</strong><br>
                    {reasoning}
                </p>
            </div>

            <p style="color: #7B8FA3; font-size: 0.85rem;">
                Log into your FinVest AI dashboard to explore this opportunity and take action.
            </p>

            <hr style="border: none; border-top: 1px solid #1C3A56; margin: 1.5rem 0;">
            <p style="color: #7B8FA3; font-size: 0.75rem; text-align: center;">
                This alert was generated by FinVest AI's intelligent opportunity scanner.<br>
                &copy; 2026 FinVest AI
            </p>
        </div>
        """
        mail.send(msg)
        print(f"[EMAIL] Opportunity alert sent to {recipient_email} for {stock_symbol}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send Opportunity email to {recipient_email}: {e}")
        return False
