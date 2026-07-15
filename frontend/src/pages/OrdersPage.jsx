import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdPending, MdCancel, MdShoppingCart } from 'react-icons/md';

/* --------------------------------------------------
   Orders Page – shows real orders placed via Trading Center
   (reads from localStorage 'recent_orders')
   -------------------------------------------------- */

const statusStyles = {
    Filled: { color: 'var(--color-accent)', icon: MdCheckCircle, bg: 'rgba(46,204,113,0.1)' },
    Pending: { color: 'var(--color-warning)', icon: MdPending, bg: 'rgba(243,156,18,0.1)' },
    Cancelled: { color: 'var(--color-danger)', icon: MdCancel, bg: 'rgba(231,76,60,0.1)' },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);

    /* Load orders from localStorage on mount + listen for changes */
    useEffect(() => {
        const load = () => {
            try {
                const raw = JSON.parse(localStorage.getItem('recent_orders') || '[]');
                setOrders(raw);
            } catch {
                setOrders([]);
            }
        };
        load();

        // Listen for storage changes from other tabs or Trading page updates
        const onStorage = (e) => { if (e.key === 'recent_orders') load(); };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });

    /* Count statuses — orders from Trading Center are Filled */
    const filled = orders.length;
    const pending = 0;
    const cancelled = 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Orders</h1>

            {/* Status summary cards */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[
                    { label: 'Filled', count: filled, ...statusStyles.Filled },
                    { label: 'Pending', count: pending, ...statusStyles.Pending },
                    { label: 'Cancelled', count: cancelled, ...statusStyles.Cancelled },
                ].map((s) => (
                    <div key={s.label} className="card card-hover" style={{ flex: '1 1 160px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginTop: 4 }}>{s.count}</div>
                    </div>
                ))}
            </div>

            {/* Orders table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {orders.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <MdShoppingCart size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>No orders yet</div>
                        <div style={{ fontSize: '0.82rem' }}>Orders you place in the Trading Center will appear here.</div>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Symbol</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th>Order Type</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => {
                                const st = statusStyles.Filled;
                                const Icon = st.icon;
                                const typeBadge = o.action === 'buy' ? 'badge-green' : 'badge-red';
                                return (
                                    <tr key={o.id}>
                                        <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{o.time}</td>
                                        <td><span className={`badge ${typeBadge}`} style={{ textTransform: 'uppercase' }}>{o.action}</span></td>
                                        <td style={{ fontWeight: 700 }}>{o.symbol}</td>
                                        <td>{o.qty}</td>
                                        <td>{fmt(o.price)}</td>
                                        <td style={{ fontWeight: 600 }}>{fmt(o.total)}</td>
                                        <td style={{ textTransform: 'capitalize', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>{o.type}</td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: st.color, fontWeight: 600, fontSize: '0.8rem' }}>
                                                <Icon size={16} /> Filled
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
