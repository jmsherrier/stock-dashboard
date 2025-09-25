import React, { useState } from 'react';
import { STRATEGY_PRESETS } from './modular/ComponentRegistry';

function PresetMenu({ isOpen, onClose, onPresetApply, onUpdateStocks }) {
  const [selectedPreset, setSelectedPreset] = useState('momentum');
  const [customBonusChecks, setCustomBonusChecks] = useState(
    STRATEGY_PRESETS.momentum.bonusChecks
  );

  if (!isOpen) return null;

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId);
    setCustomBonusChecks(STRATEGY_PRESETS[presetId].bonusChecks);
  };

  const handleBonusCheckUpdate = (checkId, field, value) => {
    setCustomBonusChecks(prev => ({
      ...prev,
      [checkId]: {
        ...prev[checkId],
        [field]: value
      }
    }));
  };

  const handleAddBonusCheck = () => {
    const newId = `custom_${Date.now()}`;
    setCustomBonusChecks(prev => ({
      ...prev,
      [newId]: {
        points: 1,
        description: 'New bonus criteria'
      }
    }));
  };

  const handleRemoveBonusCheck = (checkId) => {
    setCustomBonusChecks(prev => {
      const updated = { ...prev };
      delete updated[checkId];
      return updated;
    });
  };

  const handleApplyPreset = () => {
    const preset = {
      ...STRATEGY_PRESETS[selectedPreset],
      bonusChecks: customBonusChecks
    };
    onPresetApply(preset);
    onClose();
  };

  return (
    <div className="preset-menu-overlay">
      <div className="preset-menu">
        <div className="preset-header">
          <h3>Configure Strategy Preset</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="preset-content">
          <div className="preset-selection">
            <h4>Strategy Presets</h4>
            <div className="preset-options">
              {Object.values(STRATEGY_PRESETS).map(preset => (
                <button
                  key={preset.id}
                  className={`preset-option ${selectedPreset === preset.id ? 'active' : ''}`}
                  onClick={() => handlePresetSelect(preset.id)}
                >
                  <div className="preset-name">{preset.name}</div>
                  <div className="preset-description">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bonus-checks-config">
            <h4>Bonus Criteria Configuration</h4>
            <div className="bonus-checks-list">
              {Object.entries(customBonusChecks).map(([checkId, check]) => (
                <div key={checkId} className="bonus-check-config">
                  <input
                    type="text"
                    value={check.description}
                    onChange={(e) => handleBonusCheckUpdate(checkId, 'description', e.target.value)}
                    placeholder="Criteria description"
                    className="bonus-description-input"
                  />
                  <input
                    type="number"
                    value={check.points}
                    onChange={(e) => handleBonusCheckUpdate(checkId, 'points', parseInt(e.target.value) || 0)}
                    className="bonus-points-input"
                    min="0"
                    max="5"
                  />
                  <span className="points-label">pts</span>
                  <button
                    onClick={() => handleRemoveBonusCheck(checkId)}
                    className="remove-check-btn"
                    title="Remove criteria"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleAddBonusCheck} className="add-bonus-check-btn">
              + Add Bonus Criteria
            </button>
          </div>
        </div>

        <div className="preset-actions">
          <button onClick={onUpdateStocks} className="update-stocks-btn">
            Update Stocks
          </button>
          <div className="action-group">
            <button onClick={onClose} className="cancel-btn">Cancel</button>
            <button onClick={handleApplyPreset} className="apply-preset-btn">
              Apply Preset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PresetMenu;