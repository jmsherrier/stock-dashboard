import React from 'react';

function PERatioComponent({ value, onChange, config }) {
  const displayValue = value && !isNaN(parseFloat(value))
    ? parseFloat(value).toFixed(2)
    : 'N/A';

  return (
    <div className="component-wrapper pe-ratio-component">
      <label className="component-label">P/E Ratio</label>
      <div className="component-value">
        {displayValue}
      </div>
    </div>
  );
}

export default PERatioComponent;
