import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function ForwardPEComponent({ stock, onUpdate, config, onOpenScoringEditor , settings = {} }) {
  const getValue = () => stock.components?.forwardPE?.value || stock.forwardPE || '';
  const value = getValue();

  const criteria = stock.components?.forwardPE?.criteria;
  const score = value ? calculateComponentScore('forwardPE', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('forwardPE', value, criteria) : 'neutral';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Forward P/E"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'forwardPE', { value: val })}
        type="number"
        step="0.1"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<10', points: 3 },
          { range: '10-15', points: 2 },
          { range: '15-20', points: 1 },
          { range: '20-30', points: -1 },
          { range: '>30', points: -2 }
        ]}
      />
    );
  }

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

