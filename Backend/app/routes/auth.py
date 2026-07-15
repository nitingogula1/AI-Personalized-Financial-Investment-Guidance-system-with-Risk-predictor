"""
auth.py — Authentication routes
  POST /api/register    → Register + send OTP email
  POST /api/verify-otp  → Verify OTP and activate account
  POST /api/login       → Login with JWT
  POST /api/resend-otp  → Resend OTP email
"""
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import bcrypt

from app import db
from app.models.user import User
from app.utils.helpers import generate_otp, get_otp_expiry, create_jwt_token
from app.services.email_service import send_otp_email

auth_bp = Blueprint('auth', __name__)


# ─────────────────────────────────────────────
# POST /api/register
# ─────────────────────────────────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    Expects JSON: { first_name, last_name, email, password }
    Hashes password, generates OTP, sends verification email.
    """
    data = request.get_json()

    # ── Validate required fields ──
    required = ['first_name', 'last_name', 'email', 'password']
    for field in required:
        if not data or not data.get(field):
            return jsonify({
                'success': False,
                'message': f'{field} is required.',
            }), 400

    email = data['email'].strip().lower()
    first_name = data['first_name'].strip()
    last_name = data['last_name'].strip()
    password = data['password']

    # ── Check password length ──
    if len(password) < 6:
        return jsonify({
            'success': False,
            'message': 'Password must be at least 6 characters.',
        }), 400

    # ── Check if email already exists ──
    existing = User.query.filter_by(email=email).first()
    if existing:
        # If existing user is not verified, let them re-register (overwrite)
        if not existing.is_verified:
            db.session.delete(existing)
            db.session.commit()
        else:
            return jsonify({
                'success': False,
                'message': 'Email already registered.',
            }), 409

    # ── Hash password ──
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # ── Generate OTP ──
    otp_code = generate_otp()
    otp_expiry = get_otp_expiry(minutes=5)

    # ── Create user ──
    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=hashed.decode('utf-8'),
        otp_code=otp_code,
        otp_expiry=otp_expiry,
        is_verified=False,
    )
    db.session.add(user)
    db.session.commit()

    # ── Send OTP email ──
    print(f"\n[OTP DEBUG] --- Registration for {email} ---")
    print(f"[OTP DEBUG] Code: {otp_code}")
    print(f"[OTP DEBUG] ----------------------------------\n")

    email_sent = send_otp_email(email, otp_code, first_name)

    msg = 'Registration successful. OTP sent to your email.'
    if not email_sent:
        msg = 'Registration successful, but we couldn\'t send the email. Please check the backend console for your OTP.'

    return jsonify({
        'success': True,
        'message': msg,
        'email_sent': email_sent,
        'email': email,
        # In DEV/DEBUG, we can include the OTP in the response for convenience
        'otp_debug': otp_code if current_app.debug else None
    }), 201


# ─────────────────────────────────────────────
# POST /api/verify-otp
# ─────────────────────────────────────────────
@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """
    Verify the 6-digit OTP sent to user's email.
    Expects JSON: { email, otp }
    """
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    otp = (data.get('otp') or '').strip()

    if not email or not otp:
        return jsonify({
            'success': False,
            'message': 'Email and OTP are required.',
        }), 400

    # ── Find user ──
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found.',
        }), 404

    if user.is_verified:
        return jsonify({
            'success': False,
            'message': 'Account already verified. Please login.',
        }), 400

    print(f"[DEBUG] Verifying OTP for {email}. Provided: {otp}, Stored: {user.otp_code}, Expiry: {user.otp_expiry}")

    # ── Check OTP match ──
    if user.otp_code != otp:
        print(f"[DEBUG] OTP mismatch for {email}")
        return jsonify({
            'success': False,
            'message': 'Invalid OTP. Please try again.',
        }), 400

    # ── Check OTP expiry ──
    now = datetime.utcnow()
    if user.otp_expiry and now > user.otp_expiry:
        print(f"[DEBUG] OTP expired for {email}. Now: {now}, Expiry: {user.otp_expiry}")
        return jsonify({
            'success': False,
            'message': 'OTP has expired. Please request a new one.',
        }), 400

    # ── Mark user as verified ──
    user.is_verified = True
    user.otp_code = None
    user.otp_expiry = None
    db.session.commit()
    print(f"[DEBUG] User {email} verified successfully")

    # ── Generate JWT token so user is logged in immediately ──
    token = create_jwt_token(user.id, user.email)

    return jsonify({
        'success': True,
        'message': 'Email verified successfully!',
        'token': token,
        'user': user.to_dict(),
    }), 200


# ─────────────────────────────────────────────
# POST /api/login
# ─────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login with email and password.
    Expects JSON: { email, password }
    Returns JWT token on success.
    """
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({
            'success': False,
            'message': 'Email and password are required.',
        }), 400

    # ── Find user ──
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({
            'success': False,
            'message': 'Invalid email or password.',
        }), 401

    # ── Check if verified ──
    if not user.is_verified:
        return jsonify({
            'success': False,
            'message': 'Account not verified. Please verify your email first.',
            'needs_verification': True,
            'email': user.email,
        }), 403

    # ── Verify password ──
    if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({
            'success': False,
            'message': 'Invalid email or password.',
        }), 401

    # ── Generate JWT ──
    token = create_jwt_token(user.id, user.email)

    return jsonify({
        'success': True,
        'message': 'Login successful.',
        'token': token,
        'user': user.to_dict(),
    }), 200


# ─────────────────────────────────────────────
# POST /api/resend-otp
# ─────────────────────────────────────────────
@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    """
    Resend a new OTP to the user's email.
    Expects JSON: { email }
    """
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({'success': False, 'message': 'Email is required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

    if user.is_verified:
        return jsonify({'success': False, 'message': 'Account already verified.'}), 400

    # Generate new OTP
    otp_code = generate_otp()
    user.otp_code = otp_code
    user.otp_expiry = get_otp_expiry(minutes=5)
    db.session.commit()

    print(f"\n[OTP DEBUG] --- Resend for {email} ---")
    print(f"[OTP DEBUG] Code: {otp_code}")
    print(f"[OTP DEBUG] ------------------------------\n")

    email_sent = send_otp_email(email, otp_code, user.first_name)

    msg = 'New OTP sent to your email.'
    if not email_sent:
        msg = 'OTP generated, but email failed. Check backend console for code.'

    return jsonify({
        'success': True,
        'message': msg,
        'email_sent': email_sent,
        'otp_debug': otp_code if current_app.debug else None
    }), 200
