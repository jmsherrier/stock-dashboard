import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from './ComponentRegistry';

function TrailingPEComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.trailingPE?.value || stock.trailingPE || '';
  const value = getValue();

  const criteria = stock.components?.trailingPE?.criteria;
  const score = value ? calculateComponentScore('trailingPE', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('trailingPE', value, criteria) : 'neutral';

  return (
    <div className="modular-component trailing-pe-component">
      <div className="component-header">
        <label>Trailing P/E</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('trailingPE')}
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
            onChange={(e) => onUpdate(stock.id, 'trailingPE', { value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}

export default TrailingPEComponent;
