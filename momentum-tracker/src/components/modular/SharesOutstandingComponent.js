import React from 'react';

function SharesOutstandingComponent({ stock, onUpdate, config }) {
  // Get value from modular or legacy format
  const getValue = () => stock.components?.sharesOutstanding?.value || stock.sharesOutstanding || '';
  const value = getValue();

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
            onChange={(e) => onUpdate(stock.id, 'sharesOutstanding', { value: e.target.value })}
            placeholder="0"
          />
          <span className="input-suffix">shares</span>
        </div>
      </div>
    </div>
  );
}

export default SharesOutstandingComponent;