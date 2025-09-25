import React from 'react';

function CriteriaInput({ label, value, onChange, type = 'text', step }) {
  return (
    <div className="criteria-input">
      <div className="criteria-header">
        <label>{label}</label>
      </div>
      <input type={type} step={step} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default CriteriaInput;
