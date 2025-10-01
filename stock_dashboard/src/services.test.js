import { apiService, storage } from './services';

describe('apiService basic behavior', () => {
  test('getStockDataDemo returns percentChange and relativeVolume', async () => {
    const res = await apiService.getStockDataDemo('FAKE');
    expect(res).toHaveProperty('percentChange');
    expect(res).toHaveProperty('relativeVolume');
    expect(typeof res.percentChange).toBe('string');
    expect(typeof res.relativeVolume).toBe('string');
  });

  test('getCounters returns an object with daily/minute', () => {
    const c = apiService.getCounters();
    expect(c).toHaveProperty('daily');
    expect(c).toHaveProperty('minute');
  });
});
