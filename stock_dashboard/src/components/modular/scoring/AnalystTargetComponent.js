import React from 'react';
import { calculateComponentScore, getComponentScoreColor } from '../ComponentRegistry';
import CriteriaInput from '../../inputs/CriteriaInput';

function AnalystTargetComponent({ stock, onUpdate, config , settings = {} }) {
  const getValue = () => stock.components?.analystTarget?.value || stock.analystTarget || '';
  const value = getValue();

  // Calculate upside potential
  const currentPrice = stock?.components?.price?.value || stock?.price;
  const targetPrice = value;
  
  let upsidePotential = 0;
  if (currentPrice && targetPrice && !isNaN(parseFloat(currentPrice)) && !isNaN(parseFloat(targetPrice))) {
    upsidePotential = ((parseFloat(targetPrice) - parseFloat(currentPrice)) / parseFloat(currentPrice)) * 100;
  }
  
  const score = upsidePotential ? calculateComponentScore('analystTarget', upsidePotential) : 0;
  const scoreColor = upsidePotential ? getComponentScoreColor('analystTarget', upsidePotential) : 'neutral';

  const isCriteriaMode = config && config.criteriaMode === true;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Analyst Target"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'analystTarget', { value: val })}
        type="number"
        step="0.01"
        suffix="$"
        currentPoints={score}
        hidePointsLabel={settings.hidePointsLabel}
        scale={[
          { range: '<90%', points: -2 },
          { range: '90-100%', points: -1 },
          { range: '100-110%', points: 0 },
          { range: '110-125%', points: 1 },
          { range: '125-150%', points: 2 },
          { range: '>150%', points: 3 }
        ]}
      />
    );
  }
  
  const displayValue = targetPrice && !isNaN(parseFloat(targetPrice))
    ? `$${parseFloat(targetPrice).toFixed(2)}`
    : 'N/A';

  return (
    <div className={`component-wrapper analyst-target-component score-${scoreColor}`}>
      <label className="component-label">Analyst Target</label>
      <div className="component-value">
        {displayValue}
        {upsidePotential !== 0 && (
          <span className={`subtext ${upsidePotential > 0 ? 'positive' : 'negative'}`}>
            {' '}({upsidePotential > 0 ? '+' : ''}{upsidePotential.toFixed(1)}%)
          </span>
        )}
      </div>
    </div>
  );
}

export default AnalystTargetComponent;

