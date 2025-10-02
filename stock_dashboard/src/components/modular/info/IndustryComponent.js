import React from 'react';

function IndustryComponent({ value, onChange, config }) {
  // Get points for this industry if configured
  const points = config?.criteria?.categories?.[value] || 0;
  const showPoints = points !== 0;

  return (
    <div className="component-wrapper industry-component">
      <label className="component-label">
        Industry
        {showPoints && (
          <span className={`component-points ${points > 0 ? 'positive' : 'negative'}`}>
            {points > 0 ? '+' : ''}{points} pts
          </span>
        )}
      </label>
      <div className="component-value">
        {value || 'N/A'}
      </div>
    </div>
  );
}

export default IndustryComponent;
