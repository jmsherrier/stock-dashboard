import React, { useEffect, useState } from 'react';
import './App.css';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableStockPaper from './components/SortableStockPaper';

import { apiService, storage } from './services';

function App() {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [apiStatus, setApiStatus] = useState({ daily: 0, minute: 0, lastReset: Date.now() });
  const [undoStack, setUndoStack] = useState([]);
  // Ordering now remains stable unless explicitly reordered via the new reorder button

  const [isUpdating, setIsUpdating] = useState(false);
  const [counters, setCounters] = useState(apiService.getCounters());
  const [perStockUpdating, setPerStockUpdating] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const loaded = await storage.load();
        if (loaded) setStocks(loaded.stocks || []);
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    };
    
    loadData();
    const refreshCounters = () => setCounters(apiService.getCounters());
    refreshCounters();
    const ci = setInterval(refreshCounters, 5000);
    return () => clearInterval(ci);
  }, []);

  const addStock = () => {
    const id = `stock-${Date.now()}`;
    const newStock = {
      id,
      ticker: '',
      price: '',
      percentRise: '',
      relativeVolume: '',
      float: '',
      positiveCatalysts: [],
      marketDrivers: [],
      bonusChecks: {
        recentIPO: false,
        recentReverseSplit: false,
        blueSkyBreakout: false
      },
      notes: ''
    };
    setUndoStack(prev => [...prev, stocks]);
    setStocks(prev => [newStock, ...prev]);
    // Auto-focus ticker input after creation
    setTimeout(() => {
      const tickerElements = document.querySelectorAll('.ticker-display');
      if (tickerElements.length > 0) {
        tickerElements[0].click();
      }
    }, 100);
  };

  const updateStock = (id, field, value) => {
    setUndoStack(prev => [...prev, stocks]);
    setStocks(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeStock = (id) => {
    setUndoStack(prev => [...prev, stocks]);
    setStocks(prev => prev.filter(s => s.id !== id));
    if (selectedStock === id) setSelectedStock(null);
  };

  const updateAllStocks = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await Promise.all(stocks.map(async (s) => {
        try {
          // Skip stocks without valid tickers
          if (!s.ticker || s.ticker.trim() === '') {
            console.log('Skipping stock without ticker:', s);
            return s;
          }
          const data = await apiService.getQuote(s.ticker);
          
          // Preserve user formatting - only update if value has meaningfully changed
          const preserveFormatting = (newVal, oldVal) => {
            if (!oldVal || oldVal.trim() === '') return newVal;
            const newNum = parseFloat(newVal);
            const oldNum = parseFloat(oldVal);
            // Only update if the numerical difference is significant (>0.001)
            return Math.abs(newNum - oldNum) > 0.001 ? newVal : oldVal;
          };
          
          return { 
            ...s, 
            percentRise: preserveFormatting(data.percentChange.toString(), s.percentRise), 
            relativeVolume: preserveFormatting(data.relativeVolume.toString(), s.relativeVolume),
            price: data.price ? preserveFormatting(data.price.toString(), s.price) : s.price
          };
        } catch (err) {
          console.warn('Failed to update stock:', s.ticker, err);
          return s;
        }
      }));
      setUndoStack(prev => [...prev, stocks]);
      setStocks(updated);
    } finally {
      setIsUpdating(false);
      setCounters(apiService.getCounters());
    }
  };

  const updateSingle = async (id) => {
    const stock = stocks.find(s => s.id === id);
    if (!stock) return;
    
    // Skip stocks without valid tickers
    if (!stock.ticker || stock.ticker.trim() === '') {
      console.log('Cannot update stock without ticker:', stock);
      return;
    }
    
    // Preserve user formatting - only update if value has meaningfully changed
    const preserveFormatting = (newVal, oldVal) => {
      if (!oldVal || oldVal.trim() === '') return newVal;
      const newNum = parseFloat(newVal);
      const oldNum = parseFloat(oldVal);
      // Only update if the numerical difference is significant (>0.001)
      return Math.abs(newNum - oldNum) > 0.001 ? newVal : oldVal;
    };
    
    setPerStockUpdating(p => ({ ...p, [id]: true }));
    try {
      const data = await apiService.getQuote(stock.ticker);
      setUndoStack(prev => [...prev, stocks]);
      setStocks(prev => prev.map(s => s.id === id ? { 
        ...s, 
        percentRise: preserveFormatting(data.percentChange.toString(), s.percentRise), 
        relativeVolume: preserveFormatting(data.relativeVolume.toString(), s.relativeVolume),
        price: data.price ? preserveFormatting(data.price.toString(), s.price) : s.price
      } : s));
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

  const calculateScore = (stock) => {
    let score = 0;
    
    // Helper function to get score for individual criteria
    const getScorePoints = (value, type) => {
      // Return 0 for null, undefined, or empty values
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
    
    // Apply scoring for each criteria
    score += getScorePoints(stock.price, 'price');
    score += getScorePoints(stock.percentRise, 'percentRise');
    score += getScorePoints(stock.relativeVolume, 'relativeVolume');
    score += getScorePoints(stock.float, 'float');
    
    // News catalysts scoring
    const positiveCatalystsScore = (stock.positiveCatalysts || []).reduce((sum, item) => sum + (item.points || 0), 0);
    const marketDriversScore = (stock.marketDrivers || []).reduce((sum, item) => sum + (item.points || 0), 0);
    score += positiveCatalystsScore + marketDriversScore;
    
    // Bonus checkboxes (+1 each)
    const bonusChecks = stock.bonusChecks || {};
    if (bonusChecks.recentIPO) score += 1;
    if (bonusChecks.recentReverseSplit) score += 1;
    if (bonusChecks.blueSkyBreakout) score += 1;
    
    return score;
  };

  // Explicit reorder function (formerly implicit on every render)
  const reorderByScore = () => {
    setUndoStack(prev => [...prev, stocks]);
    setStocks(prev => [...prev].sort((a, b) => calculateScore(b) - calculateScore(a)));
  };

  useEffect(() => {
    const saveData = async () => {
      try {
        const toSave = { stocks, meta: { updated: Date.now() } };
        await storage.save(toSave);
      } catch (e) {
        console.error('Failed to save data:', e);
      }
    };
    
    if (stocks.length > 0 || localStorage.getItem('momentum_data')) {
      saveData();
    }
  }, [stocks]);

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
        <h1>Momentum Tracker</h1>
        <div className="api-status">
          Requests: {counters.daily}/500 daily | {counters.minute}/5 per minute
        </div>
        <div className="header-buttons">
          <button onClick={reorderByScore} title="Sort all stocks by current score (descending)">Reorder by Score</button>
          <button onClick={addStock}>Add Ticker (A)</button>
          <button onClick={updateAllStocks} disabled={isUpdating || counters.daily >= 500 || counters.minute >= 5}>
            {isUpdating ? 'Updating...' : 'Update All (U)'}
          </button>
          <button onClick={undo} disabled={undoStack.length === 0}>Undo</button>
        </div>
      </header>

      <DndContext
        collisionDetection={closestCenter}
      >
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


    </div>
  );
}

export default App;
