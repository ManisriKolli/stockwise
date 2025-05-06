// src/hooks/useWatchlist.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface WatchlistItem {
  symbol: string;
  name?: string;
  addedAt?: Date;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      fetchWatchlist();
    } else {
      // Use local storage for guest users
      const localWatchlist = localStorage.getItem('watchlist_local');
      if (localWatchlist) {
        try { setWatchlist(JSON.parse(localWatchlist)); } 
        catch { setWatchlist([]); }
      } else {
        setWatchlist([]);
      }
    }
  }, [isSignedIn]);

  const fetchWatchlist = async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);

    try {
      // Get authentication token
      const token = await getToken();
      
      const response = await fetch('/api/watchlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setWatchlist(data);
    } catch (err: any) {
      console.error('Error fetching watchlist:', err);
      setError(err.message || 'Failed to fetch watchlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (symbol: string, name = ''): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!isSignedIn) {
        // Handle local storage for guest users
        const item = { symbol, name: name || symbol, addedAt: new Date() };
        const newList = [...watchlist, item];
        setWatchlist(newList);
        localStorage.setItem('watchlist_local', JSON.stringify(newList));
        return true;
      }

      // Get authentication token
      const token = await getToken();
      
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symbol, name })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      // Refresh the watchlist
      fetchWatchlist();
      return true;
    } catch (err: any) {
      console.error('Error adding to watchlist:', err);
      setError(err.message || 'Failed to add to watchlist');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (symbol: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!isSignedIn) {
        // Handle local storage for guest users
        const newList = watchlist.filter(item => item.symbol !== symbol);
        setWatchlist(newList);
        localStorage.setItem('watchlist_local', JSON.stringify(newList));
        return true;
      }

      // Get authentication token
      const token = await getToken();
      
      const response = await fetch(`/api/watchlist/${symbol}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      // Update local state immediately for better UX
      setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      return true;
    } catch (err: any) {
      console.error('Error removing from watchlist:', err);
      setError(err.message || 'Failed to remove from watchlist');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    watchlist,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    refreshWatchlist: fetchWatchlist,
  };
}