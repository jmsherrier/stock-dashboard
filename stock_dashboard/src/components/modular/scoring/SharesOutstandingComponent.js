import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function SharesOutstandingComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  // Get value from modular or legacy format
  const getValue = () => stock.components?.sharesOutstanding?.value || stock.sharesOutstanding || '';
  const value = getValue();

  const criteria = stock.components?.sharesOutstanding?.criteria;
  const score = value ? calculateComponentScore('sharesOutstanding', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('sharesOutstanding', value, criteria) : 'neutral';

  const formatShares = (val) => {
    if (!val) return '';
    const num = parseFloat(val);
    if (num >= 1e6) return (num / 1e6).toFixed(2);
    return num.toFixed(0);
  };

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Shares Out"
        value={formatShares(value)}
        onChange={(val) => onUpdate(stock.id, 'sharesOutstanding', { value: parseFloat(val) * 1e6 })}
        type="number"
        step="0.1"
        suffix="M"
        currentPoints={score}
        scale={[
          { range: '<10M', points: 3 },
          { range: '10-50M', points: 2 },
          { range: '50-200M', points: 1 },
          { range: '>200M', points: 0 }
        ]}
      />
    );
  }

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