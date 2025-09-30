import React from 'react';

function SectorComponent({ value, onChange, config }) {
  // Get points for this sector if configured
  const points = config?.criteria?.categories?.[value] || 0;
  const showPoints = points !== 0;

  return (
    <div className="component-wrapper sector-component">
      <label className="component-label">
        Sector
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

export default SectorComponent;
