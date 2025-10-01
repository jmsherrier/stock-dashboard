import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from './ComponentRegistry';

function ForwardPEComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.forwardPE?.value || stock.forwardPE || '';
  const value = getValue();

  const criteria = stock.components?.forwardPE?.criteria;
  const score = value ? calculateComponentScore('forwardPE', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('forwardPE', value, criteria) : 'neutral';

  return (
    <div className="modular-component forward-pe-component">
      <div className="component-header">
        <label>Forward P/E</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('forwardPE')}
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
            onChange={(e) => onUpdate(stock.id, 'forwardPE', { value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}

export default ForwardPEComponent;
