import React, { useState, useEffect, useCallback } from 'react';
import { MdShield, MdRefresh, MdWarning, MdCheckCircle } from 'react-icons/md';
import api from '../services/api';

/* --------------------------------------------------
   Stop-Loss Manager – monitor user stocks with live prices
   -------------------------------------------------- */

export default function StopLossPage() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStocks = useCallback(async () => {
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
                    const stopPct = s.stop_loss_pct ?? 5;
                    const triggerPrice = s.purchase_price * (1 - stopPct / 100);
                    const triggered = currentPrice <= triggerPrice;
                    const profitAlertPct = s.profit_alert_pct || '';
                    const targetPrice = profitAlertPct ? (s.purchase_price * (1 + Number(profitAlertPct) / 100)) : null;

                    return {
                        ...s,
                        currentPrice,
                        stopPct,
                        triggerPrice,
                        triggered,
                        change: live?.change || 0,
                        profitAlertPct,
                        targetPrice
                    };
                });
                setConfigs(processed);
            }
        } catch (err) {
            console.error('Stop-loss fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStocks(); }, [fetchStocks]);

    const updateStopPct = async (id, pct) => {
        const newPct = Math.max(-99, Math.min(50, pct));
        setConfigs(prev => prev.map(c => {
            if (c.id !== id) return c;
            const triggerPrice = c.purchase_price * (1 - newPct / 100);
            const triggered = c.currentPrice <= triggerPrice;
            return { ...c, stopPct: newPct, triggerPrice, triggered };
        }));
        // Save to backend
        try {
            await api.updateStock(id, { stop_loss_pct: newPct });
        } catch (err) {
            console.error('Failed to update stop-loss:', err);
        }
    };

    const updateProfitAlertPct = async (id, pct) => {
        const val = pct === '' ? null : Number(pct);
        setConfigs(prev => prev.map(c => {
            if (c.id === id) {
                const newTarget = val !== null ? (c.purchase_price * (1 + val / 100)) : null;
                return { ...c, profitAlertPct: pct, targetPrice: newTarget };
            }
            return c;
        }));
        try {
            await api.updateStock(id, { profit_alert_pct: val });
        } catch (err) {
            console.error('Failed to update profit alert:', err);
        }
    };

    const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const triggeredCount = configs.filter(c => c.triggered).length;
    const activeCount = configs.filter(c => !c.triggered).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MdShield size={22} style={{ color: 'var(--color-accent)' }} /> Stop-Loss Manager
                </h1>
                <button className="btn-outline" onClick={fetchStocks} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <MdRefresh size={16} /> Refresh Prices
                </button>
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="card card-hover" style={{ flex: '1 1 180px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4, color: 'var(--color-accent)' }}>{activeCount}</div>
                </div>
                <div className="card card-hover" style={{ flex: '1 1 180px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sold</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4, color: triggeredCount > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{triggeredCount}</div>
                </div>
                <div className="card card-hover" style={{ flex: '1 1 180px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Monitored</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{configs.length}</div>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0, overflowX: 'auto' }}>
                    <table style={{ minWidth: 800 }}>
                        <thead>
                            <tr>
                                <th>Stock</th>
                                <th>Buy Price</th>
                                <th>Current</th>
                                <th>Qty</th>
                                <th>Stop % (Local)</th>
                                <th>Stop Price</th>
                                <th>Profit Alert % (Email)</th>
                                <th>Target Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Fetching live prices…</td></tr>
                            ) : configs.length === 0 ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No stocks in portfolio. Add stocks first to set stop-loss levels.</td></tr>
                            ) : configs.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 700 }}>{c.stock_name}</td>
                                    <td>{fmt(c.purchase_price)}</td>
                                    <td style={{ fontWeight: 600, color: c.change >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>{fmt(c.currentPrice)}</td>
                                    <td>{c.quantity}</td>
                                    <td>
                                        <input className="input" type="number" min="-99" max="50" value={c.stopPct} onChange={(e) => updateStopPct(c.id, Number(e.target.value))} style={{ width: 70, textAlign: 'center' }} />
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--color-warning)' }}>{fmt(c.triggerPrice)}</td>
                                    <td>
                                        <input className="input" type="number" min="-99" max="500" placeholder="e.g. 10" value={c.profitAlertPct} onChange={(e) => updateProfitAlertPct(c.id, e.target.value)} style={{ width: 100, textAlign: 'center', borderColor: 'var(--color-accent)' }} />
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{c.targetPrice !== null ? fmt(c.targetPrice) : '—'}</td>
                                    <td>
                                        {c.triggered ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)', fontWeight: 600 }}><MdWarning size={16} /> SOLD</span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-accent)', fontWeight: 600 }}><MdCheckCircle size={16} /> Active</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {triggeredCount > 0 && (
                <div className="card" style={{ background: 'rgba(231,76,60,0.08)', borderColor: 'var(--color-danger)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-danger)', fontWeight: 700, marginBottom: 6 }}>
                        <MdWarning size={20} /> Stop-Loss Alert
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {triggeredCount} stock(s) have been sold — the current price dropped below your stop-loss price.
                    </div>
                </div>
            )}
        </div>
    );
}
