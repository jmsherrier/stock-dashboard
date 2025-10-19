import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function OperatingMarginComponent({ stock, onUpdate, config, onOpenScoringEditor , settings = {} }) {
  const getValue = () => stock.components?.operatingMargin?.value || stock.operatingMargin || '';
  const value = getValue();

  const criteria = stock.components?.operatingMargin?.criteria;
  const score = value ? calculateComponentScore('operatingMargin', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('operatingMargin', value, criteria) : 'neutral';

  // Convert decimal to percentage for display
  const displayValue = value ? (parseFloat(value) * 100).toFixed(2) : '';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Operating Margin"
        value={displayValue}
        onChange={(val) => onUpdate(stock.id, 'operatingMargin', { value: parseFloat(val) / 100 })}
        type="number"
        step="0.1"
        suffix="%"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '0-5', points: -2 },
          { range: '5-10', points: -1 },
          { range: '10-15', points: 1 },
          { range: '15-25', points: 2 },
          { range: '>25', points: 3 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component operating-margin-component">
      <div className="component-header">
        <label>Operating Margin</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('operatingMargin')}
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
            value={displayValue}
            onChange={(e) => {
              // Convert percentage back to decimal for storage
              const percentValue = e.target.value;
              const decimalValue = percentValue ? (parseFloat(percentValue) / 100).toString() : '';
              onUpdate(stock.id, 'operatingMargin', { value: decimalValue });
            }}
            placeholder="0.00"
          />
          <span className="input-suffix">%</span>
        </div>
      </div>
    </div>
  );
}

export default OperatingMarginComponent;

