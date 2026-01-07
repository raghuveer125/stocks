import { useState } from 'react';
import './App.css';
import PropertiesBar from './PropertiesBar';
import Sidebar from './Sidebar';
import StockChart from './StockChart';
import Wallet from './Wallet';
import TradingPanel from './TradingPanel';

function App() {
  const [chartParams, setChartParams] = useState({
    ticker: 'VEDL',
    count: 10,
    interval: '1m'
  });

  const [stockData, setStockData] = useState({
    currentPrice: null,
    support: null,
    resistance: null
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSubmit = (params) => {
    setChartParams(params);
  };

  const handleStockDataUpdate = (data) => {
    setStockData(data);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#0f172a', position: 'relative' }}>
      <Sidebar
        onSubmit={handleSubmit}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div style={{
        flex: 1,
        padding: '24px',
        overflow: 'auto',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom right, #0f172a, #1e293b)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '16px 0'
        }}>
          <h1 style={{
            margin: 0,
            color: '#f1f5f9',
            fontSize: '2rem',
            fontWeight: '700',
            letterSpacing: '-0.02em'
          }}>VEDL Stock Chart</h1>
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '10px 20px',
              backgroundColor: isFullscreen ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: isFullscreen ? '0 4px 6px rgba(239, 68, 68, 0.3)' : '0 4px 6px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = isFullscreen ? '0 6px 12px rgba(239, 68, 68, 0.4)' : '0 6px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = isFullscreen ? '0 4px 6px rgba(239, 68, 68, 0.3)' : '0 4px 6px rgba(59, 130, 246, 0.3)';
            }}
          >
            {isFullscreen ? '✕ Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>
        <PropertiesBar
          ticker={chartParams.ticker}
          currentPrice={stockData.currentPrice}
          support={stockData.support}
          resistance={stockData.resistance}
        />
        <StockChart
          ticker={chartParams.ticker}
          count={chartParams.count}
          interval={chartParams.interval}
          onDataUpdate={handleStockDataUpdate}
          isFullscreen={isFullscreen}
        />
      </div>
      <Wallet />
      <TradingPanel
        ticker={chartParams.ticker}
        currentPrice={stockData.currentPrice}
      />
    </div>
  );
}

export default App;