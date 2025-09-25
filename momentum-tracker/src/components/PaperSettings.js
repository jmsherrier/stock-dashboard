import React, { useState } from 'react';
import { COMPONENT_REGISTRY, getAvailableComponents, COMPONENT_CATEGORIES } from './modular/ComponentRegistry';

function PaperSettings({ paperConfig, onConfigChange, onClose }) {
  const [activeComponents, setActiveComponents] = useState(paperConfig.components || []);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const availableComponents = getAvailableComponents();
  
  const filteredComponents = selectedCategory === 'all' 
    ? availableComponents 
    : availableComponents.filter(comp => comp.category === selectedCategory);

  const handleComponentToggle = (componentId) => {
    const component = COMPONENT_REGISTRY[componentId];
    
    // Don't allow removing required components
    if (component.required && activeComponents.includes(componentId)) {
      return;
    }

    const newComponents = activeComponents.includes(componentId)
      ? activeComponents.filter(id => id !== componentId)
      : [...activeComponents, componentId];
    
    setActiveComponents(newComponents);
  };

  const handleSave = () => {
    onConfigChange({
      ...paperConfig,
      components: activeComponents
    });
    onClose();
  };

  const handleReset = () => {
    const defaultComponents = availableComponents
      .filter(comp => comp.required)
      .map(comp => comp.id);
    setActiveComponents(defaultComponents);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content paper-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Paper Settings</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="settings-content">
          <div className="category-filter">
            <button 
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              All Components
            </button>
            {Object.entries(COMPONENT_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                className={selectedCategory === key ? 'active' : ''}
                onClick={() => setSelectedCategory(key)}
                style={{ '--category-color': category.color }}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="components-list">
            {filteredComponents.map(component => {
              const isActive = activeComponents.includes(component.id);
              const isRequired = component.required;
              
              return (
                <div 
                  key={component.id} 
                  className={`component-option ${isActive ? 'active' : ''} ${isRequired ? 'required' : ''}`}
                >
                  <div className="component-info">
                    <div className="component-header-info">
                      <span className="component-name">{component.name}</span>
                      <div className="component-badges">
                        {isRequired && <span className="required-badge">Required</span>}
                        {component.manualOnly && <span className="manual-badge">Manual</span>}
                        {component.scoring && <span className="scoring-badge">Scoring</span>}
                      </div>
                    </div>
                    <span className="component-description">{component.description}</span>
                  </div>
                  
                  <div className="component-controls">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleComponentToggle(component.id)}
                        disabled={isRequired && isActive}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="settings-info">
            <div className="active-count">
              {activeComponents.length} components selected
            </div>
            <div className="category-legend">
              {Object.entries(COMPONENT_CATEGORIES).map(([key, category]) => (
                <div key={key} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={handleReset} className="reset-btn">
            Reset to Default
          </button>
          <div className="action-group">
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button onClick={handleSave} className="save-btn">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaperSettings;