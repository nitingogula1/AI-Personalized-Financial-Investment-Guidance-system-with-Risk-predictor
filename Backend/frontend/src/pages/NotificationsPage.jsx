import React, { useState } from 'react';
import { MdNotifications, MdWarning, MdCheckCircle, MdInfo, MdDelete } from 'react-icons/md';

const INITIAL = [
    { id: 1, type: 'alert', title: 'High Risk Alert — TSLA', text: 'Risk score exceeded 70. Consider reviewing your position.', time: '2 hours ago', read: false },
    { id: 2, type: 'success', title: 'Order Filled — AAPL', text: 'Your buy order for 98 shares of AAPL has been filled.', time: '1 day ago', read: false },
    { id: 3, type: 'info', title: 'Market Update', text: 'S&P 500 reached a new all-time high today.', time: '2 days ago', read: true },
    { id: 4, type: 'alert', title: 'Stop-Loss Triggered — GOOGL', text: 'Your stop-loss at $170.00 has been triggered.', time: '3 days ago', read: true },
    { id: 5, type: 'info', title: 'Welcome to FinVest AI', text: 'Start by adding stocks to your portfolio.', time: '1 week ago', read: true },
];

const ICONS = { alert: MdWarning, success: MdCheckCircle, info: MdInfo };
const ICON_COLORS = { alert: 'var(--color-danger)', success: 'var(--color-accent)', info: 'var(--color-info)' };

export default function NotificationsPage() {
    const [notifs, setNotifs] = useState(INITIAL);
    const markRead = (id) => setNotifs(notifs.map((n) => n.id === id ? { ...n, read: true } : n));
    const remove = (id) => setNotifs(notifs.filter((n) => n.id !== id));
    const markAll = () => setNotifs(notifs.map((n) => ({ ...n, read: true })));
    const unread = notifs.filter((n) => !n.read).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><MdNotifications size={22} style={{ color: 'var(--color-accent)' }} /> Notifications {unread > 0 && <span className="badge badge-green">{unread} new</span>}</h1>
                {unread > 0 && <button className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={markAll}>Mark all read</button>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifs.map((n) => {
                    const Icon = ICONS[n.type]; return (
                        <div key={n.id} className="card" onClick={() => markRead(n.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', opacity: n.read ? 0.7 : 1, borderColor: !n.read ? ICON_COLORS[n.type] : 'var(--color-border)' }}>
                            <Icon size={20} style={{ color: ICON_COLORS[n.type], marginTop: 2, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{n.text}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{n.time}</div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); remove(n.id); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><MdDelete size={16} /></button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
