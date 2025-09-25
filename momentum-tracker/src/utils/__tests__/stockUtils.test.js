import { 
  createDefaultStock, 
  normalizeStockData, 
  convertToModularFormat, 
  preserveFormatting 
} from '../stockUtils';

describe('Stock Utilities', () => {
  describe('createDefaultStock', () => {
    test('creates a stock with the correct structure', () => {
      const stock = createDefaultStock();
      
      expect(stock).toHaveProperty('id');
      expect(stock).toHaveProperty('components');
      expect(stock.id).toMatch(/^stock-\d+$/);
      
      // Check components structure
      expect(stock.components).toHaveProperty('ticker');
      expect(stock.components).toHaveProperty('price');
      expect(stock.components).toHaveProperty('percentRise');
      expect(stock.components).toHaveProperty('relativeVolume');
      expect(stock.components).toHaveProperty('float');
      expect(stock.components).toHaveProperty('notes');
      expect(stock.components).toHaveProperty('news');
      expect(stock.components).toHaveProperty('bonusChecks');
    });

    test('creates empty default values', () => {
      const stock = createDefaultStock();
      
      expect(stock.components.ticker.value).toBe('');
      expect(stock.components.price.value).toBe('');
      expect(stock.components.news.items).toEqual([]);
      expect(stock.components.bonusChecks.checks.recentIPO).toBe(false);
    });
  });

  describe('normalizeStockData', () => {
    test('converts modular format to legacy format', () => {
      const modularStock = {
        id: 'test-1',
        components: {
          ticker: { value: 'AAPL' },
          price: { value: '150.00' },
          percentRise: { value: '5.5' },
          relativeVolume: { value: '2.3' },
          float: { value: '15.2' },
          notes: { value: 'Test notes' },
          news: { items: [{ text: 'News item', points: 2 }] },
          bonusChecks: { 
            checks: { 
              recentIPO: true, 
              recentReverseSplit: false,
              blueSkyBreakout: true 
            } 
          }
        }
      };

      const normalized = normalizeStockData(modularStock);

      expect(normalized.ticker).toBe('AAPL');
      expect(normalized.price).toBe('150.00');
      expect(normalized.percentRise).toBe('5.5');
      expect(normalized.relativeVolume).toBe('2.3');
      expect(normalized.float).toBe('15.2');
      expect(normalized.notes).toBe('Test notes');
      expect(normalized.positiveCatalysts).toEqual([{ text: 'News item', points: 2 }]);
      expect(normalized.bonusChecks.recentIPO).toBe(true);
      expect(normalized.bonusChecks.blueSkyBreakout).toBe(true);
    });

    test('returns legacy format unchanged', () => {
      const legacyStock = {
        id: 'test-1',
        ticker: 'TSLA',
        price: '250.00',
        percentRise: '8.2',
        relativeVolume: '4.1',
        float: '12.5'
      };

      const normalized = normalizeStockData(legacyStock);
      
      expect(normalized).toEqual(legacyStock);
    });
  });

  describe('convertToModularFormat', () => {
    test('converts legacy format to modular format', () => {
      const legacyStock = {
        id: 'test-1',
        ticker: 'MSFT',
        price: '300.00',
        percentRise: '3.2',
        relativeVolume: '1.8',
        float: '20.1',
        notes: 'Legacy notes',
        positiveCatalysts: [{ text: 'Earnings beat', points: 3 }],
        bonusChecks: { recentIPO: false, recentReverseSplit: true }
      };

      const modular = convertToModularFormat(legacyStock);

      expect(modular.components.ticker.value).toBe('MSFT');
      expect(modular.components.price.value).toBe('300.00');
      expect(modular.components.percentRise.value).toBe('3.2');
      expect(modular.components.relativeVolume.value).toBe('1.8');
      expect(modular.components.float.value).toBe('20.1');
      expect(modular.components.notes.value).toBe('Legacy notes');
      expect(modular.components.news.items).toEqual([{ text: 'Earnings beat', points: 3 }]);
      expect(modular.components.bonusChecks.checks.recentReverseSplit).toBe(true);
    });

    test('returns modular format unchanged', () => {
      const modularStock = {
        id: 'test-1',
        components: {
          ticker: { value: 'GOOGL' },
          price: { value: '2500.00' }
        }
      };

      const converted = convertToModularFormat(modularStock);
      
      expect(converted).toEqual(modularStock);
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