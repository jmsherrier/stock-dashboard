import React from 'react';
import CriteriaInput from '../../inputs/CriteriaInput';
import ChangeIndicator from '../technical/ChangeIndicator';

const CompanyDescriptionComponent = ({ stock, onUpdate, config }) => {
  const value = stock.components?.companyDescription?.value || '';
  const previousValue = stock.components?.companyDescription?.previousValue;

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Description"
        value={value ? value.substring(0, 100) + '...' : ''}
        onChange={(val) => onUpdate(stock.id, 'companyDescription', { value: val })}
        type="textarea"
        currentPoints={0} // No scoring for informational field
        readOnly={true}
      />
    );
  }

  return (
    <div className="modular-component company-description-component">
      <div className="component-header">
        <label>Company Description</label>
      </div>
      <div className="component-content">
        <div className="input-wrapper">
          <textarea
            value={value}
            onChange={(e) => onUpdate(stock.id, 'companyDescription', { value: e.target.value })}
            placeholder="Company business description"
            readOnly={true}
            rows={4}
            title="Company business description from Alpha Vantage"
          />
          <ChangeIndicator currentValue={value} previousValue={previousValue} />
        </div>
      </div>
    </div>
  );
};

export default CompanyDescriptionComponent;