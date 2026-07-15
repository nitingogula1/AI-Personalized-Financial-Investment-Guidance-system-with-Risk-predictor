import React, { useState, useEffect } from 'react';
import { MdSearch, MdRefresh, MdAttachMoney } from 'react-icons/md';
import api from '../services/api';

/* --------------------------------------------------
   Trading Center — search, buy/sell, recent orders
   -------------------------------------------------- */

export default function TradingPage() {
    const [symbol, setSymbol] = useState('');
    const [action, setAction] = useState('buy');
    const [orderType, setOrderType] = useState('market');
    const [qty, setQty] = useState('');
    const [stockInfo, setStockInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [orders, setOrders] = useState(() => {
        try { return JSON.parse(localStorage.getItem('recent_orders') || '[]'); }
        catch { return []; }
    });

    /* ---- search for stock ---- */
    const searchStock = async () => {
        if (!symbol.trim()) return;
        setLoading(true);
        setStockInfo(null);
        try {
            const res = await api.getStockDetails(symbol.trim().toUpperCase());
            if (res.data.success) setStockInfo(res.data.stock);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (symbol.length >= 2) {
            const t = setTimeout(searchStock, 600);
            return () => clearTimeout(t);
        }
    }, [symbol]);

    const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '...' }

    /* Auto-dismiss notification after 5s */
    useEffect(() => {
        if (message) {
            const t = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(t);
        }
    }, [message]);

    /* ---- place order ---- */
    const placeOrder = async () => {
        if (!qty || Number(qty) < 1 || !stockInfo) return;
        setPlacing(true);
        setMessage(null);
        try {
            if (action === 'buy') {
                await api.addStock({
                    stock_name: stockInfo.symbol,
                    quantity: Number(qty),
                    purchase_price: stockInfo.price,
                    purchase_date: new Date().toISOString().slice(0, 10),
                });
            } else {
                await api.sellStock({
                    stock_name: stockInfo.symbol,
                    quantity: Number(qty),
                });
            }
            const order = {
                id: Date.now(),
                symbol: stockInfo.symbol,
                action,
                qty: Number(qty),
                price: stockInfo.price,
                total: stockInfo.price * Number(qty),
                type: orderType,
                time: new Date().toLocaleString(),
            };
            const updated = [order, ...orders].slice(0, 20);
            setOrders(updated);
            localStorage.setItem('recent_orders', JSON.stringify(updated));
            setQty('');
            setMessage({ type: 'success', text: `${action === 'buy' ? 'Bought' : 'Sold'} ${Number(qty)} shares of ${stockInfo.symbol} successfully!` });
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Order failed. Please try again.';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setPlacing(false);
        }
    };

    const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* ── Trading Center Card ── */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MdAttachMoney size={20} style={{ color: 'var(--color-accent)' }} /> Trading Center
                </h2>

                {/* Notification Banner */}
                {message && (
                    <div style={{
                        padding: '0.7rem 1rem',
                        marginBottom: '1rem',
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        color: message.type === 'success' ? '#22c55e' : '#ef4444',
                        border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, marginLeft: 12 }}>×</button>
                    </div>
                )}

                {/* Search */}
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Search Symbol</label>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <MdSearch size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        className="input"
                        placeholder="Enter stock symbol (e.g., AAPL)"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchStock()}
                        style={{ paddingLeft: '2.4rem', width: '100%' }}
                    />
                </div>

                {/* Live price badge */}
                {loading && <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Searching…</div>}
                {stockInfo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem', padding: '0.6rem 0.85rem', background: 'var(--color-surface-light)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                        <div><span style={{ fontWeight: 700 }}>{stockInfo.symbol}</span><span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: 6 }}>{stockInfo.name}</span></div>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{fmt(stockInfo.price)}</div>
                        <div style={{ color: stockInfo.change >= 0 ? 'var(--color-accent)' : 'var(--color-danger)', fontWeight: 600, fontSize: '0.85rem' }}>
                            {stockInfo.change >= 0 ? '↑' : '↓'} {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)}%
                        </div>
                    </div>
                )}

                {/* Action + Order Type */}
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Action</label>
                        <div style={{ display: 'flex', gap: 0 }}>
                            <button
                                onClick={() => setAction('buy')}
                                style={{
                                    flex: 1, padding: '0.55rem', borderRadius: '8px 0 0 8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                                    border: '1px solid var(--color-border)',
                                    background: action === 'buy' ? 'var(--color-accent)' : 'var(--color-surface-light)',
                                    color: action === 'buy' ? '#fff' : 'var(--color-text-muted)',
                                }}
                            >Buy</button>
                            <button
                                onClick={() => setAction('sell')}
                                style={{
                                    flex: 1, padding: '0.55rem', borderRadius: '0 8px 8px 0', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                                    border: '1px solid var(--color-border)', borderLeft: 'none',
                                    background: action === 'sell' ? 'var(--color-danger)' : 'var(--color-surface-light)',
                                    color: action === 'sell' ? '#fff' : 'var(--color-text-muted)',
                                }}
                            >Sell</button>
                        </div>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Order Type</label>
                        <select className="input" value={orderType} onChange={(e) => setOrderType(e.target.value)} style={{ width: '100%' }}>
                            <option value="market">Market Order</option>
                            <option value="limit">Limit Order</option>
                            <option value="stop">Stop Order</option>
                        </select>
                    </div>
                </div>

                {/* Quantity */}
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Quantity</label>
                <input className="input" type="number" min="1" placeholder="Number of shares" value={qty} onChange={(e) => setQty(e.target.value)} style={{ width: '100%', marginBottom: '0.75rem' }} />

                {/* Total */}
                {stockInfo && qty && (
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Estimated Total: <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{fmt(stockInfo.price * Number(qty))}</span>
                    </div>
                )}

                {/* Submit */}
                <button
                    className="btn-primary"
                    onClick={placeOrder}
                    disabled={placing || !stockInfo || !qty}
                    style={{
                        width: '100%', padding: '0.7rem', fontWeight: 700, fontSize: '0.95rem',
                        background: action === 'buy' ? 'var(--color-accent)' : 'var(--color-danger)',
                        opacity: (!stockInfo || !qty) ? 0.5 : 1,
                    }}
                >
                    {placing ? 'Processing…' : action === 'buy' ? 'Buy' : 'Sell'}
                </button>
            </div>

            {/* ── Recent Orders ── */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)' }}>Recent Orders</div>
                {orders.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders placed yet</div>
                ) : (
                    <table>
                        <thead><tr><th>Symbol</th><th>Action</th><th>Qty</th><th>Price</th><th>Total</th><th>Type</th><th>Time</th></tr></thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o.id}>
                                    <td style={{ fontWeight: 700 }}>{o.symbol}</td>
                                    <td><span style={{ fontWeight: 700, color: o.action === 'buy' ? 'var(--color-accent)' : 'var(--color-danger)', textTransform: 'uppercase', fontSize: '0.78rem' }}>{o.action}</span></td>
                                    <td>{o.qty}</td>
                                    <td>{fmt(o.price)}</td>
                                    <td style={{ fontWeight: 600 }}>{fmt(o.total)}</td>
                                    <td style={{ textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>{o.type}</td>
                                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{o.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
