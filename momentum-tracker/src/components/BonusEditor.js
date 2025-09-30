import React, { useState } from 'react';

function BonusEditor({ bonusChecks, onSave, onClose }) {
  const [checks, setChecks] = useState(bonusChecks || {});

  const handleUpdate = (checkId, field, value) => {
    setChecks(prev => ({
      ...prev,
      [checkId]: {
        ...prev[checkId],
        [field]: value
      }
    }));
  };

  const handleAdd = () => {
    const newId = `custom_${Date.now()}`;
    setChecks(prev => ({
      ...prev,
      [newId]: {
        points: 1,
        description: 'New bonus criteria'
      }
    }));
  };

  const handleRemove = (checkId) => {
    setChecks(prev => {
      const updated = { ...prev };
      delete updated[checkId];
      return updated;
    });
  };

  const handleSave = () => {
    onSave(checks);
    onClose();
  };

  return (
    <div className="bonus-editor-overlay" onClick={onClose}>
      <div className="bonus-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bonus-editor-header">
          <h3>Bonus Criteria Configuration</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="bonus-editor-content">
          <div className="bonus-checks-list">
            {Object.entries(checks).map(([checkId, check]) => (
              <div key={checkId} className="bonus-check-item">
                <input
                  type="text"
                  value={check.description}
                  onChange={(e) => handleUpdate(checkId, 'description', e.target.value)}
                  placeholder="Criteria description"
                  className="bonus-description-input"
                />
                <div className="bonus-points-controls">
                  <input
                    type="number"
                    value={check.points}
                    onChange={(e) => handleUpdate(checkId, 'points', parseInt(e.target.value) || 0)}
                    className="bonus-points-input"
                    min="0"
                    max="5"
                  />
                  <span className="points-label">pts</span>
                </div>
                <button
                  onClick={() => handleRemove(checkId)}
                  className="remove-check-btn"
                  title="Remove criteria"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleAdd} className="add-bonus-check-btn">
            + Add Bonus Criteria
          </button>

          <div className="bonus-editor-help">
            <p>Bonus criteria add extra points to papers that meet specific conditions.</p>
            <p>Manually check these boxes on each paper to add the points to the total score.</p>
          </div>
        </div>

        <div className="bonus-editor-footer">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button onClick={handleSave} className="save-button">Save</button>
        </div>
      </div>
    </div>
  );
}

export default BonusEditor;
