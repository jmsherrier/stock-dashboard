import React from 'react';
import CriteriaInput from '../../inputs/CriteriaInput';
import ChangeIndicator from '../technical/ChangeIndicator';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';

const EVToEBITDAComponent = ({ stock, onUpdate, config, onOpenScoringEditor, settings = {} }) => {
  const value = stock.components?.evToEbitda?.value || '';
  const previousValue = stock.components?.evToEbitda?.previousValue;
  
  const score = calculateComponentScore('evToEbitda', value);
  const scoreColor = getComponentScoreColor(score);

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="EV/EBITDA"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'evToEbitda', { value: val })}
        type="number"
        step="0.01"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<5', points: 3 },
          { range: '5-10', points: 2 },
          { range: '10-15', points: 1 },
          { range: '15-25', points: 0 },
          { range: '>25', points: -2 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component ev-to-ebitda-component">
      <div className="component-header">
        <label>EV/EBITDA</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('evToEbitda')}
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
            onChange={(e) => onUpdate(stock.id, 'evToEbitda', { value: e.target.value })}
            placeholder="0.00"
          />
          <ChangeIndicator currentValue={value} previousValue={previousValue} />
          <span className="input-suffix">x</span>
        </div>
      </div>
    </div>
  );
};

export default EVToEBITDAComponent;
