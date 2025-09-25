import React, { useEffect, useState } from 'react';
import './App.css';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import PresetMenu from './components/PresetMenu';
import SortableStockPaper from './components/SortableStockPaper';

import { apiService, storage } from './services';
import apiClient from './api/client';
import { STRATEGY_PRESETS } from './components/modular/ComponentRegistry';

function MainApp() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [counters, setCounters] = useState(apiService.getCounters());
  const [perStockUpdating, setPerStockUpdating] = useState({});
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          // Load data from backend for authenticated users
          const userStocks = await apiClient.getUserStocks();
          setStocks(userStocks || []);
        } else {
          // Load from localStorage for unauthenticated users
          const loaded = await storage.load();
          if (loaded) setStocks(loaded.stocks || []);
        }
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    };
    
    loadData();
    const refreshCounters = () => setCounters(apiService.getCounters());
    refreshCounters();
    const ci = setInterval(refreshCounters, 5000);
    return () => clearInterval(ci);
  }, [user]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsMenu && !event.target.closest('.settings-dropdown')) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSettingsMenu]);

  const addStock = () => {
    const newStock = createDefaultStock();
    setUndoStack(prev => [...prev, stocks]);
    setStocks(prev => [newStock, ...prev]);
    
    // Auto-focus ticker input after creation
    setTimeout(() => {
      const tickerInputs = document.querySelectorAll('.component-wrapper input');
      if (tickerInputs.length > 0) {
        tickerInputs[0].focus();
      }
    }, 100);
  };

  const updateStock = async (id, componentKey, value) => {
    setUndoStack(prev => [...prev, stocks]);
    setStocks(prev => prev.map(s => {
      if (s.id === id) {
        const updatedComponents = { ...s.components };
        if (updatedComponents[componentKey]) {
          updatedComponents[componentKey] = { ...updatedComponents[componentKey], ...value };
        }
        const updatedStock = { ...s, components: updatedComponents };
        
        // Save to backend if authenticated
        if (user) {
          apiClient.saveUserStock(updatedStock).catch(console.error);
        }
        
        return updatedStock;
      }
      return s;
    }));
  };

  const removeStock = async (id) => {
    setUndoStack(prev => [...prev, stocks]);
    setStocks(prev => prev.filter(s => s.id !== id));
    if (selectedStock === id) setSelectedStock(null);
    
    // Remove from backend if authenticated
    if (user) {
      try {
        // Backend doesn't have delete endpoint yet, just remove locally
        console.log('Stock removed locally:', id);
      } catch (error) {
        console.error('Failed to remove stock from backend:', error);
      }
    }
  };

  const updateAllStocks = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await Promise.all(stocks.map(async (s) => {
        try {
          // Skip stocks without valid tickers
          if (!s.components?.ticker?.value || s.components.ticker.value.trim() === '') {
            console.log('Skipping stock without ticker:', s);
            return s;
          }
          
          const ticker = s.components.ticker.value;
          const quote = await apiClient.getStockQuote(ticker);
          
          // Update modular components with new data
          const updatedComponents = { ...s.components };
          
          if (quote.price && updatedComponents.price) {
            updatedComponents.price.value = quote.price.toString();
          }
          if (quote.percentChange && updatedComponents.percentRise) {
            updatedComponents.percentRise.value = quote.percentChange.toString();
          }
          if (quote.relativeVolume && updatedComponents.relativeVolume) {
            updatedComponents.relativeVolume.value = quote.relativeVolume.toString();
          }
          
          return { ...s, components: updatedComponents };
        } catch (err) {
          console.warn('Failed to update stock:', s.components?.ticker?.value, err);
          return s;
        }
      }));
      
      setUndoStack(prev => [...prev, stocks]);
      setStocks(updated);
      
      // Save to backend if authenticated
      if (user) {
        await saveStocksToBackend(updated);
      }
    } finally {
      setIsUpdating(false);
      setCounters(apiService.getCounters());
    }
  };

  const updateSingle = async (id) => {
    const stock = stocks.find(s => s.id === id);
    if (!stock || !stock.components?.ticker?.value?.trim()) {
      console.log('Cannot update stock without ticker:', stock);
      return;
    }

    setPerStockUpdating(p => ({ ...p, [id]: true }));
    try {
      const ticker = stock.components.ticker.value;
      const quote = await apiClient.getStockQuote(ticker);      setUndoStack(prev => [...prev, stocks]);
      let updatedStock = null;
      setStocks(prev => prev.map(s => {
        if (s.id === id) {
          const updatedComponents = { ...s.components };
          
          if (quote.price && updatedComponents.price) {
            updatedComponents.price.value = quote.price.toString();
          }
          if (quote.percentChange && updatedComponents.percentRise) {
            updatedComponents.percentRise.value = quote.percentChange.toString();
          }
          if (quote.relativeVolume && updatedComponents.relativeVolume) {
            updatedComponents.relativeVolume.value = quote.relativeVolume.toString();
          }
          
          updatedStock = { ...s, components: updatedComponents };
          return updatedStock;
        }
        return s;
      }));
      
      // Save to backend if authenticated
      if (user && updatedStock) {
        await apiClient.saveUserStock(updatedStock);
      }
    } catch (err) {
      console.error('Failed to update single:', err);
    } finally {
      setPerStockUpdating(p => ({ ...p, [id]: false }));
      setCounters(apiService.getCounters());
    }
  };

  const undo = () => {
    setStocks(prev => {
      const last = undoStack[undoStack.length - 1];
      setUndoStack(us => us.slice(0, -1));
      return last || prev;
    });
  };

  const saveStocksToBackend = async (stocksToSave) => {
    if (!user) return;
    
    try {
      for (const stock of stocksToSave) {
        await apiClient.saveUserStock(stock);
      }
    } catch (error) {
      console.error('Failed to save stocks to backend:', error);
    }
  };

  const calculateScore = (stock) => {
    if (!stock.components) return 0;
    
    let score = 0;
    
    // Helper function to get score for individual criteria
    const getScorePoints = (value, type) => {
      if (value === null || value === undefined || value === '' || value === 0) {
        return 0;
      }
      
      const val = parseFloat(value);
      if (isNaN(val)) return 0;
      
      switch (type) {
        case 'price':
          if (val >= 15) return -3;
          if (val >= 10) return -2;
          if (val >= 8) return -1;
          if (val >= 5) return 1;
          if (val >= 3) return 2;
          if (val >= 2) return 3;
          return 0;
        
        case 'percentRise':
          if (val < 3) return -3;
          if (val < 5) return -2;
          if (val < 7) return -1;
          if (val < 10) return 1;
          if (val < 15) return 2;
          if (val >= 15) return 3;
          return 0;
        
        case 'relativeVolume':
          if (val < 2) return -3;
          if (val < 3) return -2;
          if (val < 5) return -1;
          if (val < 8) return 1;
          if (val < 12) return 2;
          if (val >= 12) return 3;
          return 0;
        
        case 'float':
          if (val > 50) return -3;
          if (val > 30) return -2;
          if (val > 20) return -1;
          if (val > 15) return 1;
          if (val > 10) return 2;
          if (val > 0 && val <= 10) return 3;
          return 0;
        
        default:
          return 0;
      }
    };
    
    // Apply scoring for modular components
    const components = stock.components;
    if (components.price) score += getScorePoints(components.price.value, 'price');
    if (components.percentRise) score += getScorePoints(components.percentRise.value, 'percentRise');
    if (components.relativeVolume) score += getScorePoints(components.relativeVolume.value, 'relativeVolume');
    if (components.float) score += getScorePoints(components.float.value, 'float');
    
    // News scoring
    if (components.news && components.news.items) {
      score += components.news.items.reduce((sum, item) => sum + (item.points || 0), 0);
    }
    
    // Bonus checks scoring
    if (components.bonusChecks && components.bonusChecks.checks) {
      Object.values(components.bonusChecks.checks).forEach(checked => {
        if (checked) score += 1;
      });
    }
    
    return score;
  };

  const reorderByScore = () => {
    setUndoStack(prev => [...prev, stocks]);
    setStocks(prev => [...prev].sort((a, b) => calculateScore(b) - calculateScore(a)));
  };

  const handleStrategyApply = async (strategy) => {
    try {
      // Apply strategy configuration to all stocks
      const updatedStocks = stocks.map(stock => ({
        ...stock,
        paperConfig: strategy.paperConfig
      }));
      
      setStocks(updatedStocks);
      
      if (user) {
        await saveStocksToBackend(updatedStocks);
      }
    } catch (error) {
      console.error('Failed to apply strategy:', error);
    }
  };

  const createDefaultStock = () => {
    const strategy = STRATEGY_PRESETS.momentum; // Use momentum as default strategy
    return {
      id: `stock-${Date.now()}`,
      components: {
        ticker: { value: '' },
        price: { value: '' },
        percentRise: { value: '' },
        relativeVolume: { value: '' },
        float: { value: '' },
        sharesOutstanding: { value: '' },
        restrictedShares: { value: '' },
        news: { items: [] },
        notes: { value: '' },
        bonusChecks: { checks: strategy?.bonusChecks || {} }
      },
      paperConfig: strategy?.paperConfig || {
        ticker: true,
        price: true,
        percentRise: true,
        relativeVolume: true,
        float: true,
        sharesOutstanding: false,
        restrictedShares: false,
        news: true,
        notes: true,
        bonusChecks: true
      }
    };
  };

  useEffect(() => {
    const saveData = async () => {
      try {
        if (user) {
          // Data is saved individually via API calls, no need for bulk save
          return;
        } else {
          // Save to localStorage for unauthenticated users
          const toSave = { stocks, meta: { updated: Date.now() } };
          await storage.save(toSave);
        }
      } catch (e) {
        console.error('Failed to save data:', e);
      }
    };
    
    if (stocks.length > 0 || localStorage.getItem('momentum_data')) {
      saveData();
    }
  }, [stocks, user]);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Don't trigger shortcuts if user is editing text
      const activeElement = document.activeElement;
      const isEditingText = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true'
      );
      
      if (isEditingText) return;
      
      if (e.key === 'a' || e.key === 'A') addStock();
      if (e.key === 'u' || e.key === 'U') updateAllStocks();
      if (e.key === 'Delete' && selectedStock) removeStock(selectedStock);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedStock, stocks, counters]);

  // Click outside to deselect stock
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Only deselect if there's a selected stock
      if (!selectedStock) return;
      
      // Check if click is outside any stock-wrapper
      const stockWrapper = e.target.closest('.stock-wrapper');
      if (!stockWrapper) {
        setSelectedStock(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedStock]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="app-title-section">
            <div className="settings-dropdown">
              <button 
                className="settings-gear" 
                title="Settings"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettingsMenu(!showSettingsMenu);
                }}
              >
                ⋮
              </button>
              {showSettingsMenu && (
                <div className="settings-menu">
                  <button onClick={() => {
                    // Settings clicked - placeholder for future functionality
                    setShowSettingsMenu(false);
                  }}>
                    Settings
                  </button>
                  <button onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                    setShowSettingsMenu(false);
                  }}>
                    Clear Data
                  </button>
                  <button onClick={() => {
                    window.open('https://github.com/jmsherrier/whiteboard', '_blank');
                    setShowSettingsMenu(false);
                  }}>
                    About
                  </button>
                </div>
              )}
            </div>
            <h1>Volitiliraptor</h1>
          </div>
          {user && <span className="user-info">Welcome, {user.email}</span>}
        </div>
        
        <div className="header-center">
          <div className="api-status">
            Requests: {counters.daily}/500 daily | {counters.minute}/5 per minute
          </div>
        </div>
        
        <div className="header-buttons">
          <div className="button-group primary-actions">
            <button 
              onClick={() => setShowPresetMenu(!showPresetMenu)} 
              className="preset-btn"
              title="Configure preset settings"
            >
              Presets
            </button>
            <button onClick={addStock} className="add-btn" title="Add new stock ticker (A)">
              Add Stock
            </button>
            <button 
              onClick={updateAllStocks} 
              disabled={isUpdating || counters.daily >= 500 || counters.minute >= 5}
              className="update-all-btn"
              title="Update all stocks with latest data (U)"
            >
              {isUpdating ? 'Updating...' : 'Update All'}
            </button>
            <button onClick={reorderByScore} className="reorder-btn" title="Sort all stocks by current score (descending)">
              Sort
            </button>
          </div>
          
          <div className="button-group secondary-actions">
            <button onClick={undo} disabled={undoStack.length === 0} className="undo-btn" title="Undo last action">
              Undo
            </button>
          </div>
        </div>
      </header>

      <DndContext collisionDetection={closestCenter}>
        <div className="stocks-container">
          <SortableContext items={stocks.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {stocks.map((stock, index) => (
              <SortableStockPaper
                key={stock.id}
                stock={stock}
                score={calculateScore(stock)}
                rank={index + 1}
                isSelected={selectedStock === stock.id}
                onSelect={() => setSelectedStock(stock.id)}
                onUpdate={updateStock}
                onRemove={removeStock}
                isUpdating={perStockUpdating[stock.id]}
                onUpdateSingle={updateSingle}
                useModular={true}
              />
            ))}
          </SortableContext>
          {stocks.length === 0 && (
            <div className="empty-state">
              <h3>No stocks added yet</h3>
              <p>Press 'A' or click 'Add Ticker' to get started</p>
            </div>
          )}
        </div>
      </DndContext>

      <PresetMenu
        isOpen={showPresetMenu}
        onClose={() => setShowPresetMenu(false)}
        onPresetApply={handleStrategyApply}
        onUpdateStocks={updateAllStocks}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [devMode, setDevMode] = useState(false);
  
  // Development mode toggle (remove in production)
  if (process.env.NODE_ENV === 'development' && !user && !devMode) {
    return (
      <div className="dev-mode-prompt">
        <div className="dev-container">
          <h2>Development Mode</h2>
          <p>Choose how to proceed:</p>
          <div className="dev-buttons">
            <button onClick={() => setDevMode(true)} className="dev-bypass-btn">
              🚀 Skip Login (Dev Mode)
            </button>
            <div className="dev-divider">or</div>
            <ApiKeyPrompt />
          </div>
        </div>
      </div>
    );
  }
  
  if (!user && !devMode) {
    return <ApiKeyPrompt />;
  }
  
  return <MainApp />;
}

export default App;
