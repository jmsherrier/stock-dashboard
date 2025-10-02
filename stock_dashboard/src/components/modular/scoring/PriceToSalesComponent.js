import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function PriceToSalesComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.priceToSales?.value || stock.priceToSales || '';
  const value = getValue();

  const criteria = stock.components?.priceToSales?.criteria;
  const score = value ? calculateComponentScore('priceToSales', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('priceToSales', value, criteria) : 'neutral';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Price-to-Sales"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'priceToSales', { value: val })}
        type="number"
        step="0.1"
        currentPoints={score}
        scale={[
          { range: '<1', points: 3 },
          { range: '1-2', points: 2 },
          { range: '2-4', points: 1 },
          { range: '4-7', points: -1 },
          { range: '>7', points: -2 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component price-to-sales-component">
      <div className="component-header">
        <label>Price-to-Sales</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('priceToSales')}
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
            onChange={(e) => onUpdate(stock.id, 'priceToSales', { value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}

export default PriceToSalesComponent;
