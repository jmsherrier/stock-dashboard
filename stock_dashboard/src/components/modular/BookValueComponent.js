import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from './ComponentRegistry';

function BookValueComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.bookValue?.value || stock.bookValue || '';
  const value = getValue();

  const criteria = stock.components?.bookValue?.criteria;
  const score = value ? calculateComponentScore('bookValue', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('bookValue', value, criteria) : 'neutral';

  return (
    <div className="modular-component book-value-component">
      <div className="component-header">
        <label>Book Value</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('bookValue')}
              title="Edit scoring criteria"
            >
              ⚙
            </button>
          )}
        </div>
      </div>
      <div className="component-content">
        <div className="input-wrapper">
          <span className="input-prefix">$</span>
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onUpdate(stock.id, 'bookValue', { value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}

export default BookValueComponent;
