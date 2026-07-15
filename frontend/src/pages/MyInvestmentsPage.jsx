import React, { useState, useEffect } from 'react';
import { MdSavings, MdTrendingUp, MdTrendingDown, MdRefresh } from 'react-icons/md';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

/* --------------------------------------------------
   My Investments – user's stocks with live valuation
   -------------------------------------------------- */

export default function MyInvestmentsPage() {
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);

    const fetchInvestments = async () => {
        setLoading(true);
        try {
            const res = await api.getStocks();
            if (res.data.success) {
                const userStocks = res.data.stocks;
                const tickers = [...new Set(userStocks.map(s => s.stock_name))];

                const priceResults = await Promise.all(tickers.map(t => api.getStockPrice(t).catch(() => null)));
                const priceMap = {};
                priceResults.forEach(r => { if (r?.data?.success) priceMap[r.data.stock.symbol] = r.data.stock; });

                const processed = userStocks.map(s => {
                    const live = priceMap[s.stock_name];
                    const currentPrice = live?.price || s.purchase_price;
                    const invested = s.quantity * s.purchase_price;
                    const current = s.quantity * currentPrice;
                    return { ...s, currentPrice, invested, current, pnl: current - invested, change: live?.change || 0, name: live?.name || s.stock_name };
                });
                setInvestments(processed);

                // Build a simulated growth chart from invested amounts
                if (processed.length > 0) {
                    const totalInvested = processed.reduce((a, p) => a + p.invested, 0);
                    const totalCurrent = processed.reduce((a, p) => a + p.current, 0);
                    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
                    const growthFactor = totalCurrent / totalInvested;
                    const steps = months.map((m, i) => ({
                        month: m,
                        value: Math.round(totalInvested * (1 + (growthFactor - 1) * (i / (months.length - 1)))),
                    }));
                    setHistory(steps);
                }
            }
        } catch (err) {
            console.error('Investments fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvestments(); }, []);

    const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const totalInvested = investments.reduce((a, i) => a + i.invested, 0);
    const totalCurrent = investments.reduce((a, i) => a + i.current, 0);
    const pnl = totalCurrent - totalInvested;
    const returnPct = totalInvested > 0 ? ((pnl / totalInvested) * 100).toFixed(1) : '0.0';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MdSavings size={22} style={{ color: 'var(--color-accent)' }} /> My Investments
                </h1>
                <button className="btn-outline" onClick={fetchInvestments} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <MdRefresh size={16} /> Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="card card-hover" style={{ flex: '1 1 180px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Invested</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{fmt(totalInvested)}</div>
                </div>
                <div className="card card-hover" style={{ flex: '1 1 180px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Value</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{fmt(totalCurrent)}</div>
                </div>
                <div className="card card-hover" style={{ flex: '1 1 180px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>P&L</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4, color: pnl >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
                        {pnl >= 0 ? '+' : ''}{fmt(pnl)} ({returnPct}%)
                    </div>
                </div>
            </div>

            {/* Growth Chart */}
            {history.length > 0 && (
                <div className="card">
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Investment Growth</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={history}>
                            <defs><linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2ECC71" stopOpacity={0.3} /><stop offset="100%" stopColor="#2ECC71" stopOpacity={0} /></linearGradient></defs>
                            <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }} />
                            <Area type="monotone" dataKey="value" stroke="#2ECC71" strokeWidth={2} fill="url(#ig)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Holdings Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                    <thead><tr><th>Stock</th><th>Invested</th><th>Current</th><th>P&L</th><th>Return</th><th>Today</th><th>Date</th></tr></thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading investments with live prices…</td></tr>
                        ) : investments.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No investments yet. Add stocks to your portfolio to see them here.</td></tr>
                        ) : investments.map((inv, i) => {
                            const pl = inv.pnl;
                            const ret = inv.invested > 0 ? (pl / inv.invested * 100).toFixed(1) : '0.0';
                            return (
                                <tr key={i}>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>{inv.stock_name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{inv.name}</div>
                                    </td>
                                    <td>{fmt(inv.invested)}</td>
                                    <td style={{ fontWeight: 600 }}>{fmt(inv.current)}</td>
                                    <td style={{ color: pl >= 0 ? 'var(--color-accent)' : 'var(--color-danger)', fontWeight: 600 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            {pl >= 0 ? <MdTrendingUp size={14} /> : <MdTrendingDown size={14} />}
                                            {pl >= 0 ? '+' : ''}{fmt(pl)}
                                        </span>
                                    </td>
                                    <td style={{ color: pl >= 0 ? 'var(--color-accent)' : 'var(--color-danger)', fontWeight: 600 }}>{ret}%</td>
                                    <td style={{ color: inv.change >= 0 ? 'var(--color-accent)' : 'var(--color-danger)', fontWeight: 600, fontSize: '0.85rem' }}>
                                        {inv.change >= 0 ? '+' : ''}{inv.change.toFixed(2)}%
                                    </td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>{inv.purchase_date}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
