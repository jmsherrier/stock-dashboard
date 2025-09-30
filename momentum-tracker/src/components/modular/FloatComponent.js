import React, { useEffect } from 'react';
import { calculateComponentScore, getComponentScoreColor } from './ComponentRegistry';
import CriteriaInput from '../CriteriaInput';
import ChangeIndicator from './ChangeIndicator';

function FloatComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  // Get value from modular or legacy format, prioritize actualFloat from API
  const getValue = () => {
    // First check if actualFloat from API exists
    const actualFloat = stock.components?.actualFloat?.value || stock.actualFloat;
    if (actualFloat) {
      // Convert to millions if it's in raw shares
      const val = parseFloat(actualFloat);
      if (val > 1000000) {
        return (val / 1000000).toFixed(2);
      }
      return actualFloat;
    }
    return stock.components?.float?.value || stock.float || '';
  };
  
  const getPreviousValue = () => {
    // Check both actualFloat and float for previous values
    const actualFloatPrev = stock.components?.actualFloat?.previousValue;
    if (actualFloatPrev) {
      const val = parseFloat(actualFloatPrev);
      if (val > 1000000) {
        return (val / 1000000).toFixed(2);
      }
      return actualFloatPrev;
    }
    return stock.components?.float?.previousValue || '';
  };
  
  const value = getValue();
  const previousValue = getPreviousValue();
  
  const criteria = stock.components?.float?.criteria;
  const score = value ? calculateComponentScore('float', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('float', value, criteria) : 'neutral';

  // Auto-calculate float when shares data is available (fallback if no actualFloat)
  useEffect(() => {
    // Skip auto-calculation if we have actualFloat from API
    const actualFloat = stock.components?.actualFloat?.value || stock.actualFloat;
    if (actualFloat) return;
    
    const sharesOutstanding = stock.sharesOutstanding || stock.components?.sharesOutstanding?.value;
    const restrictedShares = stock.restrictedShares || stock.components?.restrictedShares?.value || 0;
    
    const outstanding = parseFloat(sharesOutstanding) || 0;
    const restricted = parseFloat(restrictedShares) || 0;
    
    if (outstanding > 0) {
      const calculatedFloat = (outstanding - restricted) / 1000000; // Convert to millions
      const currentFloat = parseFloat(value) || 0;
      
      if (calculatedFloat > 0 && Math.abs(calculatedFloat - currentFloat) > 0.01) {
        onUpdate(stock.id, 'float', { value: calculatedFloat.toFixed(2) });
      }
    }
  }, [stock.sharesOutstanding, stock.restrictedShares, stock.components?.sharesOutstanding?.value, stock.components?.restrictedShares?.value, stock.components?.actualFloat?.value, stock.actualFloat, value, stock.id, onUpdate]);

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

  return (
    <div className="modular-component float-component">
      <div className="component-header">
        <label>Float</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('float')}
              title="Edit scoring criteria"
            >
              ⚙
            </button>
          )}
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
            readOnly={!!(stock.components?.actualFloat?.value || stock.actualFloat)}
            title={!!(stock.components?.actualFloat?.value || stock.actualFloat) ? "Using actual float from API" : "Enter float in millions"}
          />
          <ChangeIndicator currentValue={value} previousValue={previousValue} reverseColors={true} />
          <span className="input-suffix">M shares</span>
        </div>
      </div>
    </div>
  );
}

export default FloatComponent;