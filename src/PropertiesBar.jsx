function PropertiesBar({ currentPrice, support, resistance, ticker }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      <div style={{
        padding: '20px',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
      }}>
        <div style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
          fontWeight: '600'
        }}>Ticker Symbol</div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#f1f5f9',
          letterSpacing: '-0.02em'
        }}>{ticker}</div>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
      }}>
        <div style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
          fontWeight: '600'
        }}>Current Price</div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#60a5fa',
          letterSpacing: '-0.02em'
        }}>
          ₹{currentPrice ? currentPrice.toFixed(2) : '--'}
        </div>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
      }}>
        <div style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
          fontWeight: '600'
        }}>Support Level</div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#34d399',
          letterSpacing: '-0.02em'
        }}>
          ₹{support ? support.toFixed(2) : '--'}
        </div>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
      }}>
        <div style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
          fontWeight: '600'
        }}>Resistance Level</div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#f87171',
          letterSpacing: '-0.02em'
        }}>
          ₹{resistance ? resistance.toFixed(2) : '--'}
        </div>
      </div>
    </div>
  );
}

export default PropertiesBar;