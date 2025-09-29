import React, { useEffect } from 'react';
import { calculateComponentScore, getComponentScoreColor } from './ComponentRegistry';
import CriteriaInput from '../CriteriaInput';

function FloatComponent({ stock, onUpdate, config }) {
  // Get value from modular or legacy format
  const getValue = () => stock.components?.float?.value || stock.float || '';
  const value = getValue();
  
  const score = calculateComponentScore('float', value);
  const scoreColor = getComponentScoreColor('float', value);

  // Auto-calculate float when shares data is available
  useEffect(() => {
    const sharesOutstanding = stock.sharesOutstanding || stock.components?.sharesOutstanding?.value;
    const restrictedShares = stock.restrictedShares || stock.components?.restrictedShares?.value || 0;
    
    console.log('FloatComponent useEffect - sharesOutstanding:', sharesOutstanding, 'restrictedShares:', restrictedShares, 'currentFloat:', value);
    
    const outstanding = parseFloat(sharesOutstanding) || 0;
    const restricted = parseFloat(restrictedShares) || 0;
    
    if (outstanding > 0) {
      const calculatedFloat = (outstanding - restricted) / 1000000; // Convert to millions
      const currentFloat = parseFloat(value) || 0;
      
      console.log('FloatComponent calculation - calculated:', calculatedFloat, 'current:', currentFloat, 'diff:', Math.abs(calculatedFloat - currentFloat));
      
      if (calculatedFloat > 0 && Math.abs(calculatedFloat - currentFloat) > 0.01) {
        console.log('FloatComponent updating float to:', calculatedFloat.toFixed(2));
        onUpdate(stock.id, 'float', { value: calculatedFloat.toFixed(2) });
      }
    }
  }, [stock.sharesOutstanding, stock.restrictedShares, stock.components?.sharesOutstanding?.value, stock.components?.restrictedShares?.value, value, stock.id, onUpdate]);

  const getWarning = (value) => {
    const val = parseFloat(value) || 0;
    if (!value || val === 0) return null;
    if (val > 20) return 'Above 20M limit';
    return null;
  };

  const getScorePoints = (value) => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return 0;
    }
    
    const val = parseFloat(value);
    if (isNaN(val)) return 0;
    
    if (val > 50) return -3;
    if (val > 30) return -2;
    if (val > 20) return -1;
    if (val > 15) return 1;
    if (val > 10) return 2;
    return 3;
  };

  const floatScale = [
    { range: '>50', points: -3 },
    { range: '30-50', points: -2 },
    { range: '20-30', points: -1 },
    { range: '15-20', points: 1 },
    { range: '10-15', points: 2 },
    { range: '<10', points: 3 }
  ];

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    // Use original CriteriaInput format (without manualOnly to avoid showing "manual" indicator)
    return (
      <CriteriaInput
        label="Float"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'float', { value: val })}
        type="number"
        step="0.1"
        suffix="M"
        currentPoints={getScorePoints(value)}
        warning={getWarning(value)}
        scale={floatScale}
      />
    );
  }

  // Full modular component mode
  const components = stock.components || {};
  const sharesOutstanding = components.sharesOutstanding?.value || '';
  const isAutoCalculated = sharesOutstanding && parseFloat(sharesOutstanding) > 0;

  return (
    <div className="modular-component float-component">
      <div className="component-header">
        <label>
          Float
          {!isAutoCalculated && (
            <span className="manual-only-indicator" title="Manual entry - provide shares outstanding for auto-calculation"> (manual)</span>
          )}
          {isAutoCalculated && (
            <span className="auto-calculated-indicator" title="Auto-calculated from shares outstanding minus restricted shares"> (auto)</span>
          )}
        </label>
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
            onChange={(e) => onUpdate(stock.id, 'float', { value: e.target.value })}
            placeholder="0.0"
            disabled={isAutoCalculated}
          />
          <span className="input-suffix">M</span>
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

export default FloatComponent;