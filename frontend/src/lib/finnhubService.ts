// lib/finnhubService.ts
import axios from 'axios';

interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

interface ErrorData {
  message: string;
  timestamp: number;
}

type DataCallback = (data: QuoteData | null, error?: ErrorData) => void;

class FinnhubService {
  private apiKey: string;
  private baseUrl: string;
  private subscribers: Map<string, DataCallback[]>;
  private fetchIntervals: Map<string, NodeJS.Timeout>;
  private lastData: Map<string, QuoteData>;
  private errors: Map<string, ErrorData>;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://finnhub.io/api/v1';
    this.subscribers = new Map();
    this.fetchIntervals = new Map();
    this.lastData = new Map();
    this.errors = new Map();
  }

  // Fetch stock quote data
  async fetchQuote(symbol: string): Promise<QuoteData> {
    try {
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol,
          token: this.apiKey
        }
      });

      return {
        symbol,
        price: response.data.c,
        change: response.data.d,
        changePercent: response.data.dp,
        high: response.data.h,
        low: response.data.l,
        open: response.data.o,
        previousClose: response.data.pc,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      this.errors.set(symbol, {
        message: error.message || 'Unknown error',
        timestamp: Date.now()
      });
      throw error;
    }
  }

  // Start polling for a specific symbol
  startPolling(symbol: string, intervalMs: number = 60000): void {
    if (!this.fetchIntervals.has(symbol)) {
      // Fetch immediately
      this.fetchAndNotify(symbol);

      // Set up interval
      const intervalId = setInterval(() => {
        this.fetchAndNotify(symbol);
      }, intervalMs);

      this.fetchIntervals.set(symbol, intervalId);
    }
  }

  // Stop polling for a specific symbol
  stopPolling(symbol: string): void {
    const intervalId = this.fetchIntervals.get(symbol);
    if (intervalId) {
      clearInterval(intervalId);
      this.fetchIntervals.delete(symbol);
    }
  }

  // Fetch data and notify subscribers
  async fetchAndNotify(symbol: string): Promise<QuoteData | null> {
    try {
      const data = await this.fetchQuote(symbol);
      this.lastData.set(symbol, data);
      
      // Notify subscribers
      const callbacks = this.subscribers.get(symbol) || [];
      callbacks.forEach(callback => callback(data));
      
      // Clear any previous errors
      this.errors.delete(symbol);
      
      return data;
    } catch (error: any) {
      console.error(`Error in fetchAndNotify for ${symbol}:`, error);
      // Create error object
      const errorData: ErrorData = {
        message: error.message || 'Unknown error',
        timestamp: Date.now()
      };
      
      // Notify subscribers of the error
      const callbacks = this.subscribers.get(symbol) || [];
      callbacks.forEach(callback => callback(null, errorData));
      
      return null;
    }
  }

  // Subscribe to updates for a symbol
  subscribe(symbol: string, callback: DataCallback): void {
    if (!symbol) return;

    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }

    const callbacks = this.subscribers.get(symbol) || [];
    callbacks.push(callback);
    this.subscribers.set(symbol, callbacks);

    // Start polling if not already
    this.startPolling(symbol);

    // Return the last known data if available
    if (this.lastData.has(symbol)) {
      const data = this.lastData.get(symbol);
      if (data) {
        setTimeout(() => {
          callback(data);
        }, 0);
      }
    }
  }

  // Unsubscribe from updates for a symbol
  unsubscribe(symbol: string, callback?: DataCallback): void {
    if (!symbol || !this.subscribers.has(symbol)) {
      return;
    }

    if (callback) {
      // Remove specific callback
      const callbacks = this.subscribers.get(symbol) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        this.subscribers.set(symbol, callbacks);
      }

      // If no more callbacks, stop polling
      if (callbacks.length === 0) {
        this.subscribers.delete(symbol);
        this.stopPolling(symbol);
      }
    } else {
      // Remove all callbacks for this symbol
      this.subscribers.delete(symbol);
      this.stopPolling(symbol);
    }
  }

  // Get last known data for a symbol
  getLastData(symbol: string): QuoteData | undefined {
    return this.lastData.get(symbol);
  }

  // Get error for a symbol if any
  getError(symbol: string): ErrorData | undefined {
    return this.errors.get(symbol);
  }

  // Clear all subscriptions and stop polling
  disconnect(): void {
    // Clear all intervals
    this.fetchIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });

    // Clear all data
    this.subscribers.clear();
    this.fetchIntervals.clear();
    this.lastData.clear();
    this.errors.clear();
  }
}

// Create a singleton instance
let finnhubService: FinnhubService | null = null;

export function useFinnhub(apiKey: string = 'csjefjpr01qujq2apfhgcsjefjpr01qujq2apfi0'): FinnhubService {
  if (!finnhubService) {
    finnhubService = new FinnhubService(apiKey);
  }
  
  return finnhubService;
}