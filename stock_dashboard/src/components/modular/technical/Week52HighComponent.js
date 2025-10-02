import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function Week52HighComponent({ stock, onUpdate, config }) {
  const getValue = () => stock.components?.week52High?.value || stock.week52High || '';
  const value = getValue();

  // Calculate % of 52-week high
  const currentPrice = stock?.components?.price?.value || stock?.price;
  const week52High = value;
  
  let percentOfHigh = 0;
  if (currentPrice && week52High && !isNaN(parseFloat(currentPrice)) && !isNaN(parseFloat(week52High))) {
    percentOfHigh = (parseFloat(currentPrice) / parseFloat(week52High)) * 100;
  }
  
  const score = percentOfHigh ? calculateComponentScore('week52High', percentOfHigh) : 0;
  const scoreColor = percentOfHigh ? getComponentScoreColor('week52High', percentOfHigh) : 'neutral';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="52-Wk High"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'week52High', { value: val })}
        type="number"
        step="0.01"
        suffix="$"
        currentPoints={score}
        scale={[
          { range: '<70%', points: -2 },
          { range: '70-80%', points: -1 },
          { range: '80-90%', points: 0 },
          { range: '90-95%', points: 1 },
          { range: '95-100%', points: 2 },
          { range: '100%+', points: 3 }
        ]}
      />
    );
  }
  
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
