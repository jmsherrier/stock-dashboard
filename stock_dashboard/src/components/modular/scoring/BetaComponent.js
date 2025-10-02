import React from 'react';
import CriteriaInput from '../../inputs/CriteriaInput';
import { calculateComponentScore } from '../ComponentRegistry';

function BetaComponent({ stock, onUpdate, config }) {
  const value = stock.components?.beta?.value || '';
  const score = calculateComponentScore('beta', value);

  return (
    <CriteriaInput
      label="Beta"
      value={value}
      onChange={(val) => onUpdate(stock.id, 'beta', { value: val })}
      type="number"
      step="0.01"
      currentPoints={score}
      scale={[
        { range: '<0.5', points: -3 },
        { range: '0.5-1.0', points: -1 },
        { range: '1.0-1.5', points: 1 },
        { range: '1.5-2.5', points: 2 },
        { range: '2.5-4.0', points: 3 },
        { range: '>4.0', points: 1 }
      ]}
    />
  );
}

export default BetaComponent;
