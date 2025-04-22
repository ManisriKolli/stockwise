// lib/polygonService.ts (renamed from alphaVantageService.ts)
import { useAuth } from "@clerk/nextjs";

// Define types for the API responses
export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface StockHistoryItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Hook for direct Polygon.io API access
 */
export const usePolygon = () => {
  const { getToken } = useAuth();
  const POLYGON_API_KEY = "GMjCJdNFapVqQwaJ4TroDadM2xLczWpF"; // Your Polygon API key
  
  /**
   * Base fetch function for Polygon API
   */
  const fetchPolygon = async (endpoint: string, params: Record<string, string> = {}) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        ...params,
        apiKey: POLYGON_API_KEY
      }).toString();
      
      const url = `https://api.polygon.io${endpoint}?${queryParams}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Polygon API error: ${response.status} for ${url}`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Polygon API Error for ${endpoint}:`, error);
      throw error;
    }
  };
  
  // Helper to get date range for last 30 days
  const getLast30DaysRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };
  
  return {
    // Get current stock quote
    getStockQuote: async (symbol: string): Promise<StockQuote> => {
      // Get previous day close
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayFormatted = yesterday.toISOString().split('T')[0];
      
      // Get latest price from Polygon
      const data = await fetchPolygon(`/v2/aggs/ticker/${symbol}/prev`, {});
      
      if (!data || !data.results || data.results.length === 0) {
        throw new Error(`No quote data available for ${symbol}`);
      }
      
      const result = data.results[0];
      const previousClose = result.c;
      const change = result.c - result.o;
      const changePercent = (change / result.o) * 100;
      
      return {
        symbol,
        price: result.c,
        change,
        changePercent,
        high: result.h,
        low: result.l,
        open: result.o,
        previousClose
      };
    },
    
    // Get historical stock data
    getStockHistory: async (symbol: string): Promise<StockHistoryItem[]> => {
      const { startDate, endDate } = getLast30DaysRange();
      
      const data = await fetchPolygon(`/v2/aggs/ticker/${symbol}/range/1/day/${startDate}/${endDate}`, {
        adjusted: 'true',
        sort: 'desc', // newest first
        limit: '30'
      });
      
      if (!data || !data.results || data.results.length === 0) {
        return [];
      }
      
      // Convert Polygon response to our StockHistoryItem format
      return data.results.map((item: any) => {
        // Convert timestamp to date string (Polygon uses milliseconds timestamp)
        const date = new Date(item.t);
        const dateStr = date.toISOString().split('T')[0];
        
        return {
          date: dateStr,
          open: item.o,
          high: item.h,
          low: item.l,
          close: item.c,
          volume: item.v
        };
      });
    },
    
    // Search for symbols
    searchSymbol: async (keywords: string) => {
      const data = await fetchPolygon(`/v3/reference/tickers`, {
        search: keywords,
        active: 'true',
        sort: 'ticker',
        order: 'asc',
        limit: '10'
      });
      
      if (!data || !data.results) {
        return [];
      }
      
      return data.results.map((match: any) => ({
        symbol: match.ticker,
        name: match.name,
        type: match.market,
        region: match.locale,
        currency: match.currency_name
      }));
    },
    
    // Get company overview
    getCompanyOverview: async (symbol: string) => {
      return await fetchPolygon(`/v3/reference/tickers/${symbol}`, {});
    }
  };
};