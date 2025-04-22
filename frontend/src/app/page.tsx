"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import AuthModal from "@/components/AuthModal";
import { useAuth, SignedIn, SignedOut } from "@clerk/nextjs";
import { usePolygon } from "@/lib/alphaVantageService";
import { useWatchlist } from "@/hooks/useWatchlist";

const apiCache = {
  stockData: new Map(),
  stockHistory: new Map(),
  newsData: new Map(),
  sentimentData: new Map(),
  
  expirations: {
    stockData: 5 * 60 * 1000,
    stockHistory: 60 * 60 * 1000,
    newsData: 30 * 60 * 1000,
    sentimentData: 24 * 60 * 60 * 1000
  },
  
  get: function(type, key) {
    const cacheItem = this[type].get(key);
    if (!cacheItem) return null;
    
    if (Date.now() - cacheItem.timestamp > this.expirations[type]) {
      this[type].delete(key);
      return null;
    }
    
    return cacheItem.data;
  },
  
  set: function(type, key, data) {
    this[type].set(key, {
      data,
      timestamp: Date.now()
    });
  }
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("AAPL");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState("signIn");
  const { isSignedIn } = useAuth();
  const polygon = usePolygon();
  const { addToWatchlist } = useWatchlist();
  
  const [stockData, setStockData] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [newsHeadlines, setNewsHeadlines] = useState([]);
  const [sentimentScore, setSentimentScore] = useState(0.5);
  const [overallSentiment, setOverallSentiment] = useState("Neutral");
  const [rsiValue, setRsiValue] = useState(50);
  const [movingAvgSignal, setMovingAvgSignal] = useState("neutral");
  const [predictionConfidence, setPredictionConfidence] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchStockData = async () => {
      if (!searchQuery) return;
      
      setIsLoading(true);
      setError("");
      
      try {
        let quote = apiCache.get('stockData', searchQuery);
        if (!quote) {
          quote = await polygon.getStockQuote(searchQuery);
          apiCache.set('stockData', searchQuery, quote);
        }
        setStockData(quote);
        
        let history = apiCache.get('stockHistory', searchQuery);
        if (!history) {
          history = await polygon.getStockHistory(searchQuery);
          apiCache.set('stockHistory', searchQuery, history);
        }
        
        const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
        const formattedHistory = sortedHistory.slice(0, 30).map((item, index) => ({
          day: index + 1,
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: item.close
        }));
        
        setStockHistory(formattedHistory);
        await fetchCompanyNews(searchQuery);
        
      } catch (err) {
        const errorMsg = err.message || "";
        if (errorMsg.includes("rate limit") || err.status === 429) {
          setError("API rate limit exceeded. Please try again in a few minutes.");
        } else {
          setError("Unable to fetch stock data. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStockData();
  }, [searchQuery]);
  
  useEffect(() => {
    if (newsHeadlines.length > 0 && stockHistory.length > 0) {
      analyzeStockData(newsHeadlines);
    }
  }, [newsHeadlines, stockHistory]);
  
  const fetchCompanyNews = async (symbol) => {
    try {
      let newsItems = apiCache.get('newsData', symbol);
      
      if (!newsItems) {
        const today = new Date();
        const toDate = today.toISOString().split('T')[0];
        
        const fromDate = new Date();
        fromDate.setMonth(today.getMonth() - 1);
        const fromDateStr = fromDate.toISOString().split('T')[0];
        
        const response = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDateStr}&to=${toDate}&token=csjefjpr01qujq2apfhgcsjefjpr01qujq2apfi0`);
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("API rate limit exceeded");
          } else {
            throw new Error(`Failed to fetch news: ${response.status}`);
          }
        }
        
        newsItems = await response.json();
        apiCache.set('newsData', symbol, newsItems);
      }
      
      const recentNews = newsItems.slice(0, 10).map(item => ({
        id: item.id,
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
        datetime: new Date(item.datetime * 1000).toLocaleDateString(),
        sentiment: null
      }));
      
      setNewsData(recentNews);
      
      const headlines = recentNews.map(item => ({
        id: item.id,
        headline: item.headline
      }));
      
      setNewsHeadlines(headlines);
      
    } catch (error) {
      setNewsData([]);
      setDefaultAnalysisValues();
    }
  };
  
  const setDefaultAnalysisValues = () => {
    setSentimentScore(0.5);
    setOverallSentiment("NEUTRAL");
    setRsiValue(50);
    setMovingAvgSignal("neutral");
    setPredictionConfidence(50);
  };
  
  const analyzeStockData = async (headlines) => {
    try {
      const headlinesKey = headlines.map(item => item.id).join('-');
      const cachedAnalysis = apiCache.get('sentimentData', headlinesKey);
      
      if (cachedAnalysis) {
        setSentimentScore(cachedAnalysis.sentimentScore);
        setOverallSentiment(cachedAnalysis.overallSentiment);
        setNewsData(cachedAnalysis.newsWithSentiment);
        setRsiValue(cachedAnalysis.rsiValue);
        setMovingAvgSignal(cachedAnalysis.movingAvgSignal);
        setPredictionConfidence(cachedAnalysis.predictionConfidence);
        return;
      }
      
      let newsWithSentiment = [...newsData];
      let totalSentiment = 0;
      let validSentiments = 0;
      
      const sentimentResults = await Promise.all(
        headlines.map(async (item) => {
          try {
            return await analyzeSentimentText(item.headline);
          } catch (e) {
            return null;
          }
        })
      );
      
      sentimentResults.forEach((result, idx) => {
        if (result) {
          newsWithSentiment[idx] = {
            ...newsWithSentiment[idx],
            sentiment: result.score,
            sentimentLabel: result.label
          };
          totalSentiment += result.score;
          validSentiments++;
        }
      });
      
      const averageSentiment = validSentiments > 0 ? totalSentiment / validSentiments : 0.5;
      
      let sentimentLabel = "NEUTRAL";
      if (averageSentiment > 0.6) {
        sentimentLabel = "POSITIVE";
      } else if (averageSentiment < 0.4) {
        sentimentLabel = "NEGATIVE";
      }
      
      const rsi = calculateRSI(stockHistory);
      const maSignal = calculateMovingAverageSignal(stockHistory);
      
      const sentimentWeight = 0.4;
      const rsiWeight = 0.3;
      const maWeight = 0.3;
      
      const normalizedSentiment = (averageSentiment) * 100;
      const normalizedRSI = rsi;
      const normalizedMA = maSignal === "bullish" ? 75 : maSignal === "bearish" ? 25 : 50;
      
      const weightedScore = (normalizedSentiment * sentimentWeight) + 
                           (normalizedRSI * rsiWeight) + 
                           (normalizedMA * maWeight);
      
      const confidence = Math.round(Math.min(Math.max(weightedScore, 0), 100));
      
      setSentimentScore(averageSentiment);
      setOverallSentiment(sentimentLabel);
      setNewsData(newsWithSentiment);
      setRsiValue(rsi);
      setMovingAvgSignal(maSignal);
      setPredictionConfidence(confidence);
      
      apiCache.set('sentimentData', headlinesKey, {
        sentimentScore: averageSentiment,
        overallSentiment: sentimentLabel,
        newsWithSentiment: newsWithSentiment,
        rsiValue: rsi,
        movingAvgSignal: maSignal,
        predictionConfidence: confidence
      });
      
    } catch (error) {
      setDefaultAnalysisValues();
    }
  };
  
  const calculateRSI = (priceData) => {
    if (!priceData || priceData.length < 14) {
      return 50;
    }
    
    const changes = [];
    for (let i = 1; i < priceData.length; i++) {
      changes.push(priceData[i].price - priceData[i-1].price);
    }
    
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
    
    const avgGain = gains.slice(0, 14).reduce((sum, gain) => sum + gain, 0) / 14;
    const avgLoss = losses.slice(0, 14).reduce((sum, loss) => sum + loss, 0) / 14;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return Math.round(rsi);
  };
  
  const calculateMovingAverageSignal = (priceData) => {
    if (!priceData || priceData.length < 20) {
      return "neutral";
    }
    
    const prices = priceData.map(item => item.price);
    
    const shortMA = prices.slice(0, 5).reduce((sum, price) => sum + price, 0) / 5;
    const longMA = prices.slice(0, 20).reduce((sum, price) => sum + price, 0) / 20;
    
    if (shortMA > longMA) {
      return "bullish";
    } else if (shortMA < longMA) {
      return "bearish";
    } else {
      return "neutral";
    }
  };
  
  const analyzeSentimentText = async (text) => {
    try {
      const response = await fetch("/api/sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Sentiment API rate limit exceeded");
        } else {
          throw new Error(`Sentiment analysis failed: ${response.status}`);
        }
      }
      
      const result = await response.json();
      
      const sentimentData = result[0];
      const sentimentLabel = sentimentData?.label || "neutral";
      const sentimentScore = sentimentData?.score || 0.5;
      
      let score = sentimentScore;
      if (sentimentLabel === "negative") {
        score = 1 - score;
      }
      
      return {
        score: score,
        label: sentimentLabel.toUpperCase()
      };
    } catch (error) {
      return null;
    }
  };
  
  const openAuthModal = (view) => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };
  
  const stockDirection = stockData?.change > 0 ? "up" : "down";
  
  const handleSearch = (e) => {
    e.preventDefault();
    const symbolToSearch = e.target.elements.searchInput.value.toUpperCase();
    setSearchQuery(symbolToSearch);
  };

  const handleAddToWatchlist = async () => {
    if (!isSignedIn) {
      openAuthModal('signIn');
      return;
    }
    
    if (stockData) {
      try {
        const added = await addToWatchlist(
          stockData.symbol,
          searchQuery
        );
        
        if (added) {
          alert(`${stockData.symbol} added to watchlist!`);
        } else {
          alert(`${stockData.symbol} is already in your watchlist`);
        }
      } catch (error) {
        console.error('Error adding to watchlist:', error);
        alert('Failed to add to watchlist. Please try again.');
      }
    }
  };
  
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <form onSubmit={handleSearch} className="relative w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              id="searchInput"
              type="text" 
              defaultValue={searchQuery}
              placeholder="Enter stock symbol..."
              className="bg-black text-white w-full pl-9 py-1.5 rounded-md border border-gray-800 focus:outline-none text-sm"
            />
          </form>
          
          <div className="flex gap-3">
            <button 
              onClick={handleAddToWatchlist}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md"
            >
              Add to Watchlist
            </button>
            <SignedIn>
              <button 
                onClick={() => window.Clerk?.signOut()} 
                className="px-3 py-1.5 text-sm bg-black text-white rounded-md border border-gray-800 hover:bg-gray-900"
              >
                Logout
              </button>
            </SignedIn>
            <SignedOut>
              <button 
                onClick={() => openAuthModal('signIn')} 
                className="px-3 py-1.5 text-sm bg-black text-white rounded-md border border-gray-800 hover:bg-gray-900"
              >
                Login
              </button>
            </SignedOut>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading stock data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 p-4 rounded">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="bg-black rounded border border-gray-800 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-medium">
                    {searchQuery} - ${stockData?.price?.toFixed(2)}
                  </h2>
                  <span className={stockData?.change >= 0 ? "text-green-500" : "text-red-500"}>
                    {stockData?.change >= 0 ? "+" : ""}{stockData?.change?.toFixed(2)} ({stockData?.changePercent?.toFixed(2)}%)
                  </span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stockHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="day" stroke="#fff" tick={{fontSize: 12}} />
                      <YAxis stroke="#fff" tick={{fontSize: 12}} />
                      <Tooltip labelFormatter={(value) => `Date: ${stockHistory[value-1]?.date || value}`} />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke={stockData?.change >= 0 ? "#22c55e" : "#ef4444"} 
                        strokeWidth={2} 
                        dot={false} 
                        activeDot={{ r: 4 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-black rounded border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-medium">Technical Analysis</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-800 rounded-sm p-3">
                    <p className="text-sm text-gray-400 mb-1">News Sentiment</p>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 
                        ${overallSentiment === "POSITIVE" ? "bg-green-900/30 text-green-500" :
                          overallSentiment === "NEGATIVE" ? "bg-red-900/30 text-red-500" :
                          "bg-blue-900/30 text-blue-500"}`}>
                        {overallSentiment === "POSITIVE" ? "+" : 
                          overallSentiment === "NEGATIVE" ? "-" : "="}
                      </div>
                      <span className={
                        overallSentiment === "POSITIVE" ? "text-green-500" :
                        overallSentiment === "NEGATIVE" ? "text-red-500" :
                        "text-blue-500"
                      }>
                        {overallSentiment.charAt(0) + overallSentiment.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border border-gray-800 rounded-sm p-3">
                    <p className="text-sm text-gray-400 mb-1">RSI (14)</p>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 
                        ${rsiValue > 70 ? "bg-red-900/30 text-red-500" :
                          rsiValue < 30 ? "bg-green-900/30 text-green-500" :
                          "bg-blue-900/30 text-blue-500"}`}>
                        {rsiValue > 70 ? "O" : rsiValue < 30 ? "U" : "N"}
                      </div>
                      <span className="font-medium">{rsiValue}</span>
                      <span className="text-xs ml-1 text-gray-400">
                        {rsiValue > 70 ? "(Overbought)" : 
                          rsiValue < 30 ? "(Oversold)" : "(Neutral)"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border border-gray-800 rounded-sm p-3">
                    <p className="text-sm text-gray-400 mb-1">Moving Averages</p>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 
                        ${movingAvgSignal === "bullish" ? "bg-green-900/30 text-green-500" :
                          movingAvgSignal === "bearish" ? "bg-red-900/30 text-red-500" :
                          "bg-blue-900/30 text-blue-500"}`}>
                        {movingAvgSignal === "bullish" ? "↗" : 
                          movingAvgSignal === "bearish" ? "↘" : "→"}
                      </div>
                      <span className={
                        movingAvgSignal === "bullish" ? "text-green-500" :
                        movingAvgSignal === "bearish" ? "text-red-500" :
                        "text-blue-500"
                      }>
                        {movingAvgSignal.charAt(0).toUpperCase() + movingAvgSignal.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border border-gray-800 rounded-sm p-3">
                    <p className="text-sm text-gray-400 mb-1">Combined Signal</p>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 
                        ${stockDirection === "up" ? "bg-green-900/30 text-green-500" : "bg-red-900/30 text-red-500"}`}>
                        {stockDirection === "up" ? "↑" : "↓"}
                      </div>
                      <span className={
                        stockDirection === "up" ? "text-green-500" : "text-red-500"
                      }>
                        {stockDirection.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black rounded border border-gray-800 p-4">
                <h2 className="text-lg font-medium mb-3">Latest News for {searchQuery}</h2>
                {newsData.length > 0 ? (
                  <div className="space-y-3">
                    {newsData.map((news, index) => (
                      <div key={index} 
                        className={`p-3 border rounded-sm hover:border-gray-700 ${
                          news.sentimentLabel === "POSITIVE" ? "border-green-800 bg-green-900/10" : 
                          news.sentimentLabel === "NEGATIVE" ? "border-red-800 bg-red-900/10" : 
                          "border-gray-800"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium mb-1">{news.headline}</h3>
                          {news.sentiment && (
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                              news.sentimentLabel === "POSITIVE" ? "bg-green-900/30 text-green-500" :
                              news.sentimentLabel === "NEGATIVE" ? "bg-red-900/30 text-red-500" :
                              "bg-blue-900/30 text-blue-500"
                            }`}>
                              {news.sentimentLabel.charAt(0) + news.sentimentLabel.slice(1).toLowerCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{news.summary}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">{news.source} | {news.datetime}</span>
                          <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">
                            Read More
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No recent news found for {searchQuery}</p>
                )}
              </div>
            </div>

            <div className="col-span-1 space-y-4">
              <div className="bg-black rounded border border-gray-800 p-4 text-center">
                <h2 className="text-lg font-medium mb-2">Prediction</h2>
                <div className="flex justify-center mb-2">
                  {stockDirection === "up" ? (
                    <ArrowUp size={60} className="text-green-500" />
                  ) : (
                    <ArrowDown size={60} className="text-red-500" />
                  )}
                </div>
                <p className="text-5xl font-bold mb-4">{stockDirection.toUpperCase()}</p>
                <div className="text-sm mb-4">
                  <div className="bg-gray-800 h-3 w-full rounded-full mb-1">
                    <div 
                      className={`h-3 rounded-full ${stockDirection === "up" ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${predictionConfidence}%` }}
                    ></div>
                  </div>
                  <p className="text-right font-medium">{predictionConfidence}% Confidence</p>
                </div>
              </div>

              <div className="bg-black rounded border border-gray-800 p-4">
                <h2 className="text-lg font-medium mb-3">Indicators</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p className="text-gray-400 text-sm">Previous Close</p>
                    <p className="font-medium">${stockData?.previousClose?.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400 text-sm">Open</p>
                    <p className="font-medium">${stockData?.open?.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400 text-sm">High</p>
                    <p className="font-medium">${stockData?.high?.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400 text-sm">Low</p>
                    <p className="font-medium">${stockData?.low?.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400 text-sm">Sentiment</p>
                    <p className={`font-medium ${
                      overallSentiment === "POSITIVE" ? "text-green-500" :
                      overallSentiment === "NEGATIVE" ? "text-red-500" :
                      "text-blue-500"
                    }`}>
                      {overallSentiment.charAt(0) + overallSentiment.slice(1).toLowerCase()}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400 text-sm">RSI (14)</p>
                    <p className={`font-medium ${
                      rsiValue > 70 ? "text-red-500" :
                      rsiValue < 30 ? "text-green-500" :
                      "text-white"
                    }`}>
                      {rsiValue}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400 text-sm">Moving Avg</p>
                    <p className={`font-medium ${
                      movingAvgSignal === "bullish" ? "text-green-500" :
                      movingAvgSignal === "bearish" ? "text-red-500" :
                      "text-blue-500"
                    }`}>
                      {movingAvgSignal.charAt(0).toUpperCase() + movingAvgSignal.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authView} 
      />
    </div>
  );
}