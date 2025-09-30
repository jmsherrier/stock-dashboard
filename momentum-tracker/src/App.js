import React, { useEffect, useState } from 'react';
import './App.css';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import PresetMenu from './components/PresetMenu';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import SortableStockPaper from './components/SortableStockPaper';

import { useStocks } from './hooks/useStocks';
import { useApiCounters } from './hooks/useApiCounters';
import { createDefaultStock } from './utils/stockUtils';
import { calculateScore } from './utils/scoreCalculator';
import { StockService } from './services/stockService';
import apiClient from './api/client';
import { storage } from './services';
import { APP_CONFIG } from './config';


function MainApp() {
  const { user } = useAuth();
  const {
    stocks,
    setStocks,
    selectedStock,
    setSelectedStock,
    undoStack,
    updateStock,
    removeStock,
    undo,
    saveStocksToBackend
  } = useStocks();

  // Handle drag end for reordering stocks
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setStocks((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      // Don't allow moving locked stocks
      if (items[oldIndex]?.locked) return items;

      const newArray = arrayMove(items, oldIndex, newIndex);
      
      // Preserve locked positions: if a locked stock would be displaced, adjust
      const lockedStocks = items.map((stock, idx) => stock.locked ? idx : -1).filter(idx => idx !== -1);
      if (lockedStocks.length > 0) {
        // Keep locked stocks in their original positions
        const finalArray = [...newArray];
        lockedStocks.forEach(originalIdx => {
          const lockedStock = items[originalIdx];
          const currentIdx = finalArray.findIndex(s => s.id === lockedStock.id);
          if (currentIdx !== originalIdx) {
            // Move locked stock back to original position
            finalArray.splice(currentIdx, 1);
            finalArray.splice(originalIdx, 0, lockedStock);
          }
        });
        return finalArray;
      }

      return newArray;
    });
  };  const { 
    counters, 
    isUpdating, 
    setIsUpdating, 
    perStockUpdating, 
    setStockUpdating,
    canMakeRequest,
    refreshCounters 
  } = useApiCounters();
  
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState(15); // seconds
  const [timeUntilLimitReached, setTimeUntilLimitReached] = useState(null);

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
    setStocks(prev => [newStock, ...prev]);
    
    // Auto-focus ticker input after creation
    setTimeout(() => {
      const tickerInputs = document.querySelectorAll('.component-wrapper input');
      if (tickerInputs.length > 0) {
        tickerInputs[0].focus();
      }
    }, 100);
  };



  const updateAllStocks = async () => {
    console.log('updateAllStocks called, stocks:', stocks);
    if (!canMakeRequest()) {
      console.log('Cannot make request - rate limit');
      return;
    }
    
    setIsUpdating(true);
    try {
      console.log('Calling StockService.updateMultipleStocks...');
      const updated = await StockService.updateMultipleStocks(stocks);
      console.log('Got updated stocks:', updated);
      setStocks(updated);
      console.log('State updated with:', updated);
      
      // Auto-sort if enabled
      const autoSort = localStorage.getItem('auto-sort-on-update') !== 'false';
      if (autoSort) {
        setTimeout(() => reorderByScore(), 100);
      }
      
      // Save to backend if authenticated
      if (user) {
        console.log('Saving to backend...');
        await saveStocksToBackend(updated);
      }
    } catch (error) {
      console.error('Error in updateAllStocks:', error);
    } finally {
      setIsUpdating(false);
      refreshCounters();
    }
  };

  const updateSingle = async (id) => {
    console.log('updateSingle called for id:', id);
    
    if (!canMakeRequest()) {
      console.log('Cannot make request - rate limit reached');
      return;
    }
    
    const stock = stocks.find(s => s.id === id);
    if (!stock) {
      console.log('Stock not found:', id);
      return;
    }
    console.log('Found stock:', stock);

    setStockUpdating(id, true);
    try {
      console.log('Calling StockService.updateStockQuote...');
      const updatedStock = await StockService.updateStockQuote(stock);
      console.log('Got updated stock:', updatedStock);
      
      const newStocks = stocks.map(s => s.id === id ? updatedStock : s);
      console.log('New stocks array:', newStocks);
      setStocks(newStocks);
      console.log('State updated');
      
      // Save to backend if authenticated
      if (user) {
        console.log('Saving to backend...');
        await saveStocksToBackend(newStocks);
      }
    } catch (err) {
      console.error('Failed to update single stock:', err);
    } finally {
      setStockUpdating(id, false);
      refreshCounters();
    }
  };

  const clearAllData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all data? This action cannot be undone.\\n\\n' +
      'This will remove:\\n' +
      '• All saved stocks and their data\\n' +
      '• All custom settings and preferences\\n' +
      '• All user authentication data'
    );
    
    if (confirmed) {
      try {
        // Clear local state
        setStocks([]);
        setSelectedStock(null);
        
        // Clear localStorage
        localStorage.clear();
        
        // Clear backend data if authenticated
        if (user) {
          try {
            await apiClient.clearUserData();
          } catch (error) {
            console.warn('Failed to clear backend data:', error);
          }
        }
        
        // Close settings menu
        setShowSettingsMenu(false);
        
        // Show success message
        alert('All data has been cleared successfully.');
        
        // Reload the page to reset the application state
        window.location.reload();
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('There was an error clearing some data. Please try again.');
      }
    }
  };

  const reorderByScore = () => {
    setStocks(prev => {
      const sorted = [...prev].sort((a, b) => calculateScore(b) - calculateScore(a));
      
      // Preserve locked stocks in their original positions
      const lockedPositions = new Map();
      prev.forEach((stock, idx) => {
        if (stock.locked) {
          lockedPositions.set(stock.id, idx);
        }
      });
      
      if (lockedPositions.size === 0) return sorted;
      
      // Remove locked stocks from sorted array
      const unlockedSorted = sorted.filter(s => !s.locked);
      
      // Create final array with locked stocks in original positions
      const finalArray = [];
      let unlockedIdx = 0;
      
      for (let i = 0; i < prev.length; i++) {
        const lockedStock = prev[i];
        if (lockedStock.locked) {
          finalArray[i] = lockedStock;
        } else {
          // Fill with next unlocked sorted stock
          while (finalArray[i] === undefined && unlockedIdx < unlockedSorted.length) {
            if (!lockedPositions.has(unlockedSorted[unlockedIdx].id)) {
              finalArray[i] = unlockedSorted[unlockedIdx];
            }
            unlockedIdx++;
          }
        }
      }
      
      return finalArray.filter(Boolean);
    });
  };

  const toggleLock = (stockId) => {
    setStocks(prev => prev.map(stock => 
      stock.id === stockId ? { ...stock, locked: !stock.locked } : stock
    ));
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

  // Auto-update effect
  useEffect(() => {
    if (!autoUpdateEnabled) {
      setTimeUntilLimitReached(null);
      return;
    }

    // Calculate if auto-update rate exceeds API limits
    const updatesPerMinute = 60 / autoUpdateInterval;
    const stockCount = stocks.length;
    const requestsPerUpdate = stockCount;
    const requestsPerMinute = updatesPerMinute * requestsPerUpdate;

    // Check if rate would exceed minute limit
    if (requestsPerMinute > APP_CONFIG.apiLimits.minuteLimit) {
      alert(
        `Auto-update rate too fast!\\n\\n` +
        `At ${autoUpdateInterval}s intervals with ${stockCount} stocks, you would make ${requestsPerMinute.toFixed(1)} requests/minute.\\n` +
        `Your limit is ${APP_CONFIG.apiLimits.minuteLimit} requests/minute.\\n\\n` +
        `Please increase the interval or reduce the number of stocks.`
      );
      setAutoUpdateEnabled(false);
      return;
    }

    // Calculate time until daily limit is reached
    const calculateTimeRemaining = () => {
      const remainingDaily = APP_CONFIG.apiLimits.dailyLimit - counters.daily;
      const updatesRemaining = Math.floor(remainingDaily / requestsPerUpdate);
      const secondsRemaining = updatesRemaining * autoUpdateInterval;
      setTimeUntilLimitReached(secondsRemaining);
    };

    calculateTimeRemaining();
    const timerInterval = setInterval(calculateTimeRemaining, 1000);

    // Set up auto-update interval
    const updateInterval = setInterval(() => {
      if (canMakeRequest()) {
        updateAllStocks();
      } else {
        setAutoUpdateEnabled(false);
        alert('API limit reached. Auto-update has been disabled.');
      }
    }, autoUpdateInterval * 1000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(timerInterval);
    };
  }, [autoUpdateEnabled, autoUpdateInterval, stocks.length, counters.daily]);

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (seconds === null || seconds < 0) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

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
                    setShowSettingsModal(true);
                    setShowSettingsMenu(false);
                  }}>
                    Settings
                  </button>
                  <button onClick={() => {
                    clearAllData();
                  }}>
                    Clear Data
                  </button>
                  <button onClick={() => {
                    setShowAboutModal(true);
                    setShowSettingsMenu(false);
                  }}>
                    About
                  </button>
                </div>
              )}
            </div>
            <h1>Volitiliraptor</h1>
          </div>
        </div>
        
        <div className="header-center">
          <div className="api-status">
            {user ? `API Requests: ${counters.daily || 0}/${APP_CONFIG.apiLimits.dailyLimit} daily | ${counters.minute || 0}/${APP_CONFIG.apiLimits.minuteLimit} per minute` : 'Development Mode'}
          </div>
        </div>
        
        <div className="header-buttons">
          <div className="button-group primary-actions">
            <button 
              onClick={() => setShowPresetMenu(!showPresetMenu)} 
              className="preset-btn"
              title="Configure preset settings"
            >
              Configure
            </button>
            <button onClick={addStock} className="add-btn" title="Add new stock ticker (A)">
              Add Paper
            </button>
            <button 
              onClick={updateAllStocks} 
              disabled={!canMakeRequest()}
              className="update-all-btn"
              title="Update all stocks with latest data (U)"
            >
              {isUpdating ? 'Updating...' : 'Update All'}
            </button>
            
            {/* Auto-Update Controls */}
            <div className="auto-update-button">
              <label className="auto-update-checkbox">
                <input
                  type="checkbox"
                  checked={autoUpdateEnabled}
                  onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                  disabled={stocks.length === 0}
                />
                <span>Auto</span>
              </label>
              <select
                value={autoUpdateInterval}
                onChange={(e) => setAutoUpdateInterval(Number(e.target.value))}
                className="auto-update-interval"
                disabled={!autoUpdateEnabled}
              >
                <option value={10}>10s</option>
                <option value={15}>15s</option>
                <option value={20}>20s</option>
                <option value={30}>30s</option>
                <option value={60}>1min</option>
                <option value={120}>2min</option>
                <option value={300}>5min</option>
              </select>
            </div>
            {autoUpdateEnabled && timeUntilLimitReached !== null && (
              <span className="auto-update-timer" title="Time until daily limit reached">
                {formatTimeRemaining(timeUntilLimitReached)}
              </span>
            )}
            
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

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                perStockUpdating={perStockUpdating}
                onUpdateSingle={updateSingle}
                canMakeRequest={canMakeRequest}
                onToggleLock={toggleLock}
                useModular={true}
              />
            ))}
          </SortableContext>
          {stocks.length === 0 && (
            <div className="empty-state">
              <h3>No stocks added yet</h3>
              <p>Press 'A' or click 'Add Paper' to get started</p>
            </div>
          )}
        </div>
      </DndContext>

      <PresetMenu
        isOpen={showPresetMenu}
        onClose={() => setShowPresetMenu(false)}
        onPresetApply={(preset) => {
          console.log('Preset applied:', preset);
          // Presets are now handled at the component level within each stock
          setShowPresetMenu(false);
          // Check if auto-update is enabled in settings
          const autoUpdate = localStorage.getItem('auto-update-on-preset') !== 'false';
          if (autoUpdate) {
            updateAllStocks();
          }
        }}
        onUpdateStocks={updateAllStocks}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        user={user}
      />

      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
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
  
  if (!user) {
    return <ApiKeyPrompt />;
  }
  
  return <MainApp />;
}

export default App;
