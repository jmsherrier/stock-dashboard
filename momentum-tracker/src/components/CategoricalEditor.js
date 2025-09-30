import React, { useState } from 'react';

function CategoricalEditor({ componentId, componentName, categories, criteria, onSave, onClose }) {
  const [categoryPoints, setCategoryPoints] = useState(() => {
    const initial = {};
    // Include both predefined categories and any custom ones from criteria
    const allCategories = new Set([...categories, ...Object.keys(criteria?.categories || {})]);
    allCategories.forEach(cat => {
      initial[cat] = criteria?.categories?.[cat] || 0;
    });
    return initial;
  });

  const [newCategory, setNewCategory] = useState('');

  const handlePointChange = (category, value) => {
    setCategoryPoints(prev => ({
      ...prev,
      [category]: parseInt(value) || 0
    }));
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categoryPoints.hasOwnProperty(trimmed)) {
      setCategoryPoints(prev => ({
        ...prev,
        [trimmed]: 0
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category) => {
    // Only allow removing custom categories (not in predefined list)
    if (!categories.includes(category)) {
      setCategoryPoints(prev => {
        const newPoints = { ...prev };
        delete newPoints[category];
        return newPoints;
      });
    }
  };

  const handleSave = () => {
    onSave({ categories: categoryPoints });
  };

  const allZero = Object.values(categoryPoints).every(v => v === 0);
  const sortedCategories = Object.keys(categoryPoints).sort();

  return (
    <div className="categorical-editor-overlay" onClick={onClose}>
      <div className="categorical-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="categorical-editor-header">
          <h3>{componentName} Scoring</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="categorical-editor-content">
          <div className="add-category-section">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              placeholder="Add custom category..."
              className="add-category-input"
            />
            <button 
              onClick={handleAddCategory}
              className="add-category-btn"
              disabled={!newCategory.trim()}
            >
              Add
            </button>
          </div>

          <div className="categorical-editor-list">
            {sortedCategories.map(category => {
              const points = categoryPoints[category];
              const isNonZero = points !== 0;
              const isCustom = !categories.includes(category);
              
              return (
                <div 
                  key={category} 
                  className={`categorical-item ${isNonZero ? 'has-points' : ''}`}
                >
                  <span className="category-name">
                    {category}
                    {isCustom && <span className="custom-badge">custom</span>}
                  </span>
                  <div className="category-controls">
                    <div className="category-points">
                      <input
                        type="number"
                        min="-10"
                        max="10"
                        value={points}
                        onChange={(e) => handlePointChange(category, e.target.value)}
                      />
                      <span className="points-label" style={{ 
                        opacity: points === 0 ? 0.3 : 1 
                      }}>
                        pts
                      </span>
                    </div>
                    {isCustom && (
                      <button
                        onClick={() => handleRemoveCategory(category)}
                        className="remove-category-btn"
                        title="Remove custom category"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {allZero && (
            <div className="categorical-editor-warning">
              All categories set to 0 points (neutral scoring)
            </div>
          )}

          <div className="categorical-editor-help">
            <p>Set point values for each category. Papers matching a category will receive those points.</p>
            <p>Add custom categories using the input above. Use 0 for neutral categories.</p>
          </div>
        </div>

        <div className="categorical-editor-footer">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button onClick={handleSave} className="save-button">Save</button>
        </div>
      </div>
    </div>
  );
}

export default CategoricalEditor;
