// lib/LocalStorageService.ts

/**
 * Service for managing stock data in localStorage with expiration
 */
export const LocalStorageService = {
    // Keys
    STORAGE_KEYS: {
      STOCK_DATA: 'stockwise_stock_data'
    },
    
    // Expiration time (24 hours in milliseconds)
    EXPIRATION_TIME: 24 * 60 * 60 * 1000,
    
    /**
     * Save stock data to localStorage with expiration
     */
    saveStockData: (symbol: string, data: any) => {
      try {
        // Get existing data or initialize empty object
        const existingData = LocalStorageService.getStockDataAll() || {};
        
        // Add the new data with timestamp
        existingData[symbol] = {
          data,
          timestamp: Date.now()
        };
        
        // Save back to localStorage
        localStorage.setItem(
          LocalStorageService.STORAGE_KEYS.STOCK_DATA, 
          JSON.stringify(existingData)
        );
        
        return true;
      } catch (error) {
        console.error('Error saving stock data to localStorage:', error);
        return false;
      }
    },
    
    /**
     * Get stock data for a specific symbol
     */
    getStockData: (symbol: string) => {
      try {
        const allData = LocalStorageService.getStockDataAll();
        if (!allData || !allData[symbol]) return null;
        
        const stockData = allData[symbol];
        
        // Check if data is expired
        if (Date.now() - stockData.timestamp > LocalStorageService.EXPIRATION_TIME) {
          // Remove expired data
          LocalStorageService.removeStockData(symbol);
          return null;
        }
        
        return stockData.data;
      } catch (error) {
        console.error('Error getting stock data from localStorage:', error);
        return null;
      }
    },
    
    /**
     * Get all stored stock data
     */
    getStockDataAll: () => {
      try {
        const dataStr = localStorage.getItem(LocalStorageService.STORAGE_KEYS.STOCK_DATA);
        return dataStr ? JSON.parse(dataStr) : null;
      } catch (error) {
        console.error('Error parsing stock data from localStorage:', error);
        return null;
      }
    },
    
    /**
     * Remove stock data for a specific symbol
     */
    removeStockData: (symbol: string) => {
      try {
        const allData = LocalStorageService.getStockDataAll();
        if (!allData) return false;
        
        if (allData[symbol]) {
          delete allData[symbol];
          localStorage.setItem(
            LocalStorageService.STORAGE_KEYS.STOCK_DATA, 
            JSON.stringify(allData)
          );
        }
        
        return true;
      } catch (error) {
        console.error('Error removing stock data from localStorage:', error);
        return false;
      }
    },
    
    /**
     * Clear all expired stock data
     */
    clearExpiredData: () => {
      try {
        const allData = LocalStorageService.getStockDataAll();
        if (!allData) return;
        
        let hasChanges = false;
        
        // Check each symbol's data for expiration
        Object.keys(allData).forEach(symbol => {
          if (Date.now() - allData[symbol].timestamp > LocalStorageService.EXPIRATION_TIME) {
            delete allData[symbol];
            hasChanges = true;
          }
        });
        
        // Only update storage if we removed something
        if (hasChanges) {
          localStorage.setItem(
            LocalStorageService.STORAGE_KEYS.STOCK_DATA, 
            JSON.stringify(allData)
          );
        }
      } catch (error) {
        console.error('Error clearing expired stock data:', error);
      }
    }
  };