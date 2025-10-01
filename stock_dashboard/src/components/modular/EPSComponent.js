import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from './ComponentRegistry';

function EPSComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.eps?.value || stock.eps || '';
  const value = getValue();

  const criteria = stock.components?.eps?.criteria;
  const score = value ? calculateComponentScore('eps', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('eps', value, criteria) : 'neutral';

  return (
    <div className="modular-component eps-component">
      <div className="component-header">
        <label>EPS</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('eps')}
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
            onChange={(e) => onUpdate(stock.id, 'eps', { value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}

export default EPSComponent;
