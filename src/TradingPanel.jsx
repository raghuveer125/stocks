import { useState, useEffect, useRef } from 'react';

function TradingPanel({ ticker, currentPrice }) {
  const [activeTab, setActiveTab] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [trades, setTrades] = useState([]);
  const [expandedTrade, setExpandedTrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 370, y: window.innerHeight - 520 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(650);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  const panelRef = useRef(null);

  const fetchTrades = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/trades?limit=20');
      if (response.ok) {
        const data = await response.json();
        setTrades(Array.isArray(data) ? data : []);
      } else {
        setTrades([]);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      setTrades([]);
    }
  };

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e) => {
    // Only start dragging if clicking on the header area (not buttons or inputs)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep panel within viewport bounds
    const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 350);
    const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 500);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartY(e.clientY);
    setResizeStartHeight(panelHeight);
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;
    const deltaY = e.clientY - resizeStartY;
    const newHeight = Math.max(300, Math.min(900, resizeStartHeight + deltaY));
    setPanelHeight(newHeight);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeStartY, resizeStartHeight]);

  const handleTrade = async () => {
    if (!ticker || !currentPrice || quantity <= 0) {
      alert('Invalid trade parameters');
      return;
    }

    setLoading(true);
    try {
      const endpoint = activeTab === 'buy' ? '/api/trade/buy' : '/api/trade/sell';
      const response = await fetch(`http://localhost:8000${endpoint}?ticker=${ticker}&quantity=${quantity}&price=${currentPrice}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message);
        setQuantity(1);
        fetchTrades();
        window.dispatchEvent(new Event('walletUpdate'));
      } else {
        alert(data.detail || 'Trade failed');
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      alert('Failed to execute trade');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = (currentPrice || 0) * quantity;

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: isFullscreen ? '0px' : `${position.x}px`,
        top: isFullscreen ? '0px' : `${position.y}px`,
        backgroundColor: '#1e293b',
        borderRadius: isFullscreen ? '0px' : '12px',
        border: '1px solid #334155',
        boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.5)' : '0 4px 8px rgba(0,0,0,0.3)',
        width: isFullscreen ? '100vw' : '350px',
        height: isFullscreen ? '100vh' : (isCollapsed ? 'auto' : `${panelHeight}px`),
        maxHeight: isFullscreen ? '100vh' : (isCollapsed ? '50px' : `${panelHeight}px`),
        display: 'flex',
        flexDirection: 'column',
        zIndex: isFullscreen ? 1000 : 100,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'max-height 0.3s ease, box-shadow 0.2s ease',
        overflow: isFullscreen ? 'auto' : 'hidden',
      }}
      onMouseDown={isFullscreen ? undefined : handleMouseDown}
    >
      {/* Drag handle indicator and collapse button */}
      <div style={{
        padding: '6px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'grab',
        borderBottom: '1px solid #334155',
        paddingLeft: '10px',
        paddingRight: '10px',
        backgroundColor: isFullscreen ? '#0f172a' : 'transparent',
      }}>
        <div style={{
          width: isFullscreen ? '0px' : '40px',
          height: '4px',
          backgroundColor: '#475569',
          borderRadius: '2px',
          display: isFullscreen ? 'none' : 'block',
        }}></div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isFullscreen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.color = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              {isCollapsed ? '▲' : '▼'}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(!isFullscreen);
              if (isCollapsed) setIsCollapsed(false);
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.color = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #334155',
      }}>
        <button
          onClick={() => setActiveTab('buy')}
          style={{
            flex: 1,
            padding: '15px',
            backgroundColor: activeTab === 'buy' ? '#0f172a' : 'transparent',
            color: activeTab === 'buy' ? '#34d399' : '#94a3b8',
            border: 'none',
            borderTopLeftRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          BUY
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          style={{
            flex: 1,
            padding: '15px',
            backgroundColor: activeTab === 'sell' ? '#0f172a' : 'transparent',
            color: activeTab === 'sell' ? '#f87171' : '#94a3b8',
            border: 'none',
            borderTopRightRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          SELL
        </button>
      </div>

      <div style={{ padding: isFullscreen ? '30px' : '20px', display: isFullscreen ? 'grid' : 'block', gridTemplateColumns: isFullscreen ? '1fr 1fr' : 'auto', gap: isFullscreen ? '40px' : '0' }}>
        <div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>
              Ticker
            </div>
            <div style={{ fontSize: isFullscreen ? '1.5rem' : '1.1rem', color: '#f1f5f9', fontWeight: 'bold' }}>
              {ticker || 'N/A'}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>
              Current Price
            </div>
            <div style={{ fontSize: isFullscreen ? '1.5rem' : '1.1rem', color: '#60a5fa', fontWeight: 'bold' }}>
              ₹{currentPrice?.toFixed(2) || '0.00'}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '5px' }}>
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#0f172a',
          borderRadius: '8px',
          marginBottom: '15px',
          border: '1px solid #334155',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total:</span>
            <span style={{
              color: activeTab === 'buy' ? '#34d399' : '#f87171',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}>
              ₹{totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={handleTrade}
          disabled={loading || !ticker || !currentPrice}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: activeTab === 'buy' ? '#059669' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading || !ticker ? 'not-allowed' : 'pointer',
            opacity: loading || !ticker ? 0.5 : 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading && ticker) {
              e.target.style.backgroundColor = activeTab === 'buy' ? '#047857' : '#b91c1c';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = activeTab === 'buy' ? '#059669' : '#dc2626';
          }}
        >
          {loading ? 'Processing...' : activeTab === 'buy' ? 'Buy Stock' : 'Sell Stock'}
        </button>
        </div>
        {isFullscreen && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: '#f1f5f9', marginTop: '0', marginBottom: '20px' }}>Quick Stats</h3>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Total Trades</div>
              <div style={{ fontSize: '1.5rem', color: '#60a5fa', fontWeight: 'bold' }}>{trades.length}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        borderTop: '1px solid #334155',
        padding: '15px 20px',
        fontSize: '0.85rem',
        color: '#64748b',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}>
        Recent Trades {isFullscreen && `(${trades.length})`}
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isFullscreen ? '20px' : '0 20px 20px',
        maxHeight: isFullscreen ? 'calc(100vh - 350px)' : '350px',
      }}>
        {trades.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>
            No trades yet
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                padding: isFullscreen ? '16px' : '12px',
                marginBottom: '8px',
                border: '1px solid #1e293b',
                cursor: 'pointer',
                display: isFullscreen ? 'grid' : 'block',
                gridTemplateColumns: isFullscreen ? '1fr 1fr 1fr' : 'auto',
                gap: isFullscreen ? '20px' : '0',
              }}
              onClick={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
            >
              <div style={{ display: isFullscreen ? 'flex' : 'block', flexDirection: isFullscreen ? 'column' : 'row', justifyContent: 'space-between', marginBottom: isFullscreen ? '0' : '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Type</span>
                <span style={{
                  color: trade.trade_type === 'BUY' ? '#34d399' : '#f87171',
                  fontWeight: 'bold',
                  fontSize: isFullscreen ? '1rem' : '0.9rem'
                }}>
                  {trade.trade_type}
                </span>
              </div>
              <div style={{ display: isFullscreen ? 'flex' : 'block', flexDirection: isFullscreen ? 'column' : 'row', justifyContent: 'space-between', marginBottom: isFullscreen ? '0' : '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ticker</span>
                <span style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: isFullscreen ? '1rem' : '0.9rem' }}>
                  {trade.ticker}
                </span>
              </div>
              <div style={{ display: isFullscreen ? 'flex' : 'block', flexDirection: isFullscreen ? 'column' : 'row', justifyContent: 'space-between', marginBottom: isFullscreen ? '0' : '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Quantity & Price</span>
                <span style={{ color: '#94a3b8', fontSize: isFullscreen ? '1rem' : '0.8rem' }}>
                  {trade.quantity} @ ₹{trade.price.toFixed(2)}
                </span>
              </div>
              {isFullscreen && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total</span>
                    <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1rem' }}>
                      ₹{trade.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Time</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      {new Date(trade.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Balance After</span>
                    <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '1rem' }}>
                      ₹{trade.balance_after.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              {!isFullscreen && expandedTrade === trade.id && (
                <div style={{
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid #1e293b',
                  fontSize: '0.8rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Balance After:</span>
                    <span style={{ color: '#94a3b8' }}>₹{trade.balance_after.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Time:</span>
                    <span style={{ color: '#94a3b8' }}>
                      {new Date(trade.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
        </>
      )}

      {/* Resize handle */}
      {!isCollapsed && !isFullscreen && (
        <div
          onMouseDown={handleResizeStart}
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '8px',
            cursor: 'ns-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{
            width: '40px',
            height: '3px',
            backgroundColor: '#475569',
            borderRadius: '2px',
          }}></div>
        </div>
      )}
    </div>
  );
}

export default TradingPanel;
