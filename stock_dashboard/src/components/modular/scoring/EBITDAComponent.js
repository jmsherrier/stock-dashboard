import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';

function EBITDAComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.ebitda?.value || stock.ebitda || '';
  const value = getValue();

  const criteria = stock.components?.ebitda?.criteria;
  const score = value ? calculateComponentScore('ebitda', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('ebitda', value, criteria) : 'neutral';

  // Format large numbers for display
  const formatEBITDA = (val) => {
    if (!val) return '';
    const num = parseFloat(val);
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toFixed(0);
  };

  return (
    <div className="modular-component ebitda-component">
      <div className="component-header">
        <label>EBITDA</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('ebitda')}
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
            step="1000000"
            value={value}
            onChange={(e) => onUpdate(stock.id, 'ebitda', { value: e.target.value })}
            placeholder="0"
          />
          {value && <span className="input-hint">{formatEBITDA(value)}</span>}
        </div>
      </div>
    </div>
  );
}

export default EBITDAComponent;
