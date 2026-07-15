import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md';
import api from '../services/api';

/* ===========================================================
   LoginPage — Purple gradient + glassmorphic card design
   Calls POST /api/login → stores JWT and navigates to dashboard
   =========================================================== */

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setLoading(true);
        setErrors({});
        try {
            const res = await api.post('/login', {
                email: form.email,
                password: form.password,
            });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/overview');
            }
        } catch (err) {
            const data = err.response?.data;
            if (data?.needs_verification) {
                // Account not verified — redirect to OTP page
                navigate('/verify-otp', { state: { email: data.email } });
                return;
            }
            setErrors({ general: data?.message || 'Invalid credentials.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4A00A0 0%, #6C3CE0 30%, #2E1065 70%, #1A0533 100%)',
            padding: '1rem',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Decorative glow orbs */}
            <div style={{ position: 'fixed', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Sign In</h1>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>Enter your credentials to access your account</p>
                </div>

                {/* Glassmorphic card */}
                <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 20,
                    padding: '2rem',
                }}>
                    {errors.general && (
                        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '0.6rem 1rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.85rem' }}>{errors.general}</div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Email */}
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <MdEmail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    autoComplete="email"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.75rem',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: 12,
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                />
                            </div>
                            {errors.email && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '0.4rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <MdLock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    autoComplete="current-password"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: 12,
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                                    {showPwd ? <MdVisibility size={18} /> : <MdVisibilityOff size={18} />}
                                </button>
                            </div>
                            {errors.password && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.password}</span>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.85rem',
                                borderRadius: 12,
                                border: 'none',
                                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                marginTop: '0.5rem',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
                                opacity: loading ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.5)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.35)'; }}
                        >
                            {loading ? 'Signing in...' : <>Sign In <MdArrowForward size={18} /></>}
                        </button>
                    </form>
                </div>

                {/* Footer link */}
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
                </p>
                <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.8rem' }}>← Back to home</Link>
                </p>
            </div>
        </div>
    );
}
