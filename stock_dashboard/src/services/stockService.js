// Centralized stock data management service
import apiClient from '../api/client';
import { preserveFormatting } from '../utils/stockUtils';
import { apiService } from '../services';

export class StockService {
  static async updateStockQuote(stock) {
    if (!stock.components?.ticker?.value?.trim()) {
      throw new Error('Cannot update stock without ticker');
    }
    
    const ticker = stock.components.ticker.value;
    
    // Increment API counter before making request
    apiService.incrementCounter();
    
    const quote = await apiClient.getStockQuote(ticker);
    
    console.log('Quote received for', ticker, ':', quote);
    
    // Create updated components with preserved formatting
    const updatedComponents = { ...stock.components };
    
    if (quote.price) {
      if (!updatedComponents.price) {
        updatedComponents.price = { value: quote.price.toString() };
      } else {
        // Store previous value before updating
        updatedComponents.price.previousValue = updatedComponents.price.value;
        updatedComponents.price.value = preserveFormatting(
          quote.price.toString(), 
          updatedComponents.price.value
        );
      }
      console.log('Updated price to:', updatedComponents.price.value);
    }
    
    if (quote.percentChange) {
      if (!updatedComponents.percentRise) {
        updatedComponents.percentRise = { value: quote.percentChange.toString() };
      } else {
        // Store previous value before updating
        updatedComponents.percentRise.previousValue = updatedComponents.percentRise.value;
        updatedComponents.percentRise.value = preserveFormatting(
          quote.percentChange.toString(), 
          updatedComponents.percentRise.value
        );
      }
      console.log('Updated percentRise to:', updatedComponents.percentRise.value);
    }
    
    if (quote.relativeVolume) {
      if (!updatedComponents.relativeVolume) {
        updatedComponents.relativeVolume = { value: quote.relativeVolume.toString() };
      } else {
        // Store previous value before updating
        updatedComponents.relativeVolume.previousValue = updatedComponents.relativeVolume.value;
        updatedComponents.relativeVolume.value = preserveFormatting(
          quote.relativeVolume.toString(), 
          updatedComponents.relativeVolume.value
        );
      }
      console.log('Updated relativeVolume to:', updatedComponents.relativeVolume.value);
    }
    
    // Add shares outstanding if available from API
    console.log('Checking sharesOutstanding:', quote.sharesOutstanding, 'Type:', typeof quote.sharesOutstanding);
    if (quote.sharesOutstanding) {
      console.log('sharesOutstanding exists, updating components...');
      if (!updatedComponents.sharesOutstanding) {
        updatedComponents.sharesOutstanding = { value: quote.sharesOutstanding.toString() };
      } else {
        updatedComponents.sharesOutstanding.value = quote.sharesOutstanding.toString();
      }
      console.log('Updated sharesOutstanding to:', updatedComponents.sharesOutstanding.value);
      
      // Calculate float automatically if shares outstanding is available
      const sharesOutstanding = parseFloat(quote.sharesOutstanding) || 0;
      const restrictedShares = parseFloat(updatedComponents.restrictedShares?.value || 0);
      
      if (sharesOutstanding > 0) {
        const calculatedFloat = ((sharesOutstanding - restrictedShares) / 1000000).toFixed(2);
        if (!updatedComponents.float) {
          updatedComponents.float = { value: calculatedFloat };
        } else {
          updatedComponents.float.value = calculatedFloat;
        }
        console.log('Auto-calculated float to:', calculatedFloat, 'M shares');
      }
    } else {
      console.log('sharesOutstanding NOT found in quote');
    }
    
    // Add all new fields from Alpha Vantage OVERVIEW
    const fieldMappings = {
      marketCap: 'marketCap',
      beta: 'beta',
      week52High: 'week52High',
      week52Low: 'week52Low',
      movingAverage50: 'movingAverage50',
      movingAverage200: 'movingAverage200',
      sector: 'sector',
      industry: 'industry',
      profitMargin: 'profitMargin',
      revenueGrowth: 'revenueGrowth',
      peRatio: 'peRatio',
      analystTarget: 'analystTarget',
      pegRatio: 'pegRatio',
      priceToBook: 'priceToBook',
      roe: 'roe',
      dividendYield: 'dividendYield',
      eps: 'eps',
      operatingMargin: 'operatingMargin',
      institutionalOwnership: 'institutionalOwnership',
      actualFloat: 'actualFloat',
      forwardPE: 'forwardPE',
      trailingPE: 'trailingPE',
      priceToSales: 'priceToSales',
      bookValue: 'bookValue',
      ebitda: 'ebitda',
      earningsGrowth: 'earningsGrowth',
      insiderOwnership: 'insiderOwnership',
      roa: 'roa',
      dividendPerShare: 'dividendPerShare',
      evToRevenue: 'evToRevenue',
      evToEbitda: 'evToEbitda',
      revenuePerShare: 'revenuePerShare',
      analystRatingStrongBuy: 'analystRatingStrongBuy',
      analystRatingBuy: 'analystRatingBuy',
      analystRatingHold: 'analystRatingHold',
      analystRatingSell: 'analystRatingSell',
      analystRatingStrongSell: 'analystRatingStrongSell',
      assetType: 'assetType',
      companyName: 'companyName',
      companyDescription: 'companyDescription'
    };
    
    Object.entries(fieldMappings).forEach(([apiField, componentId]) => {
      if (quote[apiField]) {
        if (!updatedComponents[componentId]) {
          updatedComponents[componentId] = { value: quote[apiField].toString() };
        } else {
          // Store previous value before updating
          updatedComponents[componentId].previousValue = updatedComponents[componentId].value;
          updatedComponents[componentId].value = quote[apiField].toString();
        }
        console.log(`Updated ${componentId} to:`, quote[apiField]);
      }
    });
    
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