import { createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';

// Calculate EMA
function calculateEMA(data, period) {
  const ema = [];
  const multiplier = 2 / (period + 1);

  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    sum += data[i].close;
  }
  let emaValue = sum / period;
  ema.push({ time: data[period - 1].time, value: emaValue });

  // Calculate EMA for remaining data
  for (let i = period; i < data.length; i++) {
    emaValue = (data[i].close - emaValue) * multiplier + emaValue;
    ema.push({ time: data[i].time, value: emaValue });
  }

  return ema;
}

function StockChart({ ticker, count, interval, onDataUpdate }) {
  const chartContainerRef = useRef();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const chart = createChart(chartContainerRef.current, {
      width: 800,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        timeFormatter: (timestamp) => {
          const date = new Date(timestamp * 1000);
          const istDateTime = date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          return istDateTime;
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const fetchData = () => {
      fetch(`http://localhost:8000/api/stock/${ticker}/${count}/${interval}`)
        .then(response => response.json())
        .then(result => {
          const data = result.data;
          candlestickSeries.setData(data);

          // Calculate support and resistance
          const highs = data.map(d => d.high);
          const lows = data.map(d => d.low);
          const closes = data.map(d => d.close);

          const resistance = Math.max(...highs);
          const support = Math.min(...lows);
          const currentPrice = closes[closes.length - 1];

          // Calculate EMA values
          const emaData9 = calculateEMA(data, 9);
          const emaData20 = calculateEMA(data, 20);
          const currentEMA = emaData9.length > 0 ? emaData9[emaData9.length - 1].value : null;

          // Update parent component with stock data
          if (onDataUpdate) {
            onDataUpdate({
              currentPrice,
              support,
              resistance,
              emaValue: currentEMA
            });
          }

          // Add resistance line
          const resistanceLine = chart.addLineSeries({
            color: '#ef5350',
            lineWidth: 2,
            lineStyle: 2,
            title: 'Resistance',
          });

          resistanceLine.setData([
            { time: data[0].time, value: resistance },
            { time: data[data.length - 1].time, value: resistance },
          ]);

          // Add support line
          const supportLine = chart.addLineSeries({
            color: '#26a69a',
            lineWidth: 2,
            lineStyle: 2,
            title: 'Support',
          });

          supportLine.setData([
            { time: data[0].time, value: support },
            { time: data[data.length - 1].time, value: support },
          ]);

          // Add EMA 9 line
          const emaLine9 = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            title: 'EMA (9)',
          });
          emaLine9.setData(emaData9);

          // Add EMA 20 line
          const emaLine20 = chart.addLineSeries({
            color: '#FF9800',
            lineWidth: 2,
            title: 'EMA (20)',
          });
          emaLine20.setData(emaData20);

          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setLoading(false);
        });
    };
    // Initial fetch
    fetchData();

    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(fetchData, 60000);

    return () => {
      chart.remove();
      clearInterval(intervalId);
    };
  }, [ticker, count, interval]);
  return (
    <div>
      {loading && <p>Loading chart...</p>}
      <div ref={chartContainerRef} />
    </div>
  );
}

export default StockChart;