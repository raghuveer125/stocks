from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
from dotenv import load_dotenv
import os

from database import engine, get_db, Base
from models import Wallet, Portfolio, Trade

# Load environment variables
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

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

# ==================== TRADING ENDPOINTS ====================

def init_wallet(db: Session):
    """Initialize wallet if it doesn't exist"""
    wallet = db.query(Wallet).first()
    if not wallet:
        initial_balance = float(os.getenv("INITIAL_WALLET_BALANCE", "100000"))
        wallet = Wallet(balance=initial_balance)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet

@app.get("/api/wallet")
def get_wallet(db: Session = Depends(get_db)):
    """Get current wallet balance"""
    wallet = init_wallet(db)
    initial_balance = float(os.getenv("INITIAL_WALLET_BALANCE", "100000"))

    return {
        "balance": float(wallet.balance),
        "initial": initial_balance
    }

@app.post("/api/wallet/reset")
def reset_wallet(db: Session = Depends(get_db)):
    """Reset wallet and clear all trades/portfolio"""
    try:
        # Delete all trades
        db.query(Trade).delete()

        # Delete all portfolio items
        db.query(Portfolio).delete()

        # Reset wallet balance
        wallet = db.query(Wallet).first()
        initial_balance = float(os.getenv("INITIAL_WALLET_BALANCE", "100000"))

        if wallet:
            wallet.balance = initial_balance
        else:
            wallet = Wallet(balance=initial_balance)
            db.add(wallet)

        db.commit()

        return {
            "success": True,
            "message": "Wallet reset successfully",
            "balance": initial_balance
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/trade/buy")
def buy_stock(ticker: str, quantity: int, price: float, db: Session = Depends(get_db)):
    """Buy stocks"""
    try:
        # Validate inputs
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        if price <= 0:
            raise HTTPException(status_code=400, detail="Price must be positive")

        # Calculate total cost
        total_cost = price * quantity

        # Get wallet
        wallet = init_wallet(db)

        # Check if sufficient funds
        if float(wallet.balance) < total_cost:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient funds. Available: ₹{wallet.balance}, Required: ₹{total_cost}"
            )

        # Deduct from wallet
        wallet.balance = float(wallet.balance) - total_cost

        # Update or create portfolio entry
        portfolio_item = db.query(Portfolio).filter(Portfolio.ticker == ticker).first()

        if portfolio_item:
            # Update average price
            total_quantity = portfolio_item.quantity + quantity
            total_cost_existing = float(portfolio_item.avg_buy_price) * portfolio_item.quantity
            new_avg_price = (total_cost_existing + total_cost) / total_quantity

            portfolio_item.quantity = total_quantity
            portfolio_item.avg_buy_price = new_avg_price
        else:
            # Create new portfolio entry
            portfolio_item = Portfolio(
                ticker=ticker,
                quantity=quantity,
                avg_buy_price=price
            )
            db.add(portfolio_item)

        # Record trade
        trade = Trade(
            trade_type="BUY",
            ticker=ticker,
            quantity=quantity,
            price=price,
            total_amount=total_cost,
            balance_after=float(wallet.balance)
        )
        db.add(trade)

        db.commit()

        return {
            "success": True,
            "message": f"Bought {quantity} shares of {ticker} at ₹{price}",
            "balance": float(wallet.balance),
            "trade_id": trade.id,
            "total_cost": total_cost
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/trade/sell")
def sell_stock(ticker: str, quantity: int, price: float, db: Session = Depends(get_db)):
    """Sell stocks"""
    try:
        # Validate inputs
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        if price <= 0:
            raise HTTPException(status_code=400, detail="Price must be positive")

        # Get portfolio item
        portfolio_item = db.query(Portfolio).filter(Portfolio.ticker == ticker).first()

        if not portfolio_item:
            raise HTTPException(status_code=400, detail=f"You don't own any {ticker} stocks")

        if portfolio_item.quantity < quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient quantity. You own {portfolio_item.quantity}, trying to sell {quantity}"
            )

        # Calculate total proceeds
        total_proceeds = price * quantity

        # Calculate profit
        cost_basis = float(portfolio_item.avg_buy_price) * quantity
        profit = total_proceeds - cost_basis

        # Get wallet
        wallet = init_wallet(db)

        # Add to wallet
        wallet.balance = float(wallet.balance) + total_proceeds

        # Update portfolio
        portfolio_item.quantity -= quantity

        # If quantity becomes 0, delete portfolio item
        if portfolio_item.quantity == 0:
            db.delete(portfolio_item)

        # Record trade
        trade = Trade(
            trade_type="SELL",
            ticker=ticker,
            quantity=quantity,
            price=price,
            total_amount=total_proceeds,
            balance_after=float(wallet.balance)
        )
        db.add(trade)

        db.commit()

        return {
            "success": True,
            "message": f"Sold {quantity} shares of {ticker} at ₹{price}",
            "balance": float(wallet.balance),
            "trade_id": trade.id,
            "total_proceeds": total_proceeds,
            "profit": profit,
            "profit_percent": (profit / cost_basis * 100) if cost_basis > 0 else 0
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio")
def get_portfolio(db: Session = Depends(get_db)):
    """Get current portfolio with P&L"""
    portfolio_items = db.query(Portfolio).all()

    result = []
    for item in portfolio_items:
        # Fetch current price from yfinance
        try:
            stock = yf.Ticker(f"{item.ticker}.NS")
            hist = stock.history(period="1d", interval="1m")
            if not hist.empty:
                current_price = float(hist['Close'].iloc[-1])
            else:
                current_price = float(item.avg_buy_price)
        except:
            current_price = float(item.avg_buy_price)

        invested = float(item.avg_buy_price) * item.quantity
        current_value = current_price * item.quantity
        profit = current_value - invested
        profit_percent = (profit / invested * 100) if invested > 0 else 0

        result.append({
            "ticker": item.ticker,
            "quantity": item.quantity,
            "avg_buy_price": float(item.avg_buy_price),
            "current_price": current_price,
            "invested": invested,
            "current_value": current_value,
            "profit": profit,
            "profit_percent": profit_percent
        })

    return result

@app.get("/api/trades")
def get_trades(limit: int = 50, trade_type: str = "ALL", db: Session = Depends(get_db)):
    """Get trade history"""
    query = db.query(Trade)

    if trade_type != "ALL":
        query = query.filter(Trade.trade_type == trade_type.upper())

    trades = query.order_by(Trade.created_at.desc()).limit(limit).all()

    result = []
    for trade in trades:
        result.append({
            "id": trade.id,
            "trade_type": trade.trade_type,
            "ticker": trade.ticker,
            "quantity": trade.quantity,
            "price": float(trade.price),
            "total_amount": float(trade.total_amount),
            "balance_after": float(trade.balance_after),
            "created_at": trade.created_at.isoformat()
        })

    return result
