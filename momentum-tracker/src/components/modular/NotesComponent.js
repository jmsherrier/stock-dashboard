import React from 'react';

function NotesComponent({ stock, onUpdate, config }) {
  // Check if we should use original format (default behavior)
  const useOriginalFormat = !config || config.originalFormat !== false;

  if (useOriginalFormat) {
    return (
      <div className="notes-section">
        <h4>Notes</h4>
        <textarea
          value={stock.notes || ''}
          onChange={(e) => onUpdate(stock.id, 'notes', e.target.value)}
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
          value={stock.notes || ''}
          onChange={(e) => onUpdate(stock.id, 'notes', e.target.value)}
          placeholder="Add your personal notes and observations..."
          className="notes-textarea"
          rows={4}
        />
      </div>
    </div>
  );
}

export default NotesComponent;