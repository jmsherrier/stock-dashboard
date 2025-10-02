import React from 'react';

const Week52LowComponent = ({ stock, onUpdate }) => {
  const value = stock.components?.week52Low?.value || '';
  const currentPrice = parseFloat(stock.components?.price?.value || 0);
  const week52Low = parseFloat(value || 0);
  
  // Calculate percentage above 52-week low
  const percentAboveLow = week52Low > 0 && currentPrice > 0 
    ? (((currentPrice - week52Low) / week52Low) * 100).toFixed(1)
    : '0.0';

  const handleChange = (e) => {
    const updatedStock = {
      ...stock,
      components: {
        ...stock.components,
        week52Low: { value: e.target.value }
      }
    };
    onUpdate(updatedStock);
  };

  return (
    <div className="criteria-item">
      <label>52-Week Low:</label>
      <div className="input-group">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="0.00"
          className="criteria-input"
        />
        {week52Low > 0 && currentPrice > 0 && (
          <span className="percentage-display">
            +{percentAboveLow}%
          </span>
        )}
      </div>
    </div>
  );
};

export default Week52LowComponent;