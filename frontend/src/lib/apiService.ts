import { useAuth } from "@clerk/nextjs";

export const useApi = () => {
  const { getToken } = useAuth();
  
  const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = await getToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      };
      
      // Ensure endpoint starts with /api
      const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      
      const response = await fetch(apiEndpoint, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let error = { message: `API request failed with status ${response.status}` };
        
        try {
          error = JSON.parse(errorText);
        } catch {
          // If response is not JSON, use the default error message
        }
        
        throw new Error(error.message || `API request failed with status ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      throw error;
    }
  };
  
  return {
    getStockData: (symbol: string) => 
      fetchApi(`/api/stock/${symbol}`),
    
    getStockHistory: (symbol: string) => 
      fetchApi(`/api/stock/${symbol}/history`),
    
    getWatchlist: () => 
      fetchApi('/api/watchlist'),
    
    addToWatchlist: (symbol: string, group = 'Default') => 
      fetchApi('/api/watchlist', {
        method: 'POST',
        body: JSON.stringify({ symbol, group })
      }),
    
    removeFromWatchlist: (itemId: string) => 
      fetchApi(`/api/watchlist/${itemId}`, {
        method: 'DELETE'
      }),
    
    getAlerts: () => 
      fetchApi('/api/alerts'),
    
    createAlert: (alertData: any) => 
      fetchApi('/api/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData)
      }),
    
    updateAlert: (alertId: string, data: any) => 
      fetchApi(`/api/alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    
    deleteAlert: (alertId: string) => 
      fetchApi(`/api/alerts/${alertId}`, {
        method: 'DELETE'
      }),
    
    getAlertHistory: () => 
      fetchApi('/api/alert-history'),
    
    getPredictions: () => 
      fetchApi('/api/predictions')
  };
}