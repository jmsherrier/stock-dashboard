import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function ProfitMarginComponent({ stock, onUpdate, config }) {
  const getValue = () => stock.components?.profitMargin?.value || stock.profitMargin || '';
  const value = getValue();

  const score = value ? calculateComponentScore('profitMargin', value) : 0;
  const scoreColor = value ? getComponentScoreColor('profitMargin', value) : 'neutral';
  
  // Convert decimal to percentage (Alpha Vantage returns as decimal)
  const displayValue = value ? (parseFloat(value) * 100).toFixed(2) : '';

  // Check if we're in criteria grid mode
  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Profit Margin"
        value={displayValue}
        onChange={(val) => onUpdate(stock.id, 'profitMargin', { value: parseFloat(val) / 100 })}
        type="number"
        step="0.1"
        suffix="%"
        currentPoints={score}
        scale={[
          { range: '<-10', points: -3 },
          { range: '-10-0', points: -1 },
          { range: '0-5', points: 0 },
          { range: '5-10', points: 1 },
          { range: '10-20', points: 2 },
          { range: '>20', points: 3 }
        ]}
      />
    );
  }

  return (
    <div className={`component-wrapper profit-margin-component score-${scoreColor}`}>
      <label className="component-label">Profit Margin</label>
      <div className="component-value">
        {displayValue ? `${displayValue}%` : 'N/A'}
      </div>
    </div>
  );
}

export default ProfitMarginComponent;
