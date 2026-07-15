import React from 'react';
import { Link } from 'react-router-dom';
import { MdArrowForward, MdAutoGraph, MdSecurity, MdShowChart, MdAccountBalanceWallet, MdPhoneIphone, MdGroups, MdCheck, MdStar } from 'react-icons/md';

/* ===========================================================
   Landing Page — Hero + Features + Pricing + Footer
   Top navbar with Sign In / Get Started.
   Matches reference: dark navy theme, gradient text, stats,
   feature cards, pricing tiers.
   =========================================================== */

const FEATURES = [
    { icon: MdAutoGraph, title: 'AI-Powered Insights', desc: 'Advanced machine learning algorithms analyze market patterns and provide personalized investment recommendations.', stat: '94% Accuracy Rate', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
    { icon: MdSecurity, title: 'Bank-Level Security', desc: 'Multi-layer encryption, biometric authentication, and real-time fraud detection keep your investments safe.', stat: '256-bit Encryption', color: '#2ECC71', bg: 'rgba(46,204,113,0.15)' },
    { icon: MdShowChart, title: 'Real-Time Analytics', desc: 'Live market data, advanced charting tools, and technical indicators at your fingertips 24/7.', stat: 'Live Data Feed', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
    { icon: MdAccountBalanceWallet, title: 'Smart Portfolio Management', desc: 'Automated rebalancing, risk assessment, and optimization algorithms maximize your returns.', stat: 'Up to 18% Returns', color: '#F43F5E', bg: 'rgba(244,63,94,0.15)' },
    { icon: MdPhoneIphone, title: 'Mobile Trading', desc: 'Trade anytime, anywhere with our responsive mobile app and instant push notifications.', stat: 'iOS & Android', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)' },
    { icon: MdGroups, title: 'Community & Learning', desc: 'Connect with expert traders, join investment groups, and access comprehensive educational resources.', stat: '50K+ Traders', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
];

const PRICING = [
    { name: 'Starter', price: 'Free', period: 'forever', desc: 'Perfect for beginners', features: ['Basic portfolio tracking', '5 stock watchlist', 'Market news feed', 'Community access'], cta: 'Get Started', highlight: false },
    { name: 'Pro', price: '$19', period: '/month', desc: 'For serious investors', features: ['Everything in Starter', 'AI risk predictions', 'Unlimited watchlist', 'Real-time alerts', 'Priority support', 'Advanced analytics'], cta: 'Start Free Trial', highlight: true },
    { name: 'Enterprise', price: '$49', period: '/month', desc: 'For teams & funds', features: ['Everything in Pro', 'Team collaboration', 'API access', 'Custom reports', 'Dedicated manager', 'White-label option'], cta: 'Contact Sales', highlight: false },
];

const STATS = [
    { value: '$2.5B+', label: 'Assets Under Management' },
    { value: '150K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Expert Support' },
];

const TESTIMONIALS = [
    { name: 'Sarah Chen', role: 'Portfolio Manager', text: 'FinVest AI transformed how I manage client portfolios. The AI predictions are remarkably accurate.', rating: 5 },
    { name: 'James Wilson', role: 'Day Trader', text: 'The real-time analytics and stop-loss features have saved me thousands. Absolutely essential tool.', rating: 5 },
    { name: 'Priya Sharma', role: 'Retail Investor', text: 'As a beginner, the Smart Invest feature made it easy to start building a diversified portfolio.', rating: 5 },
];

export default function LandingPage() {
    return (
        <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>

            {/* ===== NAVBAR ===== */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 2rem',
                background: 'rgba(6,14,26,0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--color-border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #2ECC71, #00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', color: '#fff' }}>FV</div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Fin<span style={{ color: '#2ECC71' }}>Vest</span> AI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {['Features', 'Pricing', 'Testimonials'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.2s' }}
                            onMouseEnter={(e) => e.target.style.color = '#fff'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                        >{item}</a>
                    ))}
                    <Link to="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>Sign In</Link>
                    <Link to="/register" style={{
                        background: 'linear-gradient(135deg, #2ECC71, #00D4AA)', color: '#fff',
                        padding: '0.5rem 1.25rem', borderRadius: 8, textDecoration: 'none',
                        fontWeight: 700, fontSize: '0.85rem', transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 2px 12px rgba(46,204,113,0.3)',
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,204,113,0.4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(46,204,113,0.3)'; }}
                    >Get Started</Link>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section style={{
                paddingTop: '10rem', paddingBottom: '5rem',
                textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
                {/* Background glows */}
                <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,113,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '30%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)',
                        borderRadius: 999, padding: '0.4rem 1rem', fontSize: '0.8rem',
                        color: '#2ECC71', fontWeight: 600, marginBottom: '1.5rem',
                    }}>
                        ✨ Powered by Advanced AI Technology
                    </div>

                    <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.25rem' }}>
                        Smart Investing<br />
                        <span style={{ background: 'linear-gradient(135deg, #2ECC71, #00D4AA, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Made Simple</span>
                    </h1>

                    <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', maxWidth: 580, margin: '0 auto 2rem', lineHeight: 1.7 }}>
                        Harness the power of AI to make smarter investment decisions. Build wealth with confidence using our advanced analytics and real-time market insights.
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" style={{
                            background: 'linear-gradient(135deg, #2ECC71, #00D4AA)', color: '#fff',
                            padding: '0.85rem 2rem', borderRadius: 12, textDecoration: 'none',
                            fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: '0 4px 20px rgba(46,204,113,0.3)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(46,204,113,0.4)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,204,113,0.3)'; }}
                        >Start Investing Free <MdArrowForward size={18} /></Link>
                        <Link to="/login" style={{
                            background: 'rgba(255,255,255,0.06)', color: '#fff',
                            padding: '0.85rem 2rem', borderRadius: 12, textDecoration: 'none',
                            fontWeight: 600, fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.12)',
                            transition: 'background 0.2s',
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        >Sign In to Account</Link>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(2rem, 5vw, 4rem)', marginTop: '4rem', flexWrap: 'wrap', padding: '0 1rem' }}>
                    {STATS.map((s, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, background: 'linear-gradient(135deg, #2ECC71, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section id="features" style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                        Powerful Features for<br /><span style={{ color: '#06B6D4' }}>Smart Investors</span>
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', maxWidth: 550, margin: '0 auto' }}>Everything you need to analyze, invest, and grow your portfolio with confidence</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {FEATURES.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <div key={i} style={{
                                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                borderRadius: 16, padding: '1.75rem',
                                transition: 'border-color 0.3s, transform 0.3s',
                                cursor: 'default',
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Icon size={22} style={{ color: f.color }} />
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{f.desc}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: f.color, fontWeight: 600 }}>
                                    <span>✨</span> {f.stat}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ===== PRICING ===== */}
            <section id="pricing" style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Simple, Transparent<br /><span style={{ color: '#06B6D4' }}>Pricing</span>
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Choose the plan that fits your investment journey</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
                    {PRICING.map((p, i) => (
                        <div key={i} style={{
                            background: p.highlight ? 'linear-gradient(180deg, rgba(46,204,113,0.08), var(--color-surface))' : 'var(--color-surface)',
                            border: `1px solid ${p.highlight ? 'rgba(46,204,113,0.3)' : 'var(--color-border)'}`,
                            borderRadius: 16, padding: '2rem', position: 'relative',
                            transform: p.highlight ? 'scale(1.02)' : 'none',
                        }}>
                            {p.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #2ECC71, #00D4AA)', color: '#fff', padding: '0.25rem 1rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>MOST POPULAR</div>}
                            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.25rem' }}>{p.name}</h3>
                            <div style={{ margin: '0.75rem 0' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{p.price}</span>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{p.period}</span>
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{p.desc}</p>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {p.features.map((feat, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        <MdCheck size={16} style={{ color: '#2ECC71', flexShrink: 0 }} /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" style={{
                                display: 'block', textAlign: 'center', padding: '0.75rem',
                                borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                                background: p.highlight ? 'linear-gradient(135deg, #2ECC71, #00D4AA)' : 'transparent',
                                color: p.highlight ? '#fff' : '#2ECC71',
                                border: p.highlight ? 'none' : '1px solid rgba(46,204,113,0.3)',
                                transition: 'all 0.2s',
                            }}>{p.cta}</Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section id="testimonials" style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>What Our <span style={{ color: '#2ECC71' }}>Users Say</span></h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: 2, marginBottom: '0.75rem' }}>
                                {[...Array(t.rating)].map((_, j) => <MdStar key={j} size={16} style={{ color: '#F59E0B' }} />)}
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>"{t.text}"</p>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.role}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer style={{ borderTop: '1px solid var(--color-border)', padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                © 2026 FinVest AI. All rights reserved. Built with ❤️ for smart investors.
            </footer>
        </div>
    );
}
