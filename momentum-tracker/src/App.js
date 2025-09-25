import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableStockPaper from './components/SortableStockPaper';
import AddStockModal from './components/AddStockModal';
import { apiService, storage } from './services';

function App() {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [apiStatus, setApiStatus] = useState({ daily: 0, minute: 0, lastReset: Date.now() });
  const [undoStack, setUndoStack] = useState([]);
  const [isManualOrder, setIsManualOrder] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const addStock = (ticker) => {
    const id = `${ticker}-${Date.now()}`;
    const newStock = { id, ticker, percentChange: '0', relativeVolume: '1', notes: '', news: [] };
    setUndoStack(prev => [...prev, stocks]);
    setStocks(prev => {
      const next = [newStock, ...prev];
      // auto-sort by score unless manual ordering is enabled
      if (isManualOrder) return next;
      return [...next].sort((a, b) => calculateScore(b) - calculateScore(a));
    });
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
          return { ...s, percentChange: data.percentChange.toString(), relativeVolume: data.relativeVolume.toString() };
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
      setStocks(prev => prev.map(s => s.id === id ? { ...s, percentChange: data.percentChange.toString(), relativeVolume: data.relativeVolume.toString() } : s));
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
    // Minimal scoring: percentChange and relativeVolume
    const pc = parseFloat(stock.percentChange) || 0;
    const rv = parseFloat(stock.relativeVolume) || 1;
    return Math.round(pc * 10 + (rv - 1) * 5);
  };

  const sortedStocks = isManualOrder ? stocks : [...stocks].sort((a, b) => calculateScore(b) - calculateScore(a));

  useEffect(() => {
    const toSave = { stocks, meta: { updated: Date.now() } };
    storage.save(toSave);
  }, [stocks]);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'a' || e.key === 'A') setShowAddModal(true);
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
          <button onClick={() => setShowAddModal(true)}>Add Ticker (A)</button>
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
            {sortedStocks.map((stock) => (
              <SortableStockPaper
                key={stock.id}
                stock={stock}
                score={calculateScore(stock)}
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

      {showAddModal && (
        <AddStockModal
          onAdd={addStock}
          onClose={() => setShowAddModal(false)}
          existingTickers={stocks.map(s => s.ticker)}
        />
      )}
    </div>
  );
}

export default App;
