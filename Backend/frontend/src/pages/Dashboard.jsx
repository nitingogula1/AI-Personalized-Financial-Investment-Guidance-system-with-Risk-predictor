import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdAccountBalanceWallet, MdVisibility, MdShowChart } from 'react-icons/md';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';

/* --------------------------------------------------
   Dashboard / Overview – matches reference image layout:
   - Top summary cards (Total Value, Cash, Holdings, Watchlist)
   - Stock Holdings table
   - Activity Summary cards
   - Portfolio distribution chart
   -------------------------------------------------- */

const PIE_DATA = [
    { name: 'AAPL', value: 60, color: '#2ECC71' },
    { name: 'GOOGL', value: 20, color: '#3498DB' },
    { name: 'TSLA', value: 12, color: '#F39C12' },
    { name: 'AMZN', value: 8, color: '#9B59B6' },
];

const AREA_DATA = [
    { day: 'Mon', value: 24800 }, { day: 'Tue', value: 25100 }, { day: 'Wed', value: 24900 },
    { day: 'Thu', value: 25400 }, { day: 'Fri', value: 25700 }, { day: 'Sat', value: 25940 },
];

function SummaryCard({ title, value, sub, icon: Icon, iconBg }) {
    return (
        <div className="card card-hover" style={{ flex: '1 1 200px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>{title}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.25rem' }}>{value}</div>
                {sub && <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: 4 }}>{sub}</div>}
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg || 'var(--color-surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color: 'var(--color-accent)' }} />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [holdings, setHoldings] = React.useState([]);
    const [marketData, setMarketData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [summary, setSummary] = React.useState({
        totalValue: 10000,
        cash: 10000,
        holdingsCount: 0,
        watchlist: 0,
        totalPnL: 0,
        totalPnLPct: 0
    });

    const [activeAlert, setActiveAlert] = React.useState(null);
    const [dismissedAlerts, setDismissedAlerts] = React.useState(new Set());
    const [processingSell, setProcessingSell] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState(null);

    const fmt = (n) => (n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch user stocks and market overview in parallel
                const [stocksRes, marketRes] = await Promise.all([
                    api.getStocks(),
                    api.getMarketData()
                ]);

                if (marketRes.data.success) {
                    setMarketData(marketRes.data.stocks);
                }

                if (stocksRes.data.success) {
                    const userStocks = stocksRes.data.stocks;
                    const tickers = [...new Set(userStocks.map(s => s.stock_name))];

                    // Fetch live prices for user stocks
                    const pricePromises = tickers.map(t => api.getStockPrice(t).catch(() => null));
                    const priceResults = await Promise.all(pricePromises);

                    const priceMap = {};
                    priceResults.forEach(res => {
                        if (res && res.data && res.data.success) {
                            priceMap[res.data.stock.symbol] = res.data.stock.price;
                        }
                    });

                    let totalInvested = 0;
                    let currentValue = 0;

                    const processedHoldings = userStocks.map(s => {
                        const currentPrice = priceMap[s.stock_name] || s.purchase_price;
                        const invested = s.quantity * s.purchase_price;
                        const value = s.quantity * currentPrice;
                        const pnl = value - invested;

                        totalInvested += invested;
                        currentValue += value;

                        return {
                            ...s,
                            currentPrice,
                            invested,
                            value,
                            pnl,
                            pnlPct: invested > 0 ? (pnl / invested) * 100 : 0,
                            abbr: s.stock_name.slice(0, 2).toUpperCase()
                        };
                    });

                    setHoldings(processedHoldings);
                    setSummary(prev => ({
                        ...prev,
                        totalValue: currentValue + prev.cash,
                        holdingsCount: tickers.length,
                        totalPnL: currentValue - totalInvested,
                        totalPnLPct: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0
                    }));
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Trigger profit alert for >= 10%
    React.useEffect(() => {
        if (!activeAlert && holdings.length > 0) {
            const profitStock = holdings.find(s => s.pnlPct >= 10 && !dismissedAlerts.has(s.stock_name));
            if (profitStock) {
                setActiveAlert(profitStock);
            }
        }
    }, [holdings, dismissedAlerts, activeAlert]);

    // Auto dismiss toast
    React.useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const handleSell = async () => {
        if (!activeAlert) return;
        setProcessingSell(true);
        try {
            await api.sellStock({
                stock_name: activeAlert.stock_name,
                quantity: activeAlert.quantity
            });
            setToastMessage({ type: 'success', text: `Successfully sold ${activeAlert.quantity} shares of ${activeAlert.stock_name}!` });

            // Remove from local holdings so it disappears from the table
            setHoldings(prev => prev.filter(s => s.id !== activeAlert.id));
            setDismissedAlerts(prev => new Set(prev).add(activeAlert.stock_name));

            // Update summary loosely (simplification)
            setSummary(prev => ({
                ...prev,
                cash: prev.cash + activeAlert.value,
                holdingsCount: prev.holdingsCount - 1
            }));
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to sell stock. Please try again.';
            setToastMessage({ type: 'error', text: msg });
        } finally {
            setProcessingSell(false);
            setActiveAlert(null);
        }
    };

    const handleDismissAlert = () => {
        if (!activeAlert) return;
        setDismissedAlerts(prev => new Set(prev).add(activeAlert.stock_name));
        setActiveAlert(null);
    };

    const s = summary;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>

            {/* ======= Toast Notification ======= */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    top: '1rem', right: '1rem', zIndex: 9999,
                    padding: '1rem', borderRadius: 8,
                    background: toastMessage.type === 'success' ? '#fff' : '#fff',
                    color: toastMessage.type === 'success' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${toastMessage.type === 'success' ? '#22c55e' : '#ef4444'}`,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    {toastMessage.text}
                    <button onClick={() => setToastMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '1rem' }}>×</button>
                </div>
            )}

            {/* ======= Alert Modal ======= */}
            {activeAlert && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', zIndex: 9998,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px', background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 12 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-accent)' }}>
                            <MdTrendingUp size={24} /> Profit Alert!
                        </h2>
                        <p style={{ marginBottom: '1.5rem', lineHeight: 1.5, color: 'var(--color-text)' }}>
                            Your holding of <strong>{activeAlert.stock_name}</strong> has risen by <strong>{activeAlert.pnlPct.toFixed(2)}%</strong>.
                            <br /><br />
                            Would you like to sell your <strong>{activeAlert.quantity}</strong> shares to secure profits?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-primary" onClick={handleDismissAlert} style={{ flex: 1, background: 'var(--color-surface-light)', color: 'var(--color-text)' }}>No, Keep</button>
                            <button className="btn-primary" onClick={handleSell} disabled={processingSell} style={{ flex: 1, background: 'var(--color-accent)' }}>
                                {processingSell ? 'Selling...' : 'Yes, Sell'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======= Summary Cards ======= */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <SummaryCard
                    title="Total Value"
                    value={fmt(s.totalValue)}
                    sub={<>{s.totalPnL >= 0 ? <MdTrendingUp size={14} /> : <MdTrendingDown size={14} />} {s.totalPnL >= 0 ? '+' : ''}{fmt(s.totalPnL)} ({s.totalPnLPct.toFixed(2)}%)</>}
                    icon={MdAccountBalanceWallet}
                    iconBg="rgba(46,204,113,0.12)"
                />
                <SummaryCard title="Cash" value={fmt(s.cash)} sub="Available balance" icon={MdAccountBalanceWallet} iconBg="rgba(52,152,219,0.12)" />
                <SummaryCard title="Holdings" value={s.holdingsCount} sub="Unique assets" icon={MdShowChart} iconBg="rgba(155,89,182,0.12)" />
                <SummaryCard title="Watchlist" value={s.watchlist} sub="Tracking" icon={MdVisibility} iconBg="rgba(243,156,18,0.12)" />
            </div>

            {/* ======= Market Overview Row ======= */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: '1 1 100%', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MdShowChart style={{ color: 'var(--color-accent)' }} /> Live Market Overview
                        </h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-light)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>Updates every 5m</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {marketData.length > 0 ? marketData.map((m, i) => (
                            <div key={i} className="card-hover" style={{ minWidth: '160px', padding: '0.75rem', borderRadius: 10, background: 'var(--color-surface-light)', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.symbol}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: m.change >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
                                        {m.change >= 0 ? '+' : ''}{m.change}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>${m.price.toFixed(2)}</div>
                            </div>
                        )) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Loading market trends...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* ======= Stock Holdings Table ======= */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                        <MdShowChart size={18} style={{ color: 'var(--color-accent)' }} /> My Stock Holdings
                    </div>
                    <span className={`badge ${s.totalPnL >= 0 ? 'badge-green' : 'badge-red'}`}>
                        Total P&L: {s.totalPnL >= 0 ? '+' : ''}{fmt(s.totalPnL)}
                    </span>
                </div>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Stock</th><th>Qty</th><th>Buy Price</th><th>Current</th><th>Invested</th><th>Value</th><th>P&L</th><th>% Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading holdings...</td></tr>
                            ) : holdings.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No holdings found. Start trading to see your stocks here!</td></tr>
                            ) : holdings.map((st, i) => (
                                <tr key={i}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-surface-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-accent)' }}>{st.abbr}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{st.stock_name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{st.purchase_date}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{st.quantity}</td>
                                    <td>{st.purchase_price ? fmt(st.purchase_price) : 'N/A'}</td>
                                    <td style={{ fontWeight: 600 }}>{fmt(st.currentPrice)}</td>
                                    <td>{fmt(st.invested)}</td>
                                    <td style={{ fontWeight: 600 }}>{fmt(st.value)}</td>
                                    <td style={{ color: st.pnl >= 0 ? 'var(--color-accent)' : 'var(--color-danger)', fontWeight: 600 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {st.pnl >= 0 ? <MdTrendingUp size={14} /> : <MdTrendingDown size={14} />}
                                            {st.pnl >= 0 ? '+' : ''}{fmt(st.pnl)}
                                        </span>
                                    </td>
                                    <td style={{ color: st.pnl >= 0 ? 'var(--color-accent)' : 'var(--color-danger)', fontWeight: 600 }}>
                                        {st.pnl >= 0 ? '+' : ''}{st.pnlPct.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ======= Charts Row ======= */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: '2 1 400px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Portfolio Value Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={AREA_DATA}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2ECC71" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#2ECC71" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                            <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }} />
                            <Area type="monotone" dataKey="value" stroke="#2ECC71" strokeWidth={2} fill="url(#areaGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ flex: '1 1 250px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Portfolio Distribution</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                        {PIE_DATA.map((d, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                                {d.name} ({d.value}%)
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

