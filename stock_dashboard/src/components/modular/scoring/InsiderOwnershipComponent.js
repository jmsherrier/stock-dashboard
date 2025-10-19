import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function InsiderOwnershipComponent({ stock, onUpdate, config, onOpenScoringEditor , settings = {} }) {
  const getValue = () => stock.components?.insiderOwnership?.value || stock.insiderOwnership || '';
  const value = getValue();

  const criteria = stock.components?.insiderOwnership?.criteria;
  const score = value ? calculateComponentScore('insiderOwnership', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('insiderOwnership', value, criteria) : 'neutral';

  // Convert decimal to percentage for display
  const displayValue = value ? (parseFloat(value) * 100).toFixed(2) : '';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Insider %"
        value={displayValue}
        onChange={(val) => onUpdate(stock.id, 'insiderOwnership', { value: parseFloat(val) / 100 })}
        type="number"
        step="1"
        suffix="%"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '0-5', points: -1 },
          { range: '5-10', points: 1 },
          { range: '10-20', points: 2 },
          { range: '20-40', points: 3 },
          { range: '>40', points: 1 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component insider-ownership-component">
      <div className="component-header">
        <label>Insider Ownership</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('insiderOwnership')}
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
              onUpdate(stock.id, 'insiderOwnership', { value: decimalValue });
            }}
            placeholder="0.00"
          />
          <span className="input-suffix">%</span>
        </div>
      </div>
    </div>
  );
}

export default InsiderOwnershipComponent;

