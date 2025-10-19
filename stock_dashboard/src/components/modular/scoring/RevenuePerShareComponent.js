import React from 'react';
import CriteriaInput from '../../inputs/CriteriaInput';
import ChangeIndicator from '../technical/ChangeIndicator';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';

const RevenuePerShareComponent = ({ stock, onUpdate, config, onOpenScoringEditor, settings = {} }) => {
  const value = stock.components?.revenuePerShare?.value || '';
  const previousValue = stock.components?.revenuePerShare?.previousValue;
  
  const score = calculateComponentScore('revenuePerShare', value);
  const scoreColor = getComponentScoreColor(score);

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Revenue/Share"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'revenuePerShare', { value: val })}
        type="number"
        step="0.01"
        suffix="$"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<10', points: -1 },
          { range: '10-25', points: 0 },
          { range: '25-50', points: 1 },
          { range: '50-100', points: 2 },
          { range: '>100', points: 3 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component revenue-per-share-component">
      <div className="component-header">
        <label>Revenue/Share</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('revenuePerShare')}
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
            onChange={(e) => onUpdate(stock.id, 'revenuePerShare', { value: e.target.value })}
            placeholder="0.00"
          />
          <ChangeIndicator currentValue={value} previousValue={previousValue} />
          <span className="input-suffix">$/share</span>
        </div>
      </div>
    </div>
  );
};

export default RevenuePerShareComponent;
