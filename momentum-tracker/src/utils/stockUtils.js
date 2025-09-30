// Data transformation utilities for handling legacy and modular formats
import { STRATEGY_PRESETS } from '../components/modular/ComponentRegistry';

export const createDefaultStock = () => {
  const id = `stock-${Date.now()}`;
  return {
    id,
    paperConfig: STRATEGY_PRESETS.momentum.paperConfig, // Default to momentum strategy layout
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