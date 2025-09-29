import { renderHook, act } from '@testing-library/react';
import { useApiCounters } from '../useApiCounters';
import * as services from '../../services';

// Mock the services module
jest.mock('../../services', () => ({
  apiService: {
    getCounters: jest.fn()
  }
}));

describe('useApiCounters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock default counter values
    services.apiService.getCounters.mockReturnValue({
      daily: 0,
      minute: 0,
      dailyLimit: 500,
      minuteLimit: 5
    });
  });

  test('initializes with counter values from apiService', () => {
    const mockCounters = { daily: 10, minute: 2, dailyLimit: 500, minuteLimit: 5 };
    services.apiService.getCounters.mockReturnValue(mockCounters);

    const { result } = renderHook(() => useApiCounters());

    expect(result.current.counters).toEqual(mockCounters);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.perStockUpdating).toEqual({});
  });

  test('canMakeRequest returns true when within limits', () => {
    services.apiService.getCounters.mockReturnValue({
      daily: 10,
      minute: 2,
      dailyLimit: 500,
      minuteLimit: 5
    });

    const { result } = renderHook(() => useApiCounters());

    expect(result.current.canMakeRequest()).toBe(true);
  });

  test('canMakeRequest returns false when updating', () => {
    const { result } = renderHook(() => useApiCounters());

    act(() => {
      result.current.setIsUpdating(true);
    });

    expect(result.current.canMakeRequest()).toBe(false);
  });

  test('canMakeRequest returns false when daily limit exceeded', () => {
    services.apiService.getCounters.mockReturnValue({
      daily: 500,
      minute: 2,
      dailyLimit: 500,
      minuteLimit: 5
    });

    const { result } = renderHook(() => useApiCounters());

    expect(result.current.canMakeRequest()).toBe(false);
  });

  test('canMakeRequest returns false when minute limit exceeded', () => {
    services.apiService.getCounters.mockReturnValue({
      daily: 10,
      minute: 5,
      dailyLimit: 500,
      minuteLimit: 5
    });

    const { result } = renderHook(() => useApiCounters());

    expect(result.current.canMakeRequest()).toBe(false);
  });

  test('setStockUpdating updates perStockUpdating correctly', () => {
    const { result } = renderHook(() => useApiCounters());

    act(() => {
      result.current.setStockUpdating('stock-1', true);
    });

    expect(result.current.perStockUpdating).toEqual({ 'stock-1': true });

    act(() => {
      result.current.setStockUpdating('stock-2', true);
    });

    expect(result.current.perStockUpdating).toEqual({ 
      'stock-1': true, 
      'stock-2': true 
    });

    act(() => {
      result.current.setStockUpdating('stock-1', false);
    });

    expect(result.current.perStockUpdating).toEqual({ 
      'stock-1': false, 
      'stock-2': true 
    });
  });

  test('refreshCounters updates counter values', () => {
    const initialCounters = { daily: 10, minute: 2, dailyLimit: 500, minuteLimit: 5 };
    const updatedCounters = { daily: 15, minute: 3, dailyLimit: 500, minuteLimit: 5 };
    
    // Clear previous mocks and set fresh ones
    services.apiService.getCounters.mockClear();
    services.apiService.getCounters
      .mockReturnValueOnce(initialCounters)
      .mockReturnValueOnce(updatedCounters);

    const { result } = renderHook(() => useApiCounters());

    // Wait for initial load
    expect(result.current.counters).toEqual(initialCounters);

    act(() => {
      result.current.refreshCounters();
    });

    expect(result.current.counters).toEqual(updatedCounters);
  });
});