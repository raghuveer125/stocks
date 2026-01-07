import { createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';

function StockChart({ ticker, count, interval, onDataUpdate, isFullscreen }) {
  const chartContainerRef = useRef();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    setLoading(true);
    let chartInstance = null;
    let isMounted = true;

    const chartWidth = isFullscreen ? window.innerWidth - 120 : window.innerWidth * 0.75;
    const chartHeight = isFullscreen ? window.innerHeight - 200 : window.innerHeight * 0.7;

    const chart = createChart(chartContainerRef.current, {
      width: chartWidth,
      height: chartHeight,
      layout: {
        background: { color: '#1e293b' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#60a5fa',
          width: 1,
          style: 2,
          labelBackgroundColor: '#3b82f6',
        },
        horzLine: {
          color: '#60a5fa',
          width: 1,
          style: 2,
          labelBackgroundColor: '#3b82f6',
        },
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
        rightOffset: 5,
        barSpacing: 10,
        lockVisibleTimeRangeOnResize: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      rightPriceScale: {
        borderColor: '#334155',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      leftPriceScale: {
        visible: false,
      },
    });

    chartInstance = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#34d399',
      downColor: '#f87171',
      borderVisible: false,
      wickUpColor: '#34d399',
      wickDownColor: '#f87171',
    });

    // Fetch real data from backend
    fetch(`http://localhost:8000/api/stock/${ticker}/${count}/${interval}`)
      .then(response => response.json())
      .then(result => {
        if (!isMounted) return; // Don't update if component unmounted

        const { data, ema9, ema20, support, resistance } = result;

        // Check if data is valid
        if (!data || data.length === 0) {
          if (isMounted) setLoading(false);
          return;
        }
        candlestickSeries.setData(data);

        // Get current price
        const closes = data.map(d => d.close);
        const currentPrice = closes[closes.length - 1];

        // Update parent component with stock data
        if (onDataUpdate) {
          onDataUpdate({
            currentPrice,
            support,
            resistance
          });
        }

        // Add EMA 9 line (from backend)
        if (isMounted && ema9 && ema9.length > 0) {
          const emaLine = chart.addLineSeries({
            color: '#60a5fa',
            lineWidth: 2,
            title: 'EMA (9)',
          });
          emaLine.setData(ema9);
        }

        // Add EMA 20 line (from backend)
        if (isMounted && ema20 && ema20.length > 0) {
          const emaLine1 = chart.addLineSeries({
            color: '#fbbf24',
            lineWidth: 2,
            title: 'EMA (20)',
          });
          emaLine1.setData(ema20);
        }

        // Add resistance line
        if (isMounted && resistance && data.length > 0) {
          const resistanceLine = chart.addLineSeries({
            color: '#f87171',
            lineWidth: 2,
            lineStyle: 2,
            title: 'Resistance',
          });

          resistanceLine.setData([
            { time: data[0].time, value: resistance },
            { time: data[data.length - 1].time, value: resistance },
          ]);
        }

        // Add support line
        if (isMounted && support && data.length > 0) {
          const supportLine = chart.addLineSeries({
            color: '#34d399',
            lineWidth: 2,
            lineStyle: 2,
            title: 'Support',
          });

          supportLine.setData([
            { time: data[0].time, value: support },
            { time: data[data.length - 1].time, value: support },
          ]);
        }

        // Fit content to show all data
        if (isMounted) {
          chart.timeScale().fitContent();
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (chartInstance) {
        chartInstance.remove();
      }
    };
  }, [ticker, count, interval, isFullscreen]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      flex: 1,
      padding: isFullscreen ? '20px' : '10px'
    }}>
      {loading && <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading chart...</p>}
      <div ref={chartContainerRef} style={{
        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
        borderRadius: '12px',
        overflow: 'visible',
        border: '1px solid #334155',
        backgroundColor: '#1e293b',
        padding: '10px'
      }} />
    </div>
  );
}

export default StockChart;