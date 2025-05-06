"use client";

import { useState, useEffect, useRef } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import Sidebar from "@/components/Sidebar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@clerk/nextjs";
import { useFinnhub } from "@/lib/finnhubService";

interface ChartDataPoint {
  day: number;
  price: number;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: ChartDataPoint[];
}

interface LiveData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

interface DataError {
  message: string;
  timestamp?: number;
}

interface WatchlistItem {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
}

export default function Watchlist() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("symbol");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [watchlistData, setWatchlistData] = useState<StockData[]>([]);
  const [liveData, setLiveData] = useState<Record<string, LiveData>>({});
  const [dataErrors, setDataErrors] = useState<Record<string, DataError>>({});
  const { watchlist, removeFromWatchlist, refreshWatchlist } = useWatchlist();
  const { isSignedIn } = useAuth();
  const finnhubService = useFinnhub();
  const isPageMounted = useRef<boolean>(true);

  useEffect(() => {
    isPageMounted.current = true;
    
    fetchWatchlistData();
    
    return () => {
      isPageMounted.current = false;
      
      watchlistData.forEach(stock => {
        finnhubService.unsubscribe(stock.symbol);
      });
    };
  }, [isSignedIn, watchlist, finnhubService]); 

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPageMounted.current) {
        fetchWatchlistData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const handleFocus = () => {
      if (isPageMounted.current) {
        fetchWatchlistData();
      }
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (!watchlistData.length) return;
    
    setDataErrors({});
    
    watchlistData.forEach(stock => {
      finnhubService.subscribe(stock.symbol, (data, error) => {
        if (!isPageMounted.current) return;
        
        if (data) {
          setLiveData(prev => ({
            ...prev,
            [stock.symbol]: data
          }));
          
          setDataErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[stock.symbol];
            return newErrors;
          });
        } else if (error) {
          setDataErrors(prev => ({
            ...prev,
            [stock.symbol]: error
          }));
        }
      });
    });
    
    return () => {
      watchlistData.forEach(stock => {
        finnhubService.unsubscribe(stock.symbol);
      });
    };
  }, [watchlistData, finnhubService]);

  const fetchWatchlistData = () => {
    if (watchlist && Array.isArray(watchlist)) {
      const formattedData = watchlist.map((item: WatchlistItem) => {
        const chartData = Array(5).fill(0).map((_, i) => ({ 
          day: i + 1, 
          price: (item.price || 100) + ((Math.random() * 20) - 10)
        }));
        
        return {
          symbol: item.symbol,
          name: item.name || `${item.symbol} Stock`,
          price: item.price || 0,
          change: item.change || 0,
          changePercent: item.changePercent || 0,
          chartData
        };
      });
      
      setWatchlistData(formattedData);
    }
  };

  const handleRemoveFromWatchlist = async (symbol: string) => {
    try {
      await removeFromWatchlist(symbol);
      
      finnhubService.unsubscribe(symbol);
      
      setLiveData(prev => {
        const newData = {...prev};
        delete newData[symbol];
        return newData;
      });
      
      setDataErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[symbol];
        return newErrors;
      });
      
      fetchWatchlistData();
    } catch (error: unknown) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const filteredData = watchlistData.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === "symbol") {
      comparison = a.symbol.localeCompare(b.symbol);
    } else if (sortBy === "price") {
      const aPrice = liveData[a.symbol]?.price ?? a.price;
      const bPrice = liveData[b.symbol]?.price ?? b.price;
      comparison = aPrice - bPrice;
    } else if (sortBy === "change") {
      const aChange = liveData[a.symbol]?.change ?? a.change;
      const bChange = liveData[b.symbol]?.change ?? b.change;
      comparison = aChange - bChange;
    } else if (sortBy === "changePercent") {
      const aChangePercent = liveData[a.symbol]?.changePercent ?? a.changePercent;
      const bChangePercent = liveData[b.symbol]?.changePercent ?? b.changePercent;
      comparison = aChangePercent - bChangePercent;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const hasErrors = Object.keys(dataErrors).length > 0;
  const hasLiveData = Object.keys(liveData).length > 0;

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search watchlist..."
              className="bg-black text-white w-full pl-9 py-1.5 rounded-md border border-gray-800 focus:outline-none text-sm"
            />
          </div>
          {/* Refresh button has been removed */}
        </div>

        <div className="bg-black rounded border border-gray-800 p-4 mb-6">
          <div className="mb-3">
            <h2 className="text-lg font-medium">Your Watchlist</h2>
          </div>
          
          {hasErrors && hasLiveData && (
            <div className="bg-yellow-900/20 text-yellow-400 border border-yellow-800 p-3 mb-4 rounded">
              <p className="text-sm">
                Live data may be partially available. Some stocks may show cached data.
              </p>
            </div>
          )}
          
          {hasErrors && !hasLiveData && (
            <div className="bg-red-900/20 text-red-400 border border-red-800 p-3 mb-4 rounded">
              <p className="text-sm">
                Live data connection unavailable. Showing cached data.
              </p>
            </div>
          )}
          
          {sortedData.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Your watchlist is empty. Add stocks from the home page.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-400">
                  <th className="py-2 cursor-pointer" onClick={() => handleSort("symbol")}>
                    Symbol {sortBy === "symbol" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="py-2">Name</th>
                  <th className="py-2 cursor-pointer" onClick={() => handleSort("price")}>
                    Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="py-2 cursor-pointer" onClick={() => handleSort("change")}>
                    Change {sortBy === "change" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="py-2 cursor-pointer" onClick={() => handleSort("changePercent")}>
                    % Change {sortBy === "changePercent" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="py-2">Chart</th>
                  <th className="py-2">Updated</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((stock, idx) => {
                  const stockData = liveData[stock.symbol];
                  const currentPrice = stockData?.price ?? stock.price;
                  const change = stockData?.change ?? stock.change;
                  const changePercent = stockData?.changePercent ?? stock.changePercent;
                  const lastUpdated = stockData?.timestamp ? new Date(stockData.timestamp) : null;
                  const hasError = dataErrors[stock.symbol] !== undefined;
                  
                  return (
                    <tr key={idx} className="border-b border-gray-800 text-sm">
                      <td className="py-3 font-medium">
                        {stock.symbol}
                        {hasError && (
                          <span className="ml-2 text-red-500 text-xs">!</span>
                        )}
                      </td>
                      <td className="py-3 text-gray-400">{stock.name}</td>
                      <td className="py-3">${currentPrice.toFixed(2)}</td>
                      <td className={`py-3 ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {change >= 0 ? "+" : ""}{change.toFixed(2)}
                      </td>
                      <td className={`py-3 ${changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
                      </td>
                      <td className="py-3">
                        <div className="h-8 w-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stock.chartData}>
                              <Line 
                                type="monotone" 
                                dataKey="price" 
                                stroke={change >= 0 ? "#22c55e" : "#ef4444"} 
                                strokeWidth={1.5} 
                                dot={false} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-gray-400">
                        {lastUpdated ? (
                          lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        ) : (
                          'Not yet'
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => handleRemoveFromWatchlist(stock.symbol)}
                          className="text-xs px-2 py-1 text-gray-400 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}