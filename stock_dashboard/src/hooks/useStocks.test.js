import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// Mock AuthContext
const AuthContext = React.createContext();
import useStocks from './useStocks';
import { StockService } from '../services/stockService';

// Mock the StockService
jest.mock('../services/stockService');

// Mock API client
jest.mock('../api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const mockStockService = {
  updateStockQuote: jest.fn(),
  updateAllStocks: jest.fn()
};

StockService.mockImplementation(() => mockStockService);

// Mock auth context provider
const createWrapper = (user = null) => {
  return ({ children }) => (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

const mockStocks = [
  {
    id: 1,
    symbol: 'AAPL',
    currentPrice: 150.00,
    lastQuoteUpdate: new Date().toISOString()
  },
  {
    id: 2,
    symbol: 'GOOGL',
    currentPrice: 2500.00,
    lastQuoteUpdate: new Date().toISOString()
  }
];

describe('useStocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when user is not authenticated', () => {
    it('should return empty stocks array', () => {
      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper(null)
      });

      expect(result.current.stocks).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('should not fetch stocks', () => {
      renderHook(() => useStocks(), {
        wrapper: createWrapper(null)
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('when user is authenticated', () => {
    const mockUser = { id: 1, username: 'testuser' };

    beforeEach(() => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStocks)
      });
    });

    it('should fetch stocks on mount', async () => {
      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper(mockUser)
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/stocks', {
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result.current.stocks).toEqual(mockStocks);
    });

    it('should handle fetch error gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      console.error = jest.fn(); // Mock console.error

      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper(mockUser)
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(console.error).toHaveBeenCalledWith('Error fetching stocks:', expect.any(Error));
      expect(result.current.stocks).toEqual([]);
    });

    it('should add new stock', async () => {
      const newStock = { id: 3, symbol: 'TSLA', currentPrice: 800.00 };
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStocks)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(newStock)
        });

      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper(mockUser)
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addStock({ symbol: 'TSLA' });
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: 'TSLA' })
      });
    });

    it('should update stock order', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStocks)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper(mockUser)
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newOrder = [mockStocks[1], mockStocks[0]]; // Reversed order

      await act(async () => {
        result.current.updateStockOrder(newOrder);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/stocks/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockIds: [2, 1] // IDs in new order
        })
      });
    });

    it('should remove stock', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStocks)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper(mockUser)
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.removeStock(1);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/stocks/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should update stock quote', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStocks)
      });

      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper(mockUser)
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedStock = { ...mockStocks[0], currentPrice: 155.00 };
      mockStockService.updateStockQuote.mockResolvedValue(updatedStock);

      await act(async () => {
        await result.current.updateStockQuote(1);
      });

      expect(mockStockService.updateStockQuote).toHaveBeenCalledWith(1);
    });

    it('should update stock data', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStocks)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper(mockUser)
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedData = { currentPrice: 155.00, notes: 'Updated notes' };

      await act(async () => {
        await result.current.updateStockData(1, updatedData);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/stocks/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    });

    it('should refresh all quotes', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStocks)
      });

      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper(mockUser)
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedStocks = mockStocks.map(stock => ({
        ...stock,
        currentPrice: stock.currentPrice + 10
      }));
      mockStockService.updateAllStocks.mockResolvedValue(updatedStocks);

      await act(async () => {
        await result.current.refreshAllQuotes();
      });

      expect(mockStockService.updateAllStocks).toHaveBeenCalledWith(mockStocks);
    });

    it('should handle API errors when adding stock', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStocks)
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: () => Promise.resolve('Bad Request')
        });

      console.error = jest.fn();

      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper(mockUser)
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addStock({ symbol: 'INVALID' });
      });

      expect(console.error).toHaveBeenCalledWith('Error adding stock:', expect.any(Error));
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      console.error = jest.fn();

      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper({ id: 1, username: 'testuser' })
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(console.error).toHaveBeenCalled();
      expect(result.current.stocks).toEqual([]);
    });

    it('should handle invalid JSON responses', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });
      console.error = jest.fn();

      const { result } = renderHook(() => useStocks(), {
        wrapper: createWrapper({ id: 1, username: 'testuser' })
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(console.error).toHaveBeenCalled();
    });
  });
});