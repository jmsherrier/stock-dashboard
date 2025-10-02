import React from 'react';
import { getComponentScoreColor } from '../ComponentRegistry';

function MovingAverage50Component({ value, onChange, config, stock }) {
  // Calculate % above/below MA
  const currentPrice = stock?.components?.price?.value;
  const ma50 = value;
  
  let percentDiff = 0;
  if (currentPrice && ma50 && !isNaN(parseFloat(currentPrice)) && !isNaN(parseFloat(ma50))) {
    percentDiff = ((parseFloat(currentPrice) - parseFloat(ma50)) / parseFloat(ma50)) * 100;
  }
  
  const scoreColor = getComponentScoreColor('movingAverage50', percentDiff);
  
  const displayValue = ma50 && !isNaN(parseFloat(ma50))
    ? `$${parseFloat(ma50).toFixed(2)}`
    : 'N/A';

  return (
    <div className={`component-wrapper ma50-component score-${scoreColor}`}>
      <label className="component-label">50-Day MA</label>
      <div className="component-value">
        {displayValue}
        {percentDiff !== 0 && (
          <span className={`subtext ${percentDiff > 0 ? 'positive' : 'negative'}`}>
            {' '}({percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%)
          </span>
        )}
      </div>
    </div>
  );
}

export default MovingAverage50Component;
