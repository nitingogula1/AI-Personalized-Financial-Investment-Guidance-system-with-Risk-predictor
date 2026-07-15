import React, { useState, useEffect, useCallback } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdRefresh, MdTrendingUp, MdTrendingDown, MdAttachMoney, MdAccountBalanceWallet, MdShowChart } from 'react-icons/md';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';

/* --------------------------------------------------
   Portfolio Page – summary cards, performance chart, holdings table
   -------------------------------------------------- */

export default function PortfolioPage() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ stock_name: '', quantity: '', purchase_price: '', purchase_date: '' });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [chartPeriod, setChartPeriod] = useState('1M');
    const [chartData, setChartData] = useState([]);

    /* ---- Fetch portfolio + live prices ---- */
    const fetchPortfolio = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.getStocks();
            if (res.data.success) {
                const userStocks = res.data.stocks;
                const tickers = [...new Set(userStocks.map(s => s.stock_name))];

                const priceResults = await Promise.all(tickers.map(t => api.getStockPrice(t).catch(() => null)));
                const priceMap = {};
                priceResults.forEach(res => { if (res?.data?.success) priceMap[res.data.stock.symbol] = res.data.stock; });

                const processed = userStocks.map(s => {
                    const live = priceMap[s.stock_name];
                    const currentPrice = live?.price || s.purchase_price;
                    const invested = s.quantity * s.purchase_price;
                    const value = s.quantity * currentPrice;
                    return { ...s, currentPrice, invested, value, pnl: value - invested, pnlPct: invested > 0 ? ((value - invested) / invested) * 100 : 0, change: live?.change || 0 };
                });
                setStocks(processed);

                // Build portfolio performance chart from first ticker's history
                if (tickers.length > 0) {
                    try {
                        const periodMap = { '1D': '5d', '1W': '5d', '1M': '1mo', '3M': '3mo' };
                        const histRes = await api.getStockHistory(tickers[0], periodMap[chartPeriod] || '1mo');
                        if (histRes.data.history) {
                            const totalInvested = processed.reduce((a, p) => a + p.invested, 0);
                            const totalValue = processed.reduce((a, p) => a + p.value, 0);
                            const growthFactor = totalInvested > 0 ? totalValue / totalInvested : 1;

                            const hist = histRes.data.history;
                            const data = hist.map((h, i) => ({
                                date: h.date,
                                value: Math.round(totalInvested * (1 + (growthFactor - 1) * (i / Math.max(hist.length - 1, 1)))),
                            }));
                            setChartData(data);
                        }
                    } catch { /* ignore chart errors */ }
                }
            }
        } catch (err) {
            console.error('Portfolio fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [chartPeriod]);

    useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

    /* ---- CRUD ---- */
    const openAdd = () => { setForm({ stock_name: '', quantity: '', purchase_price: '', purchase_date: '' }); setEditId(null); setModal('add'); };
    const openEdit = (s) => { setForm({ stock_name: s.stock_name, quantity: s.quantity, purchase_price: s.purchase_price, purchase_date: s.purchase_date }); setEditId(s.id); setModal('edit'); };

    const handleSave = async () => {
        if (!form.stock_name || !form.quantity || !form.purchase_price) return;
        setSaving(true);
        try {
            if (modal === 'add') await api.addStock({ ...form, quantity: Number(form.quantity), purchase_price: Number(form.purchase_price) });
            else await api.updateStock(editId, { ...form, quantity: Number(form.quantity), purchase_price: Number(form.purchase_price) });
            setModal(null);
            fetchPortfolio();
        } catch (err) { alert(err.response?.data?.message || 'Failed to save.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this stock?')) return;
        try { await api.deleteStock(id); fetchPortfolio(); } catch { }
    };

    const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const totalInvested = stocks.reduce((a, s) => a + s.invested, 0);
    const totalValue = stocks.reduce((a, s) => a + s.value, 0);
    const totalPnl = totalValue - totalInvested;
    const totalPnlPct = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(2) : '0.00';
    const uniqueStocks = new Set(stocks.map(s => s.stock_name)).size;
    const todayChange = stocks.reduce((a, s) => a + (s.change / 100 * s.value), 0);

    const PERIODS = ['1D', '1W', '1M', '3M'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* ── Summary Cards ── */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <SummaryCard icon={<MdAttachMoney size={18} style={{ color: 'var(--color-accent)' }} />} label="Total Value" value={fmt(totalValue)} sub={`↗ ${totalPnl >= 0 ? '+' : ''}${fmt(totalPnl)} (${totalPnlPct}%)`} subColor={totalPnl >= 0 ? 'var(--color-accent)' : 'var(--color-danger)'} />
                <SummaryCard icon={<MdAccountBalanceWallet size={18} style={{ color: 'var(--color-info)' }} />} label="Cash Balance" value={fmt(totalInvested)} sub={`${totalInvested > 0 ? '100.0' : '0.0'}% of portfolio`} />
                <SummaryCard icon={<span style={{ fontSize: '0.9rem' }}>📊</span>} label="Holdings" value={String(uniqueStocks)} sub="Different stocks" />
                <SummaryCard icon={<MdTrendingUp size={18} style={{ color: 'var(--color-warning)' }} />} label="Today's Change" value={`${todayChange >= 0 ? '+' : ''}${fmt(todayChange)}`} sub="Real-time updates" subColor={todayChange >= 0 ? 'var(--color-accent)' : 'var(--color-danger)'} valueColor={todayChange >= 0 ? 'var(--color-accent)' : 'var(--color-danger)'} />
            </div>

            {/* ── Performance Chart ── */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Portfolio Performance</h3>
                    <div style={{ display: 'flex', gap: 3 }}>
                        {PERIODS.map(p => (
                            <button key={p} onClick={() => setChartPeriod(p)} style={{
                                padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                border: '1px solid var(--color-border)',
                                background: chartPeriod === p ? 'var(--color-accent)' : 'var(--color-surface-light)',
                                color: chartPeriod === p ? '#fff' : 'var(--color-text-muted)',
                            }}>{p}</button>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData.length > 0 ? chartData : [{ date: 'Now', value: totalValue || 0 }]}>
                        <defs><linearGradient id="pf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                        <Tooltip contentStyle={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }} formatter={(v) => [fmt(v), 'Value']} />
                        <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#pf)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* ── Holdings Table ── */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '0.85rem 1.25rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Holdings
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn-outline" onClick={fetchPortfolio} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}><MdRefresh size={14} /></button>
                        <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}><MdAdd size={14} /> Add</button>
                    </div>
                </div>
                <table>
                    <thead><tr><th>Stock</th><th>Qty</th><th>Avg Cost</th><th>Current</th><th>Value</th><th>P&L</th><th>Today</th><th></th></tr></thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading…</td></tr>
                        ) : stocks.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No holdings. Click Add to start.</td></tr>
                        ) : stocks.map((s) => (
                            <tr key={s.id}>
                                <td><div style={{ fontWeight: 700 }}>{s.stock_name}</div><div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{s.purchase_date}</div></td>
                                <td>{s.quantity}</td>
                                <td>{fmt(s.purchase_price)}</td>
                                <td style={{ fontWeight: 600 }}>{fmt(s.currentPrice)}</td>
                                <td style={{ fontWeight: 600 }}>{fmt(s.value)}</td>
                                <td style={{ color: s.pnl >= 0 ? 'var(--color-accent)' : 'var(--color-danger)', fontWeight: 600 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>{s.pnl >= 0 ? <MdTrendingUp size={13} /> : <MdTrendingDown size={13} />}{s.pnl >= 0 ? '+' : ''}{fmt(s.pnl)}</span>
                                </td>
                                <td style={{ color: s.change >= 0 ? 'var(--color-accent)' : 'var(--color-danger)', fontWeight: 600, fontSize: '0.82rem' }}>{s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button onClick={() => openEdit(s)} style={{ background: 'var(--color-surface-lighter)', border: 'none', borderRadius: 5, padding: 4, cursor: 'pointer', color: 'var(--color-info)' }}><MdEdit size={14} /></button>
                                        <button onClick={() => handleDelete(s.id)} style={{ background: 'var(--color-surface-lighter)', border: 'none', borderRadius: 5, padding: 4, cursor: 'pointer', color: 'var(--color-danger)' }}><MdDelete size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Modal ── */}
            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: 380, position: 'relative' }}>
                        <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><MdClose size={20} /></button>
                        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>{modal === 'add' ? 'Add Stock' : 'Edit Stock'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input className="input" placeholder="Symbol (e.g. AAPL)" value={form.stock_name} onChange={(e) => setForm({ ...form, stock_name: e.target.value })} />
                            <input className="input" type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                            <input className="input" type="number" step="0.01" placeholder="Purchase price" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
                            <input className="input" type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
                            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? 'Add' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Summary Card ── */
function SummaryCard({ icon, label, value, sub, subColor, valueColor }) {
    return (
        <div className="card card-hover" style={{ flex: '1 1 200px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: valueColor }}>{value}</div>
                {sub && <div style={{ fontSize: '0.72rem', color: subColor || 'var(--color-text-muted)', marginTop: 2 }}>{sub}</div>}
            </div>
            <div style={{ background: 'var(--color-surface-light)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        </div>
    );
}
