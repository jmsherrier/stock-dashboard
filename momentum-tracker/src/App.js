import React, { useEffect, useState, useCallback } from 'react';
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
  const [isManualOrder, setIsManualOrder] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [counters, setCounters] = useState(apiService.getCounters());
  const [perStockUpdating, setPerStockUpdating] = useState({});

  useEffect(() => {
    const loaded = storage.load();
    if (loaded) setStocks(loaded.stocks || []);
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
    setStocks(prev => {
      const next = [newStock, ...prev];
      // auto-sort by score unless manual ordering is enabled
      if (isManualOrder) return next;
      return [...next].sort((a, b) => calculateScore(b) - calculateScore(a));
    });
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
          const data = await apiService.getQuote(s.ticker);
          return { 
            ...s, 
            percentRise: data.percentChange.toString(), 
            relativeVolume: data.relativeVolume.toString(),
            price: data.price ? data.price.toString() : s.price
          };
        } catch (err) {
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
    setPerStockUpdating(p => ({ ...p, [id]: true }));
    try {
      const data = await apiService.getQuote(stock.ticker);
      setUndoStack(prev => [...prev, stocks]);
      setStocks(prev => prev.map(s => s.id === id ? { 
        ...s, 
        percentRise: data.percentChange.toString(), 
        relativeVolume: data.relativeVolume.toString(),
        price: data.price ? data.price.toString() : s.price
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
    
    // Price scoring ($2-20 range): $15-20 (---), $10-15 (--), $8-10 (-), $5-8 (+), $3-5 (++), $2-3 (+++)
    const price = parseFloat(stock.price) || 0;
    if (price >= 15) score -= 3;
    else if (price >= 10) score -= 2;
    else if (price >= 8) score -= 1;
    else if (price >= 5) score += 1;
    else if (price >= 3) score += 2;
    else if (price >= 2) score += 3;
    // Outside range gets no points
    
    // % Rise scoring (7%+ minimum): <3% (---), 3-5% (--), 5-7% (-), 7-10% (+), 10-15% (++), 15%+ (+++)
    const percentRise = parseFloat(stock.percentRise) || 0;
    if (percentRise < 3) score -= 3;
    else if (percentRise < 5) score -= 2;
    else if (percentRise < 7) score -= 1;
    else if (percentRise < 10) score += 1;
    else if (percentRise < 15) score += 2;
    else if (percentRise >= 15) score += 3;
    
    // Relative Volume scoring (5x+ minimum): <2x (---), 2-3x (--), 3-5x (-), 5-8x (+), 8-12x (++), 12x+ (+++)
    const relativeVolume = parseFloat(stock.relativeVolume) || 1;
    if (relativeVolume < 2) score -= 3;
    else if (relativeVolume < 3) score -= 2;
    else if (relativeVolume < 5) score -= 1;
    else if (relativeVolume < 8) score += 1;
    else if (relativeVolume < 12) score += 2;
    else if (relativeVolume >= 12) score += 3;
    
    // Float scoring (<20M shares): >50M (---), 30-50M (--), 20-30M (-), 15-20M (+), 10-15M (++), <10M (+++)
    const float = parseFloat(stock.float) || 0;
    if (float > 50) score -= 3;
    else if (float > 30) score -= 2;
    else if (float > 20) score -= 1;
    else if (float > 15) score += 1;
    else if (float > 10) score += 2;
    else if (float > 0 && float <= 10) score += 3;
    
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

  const sortedStocks = isManualOrder ? stocks : [...stocks].sort((a, b) => calculateScore(b) - calculateScore(a));

  useEffect(() => {
    const toSave = { stocks, meta: { updated: Date.now() } };
    storage.save(toSave);
  }, [stocks]);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'a' || e.key === 'A') addStock();
      if (e.key === 'u' || e.key === 'U') updateAllStocks();
      if (e.key === 'Delete' && selectedStock) removeStock(selectedStock);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedStock, stocks, counters]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Momentum Tracker</h1>
        <div className="api-status">
          Requests: {counters.daily}/500 daily | {counters.minute}/5 per minute
        </div>
        <div className="header-buttons">
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
          <SortableContext items={sortedStocks.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {sortedStocks.map((stock, index) => (
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
