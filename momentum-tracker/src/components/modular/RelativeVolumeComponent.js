import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from './ComponentRegistry';
import CriteriaInput from '../CriteriaInput';

function RelativeVolumeComponent({ stock, onUpdate, config }) {
  // Get value from modular or legacy format
  const getValue = () => stock.components?.relativeVolume?.value || stock.relativeVolume || '';
  const value = getValue();
  
  const score = calculateComponentScore('relativeVolume', value);
  const scoreColor = getComponentScoreColor('relativeVolume', value);

  const getWarning = (value) => {
    const val = parseFloat(value) || 0;
    if (!value || val === 0) return null;
    if (val < 5) return 'Below 5x minimum';
    return null;
  };

  const getScorePoints = (value) => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return 0;
    }
    
    const val = parseFloat(value);
    if (isNaN(val)) return 0;
    
    if (val < 2) return -3;
    if (val < 3) return -2;
    if (val < 5) return -1;
    if (val < 8) return 1;
    if (val < 12) return 2;
    return 3;
  };

  const relativeVolumeScale = [
    { range: '<2', points: -3 },
    { range: '2-3', points: -2 },
    { range: '3-5', points: -1 },
    { range: '5-8', points: 1 },
    { range: '8-12', points: 2 },
    { range: '12+', points: 3 }
  ];

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    // Use original CriteriaInput format
    return (
      <CriteriaInput
        label="Relative Volume"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'relativeVolume', { value: val })}
        type="number"
        step="0.1"
        suffix="x"
        currentPoints={getScorePoints(value)}
        warning={getWarning(value)}
        scale={relativeVolumeScale}
      />
    );
  }

  // Full modular component mode
  return (
    <div className="modular-component relative-volume-component">
      <div className="component-header">
        <label>Rel. Volume</label>
        <div className={`component-score score-${scoreColor}`}>
          {score > 0 ? '+' : ''}{score} pts
        </div>
      </div>
      <div className="component-content">
        <div className="input-wrapper">
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => onUpdate(stock.id, 'relativeVolume', { value: e.target.value })}
            placeholder="0.0"
          />
          <span className="input-suffix">x</span>
        </div>
        {getWarning(value) && (
          <div className="component-warning">
            {getWarning(value)}
          </div>
        )}
      </div>
    </div>
  );
}

export default RelativeVolumeComponent;