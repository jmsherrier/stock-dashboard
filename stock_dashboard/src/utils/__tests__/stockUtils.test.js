import { 
  createDefaultStock, 
  preserveFormatting 
} from '../stockUtils';

describe('stockUtils', () => {
  describe('createDefaultStock', () => {
    test('creates a default stock with modular format', () => {
      const stock = createDefaultStock();
      
      expect(stock).toHaveProperty('id');
      expect(stock.id).toMatch(/^stock-\d+$/);
      expect(stock).toHaveProperty('components');
      expect(stock.components).toHaveProperty('ticker');
      expect(stock.components).toHaveProperty('price');
      expect(stock.components).toHaveProperty('percentRise');
      expect(stock.components).toHaveProperty('relativeVolume');
      expect(stock.components).toHaveProperty('float');
      expect(stock.components).toHaveProperty('notes');
      expect(stock.components).toHaveProperty('news');
      expect(stock.components).toHaveProperty('bonusChecks');
      
      // Check default values
      expect(stock.components.ticker.value).toBe('');
      expect(stock.components.price.value).toBe('');
      expect(stock.components.news.items).toEqual([]);
      expect(stock.components.bonusChecks.checks).toHaveProperty('recentIPO');
      expect(stock.components.bonusChecks.checks).toHaveProperty('recentReverseSplit');
      expect(stock.components.bonusChecks.checks).toHaveProperty('blueSkyBreakout');
    });

    test('creates unique IDs for multiple stocks', async () => {
      const stock1 = createDefaultStock();
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      const stock2 = createDefaultStock();
      
      expect(stock1.id).not.toBe(stock2.id);
    });
  });

  describe('preserveFormatting', () => {
    test('preserves dollar sign formatting', () => {
      const result = preserveFormatting('150.00', '$145.50');
      expect(result).toBe('$150.00');
    });

    test('preserves percentage formatting', () => {
      const result = preserveFormatting('5.5', '4.2%');
      expect(result).toBe('5.5%');
    });

    test('preserves M suffix formatting', () => {
      const result = preserveFormatting('15.2', '12.5M');
      expect(result).toBe('15.2M');
    });

    test('returns new value when old value is empty', () => {
      const result = preserveFormatting('100.00', '');
      expect(result).toBe('100.00');
    });

    test('returns new value when no special formatting detected', () => {
      const result = preserveFormatting('25.5', '20.1');
      expect(result).toBe('25.5');
    });
  });
});