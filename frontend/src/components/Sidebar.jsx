import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    MdDashboard,
    MdShowChart,
    MdAccountBalanceWallet,
    MdBookmark,
    MdReceipt,
    MdTrendingUp,
    MdAutoGraph,
    MdShield,
    MdAnalytics,
    MdStars,
    MdSavings,
    MdNotifications,
    MdSettings,
    MdLogout,
    MdLightbulb,
} from 'react-icons/md';

/* -----------------------------------------------------------
   Sidebar – matches the reference image's dark fintech layout
   Items: Overview, Trading, Portfolio, Watchlist, Orders,
   Markets, Smart Invest, Stop-Loss, Risk Analysis,
   Stock Picks, My Investments, Notifications, Settings
   ----------------------------------------------------------- */

const NAV_ITEMS = [
    { path: '/overview', label: 'Overview', icon: MdDashboard },
    { path: '/trading', label: 'Trading', icon: MdShowChart },
    { path: '/portfolio', label: 'Portfolio', icon: MdAccountBalanceWallet },
    { path: '/watchlist', label: 'Watchlist', icon: MdBookmark },
    { path: '/orders', label: 'Orders', icon: MdReceipt },
    { path: '/markets', label: 'Markets', icon: MdTrendingUp },
    { path: '/smart-invest', label: 'Smart Invest', icon: MdAutoGraph },
    { path: '/stop-loss', label: 'Stop-Loss', icon: MdShield },
    { path: '/risk-analysis', label: 'Risk Analysis', icon: MdAnalytics },
    { path: '/stock-picks', label: 'Stock Picks', icon: MdStars },
    { path: '/opportunities', label: 'Opportunities', icon: MdLightbulb },
    { path: '/investments', label: 'My Investments', icon: MdSavings },
    { path: '/notifications', label: 'Notifications', icon: MdNotifications },
    { path: '/settings', label: 'Settings', icon: MdSettings },
];

export default function Sidebar() {
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <aside
            style={{
                width: '220px',
                minHeight: '100vh',
                background: 'var(--color-primary)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 50,
                overflowY: 'auto',
            }}
        >
            {/* ---------- Brand ---------- */}
            <div
                style={{
                    padding: '1.25rem 1rem',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-info))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.875rem',
                        color: '#fff',
                    }}
                >
                    FV
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                    FinVest AI
                </span>
            </div>

            {/* ---------- Navigation ---------- */}
            <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname === path;
                    return (
                        <NavLink
                            key={path}
                            to={path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.6rem 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                background: isActive ? 'var(--color-accent-glow)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'var(--color-surface-light)';
                                    e.currentTarget.style.color = 'var(--color-text)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--color-text-muted)';
                                }
                            }}
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* ---------- Logout ---------- */}
            <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: 'var(--color-danger)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(231,76,60,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                    <MdLogout size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
