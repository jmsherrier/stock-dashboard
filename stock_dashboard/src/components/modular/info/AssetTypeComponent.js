import React from 'react';
import CriteriaInput from '../../inputs/CriteriaInput';
import ChangeIndicator from '../technical/ChangeIndicator';

const AssetTypeComponent = ({ stock, onUpdate, config }) => {
  const value = stock.components?.assetType?.value || '';
  const previousValue = stock.components?.assetType?.previousValue;

  // Check if we're being used in criteria grid mode
  const isCriteriaMode = !config || config.criteriaMode !== false;

  if (isCriteriaMode) {
    return (
      <CriteriaInput
        label="Asset Type"
        value={value}
        onChange={(val) => onUpdate(stock.id, 'assetType', { value: val })}
        type="text"
        currentPoints={0} // No scoring for informational field
        readOnly={true}
      />
    );
  }

  return (
    <div className="modular-component asset-type-component">
      <div className="component-header">
        <label>Asset Type</label>
      </div>
      <div className="component-content">
        <div className="input-wrapper">
          <input
            type="text"
            value={value}
            onChange={(e) => onUpdate(stock.id, 'assetType', { value: e.target.value })}
            placeholder="Common Stock"
            readOnly={true}
            title="Asset type from Alpha Vantage"
          />
          <ChangeIndicator currentValue={value} previousValue={previousValue} />
        </div>
      </div>
    </div>
  );
};

export default AssetTypeComponent;