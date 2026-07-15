import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdRocketLaunch } from 'react-icons/md';
import api from '../services/api';

/* ===========================================================
   RegisterPage — Dark theme with Sign In / Register tabs
   Calls POST /api/register → redirects to OTP verification
   =========================================================== */

export default function RegisterPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('register');
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.firstName) errs.firstName = 'First name is required';
        if (!form.lastName) errs.lastName = 'Last name is required';
        if (!form.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
        return errs;
    };

    /* Password strength */
    const getStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '#333' };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 2) return { level: score, label: 'Weak', color: '#EF4444' };
        if (score <= 3) return { level: score, label: 'Medium', color: '#F59E0B' };
        return { level: score, label: 'Strong', color: '#2ECC71' };
    };
    const strength = getStrength(form.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setLoading(true);
        setErrors({});
        try {
            const res = await api.post('/register', {
                first_name: form.firstName,
                last_name: form.lastName,
                email: form.email,
                password: form.password,
            });
            if (res.data.success) {
                // Navigate to OTP page, passing email and status in state
                navigate('/verify-otp', {
                    state: {
                        email: form.email,
                        message: res.data.message,
                        emailSent: res.data.email_sent
                    }
                });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setErrors({ general: msg });
        } finally {
            setLoading(false);
        }
    };

    /* Navigate to login if tab clicked */
    if (activeTab === 'signin') {
        navigate('/login');
        return null;
    }

    const inputWrapperStyle = { position: 'relative', marginTop: 4 };
    const iconStyle = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' };
    const inputStyle = {
        width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, color: '#fff', fontSize: '0.9rem', outline: 'none',
        transition: 'border-color 0.2s', boxSizing: 'border-box',
    };
    const labelStyle = { fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 2 };

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
                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'linear-gradient(135deg, #2ECC71, #00D4AA)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.9rem', color: '#fff',
                    }}>FV</div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                        Fin<span style={{ color: '#2ECC71' }}>Vest</span> AI
                    </span>
                </div>

                {/* Main card */}
                <div style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 20,
                    padding: '2rem',
                }}>
                    {/* Tabs */}
                    <div style={{
                        display: 'flex', borderRadius: 12, overflow: 'hidden',
                        border: '1px solid var(--color-border)', marginBottom: '1.5rem',
                    }}>
                        <button onClick={() => setActiveTab('signin')} style={{
                            flex: 1, padding: '0.65rem', fontSize: '0.9rem', fontWeight: 600,
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'rgba(255,255,255,0.5)',
                        }}>Sign In</button>
                        <button style={{
                            flex: 1, padding: '0.65rem', fontSize: '0.9rem', fontWeight: 600,
                            background: 'linear-gradient(135deg, #2ECC71, #00D4AA)', border: 'none', cursor: 'pointer',
                            color: '#fff', borderRadius: 10,
                        }}>Register</button>
                    </div>

                    {/* Header */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                            Create account <MdRocketLaunch size={22} style={{ color: '#F59E0B' }} />
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: 4 }}>Join FinVest AI and start predicting the market.</p>
                    </div>

                    {errors.general && (
                        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.6rem 1rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.85rem' }}>{errors.general}</div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* First Name */}
                        <div>
                            <label style={labelStyle}>First Name</label>
                            <div style={inputWrapperStyle}>
                                <MdPerson size={18} style={iconStyle} />
                                <input placeholder="John" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle}
                                    autoComplete="given-name"
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(46,204,113,0.5)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>
                            {errors.firstName && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.firstName}</span>}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label style={labelStyle}>Last Name</label>
                            <div style={inputWrapperStyle}>
                                <MdPerson size={18} style={iconStyle} />
                                <input placeholder="Doe" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={inputStyle}
                                    autoComplete="family-name"
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(46,204,113,0.5)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>
                            {errors.lastName && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.lastName}</span>}
                        </div>

                        {/* Email */}
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <div style={inputWrapperStyle}>
                                <MdEmail size={18} style={iconStyle} />
                                <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle}
                                    autoComplete="email"
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(46,204,113,0.5)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                            </div>
                            {errors.email && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={inputWrapperStyle}>
                                <MdLock size={18} style={{ ...iconStyle, color: form.password ? strength.color : 'rgba(255,255,255,0.35)' }} />
                                <input type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    style={{ ...inputStyle, paddingRight: '2.75rem' }}
                                    autoComplete="new-password"
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(46,204,113,0.5)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                                    {showPwd ? <MdVisibility size={18} /> : <MdVisibilityOff size={18} />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {form.password && (
                                <div style={{ marginTop: 6 }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= strength.level ? strength.color : 'var(--color-surface-lighter)', transition: 'background 0.3s' }} />
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: strength.color, marginTop: 2 }}>{strength.label} password</div>
                                </div>
                            )}
                            {errors.password && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.password}</span>}
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '0.85rem', borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg, #2ECC71 0%, #00D4AA 100%)',
                            color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                            marginTop: '0.25rem',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 20px rgba(46,204,113,0.3)',
                            opacity: loading ? 0.7 : 1,
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(46,204,113,0.45)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,204,113,0.3)'; }}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                    Already have an account? <Link to="/login" style={{ color: '#2ECC71', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </p>
                <p style={{ textAlign: 'center', marginTop: '0.4rem' }}>
                    <Link to="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.8rem' }}>← Back to home</Link>
                </p>
            </div>
        </div>
    );
}
