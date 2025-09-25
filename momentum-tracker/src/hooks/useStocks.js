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
  }, [user]);

  const saveStocksToBackend = async (stocksToSave) => {
    if (!user) return;
    
    try {
      // Save all stocks to backend
      await Promise.all(stocksToSave.map(stock => 
        apiClient.saveUserStock(stock)
      ));
    } catch (error) {
      console.error('Failed to save stocks to backend:', error);
    }
  };

  const updateStock = (id, componentKey, value) => {
    setUndoStack(prev => [...prev, stocks]);
    
    setStocks(prev => prev.map(s => {
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
        
        // Save to backend if authenticated
        if (user) {
          apiClient.saveUserStock(updatedStock).catch(console.error);
        }
        
        return updatedStock;
      }
      return s;
    }));
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