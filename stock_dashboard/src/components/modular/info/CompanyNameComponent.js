import React from 'react';
import CriteriaInput from '../../inputs/CriteriaInput';
import ChangeIndicator from '../technical/ChangeIndicator';

const CompanyNameComponent = ({ stock, onUpdate, config }) => {
  const value = stock.components?.companyName?.value || '';
  const previousValue = stock.components?.companyName?.previousValue;

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Company Name"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'companyName', { value: val })}
        type="text"
        currentPoints={0} // No scoring for informational field
        readOnly={true}
      />
    );
  }

  return (
    <div className="modular-component company-name-component">
      <div className="component-header">
        <label>Company Name</label>
      </div>
      <div className="component-content">
        <div className="input-wrapper">
          <input
            type="text"
            value={value}
            onChange={(e) => onUpdate(stock.id, 'companyName', { value: e.target.value })}
            placeholder="Company Name"
            readOnly={true}
            title="Full company name from Alpha Vantage"
          />
          <ChangeIndicator currentValue={value} previousValue={previousValue} />
        </div>
      </div>
    </div>
  );
};

export default CompanyNameComponent;