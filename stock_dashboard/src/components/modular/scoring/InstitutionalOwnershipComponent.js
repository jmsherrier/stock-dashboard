import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function InstitutionalOwnershipComponent({ stock, onUpdate, config, onOpenScoringEditor , settings = {} }) {
  const getValue = () => stock.components?.institutionalOwnership?.value || stock.institutionalOwnership || '';
  const value = getValue();

  const criteria = stock.components?.institutionalOwnership?.criteria;
  const score = value ? calculateComponentScore('institutionalOwnership', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('institutionalOwnership', value, criteria) : 'neutral';

  // Convert decimal to percentage for display
  const displayValue = value ? (parseFloat(value) * 100).toFixed(2) : '';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Institutional %"
        value={displayValue}
        onChange={(val) => onUpdate(stock.id, 'institutionalOwnership', { value: parseFloat(val) / 100 })}
        type="number"
        step="1"
        suffix="%"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '0-20', points: -1 },
          { range: '20-40', points: 0 },
          { range: '40-60', points: 1 },
          { range: '60-80', points: 2 },
          { range: '>80', points: 1 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component institutional-ownership-component">
      <div className="component-header">
        <label>Institutional Ownership</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('institutionalOwnership')}
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
              onUpdate(stock.id, 'institutionalOwnership', { value: decimalValue });
            }}
            placeholder="0.00"
          />
          <span className="input-suffix">%</span>
        </div>
      </div>
    </div>
  );
}

export default InstitutionalOwnershipComponent;

