"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

// Language options - limited to 4 as requested
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिन्दी" }
];

// Content for different languages
const content = {
  en: {
    title: "Stock Market 101",
    intro: "Welcome to StockWise! This guide covers stock market basics and how to use our app for smart investments.",
    appFeatures: {
      title: "StockWise Features",
      features: [
        {
          title: "Search Stocks",
          description: "Enter a stock symbol (e.g., AAPL for Apple) in the search bar to view stock details and charts."
        },
        {
          title: "Watchlist",
          description: "Add stocks to your watchlist to monitor their performance. You'll need to create an account to use this feature."
        },
        {
          title: "Technical Analysis",
          description: "We provide basic indicators like RSI and Moving Averages to help you make informed decisions."
        },
        {
          title: "Insider Trading",
          description: "View recent insider trades to spot potential market movements."
        },
        {
          title: "News Sentiment",
          description: "We analyze news headlines to estimate market sentiment for stocks you're interested in."
        }
      ]
    },
    stockBasics: {
      title: "Stock Market Basics",
      sections: [
        {
          title: "What is a Stock?",
          content: "A stock represents ownership in a company. When you buy a stock, you're buying a small piece of that company."
        },
        {
          title: "Stock Exchanges",
          content: "Stocks are bought and sold on exchanges like the NYSE or NASDAQ. These are marketplaces where buyers and sellers meet."
        },
        {
          title: "Stock Symbols",
          content: "Companies are identified by ticker symbols on exchanges. For example, AAPL for Apple, MSFT for Microsoft."
        },
        {
          title: "Price Movements",
          content: "Stock prices move based on supply and demand, influenced by company performance, economic conditions, and market sentiment."
        }
      ]
    },
    investingBasics: {
      title: "Investing Basics",
      sections: [
        {
          title: "Buy Low, Sell High",
          content: "The fundamental goal of investing is to buy assets at a low price and sell them at a higher price."
        },
        {
          title: "Diversification",
          content: "Don't put all your eggs in one basket. Spread investments across different stocks to reduce risk."
        },
        {
          title: "Long-term vs Short-term",
          content: "Long-term investing typically carries less risk than short-term trading. Most successful investors focus on the long term."
        },
        {
          title: "Research is Key",
          content: "Before investing, research companies thoroughly. Look at their financial health, growth prospects, and industry trends."
        }
      ]
    },
    keyIndicators: {
      title: "Key Indicators Explained",
      indicators: [
        {
          name: "RSI (Relative Strength Index)",
          description: "Measures momentum, ranging from 0 to 100. Above 70 is considered overbought, below 30 oversold."
        },
        {
          name: "Moving Averages",
          description: "Shows the average price over a specific time period, smoothing out price fluctuations to identify trends."
        },
        {
          name: "Volume",
          description: "The number of shares traded in a given period. High volume often indicates significant price movements."
        },
        {
          name: "Market Cap",
          description: "Total value of a company's outstanding shares, calculated by multiplying stock price by number of shares."
        }
      ]
    },
    disclaimer: "Disclaimer: Stock market investments involve risk. Past performance is not indicative of future results. This educational content should not be considered financial advice."
  },
  es: {
    title: "Mercado Bursátil 101",
    intro: "¡Bienvenido a StockWise! Esta guía cubre los conceptos básicos del mercado bursátil y cómo usar nuestra aplicación para inversiones inteligentes.",
    appFeatures: {
      title: "Características de StockWise",
      features: [
        {
          title: "Buscar Acciones",
          description: "Ingresa un símbolo de acción (por ejemplo, AAPL para Apple) en la barra de búsqueda para ver detalles y gráficos."
        },
        {
          title: "Lista de Seguimiento",
          description: "Agrega acciones a tu lista para monitorear su rendimiento. Necesitarás crear una cuenta para usar esta función."
        },
        {
          title: "Análisis Técnico",
          description: "Proporcionamos indicadores básicos como RSI y Medias Móviles para ayudarte a tomar decisiones informadas."
        },
        {
          title: "Operaciones de Insiders",
          description: "Visualiza operaciones recientes de insiders para detectar posibles movimientos del mercado."
        },
        {
          title: "Sentimiento de Noticias",
          description: "Analizamos titulares de noticias para estimar el sentimiento del mercado para las acciones que te interesan."
        }
      ]
    },
    stockBasics: {
      title: "Conceptos Básicos del Mercado Bursátil",
      sections: [
        {
          title: "¿Qué es una Acción?",
          content: "Una acción representa propiedad en una empresa. Cuando compras una acción, estás comprando una pequeña parte de esa empresa."
        },
        {
          title: "Bolsas de Valores",
          content: "Las acciones se compran y venden en bolsas como NYSE o NASDAQ. Son mercados donde se encuentran compradores y vendedores."
        },
        {
          title: "Símbolos Bursátiles",
          content: "Las empresas se identifican por símbolos en las bolsas. Por ejemplo, AAPL para Apple, MSFT para Microsoft."
        },
        {
          title: "Movimientos de Precios",
          content: "Los precios de las acciones se mueven según la oferta y demanda, influenciados por el desempeño de la empresa, condiciones económicas y sentimiento del mercado."
        }
      ]
    },
    investingBasics: {
      title: "Conceptos Básicos de Inversión",
      sections: [
        {
          title: "Compra Bajo, Vende Alto",
          content: "El objetivo fundamental de la inversión es comprar activos a un precio bajo y venderlos a un precio más alto."
        },
        {
          title: "Diversificación",
          content: "No pongas todos los huevos en una canasta. Distribuye las inversiones entre diferentes acciones para reducir el riesgo."
        },
        {
          title: "Largo Plazo vs Corto Plazo",
          content: "La inversión a largo plazo generalmente conlleva menos riesgo que el trading a corto plazo. La mayoría de los inversores exitosos se centran en el largo plazo."
        },
        {
          title: "La Investigación es Clave",
          content: "Antes de invertir, investiga las empresas a fondo. Observa su salud financiera, perspectivas de crecimiento y tendencias de la industria."
        }
      ]
    },
    keyIndicators: {
      title: "Indicadores Clave Explicados",
      indicators: [
        {
          name: "RSI (Índice de Fuerza Relativa)",
          description: "Mide el impulso, en un rango de 0 a 100. Por encima de 70 se considera sobrecomprado, por debajo de 30 sobrevendido."
        },
        {
          name: "Medias Móviles",
          description: "Muestra el precio promedio durante un período específico, suavizando las fluctuaciones para identificar tendencias."
        },
        {
          name: "Volumen",
          description: "El número de acciones negociadas en un período dado. Alto volumen a menudo indica movimientos significativos de precios."
        },
        {
          name: "Capitalización de Mercado",
          description: "Valor total de las acciones en circulación de una empresa, calculado multiplicando el precio de la acción por el número de acciones."
        }
      ]
    },
    disclaimer: "Aviso legal: Las inversiones en el mercado bursátil implican riesgo. El rendimiento pasado no es indicativo de resultados futuros. Este contenido educativo no debe considerarse asesoramiento financiero."
  },
  zh: {
    title: "股市基础知识",
    intro: "欢迎使用StockWise！本指南涵盖股票市场基础知识以及如何使用我们的应用进行智能投资。",
    appFeatures: {
      title: "StockWise功能",
      features: [
        {
          title: "搜索股票",
          description: "在搜索栏中输入股票代码（例如，AAPL代表苹果公司）以查看股票详情和图表。"
        },
        {
          title: "关注列表",
          description: "将股票添加到您的关注列表以监控其表现。您需要创建一个账户才能使用此功能。"
        },
        {
          title: "技术分析",
          description: "我们提供基本指标如相对强弱指数和移动平均线，帮助您做出明智决策。"
        },
        {
          title: "内部交易",
          description: "查看最近的内部交易，发现潜在的市场动向。"
        },
        {
          title: "新闻情绪",
          description: "我们分析新闻标题，估计您感兴趣的股票的市场情绪。"
        }
      ]
    },
    stockBasics: {
      title: "股市基础",
      sections: [
        {
          title: "什么是股票？",
          content: "股票代表公司的所有权。当您购买股票时，您是在购买该公司的一小部分。"
        },
        {
          title: "证券交易所",
          content: "股票在纽约证券交易所或纳斯达克等交易所买卖。这些是买家和卖家会面的市场。"
        },
        {
          title: "股票代码",
          content: "公司在交易所由股票代码标识。例如，AAPL代表苹果，MSFT代表微软。"
        },
        {
          title: "价格波动",
          content: "股票价格基于供求关系波动，受公司绩效、经济状况和市场情绪影响。"
        }
      ]
    },
    investingBasics: {
      title: "投资基础",
      sections: [
        {
          title: "低买高卖",
          content: "投资的基本目标是以低价购买资产并以更高的价格出售。"
        },
        {
          title: "多元化",
          content: "不要把所有鸡蛋放在一个篮子里。在不同的股票中分散投资以减少风险。"
        },
        {
          title: "长期与短期",
          content: "长期投资通常比短期交易风险更低。大多数成功的投资者专注于长期。"
        },
        {
          title: "研究是关键",
          content: "投资前，彻底研究公司。查看其财务健康状况、增长前景和行业趋势。"
        }
      ]
    },
    keyIndicators: {
      title: "关键指标解释",
      indicators: [
        {
          name: "RSI（相对强弱指数）",
          description: "测量动量，范围从0到100。超过70被认为是超买，低于30是超卖。"
        },
        {
          name: "移动平均线",
          description: "显示特定时间段内的平均价格，平滑价格波动以识别趋势。"
        },
        {
          name: "成交量",
          description: "在给定时期内交易的股票数量。高成交量通常表示显著的价格变动。"
        },
        {
          name: "市值",
          description: "公司流通股的总价值，通过将股价乘以股票数量计算。"
        }
      ]
    },
    disclaimer: "免责声明：股票市场投资涉及风险。过去的表现并不代表未来的结果。此教育内容不应被视为财务建议。"
  },
  hi: {
    title: "शेयर बाजार 101",
    intro: "StockWise में आपका स्वागत है! यह गाइड शेयर बाजार की मूल बातें और स्मार्ट निवेश के लिए हमारे ऐप का उपयोग कैसे करें, इसे कवर करता है।",
    appFeatures: {
      title: "StockWise विशेषताएँ",
      features: [
        {
          title: "शेयर खोजें",
          description: "शेयर विवरण और चार्ट देखने के लिए खोज बार में शेयर प्रतीक (जैसे, Apple के लिए AAPL) दर्ज करें।"
        },
        {
          title: "वॉचलिस्ट",
          description: "अपनी वॉचलिस्ट में शेयर जोड़ें ताकि उनके प्रदर्शन पर नज़र रखें। इस सुविधा का उपयोग करने के लिए आपको एक खाता बनाना होगा।"
        },
        {
          title: "तकनीकी विश्लेषण",
          description: "हम आपको सूचित निर्णय लेने में मदद करने के लिए RSI और मूविंग एवरेज जैसे बुनियादी संकेतक प्रदान करते हैं।"
        },
        {
          title: "इनसाइडर ट्रेडिंग",
          description: "संभावित बाजार गतिविधियों को स्पॉट करने के लिए हाल के इनसाइडर ट्रेडों को देखें।"
        },
        {
          title: "समाचार भावना",
          description: "हम आपकी रुचि वाले शेयरों के लिए बाजार भावना का अनुमान लगाने के लिए समाचार शीर्षकों का विश्लेषण करते हैं।"
        }
      ]
    },
    stockBasics: {
      title: "शेयर बाजार की मूल बातें",
      sections: [
        {
          title: "शेयर क्या है?",
          content: "शेयर किसी कंपनी में स्वामित्व का प्रतिनिधित्व करता है। जब आप शेयर खरीदते हैं, तो आप उस कंपनी का एक छोटा हिस्सा खरीद रहे हैं।"
        },
        {
          title: "शेयर एक्सचेंज",
          content: "शेयर NYSE या NASDAQ जैसे एक्सचेंजों पर खरीदे और बेचे जाते हैं। ये बाजार हैं जहां खरीदार और विक्रेता मिलते हैं।"
        },
        {
          title: "शेयर प्रतीक",
          content: "कंपनियों को एक्सचेंजों पर टिकर प्रतीकों द्वारा पहचाना जाता है। उदाहरण के लिए, Apple के लिए AAPL, Microsoft के लिए MSFT।"
        },
        {
          title: "मूल्य आंदोलन",
          content: "शेयर की कीमतें आपूर्ति और मांग के आधार पर चलती हैं, जो कंपनी के प्रदर्शन, आर्थिक स्थितियों और बाजार भावना से प्रभावित होती हैं।"
        }
      ]
    },
    investingBasics: {
      title: "निवेश की मूल बातें",
      sections: [
        {
          title: "कम खरीदें, अधिक बेचें",
          content: "निवेश का मौलिक लक्ष्य संपत्ति को कम कीमत पर खरीदना और उच्च कीमत पर बेचना है।"
        },
        {
          title: "विविधीकरण",
          content: "सभी अंडे एक टोकरी में न रखें। जोखिम कम करने के लिए विभिन्न शेयरों में निवेश फैलाएं।"
        },
        {
          title: "लंबी अवधि बनाम अल्पकालिक",
          content: "दीर्घकालिक निवेश आमतौर पर अल्पकालिक ट्रेडिंग की तुलना में कम जोखिम वाला होता है। अधिकांश सफल निवेशक लंबी अवधि पर ध्यान केंद्रित करते हैं।"
        },
        {
          title: "शोध महत्वपूर्ण है",
          content: "निवेश करने से पहले, कंपनियों का अच्छी तरह से शोध करें। उनके वित्तीय स्वास्थ्य, विकास संभावनाओं और उद्योग रुझानों को देखें।"
        }
      ]
    },
    keyIndicators: {
      title: "प्रमुख संकेतक समझाए गए",
      indicators: [
        {
          name: "RSI (रिलेटिव स्ट्रेंथ इंडेक्स)",
          description: "गति को मापता है, 0 से 100 तक का रेंज। 70 से ऊपर को ओवरबॉट, 30 से नीचे को ओवरसोल्ड माना जाता है।"
        },
        {
          name: "मूविंग एवरेज",
          description: "एक विशिष्ट समय अवधि के दौरान औसत मूल्य दिखाता है, रुझानों की पहचान के लिए मूल्य उतार-चढ़ाव को सुचारू करता है।"
        },
        {
          name: "वॉल्यूम",
          description: "दिए गए समय में कारोबार किए गए शेयरों की संख्या। उच्च वॉल्यूम अक्सर महत्वपूर्ण मूल्य आंदोलनों को दर्शाता है।"
        },
        {
          name: "मार्केट कैप",
          description: "किसी कंपनी के बकाया शेयरों का कुल मूल्य, शेयर की कीमत को शेयरों की संख्या से गुणा करके गणना की जाती है।"
        }
      ]
    },
    disclaimer: "अस्वीकरण: शेयर बाजार निवेश में जोखिम शामिल है। पिछला प्रदर्शन भविष्य के परिणामों का संकेतक नहीं है। इस शैक्षिक सामग्री को वित्तीय सलाह नहीं माना जाना चाहिए।"
  }
};

export default function LearningPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const router = useRouter();
  const currentContent = content[selectedLanguage];

  // Language switcher handler
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        {/* Language selector */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{currentContent.title}</h1>
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
          <p className="text-zinc-300">{currentContent.intro}</p>
        </div>

        {/* App Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5">
            <h2 className="text-xl font-semibold mb-4">{currentContent.appFeatures.title}</h2>
            <div className="space-y-4">
              {currentContent.appFeatures.features.map((feature, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Indicators */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5">
            <h2 className="text-xl font-semibold mb-4">{currentContent.keyIndicators.title}</h2>
            <div className="space-y-4">
              {currentContent.keyIndicators.indicators.map((indicator, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4">
                  <h3 className="font-medium mb-1">{indicator.name}</h3>
                  <p className="text-sm text-zinc-400">{indicator.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Market Basics */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">{currentContent.stockBasics.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentContent.stockBasics.sections.map((section, index) => (
              <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-400 mb-2">{section.title}</h3>
                <p className="text-zinc-300 text-sm">{section.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Investing Basics */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">{currentContent.investingBasics.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentContent.investingBasics.sections.map((section, index) => (
              <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                <h3 className="font-medium text-green-400 mb-2">{section.title}</h3>
                <p className="text-zinc-300 text-sm">{section.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-sm text-zinc-400 italic mb-8">
          {currentContent.disclaimer}
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