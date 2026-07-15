import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';

/* --------------------------------------------------
   StockChart — Interactive area chart for price history
   Props:
     data     — [{ date: 'YYYY-MM-DD', price: 123.45 }, …]
     loading  — boolean
     color    — line/gradient colour (default: accent green)
   -------------------------------------------------- */

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '0.55rem 0.85rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            fontSize: '0.78rem',
        }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                ${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        </div>
    );
};

export default function StockChart({ data = [], loading = false, color = '#2ecc71' }) {
    if (loading) {
        return (
            <div className="card" style={{
                height: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📈</div>
                    Loading chart data…
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="card" style={{
                height: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
            }}>
                No historical data available
            </div>
        );
    }

    /* Price range for Y-axis domain */
    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1 || max * 0.02;

    return (
        <div className="card" style={{ padding: '0.85rem 0.5rem 0.5rem 0' }}>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        strokeOpacity={0.5}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                        tickFormatter={(val) => {
                            /* Show short date labels */
                            if (!val) return '';
                            const parts = val.split('-');
                            if (parts.length >= 3) return `${parts[1]}/${parts[2]}`;
                            return val;
                        }}
                        interval="preserveStartEnd"
                        minTickGap={50}
                    />
                    <YAxis
                        domain={[Math.floor(min - padding), Math.ceil(max + padding)]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                        tickFormatter={(val) => `$${val.toLocaleString()}`}
                        width={70}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={color}
                        strokeWidth={2}
                        fill="url(#priceGradient)"
                        dot={false}
                        activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={600}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
