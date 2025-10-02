import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';

function SharesOutstandingComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  // Get value from modular or legacy format
  const getValue = () => stock.components?.sharesOutstanding?.value || stock.sharesOutstanding || '';
  const value = getValue();

  const criteria = stock.components?.sharesOutstanding?.criteria;
  const score = value ? calculateComponentScore('sharesOutstanding', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('sharesOutstanding', value, criteria) : 'neutral';

  return (
    <div className="modular-component shares-outstanding-component">
      <div className="component-header">
        <label>Shares Outstanding</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('sharesOutstanding')}
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