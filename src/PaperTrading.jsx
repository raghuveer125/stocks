import { useEffect, useRef, useState } from 'react';

function PaperTrading({ currentPrice, ticker, autoTradeConfig, stockData }) {
  const [capital, setCapital] = useState(1000);
  const [position, setPosition] = useState(null);
  const [trades, setTrades] = useState([]);
  const prevPriceRef = useRef(null);
  const prevEMARef = useRef(null);

  // Auto-trading logic
  useEffect(() => {
    if (!autoTradeConfig.enabled || !currentPrice) return;

    const prevPrice = prevPriceRef.current;

    if (!prevPrice) {
      prevPriceRef.current = currentPrice;
      return;
    }

    // Simple test logic: Green candle = Buy, Red candle = Sell
    const isGreenCandle = currentPrice > prevPrice;
    const isRedCandle = currentPrice < prevPrice;

    // Buy on green candle (if no position)
    if (!position && isGreenCandle) {
      console.log('🟢 GREEN CANDLE DETECTED - BUYING at', currentPrice);
      buyStock(true);
    }

    // Sell on red candle (if have position)
    if (position && isRedCandle) {
      console.log('🔴 RED CANDLE DETECTED - SELLING at', currentPrice);
      sellStock(true);
    }

    prevPriceRef.current = currentPrice;
  }, [currentPrice, autoTradeConfig.enabled, position, capital, trades]);

  const buyStock = (isAuto = false) => {
    if (!currentPrice || position) return;

    const quantity = Math.floor(capital / currentPrice);
    if (quantity === 0) {
      if (!isAuto) alert('Insufficient capital to buy even 1 share');
      return;
    }

    const cost = quantity * currentPrice;
    setCapital(capital - cost);
    setPosition({
      quantity,
      buyPrice: currentPrice,
      ticker
    });

    setTrades([...trades, {
      type: 'BUY',
      ticker,
      quantity,
      price: currentPrice,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      auto: isAuto
    }]);
  };

  const sellStock = (isAuto = false) => {
    if (!position || !currentPrice) return;

    const revenue = position.quantity * currentPrice;
    const profit = revenue - (position.quantity * position.buyPrice);

    setCapital(capital + revenue);

    setTrades([...trades, {
      type: 'SELL',
      ticker: position.ticker,
      quantity: position.quantity,
      price: currentPrice,
      profit: profit,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      auto: isAuto
    }]);

    setPosition(null);
  };

  const unrealizedPnL = position && currentPrice
    ? (currentPrice - position.buyPrice) * position.quantity
    : 0;

  const totalValue = position && currentPrice
    ? capital + (position.quantity * currentPrice)
    : capital;

  const realizedPnL = trades
    .filter(t => t.type === 'SELL')
    .reduce((sum, t) => sum + (t.profit || 0), 0);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      marginTop: '20px',
      border: '1px solid #ddd'
    }}>
      <h3>Paper Trading {autoTradeConfig.enabled && <span style={{ color: '#FF9800' }}>(AUTO)</span>}</h3>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>Available Capital</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{capital.toFixed(2)}</div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Portfolio Value</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{totalValue.toFixed(2)}</div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>Realized P&L</div>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: realizedPnL >= 0 ? '#26a69a' : '#ef5350'
          }}>
            ₹{realizedPnL.toFixed(2)}
          </div>
        </div>

        {position && (
          <>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Position</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {position.quantity} @ ₹{position.buyPrice.toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Unrealized P&L</div>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: unrealizedPnL >= 0 ? '#26a69a' : '#ef5350'
              }}>
                ₹{unrealizedPnL.toFixed(2)}
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => buyStock(false)}
          disabled={!currentPrice || position || autoTradeConfig.enabled}
          style={{
            padding: '10px 20px',
            backgroundColor: (position || autoTradeConfig.enabled) ? '#ccc' : '#26a69a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (position || autoTradeConfig.enabled) ? 'not-allowed' : 'pointer'
          }}
        >
          Buy
        </button>

        <button
          onClick={() => sellStock(false)}
          disabled={!position || !currentPrice || autoTradeConfig.enabled}
          style={{
            padding: '10px 20px',
            backgroundColor: (!position || autoTradeConfig.enabled) ? '#ccc' : '#ef5350',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!position || autoTradeConfig.enabled) ? 'not-allowed' : 'pointer'
          }}
        >
          Sell
        </button>
      </div>

      <div>
        <h4>Trade History</h4>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {trades.length === 0 ? (
            <p style={{ color: '#666' }}>No trades yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#e0e0e0' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Mode</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Ticker</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>P&L</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice().reverse().map((trade, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{
                      padding: '8px',
                      color: trade.type === 'BUY' ? '#26a69a' : '#ef5350',
                      fontWeight: 'bold'
                    }}>
                      {trade.type}
                    </td>
                    <td style={{ padding: '8px', fontSize: '12px' }}>
                      {trade.auto ? '🤖 AUTO' : '👤 MANUAL'}
                    </td>
                    <td style={{ padding: '8px' }}>{trade.ticker}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{trade.quantity}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{trade.price.toFixed(2)}</td>
                    <td style={{
                      padding: '8px',
                      textAlign: 'right',
                      color: trade.profit ? (trade.profit >= 0 ? '#26a69a' : '#ef5350') : '#333'
                    }}>
                      {trade.profit ? `₹${trade.profit.toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '8px', fontSize: '12px' }}>{trade.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaperTrading;