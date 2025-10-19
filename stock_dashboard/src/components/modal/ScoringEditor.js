import React, { useState } from 'react';

function ScoringEditor({ componentId, criteria, onSave, onClose }) {
  const [ranges, setRanges] = useState(criteria?.ranges || []);

  // Check for overlaps between ranges
  const checkOverlap = (index) => {
    const currentRange = ranges[index];
    if (!currentRange) return false;

    for (let i = 0; i < ranges.length; i++) {
      if (i === index) continue;
      const otherRange = ranges[i];
      
      // Check if ranges overlap
      const overlap = !(currentRange.max <= otherRange.min || currentRange.min >= otherRange.max);
      if (overlap) return true;
    }
    return false;
  };

  const handleRangeUpdate = (index, field, value) => {
    const updated = [...ranges];
    if (field === 'min' || field === 'max') {
      // Handle inf/-inf terminology
      const normalizedValue = value.toLowerCase().replace(/infinity/g, 'inf');
      updated[index][field] = normalizedValue === '-inf' ? -Infinity : 
                               normalizedValue === 'inf' ? Infinity : 
                               parseFloat(value) || 0;
    } else if (field === 'points') {
      updated[index][field] = parseInt(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setRanges(updated);
  };

  const handleAddRange = () => {
    setRanges([...ranges, { min: 0, max: 10, points: 0, color: 'orange' }]);
  };

  const handleRemoveRange = (index) => {
    setRanges(ranges.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ ranges });
    onClose();
  };

  const formatRangeValue = (value) => {
    if (value === -Infinity) return '-inf';
    if (value === Infinity) return 'inf';
    return value;
  };

  return (
    <div className="scoring-editor-overlay" onClick={onClose}>
      <div className="scoring-editor" onClick={(e) => e.stopPropagation()}>
        <div className="scoring-editor-header">
          <h3>Edit Scoring Criteria</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="scoring-editor-content">
          <div className="scoring-ranges">
            <div className="ranges-header">
              <span className="range-label">Min</span>
              <span className="range-label">Max</span>
              <span className="range-label">Points</span>
              <span className="range-label">Color</span>
              <span className="range-label"></span>
            </div>
            
            {ranges.map((range, index) => {
              const hasOverlap = checkOverlap(index);
              return (
                <div key={index} className={`range-row ${hasOverlap ? 'overlap-error' : ''}`}>
                  <input
                    type="text"
                    value={formatRangeValue(range.min)}
                    onChange={(e) => handleRangeUpdate(index, 'min', e.target.value)}
                    className="range-input"
                    placeholder="Min"
                  />
                  <input
                    type="text"
                    value={formatRangeValue(range.max)}
                    onChange={(e) => handleRangeUpdate(index, 'max', e.target.value)}
                    className="range-input"
                    placeholder="Max"
                  />
                  <input
                    type="number"
                    value={range.points}
                    onChange={(e) => handleRangeUpdate(index, 'points', e.target.value)}
                    className="range-input points-input"
                    min="-5"
                    max="5"
                  />
                  <select
                    value={range.color}
                    onChange={(e) => handleRangeUpdate(index, 'color', e.target.value)}
                    className="range-select"
                  >
                    <option value="green">Green</option>
                    <option value="orange">Orange</option>
                    <option value="red">Red</option>
                    <option value="neutral">Neutral</option>
                  </select>
                  <button
                    onClick={() => handleRemoveRange(index)}
                    className="remove-range-btn"
                    title="Remove range"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <button onClick={handleAddRange} className="add-range-btn">
            + Add Range
          </button>

          <div className="scoring-help">
            <p><strong>Tips:</strong></p>
            <ul>
              <li>Use <code>-inf</code> for open lower bound</li>
              <li>Use <code>inf</code> for open upper bound</li>
              <li>Ranges should not overlap (overlaps highlighted in red)</li>
              <li>Points: -5 to +5 (negative = bad, positive = good)</li>
              <li>Colors: Green (good), Orange (neutral), Red (bad)</li>
            </ul>
          </div>
        </div>

        <div className="scoring-editor-actions">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button onClick={handleSave} className="save-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default ScoringEditor;
