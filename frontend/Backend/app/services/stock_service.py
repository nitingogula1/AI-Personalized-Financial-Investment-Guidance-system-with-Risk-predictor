
import yfinance as yf
from datetime import datetime, timedelta
import os
import time
from dotenv import load_dotenv

load_dotenv()

# ─── Optional Finnhub (only used if a real key is provided) ───
FINNHUB_KEY = os.getenv('FINNHUB_API_KEY', '')
finnhub_client = None
if FINNHUB_KEY and FINNHUB_KEY != 'YOUR_FINNHUB_API_KEY_HERE':
    try:
        import finnhub
        finnhub_client = finnhub.Client(api_key=FINNHUB_KEY)
        print("  [OK] Finnhub API key loaded successfully")
    except Exception as e:
        print(f"  [WARN] Finnhub init failed: {e}")
else:
    print("  [WARN] No valid Finnhub API key -- using yfinance only")

# ─── Simple TTL Cache ───
_cache = {}
CACHE_TTL = 300  # 5 minutes


def get_cached_data(key):
    if key in _cache:
        data, expiry = _cache[key]
        if time.time() < expiry:
            return data
    return None


def set_cached_data(key, data):
    _cache[key] = (data, time.time() + CACHE_TTL)


# ─── yfinance helper (works for US, Indian, Crypto) ───
def _fetch_yfinance(ticker):
    """Reliable fallback using yfinance. Works for all asset types."""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="5d")

        if hist.empty:
            return None

        current_price = float(hist['Close'].iloc[-1])
        prev_close = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else current_price
        change = ((current_price - prev_close) / prev_close) * 100 if prev_close else 0

        day_high = float(hist['High'].iloc[-1])
        day_low = float(hist['Low'].iloc[-1])
        day_open = float(hist['Open'].iloc[-1])

        # Try to get the long name from info (sometimes slow)
        try:
            info = stock.info
            name = info.get('longName') or info.get('shortName') or ticker
        except Exception:
            name = ticker

        data = {
            'symbol': ticker.upper(),
            'name': name,
            'price': round(current_price, 2),
            'change': round(change, 2),
            'high': round(day_high, 2),
            'low': round(day_low, 2),
            'open': round(day_open, 2),
            'pc': round(prev_close, 2),
        }
        return data
    except Exception as e:
        print(f"  yfinance error for {ticker}: {e}")
        return None


# ─── Finnhub helper (US stocks only on free tier) ───
def _fetch_finnhub(ticker):
    """Try Finnhub for US stocks. Returns None if unavailable."""
    if not finnhub_client:
        return None
    # Finnhub free tier doesn't support .NS (Indian) or -USD (crypto)
    if '.' in ticker or '-' in ticker:
        return None
    try:
        quote = finnhub_client.quote(ticker.upper())
        if quote and quote.get('c', 0) != 0:
            return {
                'symbol': ticker.upper(),
                'name': ticker.upper(),
                'price': round(float(quote['c']), 2),
                'change': round(float(quote['dp']), 2),
                'high': round(float(quote['h']), 2),
                'low': round(float(quote['l']), 2),
                'open': round(float(quote['o']), 2),
                'pc': round(float(quote['pc']), 2),
            }
    except Exception as e:
        print(f"  Finnhub error for {ticker}: {e}")
    return None


# ─── Public API ───

def get_stock_price(ticker):
    """Fetch current price and change using Finnhub (if available) → yfinance fallback."""
    cache_key = f"price_{ticker}"
    cached = get_cached_data(cache_key)
    if cached:
        return cached

    # Try Finnhub first (fast, but US only on free tier)
    data = _fetch_finnhub(ticker)

    # Fallback to yfinance (works for everything)
    if not data:
        data = _fetch_yfinance(ticker)

    if data:
        set_cached_data(cache_key, data)
    return data


def get_market_data(tickers):
    """Fetch data for a list of tickers."""
    results = []
    for ticker in tickers:
        data = get_stock_price(ticker)
        if data:
            results.append(data)
    return results


def get_detailed_stock_info(ticker):
    """Fetch comprehensive info for MarketsPage."""
    data = get_stock_price(ticker)
    if data:
        price = data['price']
        pc = data.get('pc', price * 0.98)
        change = data.get('change', 0)

        # Generate mock sentiment based on price change
        if change > 0:
            buyers = min(40 + change * 3, 80)
            sellers = max(10, 30 - change * 2)
        else:
            buyers = max(15, 40 + change * 3)
            sellers = min(50 - change * 2, 70)
        holders = round(100 - buyers - sellers, 1)

        data.update({
            'rsi': min(99, max(10, int(50 + change * 5))),
            'atr': round(abs(change) * 0.8, 2),
            'news': max(1, int(20 + change * 2)),
            'buyers': round(buyers, 1),
            'sellers': round(sellers, 1),
            'holders': round(holders, 1),
            'abbr': ticker[:2].upper(),
            'current': price,
            'past': pc,
            'projected': round(price * (1 + change / 200), 2),
        })
    return data


def get_stock_history(ticker, period="1mo", interval="1d"):
    """Fetch historical data for charting."""
    cache_key = f"history_{ticker}_{period}_{interval}"
    cached = get_cached_data(cache_key)
    if cached:
        return cached

    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period, interval=interval)
        if hist.empty:
            return []

        history = []
        for index, row in hist.iterrows():
            history.append({
                'date': index.strftime('%Y-%m-%d'),
                'price': round(float(row['Close']), 2),
                'volume': int(row['Volume'])
            })

        set_cached_data(cache_key, history)
        return history
    except Exception as e:
        print(f"Error fetching history for {ticker}: {e}")
        return []
