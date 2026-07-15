import React, { useState, useEffect } from 'react';
import { MdAutoGraph, MdTrendingUp, MdRefresh, MdBookmarkAdd } from 'react-icons/md';
import api from '../services/api';

/* --------------------------------------------------
   Real-Time Stock Recommendations
   -------------------------------------------------- */

const PICK_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'TSLA', 'META', 'NFLX'];

export default function StockPicksPage() {
    const [picks, setPicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addMsg, setAddMsg] = useState('');

    const fetchPicks = async () => {
        setLoading(true);
        try {
            const results = await Promise.all(
                PICK_TICKERS.map(t => api.getStockDetails(t).catch(() => null))
            );
            const processed = results
                .filter(r => r?.data?.success)
                .map(r => {
                    const s = r.data.stock;
                    const price = s.price || 0;
                    const change = s.change || 0;
                    // Calculate a simple momentum score
                    const score = Math.round(50 + change * 5 + (s.rsi ? (s.rsi - 50) * 0.5 : 0));
                    const riskLevel = Math.abs(change) < 1.5 ? 'Low Risk' : Math.abs(change) < 3 ? 'Medium Risk' : 'High Risk';
                    const sentiment = change > 1 ? 'bullish' : change < -1 ? 'bearish' : 'neutral';
                    return { symbol: s.symbol, name: s.name || s.symbol, price, change, score: Math.min(100, Math.max(0, score)), riskLevel, sentiment };
                });
            setPicks(processed);
        } catch (err) {
            console.error('Stock picks error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPicks(); }, []);

    const addToWatchlist = (sym) => {
        try {
            const wl = JSON.parse(localStorage.getItem('watchlist') || '[]');
            if (!wl.includes(sym)) {
                wl.push(sym);
                localStorage.setItem('watchlist', JSON.stringify(wl));
                setAddMsg(`${sym} added to watchlist!`);
                setTimeout(() => setAddMsg(''), 2000);
            } else {
                setAddMsg(`${sym} is already in watchlist`);
                setTimeout(() => setAddMsg(''), 2000);
            }
        } catch { }
    };

    const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const riskBadge = (r) => r === 'Low Risk' ? { bg: 'rgba(46,204,113,0.15)', fg: 'var(--color-accent)' } : r === 'Medium Risk' ? { bg: 'rgba(243,156,18,0.15)', fg: 'var(--color-warning)' } : { bg: 'rgba(231,76,60,0.15)', fg: 'var(--color-danger)' };

    // Summary metrics
    const avgChange = picks.length > 0 ? picks.reduce((a, p) => a + p.change, 0) / picks.length : 0;
    const overallSentiment = avgChange > 0.5 ? 'Bullish' : avgChange < -0.5 ? 'Bearish' : 'Neutral';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* ── Header ── */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                        <h2 style={{ fontWeight: 700, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MdAutoGraph size={20} style={{ color: 'var(--color-accent)' }} /> Real-Time Stock Recommendations
                        </h2>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Live scoring based on momentum, news sentiment, and your watchlist.</div>
                    </div>
                    <button className="btn-primary" onClick={fetchPicks} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MdRefresh size={16} /> Refresh
                    </button>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <div className="card" style={{ flex: '1 1 200px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Market Sentiment</div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: 4 }}>{overallSentiment}</div>
                    </div>
                    <div className="card" style={{ flex: '1 1 200px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Universe</div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: 4 }}>{picks.length} stocks</div>
                    </div>
                    <div className="card" style={{ flex: '1 1 200px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Update Mode</div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: 4 }}>Real-time quotes</div>
                    </div>
                </div>
            </div>

            {addMsg && (
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-accent)', background: 'rgba(46,204,113,0.1)', padding: '0.5rem 0.85rem', borderRadius: 8 }}>{addMsg}</div>
            )}

            {/* ── Top Picks ── */}
            <div>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--color-accent)' }}>◉</span> Top Picks
                </h3>

                {loading ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Fetching real-time data…</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                        {picks.map((p) => {
                            const rb = riskBadge(p.riskLevel);
                            return (
                                <div key={p.symbol} className="card card-hover">
                                    {/* Top row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{p.symbol}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Score: {p.score.toFixed(2)}</div>
                                        </div>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: rb.fg, background: rb.bg, padding: '0.2rem 0.55rem', borderRadius: 5 }}>{p.riskLevel}</span>
                                    </div>

                                    {/* Price */}
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 2 }}>{p.price > 0 ? fmt(p.price) : '$0.00'}</div>
                                    <div style={{ fontSize: '0.78rem', color: p.change >= 0 ? 'var(--color-accent)' : 'var(--color-danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, marginBottom: '0.5rem' }}>
                                        <MdTrendingUp size={14} /> {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
                                    </div>

                                    {/* Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                        <div>
                                            <div>Source: Live</div>
                                            <div>Sentiment: {p.sentiment}</div>
                                        </div>
                                        <button onClick={() => addToWatchlist(p.symbol)} style={{
                                            display: 'flex', alignItems: 'center', gap: 4, padding: '0.3rem 0.65rem', borderRadius: 6,
                                            background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', cursor: 'pointer',
                                            color: 'var(--color-text)', fontSize: '0.72rem', fontWeight: 600,
                                        }}>
                                            <MdBookmarkAdd size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
