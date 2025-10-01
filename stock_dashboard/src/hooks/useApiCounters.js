import { useState, useEffect } from 'react';
import { apiService } from '../services';
import { APP_CONFIG } from '../config';

export const useApiCounters = () => {
  const [counters, setCounters] = useState(apiService.getCounters());
  const [isUpdating, setIsUpdating] = useState(false);
  const [perStockUpdating, setPerStockUpdating] = useState({});

  useEffect(() => {
    const refreshCounters = () => setCounters(apiService.getCounters());
    refreshCounters();
    const interval = setInterval(refreshCounters, APP_CONFIG.ui.counterRefreshInterval);
    return () => clearInterval(interval);
  }, []);

  const canMakeRequest = () => {
    return !isUpdating && 
           counters.daily < APP_CONFIG.apiLimits.dailyLimit && 
           counters.minute < APP_CONFIG.apiLimits.minuteLimit;
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