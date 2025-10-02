import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import ChangeIndicator from '../technical/ChangeIndicator';

function PEGRatioComponent({ stock, onUpdate, config, onOpenScoringEditor }) {
  const getValue = () => stock.components?.pegRatio?.value || stock.pegRatio || '';
  const getPreviousValue = () => stock.components?.pegRatio?.previousValue || '';
  const value = getValue();
  const previousValue = getPreviousValue();

  const criteria = stock.components?.pegRatio?.criteria;
  const score = value ? calculateComponentScore('pegRatio', value, criteria) : 0;
  const scoreColor = value ? getComponentScoreColor('pegRatio', value, criteria) : 'neutral';

  return (
    <div className="modular-component peg-ratio-component">
      <div className="component-header">
        <label>PEG Ratio</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('pegRatio')}
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
            value={value}
            onChange={(e) => onUpdate(stock.id, 'pegRatio', { value: e.target.value })}
            placeholder="0.00"
          />
          <ChangeIndicator currentValue={value} previousValue={previousValue} reverseColors={true} />
        </div>
      </div>
    </div>
  );
}

export default PEGRatioComponent;
