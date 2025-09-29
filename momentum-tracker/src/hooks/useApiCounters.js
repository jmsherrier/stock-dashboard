import { useState, useEffect } from 'react';
import { apiService } from '../services';

export const useApiCounters = () => {
  const [counters, setCounters] = useState(apiService.getCounters());
  const [isUpdating, setIsUpdating] = useState(false);
  const [perStockUpdating, setPerStockUpdating] = useState({});

  useEffect(() => {
    const refreshCounters = () => setCounters(apiService.getCounters());
    refreshCounters();
    const interval = setInterval(refreshCounters, 5000);
    return () => clearInterval(interval);
  }, []);

  const canMakeRequest = () => {
    return !isUpdating && counters.daily < 500 && counters.minute < 5;
  };

  const setStockUpdating = (stockId, updating) => {
    setPerStockUpdating(prev => ({ ...prev, [stockId]: updating }));
  };

  const refreshCounters = () => {
    setCounters(apiService.getCounters());
  };

  return {
    counters,
    isUpdating,
    setIsUpdating,
    perStockUpdating,
    setStockUpdating,
    canMakeRequest,
    refreshCounters
  };
};