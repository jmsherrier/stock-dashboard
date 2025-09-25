import React from 'react';

function SharesOutstandingComponent({ stock, onUpdate, config }) {
  const value = stock.sharesOutstanding || stock.components?.sharesOutstanding?.value || '';

  return (
    <div className="modular-component shares-outstanding-component">
      <div className="component-header">
        <label>Shares Outstanding</label>
      </div>
      <div className="component-content">
        <div className="input-wrapper">
          <input
            type="number"
            step="1000000"
            value={value}
            onChange={(e) => onUpdate(stock.id, 'sharesOutstanding', e.target.value)}
            placeholder="0"
          />
          <span className="input-suffix">shares</span>
        </div>
      </div>
    </div>
  );
}

export default SharesOutstandingComponent;