import React from 'react';
import CriteriaInput from '../../inputs/CriteriaInput';
import ChangeIndicator from '../technical/ChangeIndicator';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';

const DividendPerShareComponent = ({ stock, onUpdate, config, onOpenScoringEditor, settings = {} }) => {
  const value = stock.components?.dividendPerShare?.value || '';
  const previousValue = stock.components?.dividendPerShare?.previousValue;
  
  const score = calculateComponentScore('dividendPerShare', value);
  const scoreColor = getComponentScoreColor(score);

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Dividend/Share"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'dividendPerShare', { value: val })}
        type="number"
        step="0.01"
        suffix="$"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '0', points: -1 },
          { range: '0.01-1.00', points: 0 },
          { range: '1.01-2.00', points: 1 },
          { range: '2.01-4.00', points: 2 },
          { range: '>4.00', points: 3 }
        ]}
      />
    );
  }

  return (
    <div className="modular-component dividend-per-share-component">
      <div className="component-header">
        <label>Dividend/Share</label>
        <div className="header-actions">
          {value && (
            <span className={`score-badge score-${scoreColor}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
          )}
          {onOpenScoringEditor && (
            <button
              className="hotdog-menu-btn"
              onClick={() => onOpenScoringEditor('dividendPerShare')}
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
            onChange={(e) => onUpdate(stock.id, 'dividendPerShare', { value: e.target.value })}
            placeholder="0.00"
          />
          <ChangeIndicator currentValue={value} previousValue={previousValue} />
          <span className="input-suffix">$/share</span>
        </div>
      </div>
    </div>
  );
};

export default DividendPerShareComponent;
