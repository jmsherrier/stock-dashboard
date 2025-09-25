// Data transformation utilities for handling legacy and modular formats

export const createDefaultStock = () => {
  const id = `stock-${Date.now()}`;
  return {
    id,
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

export const normalizeStockData = (stock) => {
  if (stock.components) {
    // New modular format - convert to legacy format for compatibility
    return {
      ...stock,
      ticker: stock.components.ticker?.value || '',
      price: stock.components.price?.value || '',
      percentRise: stock.components.percentRise?.value || '',
      relativeVolume: stock.components.relativeVolume?.value || '',
      float: stock.components.float?.value || '',
      notes: stock.components.notes?.value || '',
      positiveCatalysts: stock.components.news?.items || [],
      marketDrivers: [],
      bonusChecks: stock.components.bonusChecks?.checks || {}
    };
  }
  return stock; // Already in legacy format
};

export const convertToModularFormat = (stock) => {
  if (stock.components) {
    return stock; // Already in modular format
  }
  
  // Convert legacy format to modular
  return {
    ...stock,
    components: {
      ticker: { value: stock.ticker || '' },
      price: { value: stock.price || '' },
      percentRise: { value: stock.percentRise || '' },
      relativeVolume: { value: stock.relativeVolume || '' },
      float: { value: stock.float || '' },
      notes: { value: stock.notes || '' },
      news: { items: stock.positiveCatalysts || [] },
      bonusChecks: { 
        checks: stock.bonusChecks || {
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