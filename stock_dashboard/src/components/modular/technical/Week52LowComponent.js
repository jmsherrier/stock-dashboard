import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

const Week52LowComponent = ({ stock, onUpdate, config }) => {
  const getValue = () => stock.components?.week52Low?.value || stock.week52Low || '';
  const value = getValue();

  const currentPrice = parseFloat(stock.components?.price?.value || stock?.price || 0);
  const week52Low = parseFloat(value || 0);
  
  // Calculate percentage above 52-week low
  let percentAboveLow = 0;
  if (week52Low > 0 && currentPrice > 0) {
    percentAboveLow = ((currentPrice - week52Low) / week52Low) * 100;
  }

  const score = percentAboveLow ? calculateComponentScore('week52Low', percentAboveLow) : 0;
  const scoreColor = percentAboveLow ? getComponentScoreColor('week52Low', percentAboveLow) : 'neutral';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="52-Wk Low"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'week52Low', { value: val })}
        type="number"
        step="0.01"
        suffix="$"
        currentPoints={score}
        scale={[
          { range: '<5%', points: -3 },
          { range: '5-10%', points: -2 },
          { range: '10-20%', points: -1 },
          { range: '20-30%', points: 0 },
          { range: '30-50%', points: 1 },
          { range: '50-100%', points: 2 },
          { range: '>100%', points: 3 }
        ]}
      />
    );
  }

  const displayValue = week52Low && !isNaN(week52Low)
    ? `$${week52Low.toFixed(2)}`
    : 'N/A';

  return (
    <div className={`component-wrapper week52low-component score-${scoreColor}`}>
      <label className="component-label">52-Week Low</label>
      <div className="component-value">
        {displayValue}
        {percentAboveLow > 0 && (
          <span className="subtext positive"> (+{percentAboveLow.toFixed(1)}%)</span>
        )}
      </div>
    </div>
  );
};

export default Week52LowComponent;