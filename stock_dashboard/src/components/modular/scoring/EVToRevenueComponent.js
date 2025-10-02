import React from 'react';
import CriteriaInput from '../../inputs/CriteriaInput';
import ChangeIndicator from '../technical/ChangeIndicator';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';

const EVToRevenueComponent = ({ stock, onUpdate, config, onOpenScoringEditor }) => {
  const value = stock.components?.evToRevenue?.value || '';
  const previousValue = stock.components?.evToRevenue?.previousValue;
  
  const score = calculateComponentScore('evToRevenue', value);
  const scoreColor = getComponentScoreColor(score);

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="EV/Revenue"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'evToRevenue', { value: val })}
        type="number"
        step="0.01"
        currentPoints={score}
        scale={[
          { range: '<1', points: 3 },
          { range: '1-3', points: 2 },
          { range: '3-6', points: 1 },
          { range: '6-10', points: 0 },
          { range: '>10', points: -2 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component ev-to-revenue-component">
      <div className="component-header">
        <label>EV/Revenue</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('evToRevenue')}
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
            onChange={(e) => onUpdate(stock.id, 'evToRevenue', { value: e.target.value })}
            placeholder="0.00"
          />
          <ChangeIndicator currentValue={value} previousValue={previousValue} />
          <span className="input-suffix">x</span>
        </div>
      </div>
    </div>
  );
};

export default EVToRevenueComponent;