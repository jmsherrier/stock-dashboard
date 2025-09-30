import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { storage } from '../services';

export const useStocks = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [undoStack, setUndoStack] = useState([]);

  // Load data on mount and when auth state changes
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          // Load data from backend for authenticated users
          const response = await apiClient.getUserStocks();
          console.log('Loaded from backend:', response);
          const userStocks = response?.stocks || [];
          // Only assign positions to stocks that don't have them (legacy data)
          // Preserve existing positions to maintain gaps
          const stocksArray = Array.isArray(userStocks) ? userStocks : [];
          const hasAnyPositions = stocksArray.some(stock => stock.position != null);
          
          const stocksWithPositions = stocksArray.map((stock, idx) => ({
            ...stock,
            // If no stocks have positions (legacy data), assign sequential
            // Otherwise, preserve existing positions or assign next available
            position: hasAnyPositions 
              ? (stock.position ?? Math.max(...stocksArray.map(s => s.position ?? 0), -1) + 1)
              : idx
          }));
          setStocks(stocksWithPositions);
        } else {
          // Load from localStorage for unauthenticated users
          const loaded = await storage.load();
          if (loaded) {
            // Only assign positions to stocks that don't have them (legacy data)
            const stocksArray = Array.isArray(loaded.stocks) ? loaded.stocks : [];
            const hasAnyPositions = stocksArray.some(stock => stock.position != null);
            
            const stocksWithPositions = stocksArray.map((stock, idx) => ({
              ...stock,
              position: hasAnyPositions 
                ? (stock.position ?? Math.max(...stocksArray.map(s => s.position ?? 0), -1) + 1)
                : idx
            }));
            setStocks(stocksWithPositions);
          }
        }
      } catch (e) {
        console.error('Failed to load saved data:', e);
        setStocks([]);
      }
    };
    
    loadData();
  }, [user]);

  const saveStocksToBackend = async (stocksToSave) => {
    if (!user) return;
    
    try {
      // Save all stocks to backend with proper structure
      await apiClient.saveUserStock({
        stocks: stocksToSave,
        meta: {
          updated: new Date().toISOString(),
          count: stocksToSave.length
        }
      });
      console.log('Saved to backend:', stocksToSave.length, 'stocks');
    } catch (error) {
      console.error('Failed to save stocks to backend:', error);
    }
  };

  const updateStock = (id, componentKey, value) => {
    setUndoStack(prev => [...prev, stocks]);
    
    setStocks(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          let updatedStock;
          
          if (s.components) {
            // Modular format - update components structure
            const updatedComponents = { ...s.components };
            if (updatedComponents[componentKey]) {
              updatedComponents[componentKey] = { ...updatedComponents[componentKey], ...value };
            } else {
              updatedComponents[componentKey] = value;
            }
            updatedStock = { ...s, components: updatedComponents };
          } else {
            // Legacy format - update directly
            updatedStock = { ...s, [componentKey]: value };
          }
          
          return updatedStock;
        }
        return s;
      });
      
      // Save entire array to backend if authenticated
      if (user) {
        saveStocksToBackend(updated).catch(console.error);
      }
      
      return updated;
    });
  };

  const removeStock = (id) => {
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

  const undo = () => {
    if (undoStack.length > 0) {
      const last = undoStack[undoStack.length - 1];
      setStocks(last);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const updateStockOrder = (newOrder) => {
    setUndoStack(prev => [...prev, stocks]);
    setStocks(newOrder);
  };

  return {
    stocks,
    setStocks,
    selectedStock,
    setSelectedStock,
    undoStack,
    updateStock,
    removeStock,
    updateStockOrder,
    undo,
    saveStocksToBackend
  };
};