import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function ROAComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.roa?.value || stock.roa || '';
  const value = getValue();

  const criteria = stock.components?.roa?.criteria;
  const score = value ? calculateComponentScore('roa', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('roa', value, criteria) : 'neutral';

  // Convert decimal to percentage for display
  const displayValue = value ? (parseFloat(value) * 100).toFixed(2) : '';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="ROA"
        value={displayValue}
        onChange={(val) => onUpdate(stock.id, 'roa', { value: parseFloat(val) / 100 })}
        type="number"
        step="0.1"
        suffix="%"
        currentPoints={score}
        scale={[
          { range: '<0', points: -3 },
          { range: '0-2', points: -2 },
          { range: '2-5', points: -1 },
          { range: '5-8', points: 1 },
          { range: '8-12', points: 2 },
          { range: '>12', points: 3 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component roa-component">
      <div className="component-header">
        <label>Return on Assets</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('roa')}
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
              onUpdate(stock.id, 'roa', { value: decimalValue });
            }}
            placeholder="0.00"
          />
          <span className="input-suffix">%</span>
        </div>
      </div>
    </div>
  );
}

export default ROAComponent;
