import React from 'react';
import CriteriaInput from '../../inputs/CriteriaInput';
import { calculateComponentScore } from '../ComponentRegistry';

function PERatioComponent({ stock, onUpdate, config }) {
  const value = stock.components?.peRatio?.value || '';
  const score = calculateComponentScore('peRatio', value);

  return (
    <CriteriaInput
      label="P/E Ratio"
      value={value}
      onChange={(val) => onUpdate(stock.id, 'peRatio', { value: val })}
      type="number"
      step="0.1"
      currentPoints={score}
      scale={[
        { range: '<0', points: 0 },
        { range: '0-15', points: 1 },
        { range: '15-30', points: 0 },
        { range: '>30', points: -1 }
      ]}
    />
  );
}

export default PERatioComponent;
