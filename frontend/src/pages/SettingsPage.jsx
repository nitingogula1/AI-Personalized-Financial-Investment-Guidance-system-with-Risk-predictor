import React, { useState } from 'react';
import { MdSettings, MdPerson, MdNotifications, MdSecurity, MdPalette } from 'react-icons/md';

export default function SettingsPage() {
    const [tab, setTab] = useState('profile');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [profile, setProfile] = useState({ name: user.first_name || 'User', email: user.email || 'user@finvest.ai', phone: '' });
    const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, riskAlerts: true, orderUpdates: true });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: MdPerson },
        { id: 'notifications', label: 'Notifications', icon: MdNotifications },
        { id: 'security', label: 'Security', icon: MdSecurity },
        { id: 'appearance', label: 'Appearance', icon: MdPalette },
    ];

    const Toggle = ({ checked, onChange }) => (
        <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: checked ? 'var(--color-accent)' : 'var(--color-surface-lighter)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: checked ? 20 : 2, transition: 'left 0.2s' }} />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><MdSettings size={22} style={{ color: 'var(--color-accent)' }} /> Settings</h1>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Tabs */}
                <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {tabs.map((t) => {
                        const Icon = t.icon; return (
                            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0.85rem', borderRadius: 8, border: 'none', background: tab === t.id ? 'var(--color-accent-glow)' : 'transparent', color: tab === t.id ? 'var(--color-accent)' : 'var(--color-text-muted)', fontWeight: tab === t.id ? 600 : 400, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
                                <Icon size={18} /> {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="card" style={{ flex: 1, minWidth: 300 }}>
                    {tab === 'profile' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ fontWeight: 700 }}>Profile Settings</h3>
                            <div><label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Full Name</label><input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                            <div><label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Email</label><input className="input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
                            <div><label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Phone</label><input className="input" placeholder="+1 (555) 000-0000" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
                            <button className="btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
                        </div>
                    )}
                    {tab === 'notifications' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ fontWeight: 700 }}>Notification Preferences</h3>
                            {Object.entries(notifPrefs).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                                    <Toggle checked={val} onChange={() => setNotifPrefs({ ...notifPrefs, [key]: !val })} />
                                </div>
                            ))}
                        </div>
                    )}
                    {tab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ fontWeight: 700 }}>Security</h3>
                            <div><label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Current Password</label><input className="input" type="password" placeholder="••••••••" /></div>
                            <div><label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>New Password</label><input className="input" type="password" placeholder="••••••••" /></div>
                            <button className="btn-primary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
                        </div>
                    )}
                    {tab === 'appearance' && (
                        <div><h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Appearance</h3><p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Dark theme is active. Theme customization coming soon.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
}
