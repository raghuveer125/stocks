from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime, timedelta
import pytz

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
    return {"message": "Stock API"}

@app.get("/api/stock/{ticker}/{count}/{interval}")
def get_last_candles_with_interval(ticker: str, count: int, interval: str):
    stock = yf.Ticker(f"{ticker}.NS")
    
    period_map = {
        "1m": "7d",
        "5m": "60d", 
        "15m": "60d"
    }
    
    period = period_map.get(interval, "7d")
    hist = stock.history(period=period, interval=interval)
    
    # Filter only market hours (9:15 AM - 3:30 PM IST)
    ist = pytz.timezone('Asia/Kolkata')
    filtered_data = []
    
    for index, row in hist.iterrows():
        ist_time = index.astimezone(ist)
        hour = ist_time.hour
        minute = ist_time.minute
        
        if (hour == 9 and minute >= 15) or (10 <= hour < 15) or (hour == 15 and minute <= 30):
            # Use Unix timestamp for lightweight-charts
            timestamp = int(index.timestamp())
            filtered_data.append({
                "time": timestamp,
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume'])
            })
    
    return {"data": filtered_data[-count:] if len(filtered_data) >= count else filtered_data}