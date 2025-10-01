import React from 'react';
import { getComponentScoreColor } from './ComponentRegistry';

function MarketCapComponent({ value, onChange, config }) {
  const scoreColor = getComponentScoreColor('marketCap', value);
  
  const formatMarketCap = (val) => {
    if (!val) return 'N/A';
    const num = parseFloat(val);
    if (isNaN(num)) return 'N/A';
    
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className={`component-wrapper market-cap-component score-${scoreColor}`}>
      <label className="component-label">Market Cap</label>
      <div className="component-value">
        {formatMarketCap(value)}
      </div>
    </div>
  );
}

export default MarketCapComponent;
