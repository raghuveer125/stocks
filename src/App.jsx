import { useState } from 'react';
import './App.css';
import PropertiesBar from './PropertiesBar';
import Sidebar from './Sidebar';
import StockChart from './StockChart';

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

  const handleSubmit = (params) => {
    setChartParams(params);
  };

  const handleStockDataUpdate = (data) => {
    setStockData(data);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar onSubmit={handleSubmit} />
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>VEDL Stock Chart</h1>
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
        />
      </div>
    </div>
  );
}

export default App;