import React from 'react';
import { getComponentScoreColor } from '../ComponentRegistry';

function RevenueGrowthComponent({ value, onChange, config }) {
  const scoreColor = getComponentScoreColor('revenueGrowth', value);
  
  // Convert decimal to percentage (Alpha Vantage returns as decimal)
  const displayValue = value && !isNaN(parseFloat(value))
    ? `${(parseFloat(value) * 100).toFixed(2)}%`
    : 'N/A';

  return (
    <div className={`component-wrapper revenue-growth-component score-${scoreColor}`}>
      <label className="component-label">Revenue Growth (YoY)</label>
      <div className="component-value">
        {displayValue}
      </div>
    </div>
  );
}

export default RevenueGrowthComponent;
