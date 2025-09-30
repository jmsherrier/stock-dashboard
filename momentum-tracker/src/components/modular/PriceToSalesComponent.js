import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from './ComponentRegistry';

function PriceToSalesComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.priceToSales?.value || stock.priceToSales || '';
  const value = getValue();

  const criteria = stock.components?.priceToSales?.criteria;
  const score = value ? calculateComponentScore('priceToSales', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('priceToSales', value, criteria) : 'neutral';

  return (
    <div className="modular-component price-to-sales-component">
      <div className="component-header">
        <label>Price-to-Sales</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('priceToSales')}
              title="Edit scoring criteria"
            >
              ⚙
            </button>
          )}
        </div>
      </div>
      <div className="component-content">
        <div className="input-wrapper">
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onUpdate(stock.id, 'priceToSales', { value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}

export default PriceToSalesComponent;
