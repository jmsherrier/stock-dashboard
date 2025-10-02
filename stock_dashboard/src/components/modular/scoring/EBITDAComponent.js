import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

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

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="EBITDA"
        value={formatEBITDA(value)}
        onChange={(val) => onUpdate(stock.id, 'ebitda', { value: parseFloat(val) * 1e6 })}
        type="number"
        step="1"
        suffix="M"
        currentPoints={score}
        scale={[
          { range: '<0', points: -3 },
          { range: '0-50M', points: -1 },
          { range: '50-200M', points: 1 },
          { range: '200M-1B', points: 2 },
          { range: '>1B', points: 3 }
        ]}
      />
    );
  }

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
