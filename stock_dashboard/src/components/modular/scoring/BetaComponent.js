import React from 'react';
import { getComponentScoreColor } from '../ComponentRegistry';

function BetaComponent({ value, onChange, config }) {
  const scoreColor = getComponentScoreColor('beta', value);
  
  const displayValue = value && !isNaN(parseFloat(value)) 
    ? parseFloat(value).toFixed(2) 
    : 'N/A';

  return (
    <div className={`component-wrapper beta-component score-${scoreColor}`}>
      <label className="component-label">Beta</label>
      <div className="component-value">
        {displayValue}
      </div>
    </div>
  );
}

export default BetaComponent;
