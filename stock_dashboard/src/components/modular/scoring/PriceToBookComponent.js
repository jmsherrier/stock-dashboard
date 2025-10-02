import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';

function PriceToBookComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.priceToBook?.value || stock.priceToBook || '';
  const value = getValue();

  const criteria = stock.components?.priceToBook?.criteria;
  const score = value ? calculateComponentScore('priceToBook', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('priceToBook', value, criteria) : 'neutral';

  return (
    <div className="modular-component price-to-book-component">
      <div className="component-header">
        <label>Price-to-Book</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('priceToBook')}
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
            onChange={(e) => onUpdate(stock.id, 'priceToBook', { value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}

export default PriceToBookComponent;
