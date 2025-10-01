import React, { useEffect, useState, useCallback } from 'react';
import './App.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import PresetMenu from './components/PresetMenu';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import GridCanvas from './components/GridCanvas';

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

  const { 
    counters, 
    isUpdating, 
    setIsUpdating, 
    perStockUpdating, 
    setStockUpdating,
    canMakeRequest,
    refreshCounters 
  } = useApiCounters();
  
  const [currentPreset, setCurrentPreset] = useState('momentum');
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState(15); // seconds
  const [timeUntilLimitReached, setTimeUntilLimitReached] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false);

  // Track hovered stock for delete functionality
  const [hoveredStockId, setHoveredStockId] = useState(null);

  // Track last mouse position for context-aware 'A' key
  const lastMousePosition = React.useRef({ x: 0, y: 0 });
  const gridCanvasRef = React.useRef(null);

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Grid settings from localStorage
  const [gridSettings, setGridSettings] = useState({
    clickEmptyToAdd: localStorage.getItem('click-empty-to-add') !== 'false',
    zeroAligned: localStorage.getItem('zero-aligned') === 'true'
  });

  // Create initial default stock if none exist
  useEffect(() => {
    if (stocks.length === 0 && !localStorage.getItem('has-initialized')) {
      const initialStock = {
        ...createDefaultStock(currentPreset, 0),
        gridPosition: { x: 0, y: 0 }
      };
      setStocks([initialStock]);
      localStorage.setItem('has-initialized', 'true');
    }
  }, []);

  // Create initial default stock if none exist
  useEffect(() => {
    if (stocks.length === 0 && !localStorage.getItem('has-initialized')) {
      const initialStock = {
        ...createDefaultStock(currentPreset, 0),
        gridPosition: { x: 0, y: 0 }
      };
      setStocks([initialStock]);
      localStorage.setItem('has-initialized', 'true');
    }
  }, []);

  // Listen for localStorage changes to update settings in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      setGridSettings({
        clickEmptyToAdd: localStorage.getItem('click-empty-to-add') !== 'false',
        zeroAligned: localStorage.getItem('zero-aligned') === 'true'
      });
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check on focus in case settings changed in same tab
    const interval = setInterval(handleStorageChange, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

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

  const addStock = (gridPosition = null) => {
    // If no position provided, find optimal position using smart placement
    if (!gridPosition) {
      gridPosition = findOptimalPlacement();
    }
    
    const newStock = {
      ...createDefaultStock(currentPreset, 0),
      gridPosition
    };
    
    setStocks(prev => [...prev, newStock]);
    
    // Auto-focus ticker input after creation
    setTimeout(() => {
      const tickerInputs = document.querySelectorAll('.ticker-input');
      if (tickerInputs.length > 0) {
        tickerInputs[tickerInputs.length - 1].focus();
        tickerInputs[tickerInputs.length - 1].select();
      }
    }, 100);
  };

  // Smart placement algorithm with priority: right > left > top > bottom > corners
  const findOptimalPlacement = () => {
    if (stocks.length === 0) {
      return { x: 0, y: 0 };
    }

    // Get all occupied positions
    const occupied = new Set(stocks.map(s => {
      const pos = s.gridPosition || { x: 0, y: 0 };
      return `${pos.x},${pos.y}`;
    }));

    // Helper to check if position is occupied
    const isOccupied = (x, y) => occupied.has(`${x},${y}`);

    // Calculate center of mass of all stocks
    const centerX = stocks.reduce((sum, s) => sum + (s.gridPosition?.x || 0), 0) / stocks.length;
    const centerY = stocks.reduce((sum, s) => sum + (s.gridPosition?.y || 0), 0) / stocks.length;

    // Priority offsets: right, left, top, bottom, then diagonals
    const priorityOffsets = [
      { dx: 1, dy: 0 },   // right
      { dx: -1, dy: 0 },  // left
      { dx: 0, dy: -1 },  // top
      { dx: 0, dy: 1 },   // bottom
      { dx: 1, dy: -1 },  // top-right
      { dx: 1, dy: 1 },   // bottom-right
      { dx: -1, dy: -1 }, // top-left
      { dx: -1, dy: 1 }   // bottom-left
    ];

    // Search in expanding rings from center
    for (let distance = 1; distance <= 50; distance++) {
      // For each distance, try all positions at that Manhattan distance
      for (let dx = -distance; dx <= distance; dx++) {
        for (let dy = -distance; dy <= distance; dy++) {
          if (Math.abs(dx) + Math.abs(dy) !== distance) continue;
          
          const x = Math.round(centerX) + dx;
          const y = Math.round(centerY) + dy;
          
          if (!isOccupied(x, y)) {
            // Check if this position has an adjacent stock (prefer connected placements)
            let hasAdjacent = false;
            for (const offset of priorityOffsets) {
              if (isOccupied(x + offset.dx, y + offset.dy)) {
                hasAdjacent = true;
                break;
              }
            }
            
            if (hasAdjacent) {
              return { x, y };
            }
          }
        }
      }
    }

    // Fallback: find any empty position near origin
    for (let d = 0; d < 100; d++) {
      for (const offset of priorityOffsets) {
        const x = offset.dx * d;
        const y = offset.dy * d;
        if (!isOccupied(x, y)) {
          return { x, y };
        }
      }
    }

    return { x: 0, y: 0 };
  };

  const handleStockMove = (stockId, newGridPosition) => {
    setStocks(prev => prev.map(s => 
      s.id === stockId ? { ...s, gridPosition: newGridPosition } : s
    ));
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

  const updateAllStocksWithArray = async (stocksArray) => {
    if (!canMakeRequest()) {
      return;
    }
    
    setIsUpdating(true);
    try {
      const updated = await StockService.updateMultipleStocks(stocksArray);
      // Preserve paperConfig for stocks without tickers (they won't be updated by service)
      const merged = updated.map((updatedStock, idx) => {
        const originalStock = stocksArray[idx];
        // If stock has no ticker, preserve the paperConfig we just set
        if (!originalStock.components?.ticker?.value?.trim()) {
          return {
            ...updatedStock,
            paperConfig: originalStock.paperConfig
          };
        }
        return updatedStock;
      });
      setStocks(merged);
      
      // Auto-sort if enabled
      const autoSort = localStorage.getItem('auto-sort-on-update') !== 'false';
      if (autoSort) {
        setTimeout(() => reorderByScore(), 100);
      }
      
      // Save to backend if authenticated
      if (user) {
        await saveStocksToBackend(merged);
      }
    } catch (error) {
      console.error('Error in updateAllStocksWithArray:', error);
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
      
      // Calculate stocks per row based on viewport and zoom
      const getStocksPerRow = () => {
        // Get viewport width
        const viewportWidth = window.innerWidth;
        
        // Estimate stock paper width (420px min + some margin)
        const estimatedStockWidth = 440;
        
        // Calculate how many fit per row (minimum 1)
        const stocksPerRow = Math.max(1, Math.floor(viewportWidth / estimatedStockWidth));
        
        return stocksPerRow;
      };
      
      const stocksPerRow = getStocksPerRow();
      
      // Preserve locked stocks in their grid positions
      const lockedStocks = prev.filter(s => s.locked);
      const unlockedSorted = sorted.filter(s => !s.locked);
      
      // Arrange unlocked stocks in grid pattern
      const arrangedStocks = unlockedSorted.map((stock, idx) => {
        const row = Math.floor(idx / stocksPerRow);
        const col = idx % stocksPerRow;
        return {
          ...stock,
          gridPosition: { x: col, y: row }
        };
      });
      
      // Combine locked and arranged stocks
      return [...lockedStocks, ...arrangedStocks];
    });
  };

  const toggleLock = useCallback((stockId) => {
    setStocks(prev => {
      const stockIndex = prev.findIndex(s => s.id === stockId);
      if (stockIndex === -1) return prev;
      
      const newStocks = [...prev];
      newStocks[stockIndex] = {
        ...prev[stockIndex],
        locked: !(prev[stockIndex].locked === true)
      };
      return newStocks;
    });
  }, [setStocks]);



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
      
      // A - Add stock (context-aware)
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (gridSettings.clickEmptyToAdd) {
          // Context-aware: try to add at cursor position
          if (gridCanvasRef.current) {
            const cellPos = gridCanvasRef.current.getCellFromMouse(
              lastMousePosition.current.x,
              lastMousePosition.current.y
            );
            if (cellPos) {
              // Check if this cell is occupied
              const isOccupied = stocks.some(s => {
                const pos = s.gridPosition || { x: 0, y: 0 };
                return pos.x === cellPos.x && pos.y === cellPos.y;
              });
              if (!isOccupied) {
                addStock(cellPos);
              } else {
                // Cell occupied, use smart placement from this position
                addStock();
              }
            } else {
              // No cell detected (outside grid), use smart placement
              addStock();
            }
          } else {
            addStock();
          }
        } else {
          // When clickEmptyToAdd is off, 'A' enters adding mode
          setIsAddingMode(true);
        }
      }
      
      // Escape - Cancel adding mode
      if (e.key === 'Escape') {
        setIsAddingMode(false);
      }
      
      // U - Update all stocks
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        updateAllStocks();
      }
      
      // Delete - Remove hovered or selected stock
      if (e.key === 'Delete') {
        e.preventDefault();
        if (hoveredStockId) {
          removeStock(hoveredStockId);
        } else if (selectedStock) {
          removeStock(selectedStock);
        }
      }
      
      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedStock, stocks, counters, gridSettings.clickEmptyToAdd, hoveredStockId]);

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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPresetMenu(!showPresetMenu);
              }} 
              className="preset-btn"
              title="Configure preset settings"
              type="button"
            >
              Configure
            </button>
            {!gridSettings.clickEmptyToAdd && (
              <button 
                onClick={() => setIsAddingMode(true)} 
                className={`add-btn ${isAddingMode ? 'active' : ''}`}
                title="Click to enter placement mode (A)"
              >
                {isAddingMode ? 'Click Grid to Place' : 'Add Paper'}
              </button>
            )}
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

      <GridCanvas
        ref={gridCanvasRef}
        stocks={stocks}
        onStockMove={handleStockMove}
        onStockUpdate={updateStock}
        onStockRemove={removeStock}
        onStockAdd={addStock}
        selectedStock={selectedStock}
        onStockSelect={setSelectedStock}
        perStockUpdating={perStockUpdating}
        onUpdateSingle={updateSingle}
        canMakeRequest={canMakeRequest}
        onToggleLock={toggleLock}
        calculateScore={calculateScore}
        isAddingMode={isAddingMode}
        setIsAddingMode={setIsAddingMode}
        settings={gridSettings}
        currentPreset={currentPreset}
        onHoverStock={setHoveredStockId}
      />

      <PresetMenu
        isOpen={showPresetMenu}
        onClose={() => setShowPresetMenu(false)}
        onPresetApply={(preset) => {
          // Track current preset
          setCurrentPreset(preset.name);
          
          // Apply paperConfig to all stocks (create completely new objects to force re-render)
          setStocks(prev => {
            const updated = prev.map(stock => ({
              ...stock,
              paperConfig: { ...preset.paperConfig }
            }));
            
            // Trigger a re-render event for GridCanvas to remeasure
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('preset-changed'));
            }, 100);
            
            // Check if auto-update is enabled in settings
            const autoUpdate = localStorage.getItem('auto-update-on-preset') !== 'false';
            if (autoUpdate) {
              // Use the updated stocks array for updating
              setTimeout(() => {
                updateAllStocksWithArray(updated);
              }, 200);
            }
            
            return updated;
          });
          
          setShowPresetMenu(false);
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
