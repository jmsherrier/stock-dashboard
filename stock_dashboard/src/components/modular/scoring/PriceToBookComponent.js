import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function PriceToBookComponent({ stock, onUpdate, config, onOpenScoringEditor , settings = {} }) {
  const getValue = () => stock.components?.priceToBook?.value || stock.priceToBook || '';
  const value = getValue();

  const criteria = stock.components?.priceToBook?.criteria;
  const score = value ? calculateComponentScore('priceToBook', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('priceToBook', value, criteria) : 'neutral';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Price-to-Book"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'priceToBook', { value: val })}
        type="number"
        step="0.1"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<1', points: 3 },
          { range: '1-2', points: 2 },
          { range: '2-3', points: 1 },
          { range: '3-5', points: -1 },
          { range: '>5', points: -2 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component price-to-book-component">
      <div className="component-header">
        <label>Price-to-Book</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('priceToBook')}
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
            onChange={(e) => onUpdate(stock.id, 'priceToBook', { value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}

export default PriceToBookComponent;

