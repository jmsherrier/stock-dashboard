import React from 'react';
import { getComponentScoreColor } from '../ComponentRegistry';

function Week52HighComponent({ value, onChange, config, stock }) {
  // Calculate % of 52-week high
  const currentPrice = stock?.components?.price?.value;
  const week52High = value;
  
  let percentOfHigh = 0;
  if (currentPrice && week52High && !isNaN(parseFloat(currentPrice)) && !isNaN(parseFloat(week52High))) {
    percentOfHigh = (parseFloat(currentPrice) / parseFloat(week52High)) * 100;
  }
  
  const scoreColor = getComponentScoreColor('week52High', percentOfHigh);
  
  const displayValue = week52High && !isNaN(parseFloat(week52High))
    ? `$${parseFloat(week52High).toFixed(2)}`
    : 'N/A';

  return (
    <div className={`component-wrapper week52high-component score-${scoreColor}`}>
      <label className="component-label">52-Week High</label>
      <div className="component-value">
        {displayValue}
        {percentOfHigh > 0 && (
          <span className="subtext"> ({percentOfHigh.toFixed(1)}%)</span>
        )}
      </div>
    </div>
  );
}

export default Week52HighComponent;
