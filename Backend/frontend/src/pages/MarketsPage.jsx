import React, { useState, useEffect, useCallback } from 'react';
import { MdRefresh, MdStar, MdStarBorder, MdSearch, MdFlashOn } from 'react-icons/md';
import api from '../services/api';
import StockChart from '../components/StockChart';

/* ---------- Asset categories ---------- */
const CATEGORIES = [
    { label: 'US/Global', icon: '🌐', key: 'US Stocks' },
    { label: 'Indian Stocks', icon: '🇮🇳', key: 'Indian Stocks' },
    { label: 'Crypto', icon: '🪙', key: 'Crypto' },
];

const DEFAULT_SYMBOLS = {
    'US Stocks': [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'TSLA', name: 'Tesla Inc.' },
        { symbol: 'MSFT', name: 'Microsoft Corp.' },
        { symbol: 'AMZN', name: 'Amazon.com' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.' },
        { symbol: 'META', name: 'Meta Platforms' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.' },
        { symbol: 'NFLX', name: 'Netflix Inc.' },
        { symbol: 'AMD', name: 'AMD Inc.' },
        { symbol: 'INTC', name: 'Intel Corp.' },
        { symbol: 'CRM', name: 'Salesforce Inc.' },
        { symbol: 'ORCL', name: 'Oracle Corp.' },
        { symbol: 'ADBE', name: 'Adobe Inc.' },
        { symbol: 'PYPL', name: 'PayPal Holdings' },
        { symbol: 'DIS', name: 'Walt Disney Co.' },
        { symbol: 'CSCO', name: 'Cisco Systems' },
        { symbol: 'PEP', name: 'PepsiCo Inc.' },
        { symbol: 'KO', name: 'Coca-Cola Co.' },
        { symbol: 'NKE', name: 'Nike Inc.' },
        { symbol: 'BA', name: 'Boeing Co.' },
        { symbol: 'JPM', name: 'JPMorgan Chase' },
        { symbol: 'V', name: 'Visa Inc.' },
        { symbol: 'MA', name: 'Mastercard Inc.' },
        { symbol: 'WMT', name: 'Walmart Inc.' },
        { symbol: 'JNJ', name: 'Johnson & Johnson' },
    ],
    'Indian Stocks': [
        { symbol: 'RELIANCE.NS', name: 'Reliance Ind.' },
        { symbol: 'TCS.NS', name: 'TCS Ltd.' },
        { symbol: 'INFY.NS', name: 'Infosys Ltd.' },
        { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
        { symbol: 'WIPRO.NS', name: 'Wipro Ltd.' },
        { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
        { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
        { symbol: 'SBIN.NS', name: 'State Bank India' },
        { symbol: 'ITC.NS', name: 'ITC Ltd.' },
        { symbol: 'LT.NS', name: 'Larsen & Toubro' },
        { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra' },
        { symbol: 'AXISBANK.NS', name: 'Axis Bank' },
        { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
        { symbol: 'MARUTI.NS', name: 'Maruti Suzuki' },
        { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
        { symbol: 'SUNPHARMA.NS', name: 'Sun Pharma' },
        { symbol: 'HCLTECH.NS', name: 'HCL Technologies' },
        { symbol: 'ADANIENT.NS', name: 'Adani Enterprises' },
        { symbol: 'TITAN.NS', name: 'Titan Company' },
        { symbol: 'ONGC.NS', name: 'ONGC Ltd.' },
        { symbol: 'NTPC.NS', name: 'NTPC Ltd.' },
        { symbol: 'POWERGRID.NS', name: 'Power Grid Corp.' },
        { symbol: 'TECHM.NS', name: 'Tech Mahindra' },
        { symbol: 'HINDALCO.NS', name: 'Hindalco Ind.' },
        { symbol: 'DRREDDY.NS', name: 'Dr. Reddys Labs' },
    ],
    Crypto: [
        { symbol: 'BTC-USD', name: 'Bitcoin' },
        { symbol: 'ETH-USD', name: 'Ethereum' },
        { symbol: 'SOL-USD', name: 'Solana' },
        { symbol: 'BNB-USD', name: 'BNB' },
        { symbol: 'XRP-USD', name: 'Ripple' },
        { symbol: 'ADA-USD', name: 'Cardano' },
        { symbol: 'AVAX-USD', name: 'Avalanche' },
        { symbol: 'DOGE-USD', name: 'Dogecoin' },
        { symbol: 'DOT-USD', name: 'Polkadot' },
        { symbol: 'MATIC-USD', name: 'Polygon' },
        { symbol: 'LINK-USD', name: 'Chainlink' },
        { symbol: 'SHIB-USD', name: 'Shiba Inu' },
        { symbol: 'UNI-USD', name: 'Uniswap' },
        { symbol: 'LTC-USD', name: 'Litecoin' },
        { symbol: 'ATOM-USD', name: 'Cosmos' },
        { symbol: 'TRX-USD', name: 'TRON' },
        { symbol: 'NEAR-USD', name: 'NEAR Protocol' },
        { symbol: 'APT-USD', name: 'Aptos' },
        { symbol: 'FIL-USD', name: 'Filecoin' },
        { symbol: 'ALGO-USD', name: 'Algorand' },
    ],
};


const TIMEFRAMES = ['1D', '1W', '1M', '1Y'];
const TIMEFRAME_MAP = { '1D': '1d', '1W': '5d', '1M': '1mo', '1Y': '1y' };

/* ---------- Component ---------- */
export default function MarketsPage() {
    const [category, setCategory] = useState('US Stocks');
    const [search, setSearch] = useState('');
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
    const [stockDetails, setStockDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [favourites, setFavourites] = useState(() => {
        try { return new Set(JSON.parse(localStorage.getItem('mkt_favs') || '[]')); }
        catch { return new Set(); }
    });
    const [timeframe, setTimeframe] = useState('1M');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    /* ---- fetch stock data ---- */
    const [fetchError, setFetchError] = useState(false);

    const fetchDetails = useCallback(async (sym) => {
        setLoading(true);
        setFetchError(false);
        try {
            const res = await api.getStockDetails(sym || selectedSymbol);
            if (res.data.success) {
                setStockDetails(res.data.stock);
            } else {
                setFetchError(true);
                setStockDetails(null);
            }
        } catch (err) {
            console.error('Error fetching stock details:', err);
            setFetchError(true);
            setStockDetails(null);
        } finally {
            setLoading(false);
        }
    }, [selectedSymbol]);

    /* ---- fetch history for chart ---- */
    const fetchHistory = useCallback(async (sym, tf) => {
        setHistoryLoading(true);
        try {
            const period = TIMEFRAME_MAP[tf] || '1mo';
            const res = await api.getStockHistory(sym, period);
            if (res.data.success && res.data.history) {
                setHistoryData(res.data.history);
            } else {
                setHistoryData([]);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
            setHistoryData([]);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDetails(selectedSymbol);
        fetchHistory(selectedSymbol, timeframe);
        let iv;
        if (autoRefresh) iv = setInterval(() => { fetchDetails(selectedSymbol); fetchHistory(selectedSymbol, timeframe); }, 15000);
        return () => clearInterval(iv);
    }, [selectedSymbol, autoRefresh, fetchDetails, fetchHistory, timeframe]);

    /* ---- helpers ---- */
    const toggleFav = (sym) => {
        const next = new Set(favourites);
        next.has(sym) ? next.delete(sym) : next.add(sym);
        setFavourites(next);
        localStorage.setItem('mkt_favs', JSON.stringify([...next]));
    };

    const selectAsset = (sym) => {
        setSelectedSymbol(sym);
    };

    const fmt = (n) => {
        const num = Number(n);
        if (isNaN(num)) return '—';
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    };

    const filteredAssets = DEFAULT_SYMBOLS[category].filter(
        (a) => a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())
    );

    const d = stockDetails;
    const changePct = d?.change ?? 0;
    const isPositive = changePct >= 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* ========== HEADER ========== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Asset Explorer</div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.1rem 0' }}>Markets</h1>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Browse stocks, crypto, and global assets with live data</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => fetchDetails(selectedSymbol)} style={btnSmall}>
                        <MdRefresh size={14} /> Refresh
                    </button>
                    <button onClick={() => setAutoRefresh(!autoRefresh)} style={{ ...btnSmall, background: autoRefresh ? 'var(--color-accent)' : 'var(--color-surface-light)', color: autoRefresh ? '#fff' : 'var(--color-text-muted)' }}>
                        <MdFlashOn size={14} /> Auto
                    </button>
                </div>
            </div>

            {/* ========== CATEGORY TABS ========== */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => { setCategory(cat.key); setSelectedSymbol(DEFAULT_SYMBOLS[cat.key][0].symbol); setStockDetails(null); }}
                        style={{
                            padding: '0.4rem 0.9rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                            border: '1px solid var(--color-border)', cursor: 'pointer',
                            background: category === cat.key ? 'var(--color-accent)' : 'var(--color-surface)',
                            color: category === cat.key ? '#fff' : 'var(--color-text-muted)',
                            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
                        }}
                    >
                        <span>{cat.icon}</span> {cat.label}
                        <span style={{ fontSize: '0.65rem', background: category === cat.key ? 'rgba(255,255,255,0.25)' : 'var(--color-surface-light)', padding: '0.1rem 0.4rem', borderRadius: 4, marginLeft: 2 }}>{DEFAULT_SYMBOLS[cat.key].length}</span>
                    </button>
                ))}

                {/* selected badge */}
                <div style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.35rem 0.75rem' }}>
                    Selected: <span style={{ color: 'var(--color-text)' }}>{selectedSymbol}</span>
                </div>
            </div>

            {/* ========== MAIN BODY ========== */}
            <div style={{ display: 'flex', gap: '0.75rem', minHeight: 520 }}>

                {/* ---- LEFT PANEL: Asset List ---- */}
                <div style={{ width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Search */}
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <MdSearch size={16} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                className="input"
                                placeholder="Search assets"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '1.8rem', fontSize: '0.78rem', height: 34 }}
                            />
                        </div>
                    </div>

                    {/* Asset list */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {filteredAssets.map((a) => {
                            const isActive = selectedSymbol === a.symbol;
                            return (
                                <div
                                    key={a.symbol}
                                    onClick={() => selectAsset(a.symbol)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '0.5rem 0.6rem', borderRadius: 8, cursor: 'pointer',
                                        background: isActive ? 'var(--color-accent)' : 'transparent',
                                        color: isActive ? '#fff' : 'var(--color-text)',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--color-surface-light)'; }}
                                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{a.symbol}</div>
                                        <div style={{ fontSize: '0.68rem', opacity: 0.7 }}>{a.name}</div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFav(a.symbol); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: favourites.has(a.symbol) ? '#F39C12' : (isActive ? 'rgba(255,255,255,0.5)' : 'var(--color-text-muted)'), padding: 2 }}
                                    >
                                        {favourites.has(a.symbol) ? <MdStar size={16} /> : <MdStarBorder size={16} />}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ---- RIGHT PANEL: Detail ---- */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {loading && !d ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                            Fetching live market data…
                        </div>
                    ) : d ? (
                        <>
                            {/* ---- Asset Header ---- */}
                            <div className="card" style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Selected</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{d.symbol}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{timeframe} timeframe</div>
                                </div>

                                {/* Timeframe buttons */}
                                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                    {TIMEFRAMES.map((tf) => (
                                        <button
                                            key={tf}
                                            onClick={() => setTimeframe(tf)}
                                            style={{
                                                padding: '0.28rem 0.55rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600,
                                                border: '1px solid var(--color-border)', cursor: 'pointer',
                                                background: timeframe === tf ? 'var(--color-accent)' : 'var(--color-surface-light)',
                                                color: timeframe === tf ? '#fff' : 'var(--color-text-muted)',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>

                                {/* BUY button */}
                                <button
                                    onClick={() => alert(`Opening buy order for ${d.symbol}`)}
                                    style={{
                                        background: 'var(--color-accent)', color: '#fff', fontWeight: 700,
                                        padding: '0.45rem 1.2rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                                        fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4,
                                        boxShadow: '0 2px 10px rgba(46,204,113,0.3)', transition: 'transform 0.15s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                                >
                                    ✎ BUY
                                </button>
                            </div>

                            {/* ---- Price Chart ---- */}
                            <StockChart
                                data={historyData}
                                loading={historyLoading}
                                color={isPositive ? '#2ecc71' : '#e74c3c'}
                            />

                            {/* ---- Price Cards Row ---- */}
                            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                <PriceCard label="Current Price" value={`$${fmt(d.price)}`} sub={d.name || d.symbol} />
                                <PriceCard label="Past Price" value={`$${fmt(d.past || d.pc)}`} badge={`${isPositive ? '+' : ''}${changePct.toFixed(2)}%`} badgeColor={isPositive ? 'var(--color-accent)' : 'var(--color-danger)'} />
                                <PriceCard label="Projected Price (Next)" value={`$${fmt(d.projected || (d.price * 1.02).toFixed(2))}`} />
                            </div>

                            {/* ---- Metrics Row ---- */}
                            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                <MetricCard label="RSI (14)" value={d.rsi ?? '—'} color="var(--color-accent)" />
                                <MetricCard label="ATR %" value={`${(d.atr ?? 0).toFixed(2)}%`} color="var(--color-info)" />
                                <MetricCard label="Change %" value={`${isPositive ? '+' : ''}${changePct.toFixed(2)}%`} color={isPositive ? 'var(--color-accent)' : 'var(--color-danger)'} />
                                <MetricCard label="News" value={d.news ?? '—'} color="var(--color-warning)" />
                            </div>

                            {/* ---- Estimated Participants ---- */}
                            <div className="card" style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                    <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>📊 Estimated Participants</h3>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-accent)', background: 'rgba(46,204,113,0.15)', padding: '0.15rem 0.5rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} /> LIVE UPDATES
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.85rem' }}>
                                    Participant metrics are estimated from price action and recent candles.
                                </div>
                                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                    <ParticipantBar label="ESTIMATED BUYERS" pct={d.buyers ?? 44.1} color="var(--color-accent)" />
                                    <ParticipantBar label="ESTIMATED SELLERS" pct={d.sellers ?? 0} color="var(--color-danger)" />
                                    <ParticipantBar label="ESTIMATED HOLDERS" pct={d.holders ?? 55.9} color="var(--color-info)" />
                                </div>
                            </div>
                        </>
                    ) : loading ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                            Fetching live data for <strong style={{ color: 'var(--color-text)' }}>{selectedSymbol}</strong>…
                        </div>
                    ) : fetchError ? (
                        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                                Could not fetch data for <strong style={{ color: 'var(--color-text)' }}>{selectedSymbol}</strong>.
                                <br />The backend may still be starting up. Try again in a moment.
                            </div>
                            <button className="btn-primary" onClick={() => fetchDetails(selectedSymbol)} style={{ fontSize: '0.82rem' }}>
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                            Select an asset to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ===== Sub-components ===== */

function PriceCard({ label, value, sub, badge, badgeColor }) {
    return (
        <div className="card" style={{ flex: '1 1 180px', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800 }}>{value}</div>
            {sub && <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{sub}</div>}
            {badge && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: badgeColor, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: badgeColor }}>{badge}</span>
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value, color }) {
    return (
        <div style={{ flex: '1 1 120px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '0.7rem 0.9rem' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>{label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color, marginTop: 4 }}>{value}</div>
        </div>
    );
}

function ParticipantBar({ label, pct, color }) {
    return (
        <div style={{ flex: '1 1 200px', background: 'var(--color-surface-light)', borderRadius: 10, padding: '0.6rem 0.85rem', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
                    {label}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color }}>{pct.toFixed(1)}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--color-surface-lighter)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>
        </div>
    );
}

/* ---- shared button style ---- */
const btnSmall = {
    display: 'flex', alignItems: 'center', gap: 4, padding: '0.38rem 0.85rem',
    borderRadius: 8, border: '1px solid var(--color-border)', cursor: 'pointer',
    background: 'var(--color-surface-light)', color: 'var(--color-text-muted)',
    fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s',
};
