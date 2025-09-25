import React, { useState } from 'react';

function AddStockModal({ onAdd, onClose, existingTickers = [] }) {
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState(null);

  const submit = () => {
    const t = ticker.trim().toUpperCase();
    if (!t) return setError('Enter a ticker');
    if (existingTickers.includes(t)) return setError('Ticker already exists');
    onAdd(t);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Ticker</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="e.g. AAPL" />
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={submit}>Add</button>
        </div>
      </div>
    </div>
  );
}

export default AddStockModal;
