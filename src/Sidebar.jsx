import { useState } from 'react';

function Sidebar({ onSubmit }) {
  const [ticker, setTicker] = useState('VEDL');
  const [count, setCount] = useState('10');
  const [interval, setInterval] = useState('1m');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ticker, count: parseInt(count), interval });
  };

  return (
    <div style={{
      width: '250px',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      height: '100vh',
      borderRight: '1px solid #ddd'
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
            cursor: 'pointer'
          }}
        >
          Update Chart
        </button>
      </form>
    </div>
  );
}

export default Sidebar;