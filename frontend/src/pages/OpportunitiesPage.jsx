import React from 'react';
import {
    MdTrendingUp,
    MdAutoGraph,
    MdDiamond,
    MdShield,
    MdRefresh,
    MdCheckCircle,
    MdFilterList,
    MdSearch,
} from 'react-icons/md';
import api from '../services/api';

/* ─────────────────────────────────────────────────────
   OpportunitiesPage — AI-detected investment opportunities
   with signal badges, profit ranges, and reasoning cards
   ───────────────────────────────────────────────────── */

const SIGNAL_CONFIG = {
    growth_momentum: {
        label: 'Growth Momentum',
        icon: MdTrendingUp,
        color: '#2ECC71',
        bg: 'rgba(46,204,113,0.12)',
        gradient: 'linear-gradient(135deg, #2ECC71, #27AE60)',
    },
    undervalued_dip: {
        label: 'Undervalued Dip',
        icon: MdDiamond,
        color: '#3498DB',
        bg: 'rgba(52,152,219,0.12)',
        gradient: 'linear-gradient(135deg, #3498DB, #2980B9)',
    },
    low_volatility_steady: {
        label: 'Low-Vol Steady',
        icon: MdShield,
        color: '#9B59B6',
        bg: 'rgba(155,89,182,0.12)',
        gradient: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
    },
};

const RISK_COLORS = {
    Low: '#2ECC71',
    Medium: '#F39C12',
    High: '#E74C3C',
};

/* ── Score Gauge ────────────────────────── */
function ScoreGauge({ score, color }) {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <svg width="68" height="68" viewBox="0 0 68 68" style={{ display: 'block' }}>
            <circle cx="34" cy="34" r={radius} fill="none" stroke="var(--color-surface-light)" strokeWidth="5" />
            <circle
                cx="34" cy="34" r={radius} fill="none"
                stroke={color} strokeWidth="5" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x="34" y="38" textAnchor="middle" fill={color} fontSize="14" fontWeight="800">{Math.round(score)}</text>
        </svg>
    );
}

/* ── Opportunity Card ───────────────────── */
function OpportunityCard({ opp, onMarkRead, isTopPick }) {
    const config = SIGNAL_CONFIG[opp.signal_type] || SIGNAL_CONFIG.growth_momentum;
    const SignalIcon = config.icon;
    const riskColor = RISK_COLORS[opp.risk_level] || '#F39C12';
    const isIndian = opp.stock_symbol.includes('.NS');
    const currSymbol = isIndian ? '₹' : '$';

    const createdDate = opp.created_at
        ? new Date(opp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <div
            className="card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                borderColor: opp.is_read ? 'var(--color-border)' : config.color,
                transition: 'all 0.3s ease',
                opacity: opp.is_read ? 0.75 : 1,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 30px ${config.bg}`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Accent gradient bar at top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: isTopPick ? 4 : 3, background: isTopPick ? 'linear-gradient(90deg, #F39C12, #FFD700)' : config.gradient }} />

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 10,
                        background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <SignalIcon size={22} style={{ color: config.color }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {opp.stock_symbol}
                            {isTopPick && (
                                <span style={{
                                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: 12,
                                    background: 'rgba(243,156,18,0.15)', color: '#F39C12',
                                    border: '1px solid rgba(243,156,18,0.4)', textTransform: 'uppercase', letterSpacing: 0.5,
                                    display: 'flex', alignItems: 'center', gap: 3
                                }}>🌟 Top Pick</span>
                            )}
                        </div>
                        <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 12,
                            background: config.bg, color: config.color, fontSize: '0.7rem', fontWeight: 600,
                        }}>
                            {config.label}
                        </span>
                    </div>
                </div>
                <ScoreGauge score={opp.score} color={config.color} />
            </div>

            {/* Price & Risk row */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 100 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Price</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2 }}>{currSymbol}{opp.current_price.toFixed(2)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 100 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Risk</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: riskColor, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: riskColor, display: 'inline-block' }} />
                        {opp.risk_level}
                    </div>
                </div>
            </div>

            {/* Profit Range */}
            <div style={{
                background: 'rgba(46,204,113,0.08)', borderRadius: 10, padding: '0.75rem',
                textAlign: 'center', marginBottom: '0.75rem',
            }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Expected Profit Range
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2ECC71', marginTop: 4 }}>
                    +{opp.expected_profit_min.toFixed(1)}% — +{opp.expected_profit_max.toFixed(1)}%
                </div>
            </div>

            {/* Reasoning */}
            <div style={{
                background: 'var(--color-surface-light)', borderLeft: `3px solid ${config.color}`,
                borderRadius: '0 8px 8px 0', padding: '0.75rem', marginBottom: '0.75rem',
            }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: config.color, marginBottom: 4 }}>Why this pick?</div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.55, color: 'var(--color-text-muted)', margin: 0 }}>
                    {opp.reasoning}
                </p>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{createdDate}</span>
                {!opp.is_read ? (
                    <button
                        onClick={() => onMarkRead(opp.id)}
                        style={{
                            background: config.bg, color: config.color,
                            border: 'none', padding: '0.35rem 0.75rem', borderRadius: 8,
                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = config.color + '33'}
                        onMouseLeave={e => e.currentTarget.style.background = config.bg}
                    >
                        <MdCheckCircle size={14} /> Mark Read
                    </button>
                ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MdCheckCircle size={13} /> Read
                    </span>
                )}
            </div>
        </div>
    );
}

/* ── Main Page ──────────────────────────── */
export default function OpportunitiesPage() {
    const [opportunities, setOpportunities] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [scanning, setScanning] = React.useState(false);
    const [filter, setFilter] = React.useState('all');
    const [riskFilter, setRiskFilter] = React.useState('all');
    const [search, setSearch] = React.useState('');

    const fetchOpportunities = async () => {
        try {
            const res = await api.getOpportunities();
            if (res.data.success) {
                setOpportunities(res.data.opportunities);
            }
        } catch (err) {
            console.error('Error fetching opportunities:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchOpportunities();
    }, []);

    const handleScan = async () => {
        setScanning(true);
        try {
            const res = await api.scanOpportunities();
            if (res.data.success) {
                await fetchOpportunities();
            }
        } catch (err) {
            console.error('Scan error:', err);
        } finally {
            setScanning(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.markOpportunityRead(id);
            setOpportunities(prev => prev.map(o => o.id === id ? { ...o, is_read: true } : o));
        } catch (err) {
            console.error('Mark read error:', err);
        }
    };

    // Filters
    const filtered = opportunities.filter(o => {
        if (filter !== 'all' && o.signal_type !== filter) return false;
        if (riskFilter !== 'all' && o.risk_level !== riskFilter) return false;
        if (search && !o.stock_symbol.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const unread = opportunities.filter(o => !o.is_read).length;
    const avgProfit = filtered.length > 0
        ? (filtered.reduce((s, o) => s + (o.expected_profit_min + o.expected_profit_max) / 2, 0) / filtered.length).toFixed(1)
        : '0.0';
    const topPick = filtered.length > 0 ? filtered.reduce((best, o) => o.score > best.score ? o : best, filtered[0]) : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* ─── Page Header ─── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MdAutoGraph size={28} style={{ color: 'var(--color-accent)' }} />
                        AI Opportunities
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                        Smart picks detected by our AI scanner — personalized for your portfolio
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleScan}
                    disabled={scanning}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 140 }}
                >
                    <MdRefresh size={18} style={{ animation: scanning ? 'spin 1s linear infinite' : 'none' }} />
                    {scanning ? 'Scanning...' : 'Scan Now'}
                </button>
            </div>

            {/* ─── Stats Cards ─── */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[
                    { label: 'Total Opportunities', value: opportunities.length, color: 'var(--color-accent)', bg: 'rgba(46,204,113,0.1)' },
                    { label: 'Unread Alerts', value: unread, color: '#3498DB', bg: 'rgba(52,152,219,0.1)' },
                    { label: 'Avg Expected Profit', value: `+${avgProfit}%`, color: '#2ECC71', bg: 'rgba(46,204,113,0.1)' },
                    { label: 'Top Pick', value: topPick ? topPick.stock_symbol : '—', color: '#F39C12', bg: 'rgba(243,156,18,0.1)' },
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ flex: '1 1 180px', textAlign: 'center', borderColor: 'transparent' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{stat.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, marginTop: 6 }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* ─── Filters Bar ─── */}
            <div className="card" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.75rem 1rem' }}>
                <MdFilterList size={18} style={{ color: 'var(--color-text-muted)' }} />

                {/* Signal Filter */}
                {[
                    { key: 'all', label: 'All Signals' },
                    { key: 'growth_momentum', label: '📈 Momentum' },
                    { key: 'undervalued_dip', label: '💎 Dip' },
                    { key: 'low_volatility_steady', label: '🛡️ Steady' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        style={{
                            padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            background: filter === f.key ? 'var(--color-accent)' : 'var(--color-surface-light)',
                            color: filter === f.key ? '#fff' : 'var(--color-text-muted)',
                        }}
                    >
                        {f.label}
                    </button>
                ))}

                <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 4px' }} />

                {/* Risk Filter */}
                {['all', 'Low', 'Medium', 'High'].map(r => (
                    <button
                        key={r}
                        onClick={() => setRiskFilter(r)}
                        style={{
                            padding: '0.3rem 0.65rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            background: riskFilter === r ? (RISK_COLORS[r] || 'var(--color-info)') : 'var(--color-surface-light)',
                            color: riskFilter === r ? '#fff' : 'var(--color-text-muted)',
                        }}
                    >
                        {r === 'all' ? 'All Risk' : r}
                    </button>
                ))}

                {/* Search */}
                <div style={{ marginLeft: 'auto', position: 'relative', minWidth: 180 }}>
                    <MdSearch size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        className="input"
                        placeholder="Search stock..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 32, padding: '0.35rem 0.75rem 0.35rem 2rem' }}
                    />
                </div>
            </div>

            {/* ─── Opportunity Cards Grid ─── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    <MdAutoGraph size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p>Loading opportunities...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <MdAutoGraph size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.3, marginBottom: 12 }} />
                    <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No Opportunities Found</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {opportunities.length === 0
                            ? 'Click "Scan Now" to let our AI analyze the market for you.'
                            : 'Try adjusting your filters to see more results.'}
                    </p>
                    {opportunities.length === 0 && (
                        <button className="btn-primary" onClick={handleScan} disabled={scanning}>
                            {scanning ? 'Scanning...' : '🔍 Run AI Scan'}
                        </button>
                    )}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '1rem',
                }}>
                    {filtered.map(opp => (
                        <OpportunityCard key={opp.id} opp={opp} onMarkRead={handleMarkRead} isTopPick={topPick && topPick.id === opp.id} />
                    ))}
                </div>
            )}

            {/* Spin animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
