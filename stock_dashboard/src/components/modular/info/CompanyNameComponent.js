import React from 'react';

const CompanyNameComponent = ({ stock, onUpdate, config }) => {
  const value = stock.components?.companyName?.value || '';

  return (
    <div className="criteria-input info-criteria">
      <div className="criteria-header">
        <label>Company Name</label>
      </div>
      <div className="info-text company-name-text">
        {value || 'N/A'}
      </div>
    </div>
  );
};

export default CompanyNameComponent;