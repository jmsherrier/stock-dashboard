import React from 'react';

function RestrictedSharesComponent({ stock, onUpdate, config }) {
  const value = stock.restrictedShares || stock.components?.restrictedShares?.value || '';

  return (
    <div className="modular-component restricted-shares-component">
      <div className="component-header">
        <label>Restricted Shares</label>
      </div>
      <div className="component-content">
        <div className="input-wrapper">
          <input
            type="number"
            step="1000000"
            value={value}
            onChange={(e) => onUpdate(stock.id, 'restrictedShares', e.target.value)}
            placeholder="0"
          />
          <span className="input-suffix">shares</span>
        </div>
      </div>
    </div>
  );
}

export default RestrictedSharesComponent;