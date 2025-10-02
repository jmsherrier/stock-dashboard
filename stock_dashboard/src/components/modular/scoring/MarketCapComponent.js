import React from 'react';
import CriteriaInput from '../../inputs/CriteriaInput';
import { calculateComponentScore } from '../ComponentRegistry';

function MarketCapComponent({ stock, onUpdate, config }) {
  const value = stock.components?.marketCap?.value || '';
  const score = calculateComponentScore('marketCap', value);
  
  const formatMarketCap = (val) => {
    if (!val) return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    
    if (num >= 1e9) return (num / 1e9).toFixed(2);
    if (num >= 1e6) return (num / 1e6).toFixed(2);
    return num.toFixed(0);
  };

  return (
    <CriteriaInput
      label="Market Cap"
      value={formatMarketCap(value)}
      onChange={(val) => onUpdate(stock.id, 'marketCap', { value: parseFloat(val) * 1e6 })}
      type="number"
      step="1"
      suffix="M"
      currentPoints={score}
      scale={[
        { range: '<50M', points: 2 },
        { range: '50-300M', points: 1 },
        { range: '300M-2B', points: 0 },
        { range: '2-10B', points: -1 },
        { range: '>10B', points: -2 }
      ]}
    />
  );
}

export default MarketCapComponent;
