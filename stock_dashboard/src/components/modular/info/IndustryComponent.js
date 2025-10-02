import React from 'react';

function IndustryComponent({ stock, onUpdate, config }) {
  // Get value from modular format
  const value = stock.components?.industry?.value || '';
  
  // Get points for this industry if configured (categorical scoring)
  const points = config?.criteria?.categories?.[value] || 0;
  const showPoints = points !== 0;

  return (
    <div className="criteria-input categorical-criteria">
      <div className="criteria-header">
        <label>
          Industry
          {showPoints && (
            <span className={`component-points ${points > 0 ? 'positive' : 'negative'}`}>
              {points > 0 ? '+' : ''}{points} pts
            </span>
          )}
        </label>
      </div>
      <div className="component-value">
        {value || 'N/A'}
      </div>
    </div>
  );
}

export default IndustryComponent;
