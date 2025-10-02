import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function RestrictedSharesComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  // Get value from modular or legacy format
  const getValue = () => stock.components?.restrictedShares?.value || stock.restrictedShares || '';
  const value = getValue();

  const criteria = stock.components?.restrictedShares?.criteria;
  const score = value ? calculateComponentScore('restrictedShares', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('restrictedShares', value, criteria) : 'neutral';

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
        label="Restricted"
        value={formatShares(value)}
        onChange={(val) => onUpdate(stock.id, 'restrictedShares', { value: parseFloat(val) * 1e6 })}
        type="number"
        step="0.1"
        suffix="M"
        currentPoints={score}
        scale={[
          { range: '<1M', points: 3 },
          { range: '1-5M', points: 2 },
          { range: '5-20M', points: 1 },
          { range: '>20M', points: 0 }
        ]}
      />
    );
  }

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