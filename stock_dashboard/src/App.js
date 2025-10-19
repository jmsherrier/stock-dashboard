import React, { useEffect, useState, useCallback } from 'react';
import './App.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ApiKeyPrompt from './components/inputs/ApiKeyPrompt';
import PresetMenu from './components/inputs/PresetMenu';
import SettingsModal from './components/modal/SettingsModal';
import AboutModal from './components/modal/AboutModal';
import GridCanvas from './components/layout/GridCanvas';

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
  
  const [currentPreset, setCurrentPreset] = useState(() => {
    return localStorage.getItem('current-preset') || 'momentum';
  });
  
  // Save current preset to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('current-preset', currentPreset);
  }, [currentPreset]);
  
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState(15); // seconds
  const [timeUntilLimitReached, setTimeUntilLimitReached] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false);

  // Track clicked stock for delete functionality and arrow key movement
  const [clickedStockId, setClickedStockId] = useState(null);

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
    zeroAligned: localStorage.getItem('zero-aligned') === 'true',
    hidePointsLabel: localStorage.getItem('hide-points-label') === 'true'
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
  }, [currentPreset, setStocks, stocks.length]);

  // Listen for localStorage changes to update settings in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      setGridSettings({
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

  // Clear clicked stock when clicking outside any stock paper
  useEffect(() => {
    const handleDocumentClick = (event) => {
      // Check if click is outside any stock paper
      if (!event.target.closest('.stock-paper') && !event.target.closest('.stock-wrapper')) {
        // If a stock was clicked, this first click off clears it
        if (clickedStockId) {
          // Mark this event as a deselect click so GridCanvas doesn't create a stock
          event._wasDeselectClick = true;
          setClickedStockId(null);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, true); // Use capture phase
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [clickedStockId]);

  // Smart placement algorithm with priority: right > left > top > bottom > corners
  const findOptimalPlacement = useCallback(() => {
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
  }, [stocks]);

  const addStock = useCallback((gridPosition = null) => {
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
  }, [currentPreset, findOptimalPlacement, setStocks]);



  const handleStockMove = (stockId, newGridPosition) => {
    setStocks(prev => prev.map(s => 
      s.id === stockId ? { ...s, gridPosition: newGridPosition } : s
    ));
  };



  const reorderByScore = useCallback(() => {
    setStocks(prev => {
      const sorted = [...prev].sort((a, b) => calculateScore(b) - calculateScore(a));
      
      // Get current zoom and cell dimensions from GridCanvas
      const zoom = gridCanvasRef.current?.getZoom() || 1;
      const cellDimensions = gridCanvasRef.current?.getCellDimensions();
      
      if (!cellDimensions) {
        console.warn('Cell dimensions not available for sorting');
        return prev;
      }
      
      // Calculate stocks per row based on viewport width and zoom
      const viewportWidth = window.innerWidth;
      const cellGap = 20;
      const scaledCellWidth = (cellDimensions.width + cellGap) * zoom;
      const stocksPerRow = Math.max(1, Math.floor(viewportWidth / scaledCellWidth));
      
      // Preserve locked stocks in their grid positions
      const lockedStocks = prev.filter(s => s.locked);
      const unlockedSorted = sorted.filter(s => !s.locked);
      
      // Arrange unlocked stocks in grid pattern (left-to-right, top-to-bottom)
      const arrangedStocks = unlockedSorted.map((stock, idx) => {
        const row = Math.floor(idx / stocksPerRow);
        const col = idx % stocksPerRow;
        return {
          ...stock,
          gridPosition: { x: col, y: row }
        };
      });
      
      // Move viewport to show top-left (position 0,0)
      if (gridCanvasRef.current?.setGridOffset) {
        // Center the top-left stock in view
        const offsetX = 50; // Small offset from left edge
        const offsetY = 50; // Small offset from top edge
        gridCanvasRef.current.setGridOffset({ x: offsetX, y: offsetY });
      }
      
      // Combine locked and arranged stocks
      return [...lockedStocks, ...arrangedStocks];
    });
  }, [setStocks, gridCanvasRef]);

  const updateAllStocks = useCallback(async () => {
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
  }, [stocks, canMakeRequest, user, setIsUpdating, setStocks, reorderByScore, saveStocksToBackend, refreshCounters]);

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
      const autoSort = localStorage.getItem('auto-sort-on-update') === 'true';
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
      'Are you sure you want to clear all data and reset to defaults? This action cannot be undone.\n\n' +
      'This will remove:\n' +
      '• All saved stocks and their data\n' +
      '• All custom settings and preferences\n\n' +
      'Your account login will be preserved.'
    );
    
    if (confirmed) {
      try {
        // Clear local state
        setStocks([]);
        setSelectedStock(null);
        
        // Get all localStorage keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // Don't remove auth-related keys
          if (!key.startsWith('api-key') && 
              !key.startsWith('user-id') && 
              !key.startsWith('user-email') && 
              !key.startsWith('user-created-at') && 
              !key.startsWith('user-dev-access')) {
            keysToRemove.push(key);
          }
        }
        
        // Remove non-auth keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Reset to default settings
        localStorage.setItem('app-theme', 'dark');
        localStorage.setItem('auto-save', 'true');
        localStorage.setItem('show-scores', 'true');
        localStorage.setItem('auto-update-on-preset', 'true');
        localStorage.setItem('auto-sort-on-update', 'false');
        localStorage.setItem('zero-aligned', 'false');
        localStorage.setItem('api-timeout', '10000');
        localStorage.setItem('refresh-interval', '300000');
        localStorage.setItem('grid-zoom', '1');
        
        // Clear backend stock data if authenticated
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
        alert('All data has been cleared and settings reset to defaults. Your account login has been preserved.');
        
        // Reload the page to reset the application state
        window.location.reload();
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('There was an error clearing some data. Please try again.');
      }
    }
  };

  const clearStocks = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all stocks?\n\n' +
      'This will remove all stocks and reset zoom to 1x.'
    );
    
    if (confirmed) {
      try {
        // Clear local state
        setStocks([]);
        setSelectedStock(null);
        setClickedStockId(null);
        
        // Reset zoom to 1x
        localStorage.setItem('grid-zoom', '1');
        
        // Clear backend stock data if authenticated
        if (user) {
          try {
            await apiClient.clearUserData();
          } catch (error) {
            console.warn('Failed to clear backend data:', error);
          }
        }
        
        // Close settings menu
        setShowSettingsMenu(false);
        
        // Reload to apply zoom reset
        window.location.reload();
      } catch (error) {
        console.error('Error clearing stocks:', error);
        alert('There was an error clearing stocks. Please try again.');
      }
    }
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
      
      // Delete - Remove clicked stock only
      const deleteKey = localStorage.getItem('keybind-delete-stock') || 'Delete';
      if (e.key === deleteKey || (deleteKey.includes('+') && deleteKey.split('+').pop() === e.key && deleteKey.includes('Control') && e.ctrlKey)) {
        e.preventDefault();
        if (clickedStockId) {
          removeStock(clickedStockId);
          setClickedStockId(null);
        }
      }
      
      // Arrow keys - Move clicked stock to adjacent empty cell (not for locked stocks)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && clickedStockId) {
        e.preventDefault();
        const stock = stocks.find(s => s.id === clickedStockId);
        if (!stock || stock.locked) return;
        
        const currentPos = stock.gridPosition || { x: 0, y: 0 };
        let newPos = { ...currentPos };
        
        switch(e.key) {
          case 'ArrowUp':
            newPos.y -= 1;
            break;
          case 'ArrowDown':
            newPos.y += 1;
            break;
          case 'ArrowLeft':
            newPos.x -= 1;
            break;
          case 'ArrowRight':
            newPos.x += 1;
            break;
          default:
            return; // No-op for other keys
        }
        
        // Check if new position is empty
        const isOccupied = stocks.some(s => {
          if (s.id === clickedStockId) return false; // Don't count the stock being moved
          const pos = s.gridPosition || { x: 0, y: 0 };
          return pos.x === newPos.x && pos.y === newPos.y;
        });
        
        if (!isOccupied) {
          // Move the stock - clickedStockId stays active for multiple moves
          setStocks(prev => prev.map(s => 
            s.id === clickedStockId 
              ? { ...s, gridPosition: newPos }
              : s
          ));
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
  }, [selectedStock, stocks, counters, clickedStockId, addStock, removeStock, setStocks, undo, updateAllStocks]);

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
  }, [autoUpdateEnabled, autoUpdateInterval, stocks.length, counters.daily, canMakeRequest, updateAllStocks]);

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
  }, [selectedStock, setSelectedStock]);

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
                    clearStocks();
                  }}>
                    Clear Stocks
                  </button>
                  <button onClick={() => {
                    clearAllData();
                  }}>
                    Clear All Data
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
              <div className="auto-update-interval-input">
                <input
                  type="number"
                  value={Math.round(60 / autoUpdateInterval * 10) / 10}
                  onChange={(e) => {
                    const updatesPerMin = parseFloat(e.target.value);
                    if (updatesPerMin > 0 && updatesPerMin <= 60) {
                      const seconds = Math.round(60 / updatesPerMin);
                      setAutoUpdateInterval(Math.max(1, seconds));
                    }
                  }}
                  onBlur={(e) => {
                    // Ensure valid value on blur
                    const updatesPerMin = parseFloat(e.target.value);
                    if (!updatesPerMin || updatesPerMin <= 0) {
                      setAutoUpdateInterval(15); // Reset to default (4 updates/min)
                    }
                  }}
                  className="auto-update-interval"
                  min="0.1"
                  max="60"
                  step="0.1"
                  placeholder="4"
                  title="Updates per minute"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                />
                <span className="interval-unit">/min</span>
              </div>
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
        onClickStock={setClickedStockId}
        clickedStockId={clickedStockId}
      />

      <PresetMenu
        isOpen={showPresetMenu}
        onClose={() => setShowPresetMenu(false)}
        onPresetApply={(preset) => {
          // Track current preset
          setCurrentPreset(preset.name);
          
          // Apply paperConfig and bonusChecksConfig to all stocks (create completely new objects to force re-render)
          setStocks(prev => {
            const updated = prev.map(stock => ({
              ...stock,
              paperConfig: { ...preset.paperConfig },
              bonusChecksConfig: preset.bonusChecks || {}
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
