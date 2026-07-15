import React, { useState, useEffect, useCallback } from 'react';
import { MdShield, MdRefresh } from 'react-icons/md';
import api from '../services/api';

/* --------------------------------------------------
   Risk Analysis Dashboard — real portfolio risk metrics
   -------------------------------------------------- */

export default function RiskAnalysisPage() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);

    const analyze = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.getStocks();
            if (!res.data.success) return;
            const userStocks = res.data.stocks;
            const tickers = [...new Set(userStocks.map(s => s.stock_name))];

            // Fetch live prices
            const priceResults = await Promise.all(tickers.map(t => api.getStockPrice(t).catch(() => null)));
            const priceMap = {};
            priceResults.forEach(r => { if (r?.data?.success) priceMap[r.data.stock.symbol] = r.data.stock; });

            // Calculate portfolio metrics
            const holdings = userStocks.map(s => {
                const live = priceMap[s.stock_name];
                const currentPrice = live?.price || s.purchase_price;
                return { ...s, currentPrice, value: s.quantity * currentPrice, change: live?.change || 0 };
            });

            const totalValue = holdings.reduce((a, h) => a + h.value, 0);
            const uniqueCount = tickers.length;

            // Concentration Risk: % of portfolio in largest holding
            let concentrationRisk = 0;
            if (totalValue > 0 && holdings.length > 0) {
                // Sum values per ticker
                const tickerValues = {};
                holdings.forEach(h => { tickerValues[h.stock_name] = (tickerValues[h.stock_name] || 0) + h.value; });
                const maxHolding = Math.max(...Object.values(tickerValues));
                concentrationRisk = (maxHolding / totalValue) * 100;
            }

            // Diversification Score: 0-100 based on how many unique stocks
            const divScore = Math.min(100, uniqueCount * 15);

            // Volatility Risk from daily changes
            const avgAbsChange = holdings.length > 0
                ? holdings.reduce((a, h) => a + Math.abs(h.change), 0) / holdings.length
                : 0;
            const volLevel = avgAbsChange < 1.5 ? 'LOW' : avgAbsChange < 3 ? 'MEDIUM' : 'HIGH';

            // Overall risk score
            const riskScore = Math.round(
                concentrationRisk * 0.4 +
                (100 - divScore) * 0.3 +
                avgAbsChange * 10 * 0.3
            );
            const riskLevel = riskScore < 30 ? 'LOW RISK' : riskScore < 70 ? 'MEDIUM RISK' : 'HIGH RISK';

            setMetrics({ riskScore: Math.min(100, Math.max(0, riskScore)), riskLevel, concentrationRisk, divScore, volLevel, uniqueCount, avgAbsChange });
        } catch (err) {
            console.error('Risk analysis error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { analyze(); }, [analyze]);

    const m = metrics;
    const riskColor = !m ? 'var(--color-text-muted)' : m.riskScore < 30 ? 'var(--color-accent)' : m.riskScore < 70 ? 'var(--color-warning)' : 'var(--color-danger)';
    const riskBadgeColor = !m ? {} : m.riskScore < 30 ? { bg: 'rgba(46,204,113,0.15)', fg: 'var(--color-accent)' } : m.riskScore < 70 ? { bg: 'rgba(243,156,18,0.15)', fg: 'var(--color-warning)' } : { bg: 'rgba(231,76,60,0.15)', fg: 'var(--color-danger)' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* ── Header Card ── */}
            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MdShield size={20} style={{ color: 'var(--color-info)' }} /> Risk Analysis Dashboard
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {m && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: riskBadgeColor.fg, background: riskBadgeColor.bg, padding: '0.3rem 0.8rem', borderRadius: 6 }}>
                                {m.riskLevel}
                            </span>
                        )}
                        <button className="btn-outline" onClick={analyze} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}>
                            <MdRefresh size={14} /> Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)' }}>Analyzing portfolio risk…</div>
                ) : m ? (
                    <>
                        {/* Risk Score Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Risk Score</span>
                            <span style={{ fontWeight: 800, color: riskColor }}>{m.riskScore}/100</span>
                        </div>
                        <div style={{ height: 10, borderRadius: 5, background: 'var(--color-surface-lighter)', overflow: 'hidden', marginBottom: 6, position: 'relative' }}>
                            {/* Gradient bar */}
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: 5,
                                background: 'linear-gradient(90deg, #2ECC71 0%, #2ECC71 30%, #F39C12 30%, #F39C12 70%, #E74C3C 70%, #E74C3C 100%)',
                                opacity: 0.15,
                            }} />
                            {/* Filled part using clipPath */}
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: 5, transition: 'clip-path 0.5s ease',
                                background: 'linear-gradient(90deg, #2ECC71 0%, #2ECC71 30%, #F39C12 30%, #F39C12 70%, #E74C3C 70%, #E74C3C 100%)',
                                clipPath: `polygon(0 0, ${m.riskScore}% 0, ${m.riskScore}% 100%, 0 100%)`
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                            <span>Low Risk (0-30)</span><span>Medium Risk (31-70)</span><span>High Risk (71-100)</span>
                        </div>

                        {/* Metric Cards */}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <RiskMetricCard
                                label="Concentration Risk"
                                value={`${m.concentrationRisk.toFixed(1)}%`}
                                icon="🎯"
                                sub={m.concentrationRisk > 50 ? 'Highly concentrated' : 'Well diversified'}
                                pct={m.concentrationRisk}
                                color="var(--color-danger)"
                            />
                            <RiskMetricCard
                                label="Diversification Score"
                                value={`${m.divScore}%`}
                                icon="🌐"
                                sub={`${m.uniqueCount} different stocks`}
                                pct={m.divScore}
                                color="var(--color-info)"
                            />
                            <RiskMetricCard
                                label="Volatility Risk"
                                value={m.volLevel}
                                icon="📊"
                                sub={m.volLevel === 'LOW' ? '🟢 Stable performance' : m.volLevel === 'MEDIUM' ? '🟡 Moderate swings' : '🔴 High volatility'}
                                pct={m.avgAbsChange * 20}
                                color={m.volLevel === 'LOW' ? 'var(--color-accent)' : m.volLevel === 'MEDIUM' ? 'var(--color-warning)' : 'var(--color-danger)'}
                            />
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)' }}>Add stocks to your portfolio to see risk analysis.</div>
                )}
            </div>
        </div>
    );
}

function RiskMetricCard({ label, value, icon, sub, pct, color }) {
    return (
        <div className="card" style={{ flex: '1 1 200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</span>
                <span>{icon}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>{value}</div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--color-surface-lighter)', overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{sub}</div>
        </div>
    );
}
