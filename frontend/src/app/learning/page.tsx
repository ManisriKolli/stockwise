"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

// Language options - limited to 4 as requested
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिन्दी" }
];

export default function LearningPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load content based on selected language
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/content/${selectedLanguage}.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch language content: ${response.status}`);
        }
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error("Error loading content:", error);
        // Fallback to English if there's an error
        if (selectedLanguage !== "en") {
          setSelectedLanguage("en");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [selectedLanguage]);

  // Language switcher handler
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  // Show loading state
  if (isLoading || !content) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading content...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        {/* Language selector */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{content.title}</h1>
          <select 
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Introduction */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 mb-6">
          <p className="text-zinc-300">{content.intro}</p>
        </div>

        {/* App Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5">
            <h2 className="text-xl font-semibold mb-4">{content.appFeatures.title}</h2>
            <div className="space-y-4">
              {content.appFeatures.features.map((feature, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Indicators */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5">
            <h2 className="text-xl font-semibold mb-4">{content.keyIndicators.title}</h2>
            <div className="space-y-4">
              {content.keyIndicators.indicators.map((indicator, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4">
                  <h3 className="font-medium mb-1">{indicator.name}</h3>
                  <p className="text-sm text-zinc-400">{indicator.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Sentiment (Bullish vs Bearish) */}
        {content.marketSentiment && (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 mb-6">
            <h2 className="text-xl font-semibold mb-4">{content.marketSentiment.title}</h2>
            <p className="text-zinc-300 mb-4">{content.marketSentiment.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.marketSentiment.sections.map((section, index) => (
                <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-400 mb-2">{section.title}</h3>
                  <p className="text-zinc-300 text-sm mb-2">{section.content}</p>
                  {section.strategy && (
                    <p className="text-green-400 text-sm mt-2 italic">{section.strategy}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSI Trading */}
        {content.rsiTrading && (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 mb-6">
            <h2 className="text-xl font-semibold mb-4">{content.rsiTrading.title}</h2>
            <p className="text-zinc-300 mb-4">{content.rsiTrading.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.rsiTrading.sections.map((section, index) => (
                <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-400 mb-2">{section.title}</h3>
                  <p className="text-zinc-300 text-sm mb-2">{section.content}</p>
                  {section.strategy && (
                    <p className="text-green-400 text-sm mt-2 italic">{section.strategy}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Terminology */}
        {content.priceTerminology && (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 mb-6">
            <h2 className="text-xl font-semibold mb-4">{content.priceTerminology.title}</h2>
            <p className="text-zinc-300 mb-4">{content.priceTerminology.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.priceTerminology.sections.map((section, index) => (
                <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-400 mb-2">{section.title}</h3>
                  <p className="text-zinc-300 text-sm">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Combined Signal Calculation */}
        {content.signalCalculation && (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 mb-6">
            <h2 className="text-xl font-semibold mb-4">{content.signalCalculation.title}</h2>
            <p className="text-zinc-300 mb-4">{content.signalCalculation.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.signalCalculation.sections.map((section, index) => (
                <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-400 mb-2">{section.title}</h3>
                  <p className="text-zinc-300 text-sm">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock Market Basics */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">{content.stockBasics.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.stockBasics.sections.map((section, index) => (
              <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-400 mb-2">{section.title}</h3>
                <p className="text-zinc-300 text-sm">{section.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Investing Basics */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">{content.investingBasics.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.investingBasics.sections.map((section, index) => (
              <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="font-medium text-green-400 mb-2">{section.title}</h3>
                <p className="text-zinc-300 text-sm">{section.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-sm text-zinc-400 italic mb-8">
          {content.disclaimer}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-2">Ready to start?</h2>
          <p className="text-zinc-300 mb-4">Now that you understand the basics, try exploring the app and track your first stock!</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded-md"
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}