import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function MovingAverage50Component({ stock, onUpdate, config , settings = {} }) {
  const getValue = () => stock.components?.movingAverage50?.value || stock.movingAverage50 || '';
  const value = getValue();

  // Calculate % above/below MA
  const currentPrice = stock?.components?.price?.value || stock?.price;
  const ma50 = value;
  
  let percentDiff = 0;
  if (currentPrice && ma50 && !isNaN(parseFloat(currentPrice)) && !isNaN(parseFloat(ma50))) {
    percentDiff = ((parseFloat(currentPrice) - parseFloat(ma50)) / parseFloat(ma50)) * 100;
  }
  
  const score = percentDiff ? calculateComponentScore('movingAverage50', percentDiff) : 0;
  const scoreColor = percentDiff ? getComponentScoreColor('movingAverage50', percentDiff) : 'neutral';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="50-Day MA"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'movingAverage50', { value: val })}
        type="number"
        step="0.01"
        suffix="$"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<-10%', points: -3 },
          { range: '-10 to -5%', points: -2 },
          { range: '-5 to 0%', points: -1 },
          { range: '0-2%', points: 0 },
          { range: '2-5%', points: 1 },
          { range: '5-10%', points: 2 },
          { range: '>10%', points: 3 }
        ]}
      />
    );
  }
  
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

