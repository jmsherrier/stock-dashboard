import React from 'react';
import ScaleBar from './ScaleBar';

function CriteriaInput({ label, value, onChange, type = 'text', step, warning, scale, currentPoints, suffix = '', manualOnly = false }) {
  const getPointsColor = (points) => {
    if (points > 0) return '#22c55e'; // green for positive values (+1, +2, +3)
    if (points < 0) return '#ef4444'; // red for negative values (-1, -2, -3)
    return '#666'; // neutral for 0 (though 0 doesn't exist in current scales)
  };

  return (
    <div className="criteria-input">
      <div className="criteria-header">
        <label>
          {label}
          {manualOnly && <span className="manual-only-indicator" title="Manual entry only - not updated automatically"> (manual)</span>}
        </label>
        <div className="points-display" style={{ color: getPointsColor(currentPoints) }}>
          {currentPoints > 0 ? '+' : ''}{currentPoints} pts
        </div>
      </div>
      <div className="input-wrapper">
        <input
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {scale && <ScaleBar currentPoints={currentPoints} scale={scale} />}
    </div>
  );
}

export default CriteriaInput;
