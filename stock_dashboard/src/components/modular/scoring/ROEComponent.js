import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import ChangeIndicator from '../technical/ChangeIndicator';

function ROEComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.roe?.value || stock.roe || '';
  const getPreviousValue = () => stock.components?.roe?.previousValue || '';
  const value = getValue();
  const previousValue = getPreviousValue();

  const criteria = stock.components?.roe?.criteria;
  const score = value ? calculateComponentScore('roe', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('roe', value, criteria) : 'neutral';

  // Convert decimal to percentage for display
  const displayValue = value ? (parseFloat(value) * 100).toFixed(2) : '';
  const displayPreviousValue = previousValue ? (parseFloat(previousValue) * 100).toFixed(2) : '';

  return (
    <div className="modular-component roe-component">
      <div className="component-header">
        <label>Return on Equity</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('roe')}
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
            step="0.01"
            value={displayValue}
            onChange={(e) => {
              // Convert percentage back to decimal for storage
              const percentValue = e.target.value;
              const decimalValue = percentValue ? (parseFloat(percentValue) / 100).toString() : '';
              onUpdate(stock.id, 'roe', { value: decimalValue });
            }}
            placeholder="0.00"
          />
          <ChangeIndicator currentValue={displayValue} previousValue={displayPreviousValue} />
          <span className="input-suffix">%</span>
        </div>
      </div>
    </div>
  );
}

export default ROEComponent;
