import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function MovingAverage200Component({ stock, onUpdate, config , settings = {} }) {
  const getValue = () => stock.components?.movingAverage200?.value || stock.movingAverage200 || '';
  const value = getValue();

  // Calculate % above/below MA
  const currentPrice = stock?.components?.price?.value || stock?.price;
  const ma200 = value;
  
  let percentDiff = 0;
  if (currentPrice && ma200 && !isNaN(parseFloat(currentPrice)) && !isNaN(parseFloat(ma200))) {
    percentDiff = ((parseFloat(currentPrice) - parseFloat(ma200)) / parseFloat(ma200)) * 100;
  }
  
  const score = percentDiff ? calculateComponentScore('movingAverage200', percentDiff) : 0;
  const scoreColor = percentDiff ? getComponentScoreColor('movingAverage200', percentDiff) : 'neutral';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="200-Day MA"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'movingAverage200', { value: val })}
        type="number"
        step="0.01"
        suffix="$"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<-15%', points: -3 },
          { range: '-15 to -10%', points: -2 },
          { range: '-10 to 0%', points: -1 },
          { range: '0-3%', points: 0 },
          { range: '3-8%', points: 1 },
          { range: '8-15%', points: 2 },
          { range: '>15%', points: 3 }
        ]}
      />
    );
  }
  
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

