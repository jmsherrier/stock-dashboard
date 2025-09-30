import React, { useState } from 'react';
import { STRATEGY_PRESETS, COMPONENT_REGISTRY, COMPONENT_CATEGORIES } from './modular/ComponentRegistry';
import ScoringEditor from './ScoringEditor';
import NewsEditor from './NewsEditor';
import CategoricalEditor from './CategoricalEditor';
import BonusEditor from './BonusEditor';

function PresetMenu({ isOpen, onClose, onPresetApply, onUpdateStocks }) {
  const [selectedPreset, setSelectedPreset] = useState('momentum');
  const [customBonusChecks, setCustomBonusChecks] = useState(
    STRATEGY_PRESETS.momentum.bonusChecks
  );
  const [activeComponents, setActiveComponents] = useState(
    STRATEGY_PRESETS.momentum.paperConfig
  );
  const [customCriteria, setCustomCriteria] = useState({});
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [customPresets, setCustomPresets] = useState({});
  const [editingComponent, setEditingComponent] = useState(null);
  const [editingNews, setEditingNews] = useState(false);
  const [editingCategorical, setEditingCategorical] = useState(null);
  const [editingBonusChecks, setEditingBonusChecks] = useState(false);
  const [renamingPreset, setRenamingPreset] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [editingDescription, setEditingDescription] = useState(null);
  const [descriptionValue, setDescriptionValue] = useState('');

  if (!isOpen) return null;

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId);
    const preset = { ...STRATEGY_PRESETS, ...customPresets }[presetId];
    setCustomBonusChecks(preset.bonusChecks);
    setActiveComponents(preset.paperConfig);
  };

  const handleComponentToggle = (componentId) => {
    setActiveComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };

  const handleCreatePreset = () => {
    if (!newPresetName.trim()) return;
    
    const newPresetId = `custom_${Date.now()}`;
    // Default to empty configuration - no components selected
    const emptyConfig = {};
    Object.keys(COMPONENT_REGISTRY).forEach(id => {
      if (!COMPONENT_REGISTRY[id].required && id !== 'bonusChecks' && id !== 'notes') {
        emptyConfig[id] = false;
      }
    });
    
    const newPreset = {
      id: newPresetId,
      name: newPresetName,
      description: 'Custom strategy preset',
      paperConfig: emptyConfig,
      bonusChecks: {}
    };
    
    setCustomPresets(prev => ({ ...prev, [newPresetId]: newPreset }));
    setSelectedPreset(newPresetId);
    setActiveComponents(emptyConfig);
    setCustomBonusChecks({});
    setIsAddingPreset(false);
    setNewPresetName('');
  };

  const handleResetPreset = () => {
    // For built-in presets: restore original configuration
    if (STRATEGY_PRESETS[selectedPreset]) {
      const original = STRATEGY_PRESETS[selectedPreset];
      setActiveComponents(original.paperConfig);
      setCustomBonusChecks(original.bonusChecks);
      setCustomCriteria({});
    } 
    // For custom presets: clear all, set to defaults
    else {
      const defaultConfig = {};
      Object.keys(COMPONENT_REGISTRY).forEach(id => {
        if (!COMPONENT_REGISTRY[id].required && id !== 'bonusChecks' && id !== 'notes') {
          defaultConfig[id] = false;
        }
      });
      setActiveComponents(defaultConfig);
      setCustomBonusChecks({});
      setCustomCriteria({});
    }
  };

  const handleStartRename = (presetId, currentName) => {
    setRenamingPreset(presetId);
    setRenameValue(currentName);
  };

  const handleConfirmRename = () => {
    if (!renameValue.trim() || !renamingPreset) return;
    
    setCustomPresets(prev => ({
      ...prev,
      [renamingPreset]: {
        ...prev[renamingPreset],
        name: renameValue.trim()
      }
    }));
    
    setRenamingPreset(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setRenamingPreset(null);
    setRenameValue('');
  };

  const handleStartEditDescription = (presetId, currentDescription) => {
    setEditingDescription(presetId);
    setDescriptionValue(currentDescription);
  };

  const handleConfirmEditDescription = () => {
    if (!descriptionValue.trim() || !editingDescription) return;
    
    setCustomPresets(prev => ({
      ...prev,
      [editingDescription]: {
        ...prev[editingDescription],
        description: descriptionValue.trim()
      }
    }));
    
    setEditingDescription(null);
    setDescriptionValue('');
  };

  const handleCancelEditDescription = () => {
    setEditingDescription(null);
    setDescriptionValue('');
  };

  const handleDeletePreset = (presetId) => {
    if (window.confirm('Are you sure you want to delete this custom strategy?')) {
      setCustomPresets(prev => {
        const updated = { ...prev };
        delete updated[presetId];
        return updated;
      });
      
      // If we're deleting the currently selected preset, switch to momentum
      if (selectedPreset === presetId) {
        setSelectedPreset('momentum');
        handlePresetSelect('momentum');
      }
    }
  };

  const handleApplyPreset = (e) => {
    console.log('handleApplyPreset called!');
    e.preventDefault();
    e.stopPropagation();
    
    const preset = {
      ...({ ...STRATEGY_PRESETS, ...customPresets }[selectedPreset]),
      name: selectedPreset, // Pass the preset ID as name
      bonusChecks: customBonusChecks,
      paperConfig: activeComponents,
      customCriteria: customCriteria
    };
    
    console.log('Calling onPresetApply with preset:', preset);
    onPresetApply(preset);
    console.log('Called onPresetApply, now closing...');
    onClose();
  };

  const handleSaveCustomCriteria = (componentId, criteria) => {
    setCustomCriteria(prev => ({
      ...prev,
      [componentId]: criteria
    }));
  };

  const getComponentCriteria = (componentId) => {
    return customCriteria[componentId] || COMPONENT_REGISTRY[componentId]?.criteria;
  };

  // Group components by category, with non-editable ones last in each group
  const getGroupedComponents = () => {
    const grouped = {};
    const categories = ['Price & Momentum', 'Volume & Float', 'Company Size', 'Technical Indicators', 'Fundamentals', 'Classification', 'analysis'];
    
    categories.forEach(category => {
      const components = Object.entries(COMPONENT_REGISTRY)
        .filter(([id, config]) => 
          !config.required && 
          id !== 'bonusChecks' && 
          id !== 'notes' && 
          config.category === category
        );
      
      // Sort: editable components first, then non-editable
      const sorted = components.sort((a, b) => {
        const aHasEditor = a[1].scoring === true || a[1].scoring === 'simpleToggle' || a[1].scoring === 'categorical';
        const bHasEditor = b[1].scoring === true || b[1].scoring === 'simpleToggle' || b[1].scoring === 'categorical';
        if (aHasEditor && !bHasEditor) return -1;
        if (!aHasEditor && bHasEditor) return 1;
        return 0;
      });
      
      if (sorted.length > 0) {
        grouped[category] = sorted;
      }
    });
    
    return grouped;
  };

  return (
    <div className="preset-menu-overlay" onClick={onClose}>
      <div className="preset-menu" onClick={(e) => e.stopPropagation()}>
        <div className="preset-header">
          <h3>Configure Strategy</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="preset-content">
          <div className="preset-selection">
            <h4>Strategy Presets</h4>
            <div className="preset-options">
              {Object.values({ ...STRATEGY_PRESETS, ...customPresets }).map(preset => (
                <button
                  key={preset.id}
                  className={`preset-option ${selectedPreset === preset.id ? 'active' : ''}`}
                  onClick={() => handlePresetSelect(preset.id)}
                >
                  {renamingPreset === preset.id ? (
                    <div className="preset-rename-form" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="preset-name-input"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleConfirmRename();
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        onBlur={handleConfirmRename}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="preset-info">
                        <div 
                          className="preset-name"
                          onClick={(e) => {
                            if (!STRATEGY_PRESETS[preset.id]) {
                              e.stopPropagation();
                              handleStartRename(preset.id, preset.name);
                            }
                          }}
                          style={{ cursor: !STRATEGY_PRESETS[preset.id] ? 'text' : 'pointer' }}
                          title={!STRATEGY_PRESETS[preset.id] ? 'Click to rename' : ''}
                        >
                          {preset.name}
                        </div>
                        {editingDescription === preset.id ? (
                          <input
                            type="text"
                            value={descriptionValue}
                            onChange={(e) => setDescriptionValue(e.target.value)}
                            className="preset-description-input"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleConfirmEditDescription();
                              if (e.key === 'Escape') handleCancelEditDescription();
                            }}
                            onBlur={handleConfirmEditDescription}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div 
                            className="preset-description"
                            onClick={(e) => {
                              if (!STRATEGY_PRESETS[preset.id]) {
                                e.stopPropagation();
                                handleStartEditDescription(preset.id, preset.description);
                              }
                            }}
                            style={{ cursor: !STRATEGY_PRESETS[preset.id] ? 'text' : 'default' }}
                            title={!STRATEGY_PRESETS[preset.id] ? 'Click to edit description' : ''}
                          >
                            {preset.description}
                          </div>
                        )}
                      </div>
                      {!STRATEGY_PRESETS[preset.id] && (
                        <button
                          className="delete-preset-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePreset(preset.id);
                          }}
                          title="Delete custom strategy"
                        >
                          ×
                        </button>
                      )}
                    </>
                  )}
                </button>
              ))}
              {isAddingPreset ? (
                <div className="preset-option add-preset-form">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Preset name"
                    className="preset-name-input"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleCreatePreset()}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={handleCreatePreset} className="confirm-btn">✓</button>
                    <button onClick={() => { setIsAddingPreset(false); setNewPresetName(''); }} className="cancel-btn-small">×</button>
                  </div>
                </div>
              ) : (
                <button
                  className="preset-option add-preset-btn"
                  onClick={() => setIsAddingPreset(true)}
                  title="Add new strategy preset"
                >
                  <div className="add-preset-icon">+</div>
                  <div className="preset-description">Add Strategy</div>
                </button>
              )}
            </div>
          </div>


          <div className="component-criteria-config">
            <h4>Active Components</h4>
            {Object.entries(getGroupedComponents()).map(([category, components]) => (
              <div key={category} className="component-category-group">
                <h5 className="category-header">{COMPONENT_CATEGORIES[category]?.name || category}</h5>
                <div className="component-grid">
                  {components.map(([id, config]) => (
                    <div key={id} className="component-checkbox-wrapper">
                      <label className="component-checkbox-item">
                        <input
                          type="checkbox"
                          checked={activeComponents[id] || false}
                          onChange={() => handleComponentToggle(id)}
                          className="component-checkbox"
                        />
                        <span className="component-label">{config.name}</span>
                      </label>
                      {(config.scoring === true || config.scoring === 'simpleToggle' || config.scoring === 'categorical') && (
                        <button
                          className="component-menu-btn"
                          onClick={() => {
                            if (config.scoring === 'simpleToggle') {
                              setEditingNews(true);
                            } else if (config.scoring === 'categorical') {
                              setEditingCategorical(id);
                            } else {
                              setEditingComponent(id);
                            }
                          }}
                          title="Edit scoring criteria"
                        >
                          ⋮
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="component-category-group">
              <h5 className="category-header">Bonus Criteria</h5>
              <div className="component-grid">
                <div className="component-checkbox-wrapper">
                  <label className="component-checkbox-item">
                    <input
                      type="checkbox"
                      checked={activeComponents.bonusChecks || false}
                      onChange={() => handleComponentToggle('bonusChecks')}
                      className="component-checkbox"
                    />
                    <span className="component-label">Bonus Criteria</span>
                  </label>
                  <button
                    className="component-menu-btn"
                    onClick={() => setEditingBonusChecks(true)}
                    title="Edit bonus criteria"
                  >
                    ⋮
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="preset-actions">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button onClick={handleResetPreset} className="reset-preset-btn" title="Reset to default configuration">
            Reset to Default
          </button>
          <button 
            onClick={handleApplyPreset} 
            className="apply-preset-btn"
            type="button"
          >
            Apply Preset
          </button>
        </div>
      </div>

      {editingComponent && (
        <ScoringEditor
          componentId={editingComponent}
          criteria={getComponentCriteria(editingComponent)}
          onSave={(criteria) => handleSaveCustomCriteria(editingComponent, criteria)}
          onClose={() => setEditingComponent(null)}
        />
      )}

      {editingNews && (
        <NewsEditor
          criteria={getComponentCriteria('news').scoring || {}}
          onSave={(criteria) => {
            handleSaveCustomCriteria('news', { scoring: criteria });
            setEditingNews(false);
          }}
          onClose={() => setEditingNews(false)}
        />
      )}

      {editingCategorical && (
        <CategoricalEditor
          componentId={editingCategorical}
          componentName={COMPONENT_REGISTRY[editingCategorical].name}
          categories={COMPONENT_REGISTRY[editingCategorical].categories}
          criteria={getComponentCriteria(editingCategorical)}
          onSave={(criteria) => {
            handleSaveCustomCriteria(editingCategorical, criteria);
            setEditingCategorical(null);
          }}
          onClose={() => setEditingCategorical(null)}
        />
      )}

      {editingBonusChecks && (
        <BonusEditor
          bonusChecks={customBonusChecks}
          onSave={(checks) => {
            setCustomBonusChecks(checks);
            setEditingBonusChecks(false);
          }}
          onClose={() => setEditingBonusChecks(false)}
        />
      )}
    </div>
  );
}

export default PresetMenu;
