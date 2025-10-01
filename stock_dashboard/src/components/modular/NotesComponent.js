import React from 'react';

function NotesComponent({ stock, onUpdate, config }) {
  // Get value from modular or legacy format
  const getValue = () => stock.components?.notes?.value || stock.notes || '';
  const value = getValue();
  
  // Check if we should use original format (default behavior)
  const useOriginalFormat = !config || config.originalFormat !== false;

  if (useOriginalFormat) {
    return (
      <div className="notes-section">
        <h4>Notes</h4>
        <textarea
          value={value}
          onChange={(e) => onUpdate(stock.id, 'notes', { value: e.target.value })}
          placeholder="Trading notes, observations, setup details..."
        />
      </div>
    );
  }

  // Fallback modular format
  return (
    <div className="modular-component notes-component large-component">
      <div className="component-header">
        <label>Notes</label>
      </div>
      <div className="component-content">
        <textarea
          value={value}
          onChange={(e) => onUpdate(stock.id, 'notes', { value: e.target.value })}
          placeholder="Add your personal notes and observations..."
          className="notes-textarea"
          rows={4}
        />
      </div>
    </div>
  );
}

export default NotesComponent;