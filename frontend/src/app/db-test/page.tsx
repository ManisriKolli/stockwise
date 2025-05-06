"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function DbTestPage() {
  const [status, setStatus] = useState({
    loading: true,
    connected: false,
    message: "Testing database connection...",
    collections: [],
    error: null
  });

  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        const response = await fetch('/api/db-test');
        const data = await response.json();
        
        setStatus({
          loading: false,
          connected: data.connected,
          message: data.message,
          collections: data.collections || [],
          error: data.error || null
        });
      } catch (error) {
        setStatus({
          loading: false,
          connected: false,
          message: "Failed to check database connection",
          collections: [],
          error: error.message
        });
      }
    };

    checkDbConnection();
  }, []);

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="bg-black rounded border border-gray-800 p-4 mb-6">
          <h1 className="text-xl font-bold mb-4">Database Connection Test</h1>
          
          {status.loading ? (
            <div className="py-4">
              <p>Testing database connection...</p>
            </div>
          ) : status.connected ? (
            <div className="py-4">
              <p className="text-green-500 font-bold mb-2">✓ {status.message}</p>
              <p className="text-sm text-gray-400 mb-2">Found {status.collections.length} collections:</p>
              <ul className="list-disc pl-5">
                {status.collections.map((collection, index) => (
                  <li key={index} className="text-gray-300">{collection}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-red-500 font-bold mb-2">✗ {status.message}</p>
              {status.error && (
                <p className="text-sm text-red-400 mt-2">Error: {status.error}</p>
              )}
            </div>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Again
          </button>
        </div>
      </main>
    </div>
  );
}