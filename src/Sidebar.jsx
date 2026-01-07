import { useState } from 'react';

function Sidebar({ onSubmit, onAutoTradeChange }) {
  const [ticker, setTicker] = useState('VEDL');
  const [count, setCount] = useState('10');
  const [interval, setInterval] = useState('1m');
  const [autoTrade, setAutoTrade] = useState(false);
  const [buyCondition, setBuyCondition] = useState('price_below_ema');
  const [sellCondition, setSellCondition] = useState('price_above_ema');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ticker, count: parseInt(count), interval });
  };

  const handleAutoTradeToggle = (e) => {
    const enabled = e.target.checked;
    setAutoTrade(enabled);
    onAutoTradeChange({
      enabled,
      buyCondition,
      sellCondition
    });
  };

  const handleBuyConditionChange = (e) => {
    const condition = e.target.value;
    setBuyCondition(condition);
    if (autoTrade) {
      onAutoTradeChange({
        enabled: autoTrade,
        buyCondition: condition,
        sellCondition
      });
    }
  };

  const handleSellConditionChange = (e) => {
    const condition = e.target.value;
    setSellCondition(condition);
    if (autoTrade) {
      onAutoTradeChange({
        enabled: autoTrade,
        buyCondition,
        sellCondition: condition
      });
    }
  };

  return (
    <div style={{
      width: '280px',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      height: '100vh',
      borderRight: '1px solid #ddd',
      overflowY: 'auto'
    }}>
      <h3>Stock Settings</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Ticker:
          </label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Candle Count:
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Interval:
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#26a69a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Update Chart
        </button>
      </form>

      <hr style={{ margin: '20px 0', border: '1px solid #ddd' }} />

      <h3>Auto Trading</h3>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoTrade}
            onChange={handleAutoTradeToggle}
            style={{ marginRight: '8px', width: '18px', height: '18px' }}
          />
          <span style={{ fontWeight: 'bold' }}>Enable Auto Trading</span>
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Buy Condition:
        </label>
        <select
          value={buyCondition}
          onChange={handleBuyConditionChange}
          disabled={!autoTrade}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: autoTrade ? 'white' : '#e0e0e0'
          }}
        >
          <option value="price_below_ema">Price crosses below EMA</option>
          <option value="price_above_ema">Price crosses above EMA</option>
          <option value="price_at_support">Price touches support</option>
          <option value="price_at_resistance">Price touches resistance</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Sell Condition:
        </label>
        <select
          value={sellCondition}
          onChange={handleSellConditionChange}
          disabled={!autoTrade}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: autoTrade ? 'white' : '#e0e0e0'
          }}
        >
          <option value="price_above_ema">Price crosses above EMA</option>
          <option value="price_below_ema">Price crosses below EMA</option>
          <option value="price_at_support">Price touches support</option>
          <option value="price_at_resistance">Price touches resistance</option>
          <option value="profit_target_2">2% Profit Target</option>
          <option value="stop_loss_1">1% Stop Loss</option>
        </select>
      </div>

      {autoTrade && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#856404'
        }}>
          ⚠️ Auto trading is enabled. Trades will execute automatically based on conditions.
        </div>
      )}
    </div>
  );
}

export default Sidebar;