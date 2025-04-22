// hooks/useWatchlist.js
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { LocalWatchlistService } from '@/lib/LocalWatchlistService';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useAuth();

  // Load watchlist data when the hook is initialized
  useEffect(() => {
    fetchWatchlist();
  }, [isSignedIn]);

  const fetchWatchlist = () => {
    setLoading(true);
    try {
      const data = LocalWatchlistService.getWatchlist();
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (symbol, name = '') => {
    try {
      const added = LocalWatchlistService.addToWatchlist(symbol, name);
      if (added) {
        fetchWatchlist(); // Refresh the watchlist
      }
      return added;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      const removed = LocalWatchlistService.removeFromWatchlist(symbol);
      if (removed) {
        fetchWatchlist(); // Refresh the watchlist
      }
      return removed;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  };

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    refreshWatchlist: fetchWatchlist
  };
}