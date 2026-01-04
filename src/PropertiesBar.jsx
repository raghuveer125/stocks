function PropertiesBar({ currentPrice, support, resistance, ticker }) {
  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      padding: '15px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #ddd'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: '#666' }}>Ticker</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{ticker}</div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: '#666' }}>Current Price</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
          ₹{currentPrice ? currentPrice.toFixed(2) : '--'}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: '#666' }}>Support</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#26a69a' }}>
          ₹{support ? support.toFixed(2) : '--'}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: '#666' }}>Resistance</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef5350' }}>
          ₹{resistance ? resistance.toFixed(2) : '--'}
        </div>
      </div>
    </div>
  );
}

export default PropertiesBar;