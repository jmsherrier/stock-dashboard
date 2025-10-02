import React from 'react';

const CompanyDescriptionComponent = ({ stock, onUpdate, config }) => {
  const value = stock.components?.companyDescription?.value || '';

  return (
    <div className="criteria-input info-criteria description-criteria">
      <div className="criteria-header">
        <label>Company Description</label>
      </div>
      <div className="info-text description-text">
        {value || 'No description available'}
      </div>
    </div>
  );
};

export default CompanyDescriptionComponent;