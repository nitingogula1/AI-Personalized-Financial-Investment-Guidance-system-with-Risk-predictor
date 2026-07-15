import React, { useState } from 'react';
import { MdPerson, MdEdit, MdSave, MdEmail, MdCalendarToday } from 'react-icons/md';

/* --------------------------------------------------
   Profile Page – view & edit user profile
   -------------------------------------------------- */

export default function ProfilePage() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: user.first_name || '', email: user.email || '' });

    const handleSave = () => {
        const updated = { ...user, first_name: form.name, email: form.email };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
        setEditing(false);
    };

    const userName = user.first_name || 'User';
    const userEmail = user.email || 'user@finvest.ai';
    const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Mar 2026';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 600 }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>My Profile</h1>

            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem',
                    background: 'linear-gradient(135deg, #2ECC71, #27AE60)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', fontWeight: 700, color: '#fff',
                    border: '3px solid var(--color-border)',
                }}>
                    {userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{userName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{userEmail}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <MdCalendarToday size={12} /> Joined {joinDate}
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Account Details</h3>
                    <button className="btn-outline" onClick={() => setEditing(!editing)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}>
                        {editing ? <MdSave size={14} /> : <MdEdit size={14} />} {editing ? 'Cancel' : 'Edit'}
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Name</label>
                        {editing ? (
                            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} />
                        ) : (
                            <div style={{ fontWeight: 600 }}>{userName}</div>
                        )}
                    </div>
                    <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Email</label>
                        {editing ? (
                            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%' }} />
                        ) : (
                            <div style={{ fontWeight: 600 }}>{userEmail}</div>
                        )}
                    </div>
                    {editing && (
                        <button className="btn-primary" onClick={handleSave} style={{ marginTop: '0.5rem' }}>Save Changes</button>
                    )}
                </div>
            </div>
        </div>
    );
}
