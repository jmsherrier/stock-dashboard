import React from 'react';
import { getComponentScoreColor } from '../ComponentRegistry';

function AnalystTargetComponent({ value, onChange, config, stock }) {
  // Calculate upside potential
  const currentPrice = stock?.components?.price?.value;
  const targetPrice = value;
  
  let upsidePotential = 0;
  if (currentPrice && targetPrice && !isNaN(parseFloat(currentPrice)) && !isNaN(parseFloat(targetPrice))) {
    upsidePotential = ((parseFloat(targetPrice) - parseFloat(currentPrice)) / parseFloat(currentPrice)) * 100;
  }
  
  const scoreColor = getComponentScoreColor('analystTarget', upsidePotential);
  
  const displayValue = targetPrice && !isNaN(parseFloat(targetPrice))
    ? `$${parseFloat(targetPrice).toFixed(2)}`
    : 'N/A';

  return (
    <div className={`component-wrapper analyst-target-component score-${scoreColor}`}>
      <label className="component-label">Analyst Target</label>
      <div className="component-value">
        {displayValue}
        {upsidePotential !== 0 && (
          <span className={`subtext ${upsidePotential > 0 ? 'positive' : 'negative'}`}>
            {' '}({upsidePotential > 0 ? '+' : ''}{upsidePotential.toFixed(1)}%)
          </span>
        )}
      </div>
    </div>
  );
}

export default AnalystTargetComponent;
