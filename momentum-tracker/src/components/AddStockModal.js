import React from 'react';

function AddStockModal({ onAdd, onClose }) {
  const addEmptyStock = () => {
    onAdd();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Stock Analysis</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="add-stock-content">
            <div className="add-stock-icon">📊</div>
            <h4>Create New Stock Analysis</h4>
            <p>Add a blank stock analysis sheet. You can edit the ticker symbol and enter all momentum criteria directly on the sheet.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="add-btn" onClick={addEmptyStock}>
            Add Stock Sheet
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddStockModal;
