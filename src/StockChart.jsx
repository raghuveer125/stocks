import { createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';

// Calculate EMA
function calculateEMA(data, period) {
  if (!data || data.length === 0) return [];

  const ema = [];
  const multiplier = 2 / (period + 1);

  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    sum += data[i].close;
  }

  if (data.length < period) return [];

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
  const chartRef = useRef(null);
  const seriesRefs = useRef({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Remove existing chart if any
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRefs.current = {};
    }

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

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    seriesRefs.current.candlestick = candlestickSeries;

    // Function to fetch and update data
    const fetchData = () => {
      if (!chartRef.current) return; // Don't fetch if chart is destroyed

      fetch(`http://localhost:8000/api/stock/${ticker}/${count}/${interval}`)
        .then(response => response.json())
        .then(result => {
          if (!chartRef.current) return; // Check again after async operation

          const data = result.data;
          seriesRefs.current.candlestick.setData(data);

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

          // Only add series if they don't exist
          if (!seriesRefs.current.resistance) {
            const resistanceLine = chartRef.current.addLineSeries({
              color: '#ef5350',
              lineWidth: 2,
              lineStyle: 2,
              title: 'Resistance',
            });
            seriesRefs.current.resistance = resistanceLine;
          }
          seriesRefs.current.resistance.setData([
            { time: data[0].time, value: resistance },
            { time: data[data.length - 1].time, value: resistance },
          ]);

          if (!seriesRefs.current.support) {
            const supportLine = chartRef.current.addLineSeries({
              color: '#26a69a',
              lineWidth: 2,
              lineStyle: 2,
              title: 'Support',
            });
            seriesRefs.current.support = supportLine;
          }
          seriesRefs.current.support.setData([
            { time: data[0].time, value: support },
            { time: data[data.length - 1].time, value: support },
          ]);

          if (!seriesRefs.current.ema9) {
            const emaLine9 = chartRef.current.addLineSeries({
              color: '#2962FF',
              lineWidth: 2,
              title: 'EMA (9)',
            });
            seriesRefs.current.ema9 = emaLine9;
          }
          seriesRefs.current.ema9.setData(emaData9);

          if (!seriesRefs.current.ema20) {
            const emaLine20 = chartRef.current.addLineSeries({
              color: '#FF9800',
              lineWidth: 2,
              title: 'EMA (20)',
            });
            seriesRefs.current.ema20 = emaLine20;
          }
          seriesRefs.current.ema20.setData(emaData20);

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
      clearInterval(intervalId);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRefs.current = {};
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