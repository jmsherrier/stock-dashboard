import React from 'react';
import { getComponentScoreColor } from '../ComponentRegistry';

function ProfitMarginComponent({ value, onChange, config }) {
  const scoreColor = getComponentScoreColor('profitMargin', value);
  
  // Convert decimal to percentage (Alpha Vantage returns as decimal)
  const displayValue = value && !isNaN(parseFloat(value))
    ? `${(parseFloat(value) * 100).toFixed(2)}%`
    : 'N/A';

  return (
    <div className={`component-wrapper profit-margin-component score-${scoreColor}`}>
      <label className="component-label">Profit Margin</label>
      <div className="component-value">
        {displayValue}
      </div>
    </div>
  );
}

export default ProfitMarginComponent;
