import React from 'react';
import ScaleBar from './ScaleBar';

function CriteriaInput({ label, value, onChange, type = 'text', step, warning, scale, currentPoints, suffix = '' }) {
  const getPointsColor = (points) => {
    if (points >= 2) return '#22c55e'; // green
    if (points >= 1) return '#84cc16'; // light green
    if (points >= 0) return '#666'; // neutral
    if (points >= -1) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="criteria-input">
      <div className="criteria-header">
        <label>{label}</label>
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
          className={warning ? 'warning' : ''}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {warning && <div className="warning-indicator">⚠ {warning}</div>}
      {scale && <ScaleBar currentPoints={currentPoints} scale={scale} />}
    </div>
  );
}

export default CriteriaInput;
