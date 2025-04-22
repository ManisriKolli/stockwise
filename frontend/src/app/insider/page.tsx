'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

// Define the trade interface
interface InsiderTrade {
  symbol: string;
  symbolName: string;
  fullName: string;
  shortJobTitle: string;
  transactionType: string;
  amount: string;
  reportedPrice: string;
  usdValue: string;
  transactionDate: string;
}

export default function ChartPage() {
  const [trades, setTrades] = useState<InsiderTrade[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  useEffect(() => {
    // Try to get data from localStorage first
    const cachedData = localStorage.getItem('insiderTrades');
    const cachedTimestamp = localStorage.getItem('insiderTradesTimestamp');
    
    if (cachedData && cachedTimestamp) {
      const parsedData = JSON.parse(cachedData);
      setTrades(parsedData);
      setLastFetched(new Date(parseInt(cachedTimestamp)));
    } else {
      // No cached data, fetch fresh
      fetchInsiderTrades();
    }
  }, []);

  const fetchInsiderTrades = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.get('https://yahoo-finance15.p.rapidapi.com/api/v1/markets/insider-trades', {
        headers: {
          'X-RapidAPI-Key': '87b088a185msh6dc197816329727p13c48ajsnb75d08fdfdf6',
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
      });
      
      if (response.data && response.data.body) {
        const newTrades = response.data.body;
        // Update state with new data
        setTrades(newTrades);
        
        // Cache data in localStorage
        localStorage.setItem('insiderTrades', JSON.stringify(newTrades));
        const now = Date.now();
        localStorage.setItem('insiderTradesTimestamp', now.toString());
        setLastFetched(new Date(now));
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (err) {
      console.error('Error fetching insider trades:', err);
      setError('Failed to fetch insider trades. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string | undefined): string => {
    if (!value) return '$0';
    const numValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(numValue);
  };

  const formatDate = (dateStr: string): string => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]) < 100 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
    
    return `${months[month]} ${day}, ${year}`;
  };

  const getRelativeTime = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // diff in seconds
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50">
      <Sidebar />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Insider Trading Tracker</h1>
            {lastFetched && (
              <p className="text-xs text-zinc-500 mt-1">Last updated: {getRelativeTime(lastFetched)}</p>
            )}
          </div>
          
          <button 
            className="px-4 py-2 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 rounded transition-colors"
            onClick={fetchInsiderTrades}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 p-4 mb-4 rounded flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw size={32} className="animate-spin text-blue-500 mr-3" />
            <p>Loading insider trading data...</p>
          </div>
        ) : trades.length > 0 ? (
          <div className="overflow-auto rounded border border-zinc-800">
            <table className="w-full border-collapse">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="text-left p-3 text-zinc-400 text-xs font-medium">Symbol</th>
                  <th className="text-left p-3 text-zinc-400 text-xs font-medium">Company</th>
                  <th className="text-left p-3 text-zinc-400 text-xs font-medium">Insider</th>
                  <th className="text-left p-3 text-zinc-400 text-xs font-medium">Position</th>
                  <th className="text-left p-3 text-zinc-400 text-xs font-medium">Type</th>
                  <th className="text-right p-3 text-zinc-400 text-xs font-medium">Shares</th>
                  <th className="text-right p-3 text-zinc-400 text-xs font-medium">Price</th>
                  <th className="text-right p-3 text-zinc-400 text-xs font-medium">Value</th>
                  <th className="text-right p-3 text-zinc-400 text-xs font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, index) => (
                  <tr key={index} className="border-t border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3 font-medium">{trade.symbol}</td>
                    <td className="p-3 text-zinc-400 max-w-xs truncate">{trade.symbolName}</td>
                    <td className="p-3 max-w-xs truncate">{trade.fullName}</td>
                    <td className="p-3 text-zinc-400 text-xs">
                      {trade.shortJobTitle !== "N/A" ? trade.shortJobTitle : "Director"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.transactionType === 'Buy' ? 'bg-green-900/50 text-green-300' : 
                        trade.transactionType === 'Sell' ? 'bg-red-900/50 text-red-300' : 
                        'bg-blue-900/50 text-blue-300'
                      }`}>
                        {trade.transactionType}
                      </span>
                    </td>
                    <td className="p-3 text-right">{trade.amount}</td>
                    <td className="p-3 text-right">
                      {parseFloat(trade.reportedPrice) > 0 ? `$${parseFloat(trade.reportedPrice).toFixed(2)}` : '-'}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(trade.usdValue)}
                    </td>
                    <td className="p-3 text-right text-zinc-400">
                      {formatDate(trade.transactionDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-400 bg-zinc-900/30 rounded border border-zinc-800">
            <p className="mb-2">No insider trading data found</p>
            <button 
              onClick={fetchInsiderTrades} 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Click to fetch data
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4 text-xs text-zinc-500">
          <p>Data from Yahoo Finance via RapidAPI</p>
          {trades.length > 0 && <p>{trades.length} trades found</p>}
        </div>
      </div>
    </div>
  );
}