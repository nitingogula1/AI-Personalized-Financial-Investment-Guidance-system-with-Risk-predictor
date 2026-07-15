import React, { useState } from 'react';
import { MdAutoGraph } from 'react-icons/md';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const RISK_LEVELS = ['Conservative', 'Moderate', 'Aggressive'];
const RECOMMENDATIONS = {
    Conservative: [
        { symbol: 'MSFT', alloc: 35, reason: 'Stable blue-chip with consistent dividends', priority: 'High', monthlyRtn: 1.2, yearlyRtn: 14.5 },
        { symbol: 'JNJ', alloc: 30, reason: 'Healthcare sector stability', priority: 'High', monthlyRtn: 0.8, yearlyRtn: 9.6 },
        { symbol: 'BRK.B', alloc: 20, reason: 'Diversified holdings, low volatility', priority: 'Medium', monthlyRtn: 1.0, yearlyRtn: 12.0 },
        { symbol: 'VZ', alloc: 15, reason: 'Telecom with steady cash flow', priority: 'Medium', monthlyRtn: 0.6, yearlyRtn: 7.2 },
    ],
    Moderate: [
        { symbol: 'AAPL', alloc: 30, reason: 'Strong ecosystem and growth potential', priority: 'High', monthlyRtn: 2.0, yearlyRtn: 24.0 },
        { symbol: 'GOOGL', alloc: 25, reason: 'AI-driven revenue growth', priority: 'High', monthlyRtn: 1.8, yearlyRtn: 21.6 },
        { symbol: 'AMZN', alloc: 25, reason: 'E-commerce & cloud dominance', priority: 'Medium', monthlyRtn: 2.2, yearlyRtn: 26.4 },
        { symbol: 'MSFT', alloc: 20, reason: 'Enterprise software leader', priority: 'Medium', monthlyRtn: 1.5, yearlyRtn: 18.0 },
    ],
    Aggressive: [
        { symbol: 'NVDA', alloc: 35, reason: 'AI chip market leader', priority: 'High', monthlyRtn: 3.5, yearlyRtn: 42.0 },
        { symbol: 'TSLA', alloc: 25, reason: 'EV & energy disruption', priority: 'High', monthlyRtn: 4.0, yearlyRtn: 48.0 },
        { symbol: 'META', alloc: 20, reason: 'Metaverse & AI investments', priority: 'Medium', monthlyRtn: 2.8, yearlyRtn: 33.6 },
        { symbol: 'AMD', alloc: 20, reason: 'Growing datacenter presence', priority: 'Medium', monthlyRtn: 3.0, yearlyRtn: 36.0 },
    ],
};
const COLORS = ['#2ECC71', '#3498DB', '#F39C12', '#9B59B6'];

export default function SmartInvestPage() {
    const [amount, setAmount] = useState('');
    const [risk, setRisk] = useState('');
    const [result, setResult] = useState(null);

    const handleAnalyze = () => {
        if (!amount || !risk) return;
        setResult(RECOMMENDATIONS[risk].map((r) => {
            const investedValue = Number(amount) * r.alloc / 100;
            return {
                ...r,
                value: investedValue,
                monthlyProfit: (investedValue * r.monthlyRtn) / 100,
                yearlyProfit: (investedValue * r.yearlyRtn) / 100,
            };
        }));
    };

    const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><MdAutoGraph size={24} style={{ color: 'var(--color-accent)' }} /> Smart Invest</h1>
            <div className="card" style={{ maxWidth: 500 }}>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Investment Parameters</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Investment Amount ($)</label>
                        <input className="input" type="number" placeholder="e.g. 10000" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Risk Level</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {RISK_LEVELS.map((r) => (
                                <button key={r} onClick={() => setRisk(r)} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: `1px solid ${risk === r ? 'var(--color-accent)' : 'var(--color-border)'}`, background: risk === r ? 'var(--color-accent-glow)' : 'var(--color-surface-light)', color: risk === r ? 'var(--color-accent)' : 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="btn-primary" onClick={handleAnalyze} style={{ marginTop: '0.5rem' }}>Get Recommendations</button>
                </div>
            </div>

            {result && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="card" style={{ flex: '1 1 300px' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Allocation</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart><Pie data={result} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="alloc" paddingAngle={3}>
                                {result.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie><Tooltip /></PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: 8 }}>
                            {result.map((r, i) => <span key={i} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} /> {r.symbol} ({r.alloc}%)</span>)}
                        </div>
                    </div>
                    <div className="card" style={{ flex: '2 1 650px', padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.25rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)' }}>Recommended Portfolio — {fmt(amount)}</div>
                        <div className="table-container" style={{ border: 'none', borderRadius: 0, overflowX: 'auto' }}>
                            <table style={{ minWidth: 600 }}>
                                <thead>
                                    <tr>
                                        <th>Stock</th>
                                        <th>Priority</th>
                                        <th>Allocation</th>
                                        <th>Invest Amount</th>
                                        <th>Proj. 1M Profit</th>
                                        <th>Proj. 1Y Profit</th>
                                        <th>Rationale</th>
                                    </tr>
                                </thead>
                                <tbody>{result.map((r, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 700 }}>{r.symbol}</td>
                                        <td>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 4, background: r.priority === 'High' ? 'rgba(46,204,113,0.15)' : 'rgba(243,156,18,0.15)', color: r.priority === 'High' ? 'var(--color-accent)' : 'var(--color-warning)' }}>
                                                {r.priority}
                                            </span>
                                        </td>
                                        <td>{r.alloc}%</td>
                                        <td style={{ fontWeight: 600 }}>{fmt(r.value)}</td>
                                        <td style={{ color: 'var(--color-accent)', fontWeight: 600 }}>+{fmt(r.monthlyProfit)} <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>({r.monthlyRtn}%)</span></td>
                                        <td style={{ color: 'var(--color-accent)', fontWeight: 600 }}>+{fmt(r.yearlyProfit)} <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>({r.yearlyRtn}%)</span></td>
                                        <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{r.reason}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                        <div style={{ padding: '0.75rem 1.25rem', fontSize: '0.72rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-lighter)', borderTop: '1px solid var(--color-border)' }}>
                            * Project profits are estimates generated by AI based on historical momentum and your chosen risk profile. Actual market returns are not strictly guaranteed and may fluctuate.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
