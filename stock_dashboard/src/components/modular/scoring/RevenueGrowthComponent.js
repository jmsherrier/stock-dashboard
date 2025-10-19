import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function RevenueGrowthComponent({ stock, onUpdate, config , settings = {} }) {
  const getValue = () => stock.components?.revenueGrowth?.value || stock.revenueGrowth || '';
  const value = getValue();

  const score = value ? calculateComponentScore('revenueGrowth', value) : 0;
  const scoreColor = value ? getComponentScoreColor('revenueGrowth', value) : 'neutral';
  
  // Convert decimal to percentage (Alpha Vantage returns as decimal)
  const displayValue = value ? (parseFloat(value) * 100).toFixed(2) : '';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Revenue Growth"
        value={displayValue}
        onChange={(val) => onUpdate(stock.id, 'revenueGrowth', { value: parseFloat(val) / 100 })}
        type="number"
        step="1"
        suffix="%"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<0', points: -2 },
          { range: '0-10', points: 0 },
          { range: '10-25', points: 1 },
          { range: '25-50', points: 2 },
          { range: '>50', points: 3 }
        ]}
      />
    );
  }

  return (
    <div className={`component-wrapper revenue-growth-component score-${scoreColor}`}>
      <label className="component-label">Revenue Growth (YoY)</label>
      <div className="component-value">
        {displayValue ? `${displayValue}%` : 'N/A'}
      </div>
    </div>
  );
}

export default RevenueGrowthComponent;

