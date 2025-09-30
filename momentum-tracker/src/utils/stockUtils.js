// Data transformation utilities for handling legacy and modular formats
import { STRATEGY_PRESETS } from '../components/modular/ComponentRegistry';

export const createDefaultStock = (presetName = 'momentum', position = null) => {
  const id = `stock-${Date.now()}`;
  const preset = STRATEGY_PRESETS[presetName] || STRATEGY_PRESETS.momentum;
  
  return {
    id,
    position, // Position in the grid (null means append to end)
    paperConfig: preset.paperConfig, // Use specified preset's layout
    components: {
      ticker: { value: '' },
      price: { value: '' },
      percentRise: { value: '' },
      relativeVolume: { value: '' },
      float: { value: '' },
      notes: { value: '' },
      news: { items: [] },
      bonusChecks: { 
        checks: {
          recentIPO: false,
          recentReverseSplit: false,
          blueSkyBreakout: false
        }
      }
    }
  };
};



export const preserveFormatting = (newValue, oldValue) => {
  // Preserve user formatting when updating values
  if (!oldValue || oldValue.toString().trim() === '') {
    return newValue;
  }
  
  const oldStr = oldValue.toString();
  const newStr = newValue.toString();
  
  // If the old value had a specific format (like $ or %), try to preserve it
  if (oldStr.includes('$') && !newStr.includes('$')) {
    return `$${newStr}`;
  }
  if (oldStr.includes('%') && !newStr.includes('%')) {
    return `${newStr}%`;
  }
  if (oldStr.includes('M') && !newStr.includes('M')) {
    return `${newStr}M`;
  }
  
  return newValue;
};