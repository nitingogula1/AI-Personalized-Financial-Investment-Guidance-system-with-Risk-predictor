import React, { useState, useEffect, useCallback } from 'react';
import { MdBookmarkAdd, MdBookmarkRemove, MdTrendingUp, MdTrendingDown, MdRefresh } from 'react-icons/md';
import api from '../services/api';

/* --------------------------------------------------
   Watchlist Page – track favourite stocks with live prices
   -------------------------------------------------- */

const DEFAULT_WATCHLIST = ['AAPL', 'NVDA', 'AMZN', 'TSLA', 'MSFT'];

export default function WatchlistPage() {
    const [symbols, setSymbols] = useState(() => {
        try { return JSON.parse(localStorage.getItem('watchlist') || 'null') || DEFAULT_WATCHLIST; }
        catch { return DEFAULT_WATCHLIST; }
    });
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState(true);
    const [newSymbol, setNewSymbol] = useState('');

    const saveSymbols = (syms) => {
        setSymbols(syms);
        localStorage.setItem('watchlist', JSON.stringify(syms));
    };

    const fetchPrices = useCallback(async () => {
        setLoading(true);
        try {
            const results = await Promise.all(
                symbols.map(sym => api.getStockDetails(sym).catch(() => null))
            );
            const data = {};
            results.forEach(res => {
                if (res?.data?.success) {
                    const s = res.data.stock;
                    data[s.symbol] = s;
                }
            });
            setStockData(data);
        } catch (err) {
            console.error('Watchlist fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [symbols]);

    useEffect(() => { fetchPrices(); }, [fetchPrices]);

    const addSymbol = () => {
        if (!newSymbol) return;
        const sym = newSymbol.toUpperCase().trim();
        if (symbols.includes(sym)) { setNewSymbol(''); return; }
        saveSymbols([...symbols, sym]);
        setNewSymbol('');
    };

    const remove = (sym) => saveSymbols(symbols.filter(s => s !== sym));

    const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Watchlist</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="input" placeholder="Add symbol (e.g. GOOGL)" style={{ width: 200 }} value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSymbol()} />
                    <button className="btn-primary" onClick={addSymbol} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdBookmarkAdd size={16} /> Add</button>
                    <button className="btn-outline" onClick={fetchPrices} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}><MdRefresh size={16} /> Refresh</button>
                </div>
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    Fetching live prices for {symbols.length} stocks…
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {symbols.map((sym) => {
                        const d = stockData[sym];
                        const change = d?.change ?? 0;
                        const isUp = change >= 0;
                        return (
                            <div key={sym} className="card card-hover" style={{ position: 'relative' }}>
                                <button onClick={() => remove(sym)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><MdBookmarkRemove size={18} /></button>
                                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{sym}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{d?.name || sym}</div>
                                {d ? (
                                    <>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{fmt(d.price)}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.85rem', color: isUp ? 'var(--color-accent)' : 'var(--color-danger)', fontWeight: 600 }}>
                                            {isUp ? <MdTrendingUp size={16} /> : <MdTrendingDown size={16} />}
                                            {isUp ? '+' : ''}{change.toFixed(2)}%
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            <span>H: {fmt(d.high)}</span><span>L: {fmt(d.low)}</span><span>O: {fmt(d.open)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Loading…</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
