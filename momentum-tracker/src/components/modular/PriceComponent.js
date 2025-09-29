import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from './ComponentRegistry';
import CriteriaInput from '../CriteriaInput';

function PriceComponent({ stock, onUpdate, config }) {
  // Get value from modular or legacy format
  const getValue = () => stock.components?.price?.value || stock.price || '';
  const value = getValue();
  
  const score = calculateComponentScore('price', value);
  const scoreColor = getComponentScoreColor('price', value);

  const getWarning = (value) => {
    const val = parseFloat(value) || 0;
    if (!value || val === 0) return null;
    if (val < 2 || val > 20) return 'Outside $2-20 range';
    return null;
  };

  const getScorePoints = (value) => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return 0;
    }
    
    const val = parseFloat(value);
    if (isNaN(val)) return 0;
    
    if (val >= 15) return -3;
    if (val >= 10) return -2;
    if (val >= 8) return -1;
    if (val >= 5) return 1;
    if (val >= 3) return 2;
    if (val >= 2) return 3;
    return 0;
  };

  const priceScale = [
    { range: '15-20', points: -3 },
    { range: '10-15', points: -2 },
    { range: '8-10', points: -1 },
    { range: '5-8', points: 1 },
    { range: '3-5', points: 2 },
    { range: '2-3', points: 3 }
  ];

  // Check if we're being used in criteria grid mode (config indicates it)
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    // Use original CriteriaInput format
    return (
      <CriteriaInput
        label="Price"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'price', { value: val })}
        type="number"
        step="0.01"
        suffix="$"
        currentPoints={getScorePoints(value)}
        warning={getWarning(value)}
        scale={priceScale}
      />
    );
  }

  // Full modular component mode
  return (
    <div className="modular-component price-component">
      <div className="component-header">
        <label>Price</label>
        <div className={`component-score score-${scoreColor}`}>
          {score > 0 ? '+' : ''}{score} pts
        </div>
      </div>
      <div className="component-content">
        <div className="input-wrapper">
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onUpdate(stock.id, 'price', { value: e.target.value })}
            placeholder="0.00"
          />
          <span className="input-suffix">$</span>
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

export default PriceComponent;