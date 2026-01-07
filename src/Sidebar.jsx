import { useState } from 'react';

function Sidebar({ onSubmit, isCollapsed, onToggle }) {
  const [ticker, setTicker] = useState('VEDL');
  const [count, setCount] = useState('10');
  const [interval, setInterval] = useState('1m');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ticker, count: parseInt(count), interval });
  };

  return (
    <div style={{
      width: isCollapsed ? '60px' : '280px',
      padding: isCollapsed ? '15px' : '24px',
      backgroundColor: '#1e293b',
      height: '100vh',
      borderRight: '1px solid #334155',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '2px 0 12px rgba(0,0,0,0.15)'
    }}>
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#334155',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '8px 12px',
          zIndex: 10,
          borderRadius: '6px',
          color: '#e2e8f0',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.target.style.background = '#475569'}
        onMouseLeave={(e) => e.target.style.background = '#334155'}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '☰' : '✕'}
      </button>
      {!isCollapsed && <h3 style={{
        color: '#f1f5f9',
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '24px',
        marginTop: '8px'
      }}>Stock Settings</h3>}
      {!isCollapsed && <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#cbd5e1',
            fontSize: '0.875rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Ticker Symbol
          </label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f1f5f9',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#334155'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#cbd5e1',
            fontSize: '0.875rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Candle Count
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f1f5f9',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#334155'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#cbd5e1',
            fontSize: '0.875rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Time Interval
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f1f5f9',
              fontSize: '0.95rem',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#334155'}
          >
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="15m">30 Minutes</option>
            <option value="1h">1 Hour</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 6px 12px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#3b82f6';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
          }}
        >
          Update Chart
        </button>
      </form>}
    </div>
  );
}

export default Sidebar;