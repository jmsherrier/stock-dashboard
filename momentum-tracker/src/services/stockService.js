// Centralized stock data management service
import apiClient from '../api/client';
import { preserveFormatting } from '../utils/stockUtils';

export class StockService {
  static async updateStockQuote(stock) {
    if (!stock.components?.ticker?.value?.trim()) {
      throw new Error('Cannot update stock without ticker');
    }
    
    const ticker = stock.components.ticker.value;
    const quote = await apiClient.getStockQuote(ticker);
    
    // Create updated components with preserved formatting
    const updatedComponents = { ...stock.components };
    
    if (quote.price && updatedComponents.price) {
      updatedComponents.price.value = preserveFormatting(
        quote.price.toString(), 
        updatedComponents.price.value
      );
    }
    
    if (quote.percentChange && updatedComponents.percentRise) {
      updatedComponents.percentRise.value = preserveFormatting(
        quote.percentChange.toString(), 
        updatedComponents.percentRise.value
      );
    }
    
    if (quote.relativeVolume && updatedComponents.relativeVolume) {
      updatedComponents.relativeVolume.value = preserveFormatting(
        quote.relativeVolume.toString(), 
        updatedComponents.relativeVolume.value
      );
    }
    
    return { ...stock, components: updatedComponents };
  }

  static async updateMultipleStocks(stocks) {
    const updatePromises = stocks.map(async (stock) => {
      try {
        if (!stock.components?.ticker?.value?.trim()) {
          console.log('Skipping stock without ticker:', stock);
          return stock;
        }
        
        return await this.updateStockQuote(stock);
      } catch (err) {
        console.warn('Failed to update stock:', stock.components?.ticker?.value, err);
        return stock;
      }
    });

    return await Promise.all(updatePromises);
  }
}