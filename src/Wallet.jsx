import { useEffect, useState, useRef } from 'react';

function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const walletRef = useRef(null);

  const fetchWalletData = async () => {
    try {
      const [walletRes, portfolioRes] = await Promise.all([
        fetch('http://localhost:8000/api/wallet'),
        fetch('http://localhost:8000/api/portfolio')
      ]);

      if (walletRes.ok && portfolioRes.ok) {
        const walletData = await walletRes.json();
        const portfolioData = await portfolioRes.json();

        setWallet(walletData);
        setPortfolio(Array.isArray(portfolioData) ? portfolioData : []);
      } else {
        // APIs not available yet (503)
        setWallet(null);
        setPortfolio([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setWallet(null);
      setPortfolio([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    const interval = setInterval(fetchWalletData, 5000);
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
    const maxX = window.innerWidth - (walletRef.current?.offsetWidth || 320);
    const maxY = window.innerHeight - (walletRef.current?.offsetHeight || 400);

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

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset your wallet? This will delete all trades and portfolio items.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/wallet/reset', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        alert('Wallet reset successfully!');
        fetchWalletData();
      }
    } catch (error) {
      console.error('Error resetting wallet:', error);
      alert('Failed to reset wallet');
    }
  };

  if (loading) {
    return (
      <div
        ref={walletRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          padding: '15px 20px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          color: '#94a3b8',
          fontSize: '0.9rem',
          zIndex: 100,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        Loading...
      </div>
    );
  }

  if (!wallet) {
    return (
      <div
        ref={walletRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          padding: '15px 20px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          color: '#fbbf24',
          fontSize: '0.85rem',
          maxWidth: '280px',
          zIndex: 100,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        Trading features unavailable
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px' }}>
          Database not configured
        </div>
      </div>
    );
  }

  const portfolioValue = portfolio.reduce((sum, item) => sum + item.current_value, 0);
  const totalValue = (wallet?.balance || 0) + portfolioValue;
  const totalPL = totalValue - (wallet?.initial || 0);
  const totalPLPercent = ((totalPL / (wallet?.initial || 1)) * 100).toFixed(2);

  return (
    <div
      ref={walletRef}
      style={{
        position: isFullscreen ? 'fixed' : 'fixed',
        left: isFullscreen ? '0px' : `${position.x}px`,
        top: isFullscreen ? '0px' : `${position.y}px`,
        backgroundColor: '#1e293b',
        borderRadius: isFullscreen ? '0px' : '12px',
        border: '1px solid #334155',
        boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.5)' : '0 4px 8px rgba(0,0,0,0.3)',
        minWidth: isFullscreen ? '100vw' : '280px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: isFullscreen ? 1000 : 100,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
        overflow: isFullscreen ? 'auto' : 'visible',
      }}
      onMouseDown={isFullscreen ? undefined : handleMouseDown}
    >
      {/* Drag handle and control buttons */}
      <div style={{
        padding: '6px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'grab',
        borderBottom: isCollapsed ? 'none' : '1px solid #334155',
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
              {isCollapsed ? '▼' : '▲'}
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
            ⛶
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: isFullscreen ? 'auto' : 'visible',
        }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '15px 20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: expanded && !isFullscreen ? '1px solid #334155' : 'none',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
            Total Value
          </div>
          <div style={{ fontSize: isFullscreen ? '2rem' : '1.3rem', fontWeight: 'bold', color: '#f1f5f9' }}>
            ₹{totalValue.toFixed(2)}
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: totalPL >= 0 ? '#34d399' : '#f87171',
            marginTop: '2px'
          }}>
            {totalPL >= 0 ? '+' : ''}₹{totalPL.toFixed(2)} ({totalPLPercent}%)
          </div>
        </div>
        {!isFullscreen && (
          <div style={{
            fontSize: '1.2rem',
            color: '#94a3b8',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}>
            ▼
          </div>
        )}
      </div>

      {(expanded || isFullscreen) && (
        <div style={{ padding: '15px 20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Cash Balance:</span>
              <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.95rem' }}>
                ₹{wallet?.balance?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Portfolio Value:</span>
              <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '0.95rem' }}>
                ₹{portfolioValue.toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Initial Balance:</span>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                ₹{wallet?.initial?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          {portfolio.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#64748b',
                marginBottom: '8px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}>
                Holdings
              </div>
              {portfolio.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px',
                    backgroundColor: '#0f172a',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    border: '1px solid #1e293b',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {item.ticker}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {item.quantity} shares
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748b' }}>
                      Avg: ₹{item.avg_buy_price.toFixed(2)}
                    </span>
                    <span style={{ color: item.profit >= 0 ? '#34d399' : '#f87171' }}>
                      {item.profit >= 0 ? '+' : ''}₹{item.profit.toFixed(2)} ({item.profit_percent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleReset}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            Reset Wallet
          </button>
        </div>
      )}
        </div>
      )}
    </div>
  );
}

export default Wallet;
