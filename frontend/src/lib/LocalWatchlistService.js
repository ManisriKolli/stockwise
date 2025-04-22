// lib/LocalWatchlistService.js

/**
 * Service for managing watchlist data in localStorage
 */
export const LocalWatchlistService = {
    // Storage key
    STORAGE_KEY: 'stockwise_watchlist',
    
    /**
     * Get all watchlist items
     */
    getWatchlist: () => {
      try {
        const data = localStorage.getItem(LocalWatchlistService.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('Error getting watchlist from localStorage:', error);
        return [];
      }
    },
    
    /**
     * Add a stock to watchlist
     */
    addToWatchlist: (symbol, name = '') => {
      try {
        const watchlist = LocalWatchlistService.getWatchlist();
        
        // Check if already exists
        if (watchlist.some(item => item.symbol === symbol)) {
          return false;
        }
        
        // Add new item
        const newItem = {
          id: `${symbol}_${Date.now()}`,
          symbol,
          name: name || symbol,
          addedAt: Date.now()
        };
        
        watchlist.push(newItem);
        
        // Save to localStorage
        localStorage.setItem(
          LocalWatchlistService.STORAGE_KEY, 
          JSON.stringify(watchlist)
        );
        
        return true;
      } catch (error) {
        console.error('Error adding to watchlist:', error);
        return false;
      }
    },
    
    /**
     * Remove a stock from watchlist
     */
    removeFromWatchlist: (symbol) => {
      try {
        let watchlist = LocalWatchlistService.getWatchlist();
        
        // Filter out the item to remove
        const newWatchlist = watchlist.filter(item => item.symbol !== symbol);
        
        // If no change, return false
        if (newWatchlist.length === watchlist.length) {
          return false;
        }
        
        // Save back to localStorage
        localStorage.setItem(
          LocalWatchlistService.STORAGE_KEY, 
          JSON.stringify(newWatchlist)
        );
        
        return true;
      } catch (error) {
        console.error('Error removing from watchlist:', error);
        return false;
      }
    }
  };