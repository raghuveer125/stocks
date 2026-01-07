from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime, timedelta

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "VEDL Stock API"}

@app.get("/api/stock/{ticker}")
def get_stock_data(ticker: str, interval: str = "1m", period: str = "7d"):
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
def get_last_candles(ticker: str, count: int, interval: str = "1m"):
    stock = yf.Ticker(f"{ticker}.NS")
    
    # Map intervals to appropriate periods
    period_map = {
        "1m": "7d",
        "5m": "60d", 
        "15m": "60d"
    }
    
    period = period_map.get(interval, "7d")
    hist = stock.history(period=period, interval=interval)
    
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
    hist = stock.history(period="7d", interval=interval)
    
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