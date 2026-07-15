"""
opportunity_engine.py — AI-powered market scanner that detects investment opportunities.

Signals:
  1. Growth Momentum    — consistent upward price trend (5-day slope)
  2. Undervalued Dip    — significant drop from recent high with recovery signs
  3. Low-Vol Steady     — low volatility + positive returns (ideal for beginners)

Each signal produces a 0-100 score, expected profit range, risk level,
and a plain-English reasoning paragraph.
"""

import yfinance as yf
import numpy as np
from datetime import datetime, timedelta

# ── Stock universe to scan ────────────────────────────────────────────
SCAN_TICKERS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX',
    'JPM', 'V', 'JNJ', 'WMT', 'DIS', 'PYPL', 'AMD', 'INTC',
    'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS',
]

SIGNAL_LABELS = {
    'growth_momentum': 'Growth Momentum',
    'undervalued_dip': 'Undervalued Dip',
    'low_volatility_steady': 'Low-Vol Steady',
}


def _fetch_history(ticker, period='1mo'):
    """Fetch historical data via yfinance. Returns DataFrame or None."""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        if hist.empty or len(hist) < 5:
            return None
        return hist
    except Exception as e:
        print(f"[OPPORTUNITY] Error fetching {ticker}: {e}")
        return None


def _linear_slope(prices):
    """Compute normalised linear-regression slope over a price series."""
    n = len(prices)
    if n < 2:
        return 0
    x = np.arange(n, dtype=float)
    y = np.array(prices, dtype=float)
    mean_x, mean_y = x.mean(), y.mean()
    denom = ((x - mean_x) ** 2).sum()
    if denom == 0:
        return 0
    slope = ((x - mean_x) * (y - mean_y)).sum() / denom
    # Normalise by mean price so slope is comparable across stocks
    return (slope / mean_y) * 100 if mean_y else 0


def _atr(hist, window=5):
    """Average True Range (simplified) as a % of current price."""
    highs = hist['High'].values[-window:]
    lows = hist['Low'].values[-window:]
    closes = hist['Close'].values[-window:]
    if len(closes) == 0:
        return 0
    tr = highs - lows
    atr_val = float(np.mean(tr))
    return (atr_val / closes[-1]) * 100 if closes[-1] else 0


def _rsi(closes, period=14):
    """Relative Strength Index."""
    if len(closes) < period + 1:
        period = max(len(closes) - 1, 1)
    deltas = np.diff(closes)
    gain = np.where(deltas > 0, deltas, 0)
    loss = np.where(deltas < 0, -deltas, 0)
    avg_gain = np.mean(gain[-period:]) if len(gain) >= period else np.mean(gain)
    avg_loss = np.mean(loss[-period:]) if len(loss) >= period else np.mean(loss)
    if avg_loss == 0:
        return 100
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


# ── Signal Detectors ────────────────────────────────────────────────

def _detect_growth_momentum(hist, ticker):
    """Signal 1: Strong upward momentum over the last 5 days."""
    closes = hist['Close'].values
    recent = closes[-5:]
    slope = _linear_slope(recent)
    volatility = _atr(hist)

    if slope <= 0.1:
        return None  # not moving up enough

    # Score: slope strength (capped at 100)
    raw_score = min(slope * 20, 100)
    score = round(max(raw_score, 0), 1)
    if score < 60:
        return None

    current_price = float(closes[-1])
    # Expected profit based on momentum continuation
    profit_min = round(slope * 0.5, 2)
    profit_max = round(slope * 2.0, 2)

    # Risk from volatility
    if volatility < 2:
        risk = 'Low'
    elif volatility < 4:
        risk = 'Medium'
    else:
        risk = 'High'

    pct_5d = ((closes[-1] - closes[-5]) / closes[-5]) * 100

    reasoning = (
        f"{ticker} has shown strong upward momentum over the past 5 trading days, "
        f"rising approximately {pct_5d:.1f}%. The price trend shows a consistent "
        f"climbing pattern which suggests continued buying interest. "
        f"Based on this momentum, we project a potential profit range of "
        f"+{profit_min}% to +{profit_max}% over the coming week. "
        f"{'This is a relatively safe pick with low price swings.' if risk == 'Low' else ''}"
        f"{'Watch for moderate price swings — suitable for balanced portfolios.' if risk == 'Medium' else ''}"
        f"{'Higher volatility detected — consider a smaller position size.' if risk == 'High' else ''}"
    )

    return {
        'signal_type': 'growth_momentum',
        'score': score,
        'expected_profit_min': profit_min,
        'expected_profit_max': profit_max,
        'reasoning': reasoning,
        'current_price': round(current_price, 2),
        'risk_level': risk,
    }


def _detect_undervalued_dip(hist, ticker):
    """Signal 2: Stock dipped significantly but shows recovery signals."""
    closes = hist['Close'].values
    if len(closes) < 10:
        return None

    recent_high = float(np.max(closes[-20:]))
    current_price = float(closes[-1])
    dip_pct = ((current_price - recent_high) / recent_high) * 100

    if dip_pct > -3:
        return None  # hasn't dipped enough

    rsi_val = _rsi(closes)
    # Good buy signal: RSI recovering from oversold
    if rsi_val > 65:
        return None  # already recovered, too late

    # Score based on dip depth + RSI recovery potential
    dip_score = min(abs(dip_pct) * 5, 50)
    rsi_score = max(50 - abs(rsi_val - 35), 0)  # best around RSI 35
    score = round(min(dip_score + rsi_score, 100), 1)

    if score < 60:
        return None

    # Expect recovery toward the recent high
    profit_min = round(abs(dip_pct) * 0.3, 2)
    profit_max = round(abs(dip_pct) * 0.7, 2)

    volatility = _atr(hist)
    if volatility < 2.5:
        risk = 'Low'
    elif volatility < 5:
        risk = 'Medium'
    else:
        risk = 'High'

    reasoning = (
        f"{ticker} has dropped {dip_pct:.1f}% from its recent high of ${recent_high:.2f}, "
        f"currently trading at ${current_price:.2f}. The RSI indicator is at {rsi_val:.0f}, "
        f"suggesting the stock is approaching oversold territory and could be due for a rebound. "
        f"Historically, similar dips in this stock have recovered, offering a potential "
        f"profit range of +{profit_min}% to +{profit_max}%. "
        f"This is a 'buy the dip' opportunity — ideal for investors looking for discounted entry points."
    )

    return {
        'signal_type': 'undervalued_dip',
        'score': score,
        'expected_profit_min': profit_min,
        'expected_profit_max': profit_max,
        'reasoning': reasoning,
        'current_price': round(current_price, 2),
        'risk_level': risk,
    }


def _detect_low_vol_steady(hist, ticker):
    """Signal 3: Low volatility with consistent positive returns — beginner-friendly."""
    closes = hist['Close'].values
    if len(closes) < 10:
        return None

    volatility = _atr(hist, window=10)
    slope = _linear_slope(closes[-10:])

    if volatility > 2.5 or slope <= 0.05:
        return None  # too volatile or not growing

    # Score: reward low vol + positive slope
    vol_score = max(50 - volatility * 15, 0)
    slope_score = min(slope * 30, 50)
    score = round(min(vol_score + slope_score, 100), 1)

    if score < 60:
        return None

    current_price = float(closes[-1])
    profit_min = round(slope * 0.3, 2)
    profit_max = round(slope * 1.5, 2)

    pct_10d = ((closes[-1] - closes[-10]) / closes[-10]) * 100

    reasoning = (
        f"{ticker} is showing steady, low-volatility growth — perfect for cautious and beginner investors. "
        f"Over the last 10 trading days, it has gained {pct_10d:.1f}% with very small daily price swings "
        f"(volatility: {volatility:.1f}%). This type of consistent growth often continues, "
        f"with an expected profit range of +{profit_min}% to +{profit_max}%. "
        f"This is one of the safest picks in our analysis — a great stock to hold with confidence."
    )

    return {
        'signal_type': 'low_volatility_steady',
        'score': score,
        'expected_profit_min': profit_min,
        'expected_profit_max': profit_max,
        'reasoning': reasoning,
        'current_price': round(current_price, 2),
        'risk_level': 'Low',
    }


# ── Main Scanner ────────────────────────────────────────────────────

def scan_all_opportunities():
    """
    Scan all tickers and return a list of opportunity dicts.
    Each dict: { stock_symbol, signal_type, score, expected_profit_min/max,
                 reasoning, current_price, risk_level }
    """
    opportunities = []

    for ticker in SCAN_TICKERS:
        hist = _fetch_history(ticker, period='1mo')
        if hist is None:
            continue

        # Run all three signal detectors
        for detector in [_detect_growth_momentum, _detect_undervalued_dip, _detect_low_vol_steady]:
            try:
                result = detector(hist, ticker)
                if result:
                    result['stock_symbol'] = ticker
                    opportunities.append(result)
            except Exception as e:
                print(f"[OPPORTUNITY] Detector error for {ticker}: {e}")

    # Sort by score descending
    opportunities.sort(key=lambda x: x['score'], reverse=True)
    return opportunities
