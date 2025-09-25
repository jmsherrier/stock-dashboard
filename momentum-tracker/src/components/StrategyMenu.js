import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

function StrategyMenu({ onStrategyChange, onUpdateAll, currentStrategy }) {
  const [strategies, setStrategies] = useState([]);
  const [presets, setPresets] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    config: {},
    isDefault: false
  });

  useEffect(() => {
    loadStrategies();
    loadPresets();
  }, []);

  const loadStrategies = async () => {
    try {
      const response = await apiClient.getStrategies();
      setStrategies(response.strategies || []);
    } catch (error) {
      console.error('Failed to load strategies:', error);
    }
  };

  const loadPresets = async () => {
    try {
      const response = await apiClient.getStrategyPresets();
      setPresets(response.presets || []);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  const handleCreateStrategy = async () => {
    try {
      await apiClient.createStrategy(newStrategy);
      setShowCreateModal(false);
      setNewStrategy({ name: '', description: '', config: {}, isDefault: false });
      loadStrategies();
    } catch (error) {
      console.error('Failed to create strategy:', error);
    }
  };

  const handleDeleteStrategy = async (strategyId) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      try {
        await apiClient.deleteStrategy(strategyId);
        loadStrategies();
      } catch (error) {
        console.error('Failed to delete strategy:', error);
      }
    }
  };

  const handleApplyPreset = async (preset) => {
    try {
      const strategy = {
        name: `${preset.name} (Copy)`,
        description: preset.description,
        config: preset.config,
        isDefault: false
      };
      await apiClient.createStrategy(strategy);
      loadStrategies();
      onStrategyChange(strategy.config);
    } catch (error) {
      console.error('Failed to apply preset:', error);
    }
  };

  return (
    <div className="strategy-menu">
      <button 
        className="strategy-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        Strategy: {currentStrategy?.name || 'Default'}
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="strategy-dropdown">
          <div className="dropdown-section">
            <h4>Your Strategies</h4>
            {strategies.length === 0 ? (
              <div className="no-strategies">No custom strategies yet</div>
            ) : (
              strategies.map(strategy => (
                <div key={strategy.id} className="strategy-item">
                  <div className="strategy-info">
                    <span className="strategy-name">{strategy.name}</span>
                    <span className="strategy-description">{strategy.description}</span>
                  </div>
                  <div className="strategy-actions">
                    <button 
                      onClick={() => {
                        onStrategyChange(strategy);
                        setIsOpen(false);
                      }}
                      className="apply-btn"
                    >
                      Apply
                    </button>
                    <button 
                      onClick={() => handleDeleteStrategy(strategy.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="dropdown-section">
            <h4>Preset Strategies</h4>
            {presets.map(preset => (
              <div key={preset.id} className="strategy-item preset-item">
                <div className="strategy-info">
                  <span className="strategy-name">{preset.name}</span>
                  <span className="strategy-description">{preset.description}</span>
                </div>
                <div className="strategy-actions">
                  <button 
                    onClick={() => {
                      handleApplyPreset(preset);
                      setIsOpen(false);
                    }}
                    className="apply-btn"
                  >
                    Use Preset
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="dropdown-actions">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="create-strategy-btn"
            >
              + Create New Strategy
            </button>
            <button 
              onClick={() => {
                onUpdateAll();
                setIsOpen(false);
              }}
              className="update-all-btn"
            >
              Update All Papers
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Create New Strategy</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newStrategy.name}
                onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter strategy name"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newStrategy.description}
                onChange={(e) => setNewStrategy(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your strategy"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={newStrategy.isDefault}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, isDefault: e.target.checked }))}
                />
                Set as default strategy
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button 
                onClick={handleCreateStrategy}
                className="create-btn"
                disabled={!newStrategy.name.trim()}
              >
                Create Strategy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StrategyMenu;