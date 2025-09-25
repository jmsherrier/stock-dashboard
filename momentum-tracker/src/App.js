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


function MainApp({ devMode = false }) {
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

    if (active.id !== over?.id) {
      setStocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
    if (!canMakeRequest()) return;
    
    setIsUpdating(true);
    try {
      const updated = await StockService.updateMultipleStocks(stocks);
      setStocks(updated);
      
      // Save to backend if authenticated (skip in dev mode)
      if (user && !devMode) {
        await saveStocksToBackend(updated);
      }
    } finally {
      setIsUpdating(false);
      refreshCounters();
    }
  };

  const updateSingle = async (id) => {
    const stock = stocks.find(s => s.id === id);
    if (!stock) {
      console.log('Stock not found:', id);
      return;
    }

    setStockUpdating(id, true);
    try {
      const updatedStock = await StockService.updateStockQuote(stock);
      
      setStocks(prev => prev.map(s => s.id === id ? updatedStock : s));
      
      // Save to backend if authenticated (skip in dev mode)
      if (user && !devMode) {
        await apiClient.saveUserStock(updatedStock);
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
      'Are you sure you want to clear all data? This action cannot be undone.\n\n' +
      'This will remove:\n' +
      '• All saved stocks and their data\n' +
      '• All custom settings and preferences\n' +
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
    setStocks(prev => [...prev].sort((a, b) => calculateScore(b) - calculateScore(a)));
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
          {user && <span className="user-info">Welcome, {user.email}</span>}
        </div>
        
        <div className="header-center">
          <div className="api-status">
            {user ? `Requests: ${counters.daily}/500 daily | ${counters.minute}/5 per minute` : 'Development Mode'}
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
              disabled={isUpdating || (user && (counters.daily >= 500 || counters.minute >= 5))}
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
        onPresetApply={(preset) => {
          console.log('Preset applied:', preset);
          // Presets are now handled at the component level within each stock
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
  
  return <MainApp devMode={devMode} />;
}

export default App;
