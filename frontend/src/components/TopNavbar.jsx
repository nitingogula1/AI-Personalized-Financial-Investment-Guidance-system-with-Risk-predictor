import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdNotificationsNone, MdSettings, MdPerson, MdLogout, MdKeyboardArrowDown } from 'react-icons/md';

/* --------------------------------------------------
   TopNavbar – search bar + notification + settings + user dropdown
   -------------------------------------------------- */

export default function TopNavbar() {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.first_name || 'User';
    const userEmail = user.email || 'user@finvest.ai';

    /* Close dropdown on outside click */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItem = (label, icon, onClick) => (
        <button
            key={label}
            onClick={() => { setDropdownOpen(false); onClick(); }}
            style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '0.5rem 0.85rem', background: 'none', border: 'none',
                color: 'var(--color-text)', fontSize: '0.82rem', cursor: 'pointer',
                textAlign: 'left', borderRadius: 6, transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
            {icon} {label}
        </button>
    );

    return (
        <header
            style={{
                height: '56px',
                background: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                position: 'sticky',
                top: 0,
                zIndex: 40,
            }}
        >
            {/* ---- Left: Search ---- */}
            <div style={{ position: 'relative' }}>
                <MdSearch size={18} style={{ position: 'absolute', top: '50%', left: '0.65rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search stocks, news, or analysis..."
                    className="input"
                    style={{ paddingLeft: '2.2rem', width: 260, height: 34, fontSize: '0.8rem' }}
                />
            </div>

            {/* ---- Right: Icons + Dropdown ---- */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Notification bell */}
                <button
                    onClick={() => navigate('/notifications')}
                    style={{
                        background: 'none', border: 'none', borderRadius: '50%',
                        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--color-text-muted)', position: 'relative',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                    <MdNotificationsNone size={22} />
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />
                </button>

                {/* Settings gear */}
                <button
                    onClick={() => navigate('/settings')}
                    style={{
                        background: 'none', border: 'none', borderRadius: '50%',
                        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--color-text-muted)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                    <MdSettings size={22} />
                </button>

                {/* User avatar + dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        }}
                    >
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2ECC71, #27AE60)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.8rem', color: '#fff',
                            border: '2px solid var(--color-border)',
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <MdKeyboardArrowDown size={18} style={{ color: 'var(--color-text-muted)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            minWidth: 220, background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)', borderRadius: 12,
                            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                            padding: '0.5rem', zIndex: 100,
                            animation: 'fadeIn 0.15s ease',
                        }}>
                            {/* User info header */}
                            <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.35rem' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{userName}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{userEmail}</div>
                            </div>

                            {/* Menu items */}
                            {menuItem('Profile', <MdPerson size={18} style={{ color: 'var(--color-text-muted)' }} />, () => navigate('/profile'))}
                            {menuItem('Settings', <MdSettings size={18} style={{ color: 'var(--color-text-muted)' }} />, () => navigate('/settings'))}
                            {menuItem('Notifications', <MdNotificationsNone size={18} style={{ color: 'var(--color-text-muted)' }} />, () => navigate('/notifications'))}

                            <div style={{ borderTop: '1px solid var(--color-border)', margin: '0.35rem 0' }} />

                            {menuItem('Logout', <MdLogout size={18} style={{ color: 'var(--color-danger)' }} />, handleLogout)}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
