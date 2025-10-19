import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function BookValueComponent({ stock, onUpdate, config, onOpenScoringEditor , settings = {} }) {
  const getValue = () => stock.components?.bookValue?.value || stock.bookValue || '';
  const value = getValue();

  const criteria = stock.components?.bookValue?.criteria;
  const score = value ? calculateComponentScore('bookValue', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('bookValue', value, criteria) : 'neutral';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Book Value"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'bookValue', { value: val })}
        type="number"
        step="0.01"
        suffix="$"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<5', points: -2 },
          { range: '5-15', points: -1 },
          { range: '15-30', points: 1 },
          { range: '30-50', points: 2 },
          { range: '>50', points: 3 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component book-value-component">
      <div className="component-header">
        <label>Book Value</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('bookValue')}
              title="Edit scoring criteria"
            >
              ⚙
            </button>
          )}
        </div>
      </div>
      <div className="component-content">
        <div className="input-wrapper">
          <span className="input-prefix">$</span>
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onUpdate(stock.id, 'bookValue', { value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}

export default BookValueComponent;

