from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd

app = FastAPI()

def calculate_ema(data, period):
    """Calculate Exponential Moving Average"""
    closes = [candle['close'] for candle in data]
    if len(closes) < period:
        return []

    df = pd.DataFrame({'close': closes})
    ema = df['close'].ewm(span=period, adjust=False).mean()

    ema_data = []
    for i in range(period - 1, len(data)):
        ema_data.append({
            'time': data[i]['time'],
            'value': float(ema.iloc[i])
        })

    return ema_data

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "VEDL Stock API"}

@app.get("/api/stock/{ticker}")
def get_stock_data(ticker: str, interval: str = "1m", period: str = "1d"):
    stock = yf.Ticker(f"{ticker}.NS")
    hist = stock.history(period=period, interval=interval)

    data = []
    for index, row in hist.iterrows():
        data.append({
            "time": int(index.timestamp()),
            "open": float(row['Open']),
            "high": float(row['High']),
            "low": float(row['Low']),
            "close": float(row['Close']),
            "volume": int(row['Volume'])
        })

    return {"data": data[-10:]}  # Return last 10 candles

@app.get("/api/stock/{ticker}/{count}")
def get_last_candles(ticker: str, count: int):
    stock = yf.Ticker(f"{ticker}.NS")
    hist = stock.history(period="1d", interval="1m")

    data = []
    for index, row in hist.tail(count).iterrows():
        data.append({
            "time": int(index.timestamp()),
            "open": float(row['Open']),
            "high": float(row['High']),
            "low": float(row['Low']),
            "close": float(row['Close']),
            "volume": int(row['Volume'])
        })

    return {"data": data}

@app.get("/api/stock/{ticker}/{count}/{interval}")
def get_last_candles_interval(ticker: str, count: int, interval: str = "1m"):
    stock = yf.Ticker(f"{ticker}.NS")
    hist = stock.history(period="1d", interval=interval)

    data = []
    for index, row in hist.tail(count).iterrows():
        data.append({
            "time": int(index.timestamp()),
            "open": float(row['Open']),
            "high": float(row['High']),
            "low": float(row['Low']),
            "close": float(row['Close']),
            "volume": int(row['Volume'])
        })

    # Calculate EMAs
    ema9 = calculate_ema(data, 9)
    ema20 = calculate_ema(data, 20)

    # Calculate support and resistance
    highs = [d['high'] for d in data]
    lows = [d['low'] for d in data]

    support = min(lows) if lows else None
    resistance = max(highs) if highs else None

    return {
        "data": data,
        "ema9": ema9,
        "ema20": ema20,
        "support": support,
        "resistance": resistance
    }

# Placeholder endpoints for trading features (requires database setup)
@app.get("/api/wallet")
def get_wallet_disabled():
    raise HTTPException(
        status_code=503,
        detail="Trading features not yet configured. Please install dependencies: pip install psycopg[binary]==3.3.2 sqlalchemy==2.0.23 python-dotenv==1.0.0 && docker-compose up -d"
    )

@app.post("/api/wallet/reset")
def reset_wallet_disabled():
    raise HTTPException(status_code=503, detail="Trading features not yet configured")

@app.post("/api/trade/buy")
def buy_stock_disabled():
    raise HTTPException(status_code=503, detail="Trading features not yet configured")

@app.post("/api/trade/sell")
def sell_stock_disabled():
    raise HTTPException(status_code=503, detail="Trading features not yet configured")

@app.get("/api/portfolio")
def get_portfolio_disabled():
    raise HTTPException(status_code=503, detail="Trading features not yet configured")

@app.get("/api/trades")
def get_trades_disabled():
    raise HTTPException(status_code=503, detail="Trading features not yet configured")
