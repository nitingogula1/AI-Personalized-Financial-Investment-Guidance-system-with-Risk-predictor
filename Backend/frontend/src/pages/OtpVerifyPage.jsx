import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MdEmail, MdRefresh } from 'react-icons/md';
import api from '../services/api';

/* ===========================================================
   OTP Verification Page
   6-digit code input, auto-focus, resend OTP button
   =========================================================== */

export default function OtpVerifyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef([]);

    // Redirect if no email in state
    // Redirect if no email in state
    useEffect(() => {
        if (!email) {
            navigate('/register', { replace: true });
        } else if (location.state?.message && !location.state?.emailSent) {
            // If email failed, show the message from register
            setError(location.state.message);
        }
    }, [email, navigate, location.state]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // digits only
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        setError('');
        // Auto-focus next input
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/verify-otp', { email, otp: code });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setSuccess('Email verified! Redirecting...');
                setTimeout(() => navigate('/overview'), 1200);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/resend-otp', { email });
            if (res.data.email_sent) {
                setSuccess('New OTP sent to your email!');
            } else {
                setError(res.data.message || 'OTP generated, but email failed. Check backend console.');
            }
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            padding: '1rem',
            fontFamily: "'Inter', sans-serif",
        }}>
            <div style={{ width: '100%', maxWidth: 440 }}>
                {/* Icon */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'linear-gradient(135deg, rgba(46,204,113,0.15), rgba(6,182,212,0.15))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                    }}>
                        <MdEmail size={30} style={{ color: '#2ECC71' }} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>Verify Your Email</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                        We sent a 6-digit code to<br />
                        <span style={{ color: '#2ECC71', fontWeight: 600 }}>{email}</span>
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 20,
                    padding: '2rem',
                }}>
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.6rem 1rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.85rem' }}>{error}</div>
                    )}
                    {success && (
                        <div style={{ background: 'rgba(46,204,113,0.12)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 10, padding: '0.6rem 1rem', marginBottom: '1rem', color: '#2ECC71', fontSize: '0.85rem' }}>{success}</div>
                    )}

                    <form onSubmit={handleVerify}>
                        {/* OTP Inputs */}
                        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '1.5rem' }} onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    style={{
                                        width: 52, height: 60, textAlign: 'center',
                                        fontSize: '1.5rem', fontWeight: 800, borderRadius: 12,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: digit ? '2px solid #2ECC71' : '1.5px solid rgba(255,255,255,0.12)',
                                        color: '#fff', outline: 'none',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        boxShadow: digit ? '0 0 12px rgba(46,204,113,0.15)' : 'none',
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = '#2ECC71'; e.target.style.boxShadow = '0 0 12px rgba(46,204,113,0.2)'; }}
                                    onBlur={(e) => { if (!digit) { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; } }}
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '0.85rem', borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg, #2ECC71 0%, #00D4AA 100%)',
                            color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 20px rgba(46,204,113,0.3)',
                            opacity: loading ? 0.7 : 1,
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(46,204,113,0.45)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,204,113,0.3)'; }}
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>

                    {/* Resend */}
                    <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Didn't receive the code?</p>
                        <button
                            onClick={handleResend}
                            disabled={resending || countdown > 0}
                            style={{
                                background: 'none', border: 'none', color: '#2ECC71', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6,
                                opacity: countdown > 0 ? 0.5 : 1,
                            }}
                        >
                            <MdRefresh size={16} />
                            {countdown > 0 ? `Resend in ${countdown}s` : resending ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                    <Link to="/register" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.8rem' }}>← Back to register</Link>
                </p>
            </div>
        </div>
    );
}
