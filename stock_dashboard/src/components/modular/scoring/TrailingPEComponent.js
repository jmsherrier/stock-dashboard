import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function TrailingPEComponent({ stock, onUpdate, config, onOpenScoringEditor, settings = {} }) {
  const getValue = () => stock.components?.trailingPE?.value || stock.trailingPE || '';
  const value = getValue();

  const criteria = stock.components?.trailingPE?.criteria;
  const score = value ? calculateComponentScore('trailingPE', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('trailingPE', value, criteria) : 'neutral';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Trailing P/E"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'trailingPE', { value: val })}
        type="number"
        step="0.1"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<12', points: 3 },
          { range: '12-18', points: 2 },
          { range: '18-25', points: 1 },
          { range: '25-35', points: -1 },
          { range: '>35', points: -2 }
        ]}
      />
    );
  }

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

