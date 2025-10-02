import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';
import ChangeIndicator from '../technical/ChangeIndicator';

function PercentRiseComponent({ stock, onUpdate, config }) {
  // Get value from modular or legacy format
  const getValue = () => stock.components?.percentRise?.value || stock.percentRise || '';
  const getPreviousValue = () => stock.components?.percentRise?.previousValue || '';
  const value = getValue();
  const previousValue = getPreviousValue();
  
  const score = calculateComponentScore('percentRise', value);
  const scoreColor = getComponentScoreColor('percentRise', value);

  const getWarning = (value) => {
    const val = parseFloat(value) || 0;
    if (!value || val === 0) return null;
    if (val < 7) return 'Below 7% minimum';
    return null;
  };

  const getScorePoints = (value) => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return 0;
    }
    
    const val = parseFloat(value);
    if (isNaN(val)) return 0;
    
    if (val < 3) return -3;
    if (val < 5) return -2;
    if (val < 7) return -1;
    if (val < 10) return 1;
    if (val < 15) return 2;
    return 3;
  };

  const percentRiseScale = [
    { range: '<3', points: -3 },
    { range: '3-5', points: -2 },
    { range: '5-7', points: -1 },
    { range: '7-10', points: 1 },
    { range: '10-15', points: 2 },
    { range: '15+', points: 3 }
  ];

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    // Use original CriteriaInput format
    return (
      <CriteriaInput
        label="Percent Risen"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'percentRise', { value: val })}
        type="number"
        step="0.01"
        suffix="%"
        currentPoints={getScorePoints(value)}
        warning={getWarning(value)}
        scale={percentRiseScale}
      />
    );
  }

  // Full modular component mode
  return (
    <div className="modular-component percent-rise-component">
      <div className="component-header">
        <label>% Rise</label>
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
            onChange={(e) => onUpdate(stock.id, 'percentRise', { value: e.target.value })}
            placeholder="0.0"
          />
          <ChangeIndicator currentValue={value} previousValue={previousValue} />
          <span className="input-suffix">%</span>
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

export default PercentRiseComponent;