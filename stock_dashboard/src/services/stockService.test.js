import { StockService } from './stockService';

// Mock API client
jest.mock('../api/client', () => ({
  get: jest.fn(),
  put: jest.fn()
}));

const mockApiClient = require('../api/client');

// Mock useApiCounters hook
const mockUseApiCounters = {
  canMakeRequest: jest.fn(),
  incrementCounter: jest.fn(),
  getRemainingRequests: jest.fn()
};

jest.mock('../hooks/useApiCounters', () => ({
  __esModule: true,
  default: () => mockUseApiCounters
}));

describe('StockService', () => {
  let stockService;
  const mockStock = {
    id: 1,
    symbol: 'AAPL',
    currentPrice: 150.00,
    lastQuoteUpdate: '2024-01-01T10:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    stockService = new StockService();
    mockUseApiCounters.canMakeRequest.mockReturnValue(true);
    mockUseApiCounters.getRemainingRequests.mockReturnValue(5);
  });

  describe('updateStockQuote', () => {
    it('should update stock quote successfully', async () => {
      // Mock quote data for reference (currently unused)
      // const mockQuoteData = {
      //   price: 155.50,
      //   change: 5.50,
      //   changePercent: 3.67,
      //   volume: 1000000
      // };

      const updatedStock = {
        ...mockStock,
        currentPrice: 155.50,
        lastQuoteUpdate: expect.any(String)
      };

      mockApiClient.get.mockResolvedValue({
        data: {
          'Global Quote': {
            '05. price': '155.50',
            '09. change': '5.50',
            '10. change percent': '3.67%',
          }
        }
      });

      mockApiClient.put.mockResolvedValue({
        data: updatedStock
      });

      const result = await stockService.updateStockQuote(1);

      expect(mockUseApiCounters.canMakeRequest).toHaveBeenCalled();
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('query?function=GLOBAL_QUOTE&symbol=')
      );
      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/api/stocks/1',
        expect.objectContaining({
          currentPrice: 155.50,
          lastQuoteUpdate: expect.any(String)
        })
      );
      expect(mockUseApiCounters.incrementCounter).toHaveBeenCalled();
      expect(result).toEqual(updatedStock);
    });

    it('should throw error when API rate limit exceeded', async () => {
      mockUseApiCounters.canMakeRequest.mockReturnValue(false);
      mockUseApiCounters.getRemainingRequests.mockReturnValue(0);

      await expect(stockService.updateStockQuote(1)).rejects.toThrow(
        'API rate limit exceeded. No requests remaining.'
      );

      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle Alpha Vantage API errors', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          'Error Message': 'Invalid API call'
        }
      });

      await expect(stockService.updateStockQuote(1)).rejects.toThrow(
        'Alpha Vantage API Error: Invalid API call'
      );

      expect(mockUseApiCounters.incrementCounter).toHaveBeenCalled();
    });

    it('should handle missing quote data', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {}
      });

      await expect(stockService.updateStockQuote(1)).rejects.toThrow(
        'No quote data available for stock ID: 1'
      );
    });

    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(stockService.updateStockQuote(1)).rejects.toThrow('Network error');
      expect(mockUseApiCounters.incrementCounter).toHaveBeenCalled();
    });

    it('should handle database update errors', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          'Global Quote': {
            '05. price': '155.50',
            '09. change': '5.50',
            '10. change percent': '3.67%',
          }
        }
      });

      mockApiClient.put.mockRejectedValue(new Error('Database error'));

      await expect(stockService.updateStockQuote(1)).rejects.toThrow('Database error');
    });
  });

  describe('updateAllStocks', () => {
    const mockStocks = [
      { id: 1, symbol: 'AAPL', currentPrice: 150.00 },
      { id: 2, symbol: 'GOOGL', currentPrice: 2500.00 },
      { id: 3, symbol: 'TSLA', currentPrice: 800.00 }
    ];

    it('should update all stocks successfully', async () => {
      mockUseApiCounters.getRemainingRequests.mockReturnValue(10);
      
      // Mock successful responses for each stock
      mockApiClient.get
        .mockResolvedValueOnce({
          data: {
            'Global Quote': {
              '05. price': '155.00',
              '09. change': '5.00',
              '10. change percent': '3.33%',
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            'Global Quote': {
              '05. price': '2550.00',
              '09. change': '50.00',
              '10. change percent': '2.00%',
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            'Global Quote': {
              '05. price': '820.00',
              '09. change': '20.00',
              '10. change percent': '2.50%',
            }
          }
        });

      const updatedStocks = mockStocks.map(stock => ({
        ...stock,
        currentPrice: stock.currentPrice + 10,
        lastQuoteUpdate: expect.any(String)
      }));

      mockApiClient.put
        .mockResolvedValueOnce({ data: updatedStocks[0] })
        .mockResolvedValueOnce({ data: updatedStocks[1] })
        .mockResolvedValueOnce({ data: updatedStocks[2] });

      const result = await stockService.updateAllStocks(mockStocks);

      expect(mockApiClient.get).toHaveBeenCalledTimes(3);
      expect(mockApiClient.put).toHaveBeenCalledTimes(3);
      expect(mockUseApiCounters.incrementCounter).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
    });

    it('should stop updating when rate limit is reached', async () => {
      mockUseApiCounters.getRemainingRequests
        .mockReturnValueOnce(2) // Initial check
        .mockReturnValueOnce(1)  // After first request
        .mockReturnValueOnce(0); // After second request

      mockUseApiCounters.canMakeRequest
        .mockReturnValueOnce(true)  // First request
        .mockReturnValueOnce(true)  // Second request
        .mockReturnValueOnce(false); // Third request blocked

      mockApiClient.get
        .mockResolvedValueOnce({
          data: {
            'Global Quote': {
              '05. price': '155.00',
              '09. change': '5.00',
              '10. change percent': '3.33%',
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            'Global Quote': {
              '05. price': '2550.00',
              '09. change': '50.00',
              '10. change percent': '2.00%',
            }
          }
        });

      mockApiClient.put
        .mockResolvedValueOnce({ data: { ...mockStocks[0], currentPrice: 155.00 } })
        .mockResolvedValueOnce({ data: { ...mockStocks[1], currentPrice: 2550.00 } });

      const result = await stockService.updateAllStocks(mockStocks);

      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2); // Only first two stocks updated
    });

    it('should handle partial failures gracefully', async () => {
      mockUseApiCounters.getRemainingRequests.mockReturnValue(10);
      
      // First stock succeeds, second fails, third succeeds
      mockApiClient.get
        .mockResolvedValueOnce({
          data: {
            'Global Quote': {
              '05. price': '155.00',
              '09. change': '5.00',
              '10. change percent': '3.33%',
            }
          }
        })
        .mockRejectedValueOnce(new Error('API error for GOOGL'))
        .mockResolvedValueOnce({
          data: {
            'Global Quote': {
              '05. price': '820.00',
              '09. change': '20.00',
              '10. change percent': '2.50%',
            }
          }
        });

      mockApiClient.put
        .mockResolvedValueOnce({ data: { ...mockStocks[0], currentPrice: 155.00 } })
        .mockResolvedValueOnce({ data: { ...mockStocks[2], currentPrice: 820.00 } });

      const result = await stockService.updateAllStocks(mockStocks);

      expect(result).toHaveLength(2); // Only successful updates returned
      expect(result.find(stock => stock.symbol === 'GOOGL')).toBeUndefined();
    });

    it('should handle empty stocks array', async () => {
      const result = await stockService.updateAllStocks([]);
      
      expect(result).toEqual([]);
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('rate limiting', () => {
    it('should respect API rate limits', async () => {
      mockUseApiCounters.canMakeRequest.mockReturnValue(false);
      mockUseApiCounters.getRemainingRequests.mockReturnValue(0);

      await expect(stockService.updateStockQuote(1)).rejects.toThrow(
        'API rate limit exceeded'
      );
    });

    it('should increment counter after successful requests', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          'Global Quote': {
            '05. price': '155.50',
            '09. change': '5.50',
            '10. change percent': '3.67%',
          }
        }
      });

      mockApiClient.put.mockResolvedValue({
        data: { ...mockStock, currentPrice: 155.50 }
      });

      await stockService.updateStockQuote(1);

      expect(mockUseApiCounters.incrementCounter).toHaveBeenCalledTimes(1);
    });

    it('should increment counter even after failed requests', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API error'));

      try {
        await stockService.updateStockQuote(1);
      } catch (error) {
        // Expected to throw
      }

      expect(mockUseApiCounters.incrementCounter).toHaveBeenCalledTimes(1);
    });
  });
});