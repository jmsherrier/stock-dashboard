import React from 'react';
import { getComponentScoreColor } from '../ComponentRegistry';

function MovingAverage200Component({ value, onChange, config, stock }) {
  // Calculate % above/below MA
  const currentPrice = stock?.components?.price?.value;
  const ma200 = value;
  
  let percentDiff = 0;
  if (currentPrice && ma200 && !isNaN(parseFloat(currentPrice)) && !isNaN(parseFloat(ma200))) {
    percentDiff = ((parseFloat(currentPrice) - parseFloat(ma200)) / parseFloat(ma200)) * 100;
  }
  
  const scoreColor = getComponentScoreColor('movingAverage200', percentDiff);
  
  const displayValue = ma200 && !isNaN(parseFloat(ma200))
    ? `$${parseFloat(ma200).toFixed(2)}`
    : 'N/A';

  return (
    <div className={`component-wrapper ma200-component score-${scoreColor}`}>
      <label className="component-label">200-Day MA</label>
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

export default MovingAverage200Component;
