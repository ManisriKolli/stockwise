# StockWise

StockWise is a Next.js application that provides stock market tracking, analysis, and predictions with features like watchlists, sentiment analysis, and technical indicators.

## [Live Demo](https://stockwise-teal.vercel.app) | [GitHub Repository](https://github.com/ManisriKolli/stockwise)

![StockWise Dashboard](public/screenshot.png)

## Features

- **Real-time Stock Data**: Track stock prices, changes, and technical indicators
- **Watchlist Management**: Save and monitor your favorite stocks
- **Sentiment Analysis**: News sentiment tracking for stocks
- **Insider Trading Tracker**: Monitor insider trading activity
- **Multi-language Support**: Available in English, Spanish, Chinese, and Hindi
- **Technical Analysis**: RSI, Moving Averages, and combined signals
- **User Authentication**: Secure login and registration with Clerk

## Project Structure

```
.
├── frontend/            # Frontend Next.js application
│   ├── public/          # Static assets and content files
│   │   ├── content/     # Multilanguage content JSON files
│   └── src/
│       ├── app/         # Next.js app directory
│       │   ├── api/     # API routes
│       │   ├── lib/     # MongoDB connection
│       │   ├── models/  # Data models
│       │   └── ...      # Page components
│       ├── components/  # Reusable UI components
│       ├── hooks/       # Custom React hooks
│       └── lib/         # Utility functions and services
└── machine/             # Backend machine learning code
```

## Components and Services

### API Routes

- `api/db-test/route.ts`: Tests MongoDB connection
- `api/sentiment/route.ts`: Sentiment analysis service for news headlines
- `api/watchlist/route.ts`: CRUD operations for user watchlists
- `api/watchlist/[symbol]/route.ts`: Symbol-specific watchlist operations

### Pages

- `page.tsx` (home): Main dashboard with stock tracking and analysis
- `insider/page.tsx`: Insider trading data tracking
- `learning/page.tsx`: Educational content about stock market trading
- `watchlist/page.tsx`: User's saved stock watchlist
- `db-test/page.tsx`: Database connection test page
- `sign-in/page.tsx` & `sign-up/page.tsx`: Authentication pages

### Components

- `Sidebar.tsx`: Main navigation sidebar
- `AuthModal.tsx`: Authentication modal for login/signup

### Services & Hooks

- `alphaVantageService.ts`: Stock data service (renamed to polygonService)
- `finnhubService.ts`: Real-time stock price updates
- `apiService.ts`: Centralized API client for backend requests
- `useWatchlist.ts`: Watchlist management hook
- `useAlerts.ts`: Stock alerts management hook

### Data Models

- `Watchlist.ts`: MongoDB model for user watchlists

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: MongoDB
- **API Integration**: 
  - Polygon.io for stock data
  - Finnhub for real-time updates
  - HuggingFace for sentiment analysis
- **State Management**: React Hooks
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- API keys for:
  - Clerk (authentication)
  - HuggingFace (sentiment analysis)
  - Polygon.io and/or Finnhub (stock data)

### Environment Setup

Create a `.env.local` file in the frontend directory with the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=your_mongodb_database_name
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ManisriKolli/stockwise.git
   cd stockwise
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Home Dashboard**: Search for stocks and view detailed analysis
2. **Watchlist**: Save and track your favorite stocks
3. **Insider Trading**: Monitor insider trading activity
4. **Learning**: Access educational content about stock market trading

## Authentication

The application uses Clerk for authentication. Users can:
- Create an account
- Sign in with email/password or social providers
- Access personalized features like watchlists

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Clerk](https://clerk.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Finnhub](https://finnhub.io/)
- [Polygon.io](https://polygon.io/)
