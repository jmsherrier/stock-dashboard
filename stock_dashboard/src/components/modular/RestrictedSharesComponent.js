import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from './ComponentRegistry';

function RestrictedSharesComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  // Get value from modular or legacy format
  const getValue = () => stock.components?.restrictedShares?.value || stock.restrictedShares || '';
  const value = getValue();

  const criteria = stock.components?.restrictedShares?.criteria;
  const score = value ? calculateComponentScore('restrictedShares', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('restrictedShares', value, criteria) : 'neutral';

  return (
    <div className="modular-component restricted-shares-component">
      <div className="component-header">
        <label>Restricted Shares</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('restrictedShares')}
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
            onChange={(e) => onUpdate(stock.id, 'restrictedShares', { value: e.target.value })}
            placeholder="0"
          />
          <span className="input-suffix">shares</span>
        </div>
      </div>
    </div>
  );
}

export default RestrictedSharesComponent;