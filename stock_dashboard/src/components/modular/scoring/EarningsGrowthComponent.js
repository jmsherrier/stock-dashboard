import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function EarningsGrowthComponent({ stock, onUpdate, config, onOpenScoringEditor , settings = {} }) {
  const getValue = () => stock.components?.earningsGrowth?.value || stock.earningsGrowth || '';
  const value = getValue();

  const criteria = stock.components?.earningsGrowth?.criteria;
  const score = value ? calculateComponentScore('earningsGrowth', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('earningsGrowth', value, criteria) : 'neutral';

  // Convert decimal to percentage for display
  const displayValue = value ? (parseFloat(value) * 100).toFixed(2) : '';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Earnings Growth"
        value={displayValue}
        onChange={(val) => onUpdate(stock.id, 'earningsGrowth', { value: parseFloat(val) / 100 })}
        type="number"
        step="1"
        suffix="%"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<-10', points: -3 },
          { range: '-10-0', points: -1 },
          { range: '0-10', points: 1 },
          { range: '10-25', points: 2 },
          { range: '>25', points: 3 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component earnings-growth-component">
      <div className="component-header">
        <label>Earnings Growth (QoQ)</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('earningsGrowth')}
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
              onUpdate(stock.id, 'earningsGrowth', { value: decimalValue });
            }}
            placeholder="0.00"
          />
          <span className="input-suffix">%</span>
        </div>
      </div>
    </div>
  );
}

export default EarningsGrowthComponent;

