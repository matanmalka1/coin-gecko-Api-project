# 🪙 Crypto Tracker - Real-Time Cryptocurrency Monitor

A professional, real-time cryptocurrency tracking application built with vanilla JavaScript, jQuery, and Bootstrap 5. Features live price charts, news aggregation, advanced filtering, and comprehensive coin comparison tools.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Integration](#-api-integration)
- [Architecture](#-architecture)
- [Performance](#-performance)
- [Browser Support](#-browser-support)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Functionality
- **Real-Time Price Tracking** - Live cryptocurrency prices with automatic updates
- **Interactive Charts** - Candlestick charts powered by TradingView Lightweight Charts
- **Advanced Search** - Fast, client-side search by coin name or symbol
- **Smart Filtering** - Sort by price, market cap, volume (high/low)
- **Favorites System** - Mark and filter your favorite coins
- **Compare Mode** - Side-by-side comparison of up to 2 coins
- **Live Reports** - Track up to 5 selected coins with real-time charts

### 📰 News Integration
- **Crypto News Feed** - Latest headlines from newsdata.io
- **Dual Mode Filtering**:
  - General crypto news
  - Personalized news for favorited coins
- **Freshness Indicator** - Shows articles from last 5 hours with fallback

### 🎨 UI/UX
- **Responsive Design** - Mobile-first, works on all screen sizes
- **Skeleton Loaders** - Smooth loading states
- **Toast Notifications** - Non-intrusive alerts via Notyf
- **Bootstrap 5 Modals** - Professional dialogs for coin replacement and comparison
- **Dark/Light Indicators** - Visual feedback for selected/compared coins

---

## 🛠 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styles + Bootstrap utilities
- **JavaScript (ES6+)** - Modular architecture with ES modules
- **jQuery 3.7** - DOM manipulation and event handling

### UI Framework
- **Bootstrap 5.3** - Responsive grid and components
- **Bootstrap Icons** - Iconography
- **Font Awesome 6** - Additional icons

### Charts & Visualization
- **TradingView Lightweight Charts** - Professional candlestick charts
- **CanvasJS** - Mini charts in coin details

### APIs
- **CoinGecko API** - Cryptocurrency data (prices, market cap, details)
- **CryptoCompare API** - Historical price data for charts
- **NewsData.io API** - Crypto news headlines

### Notifications
- **Notyf** - Modern toast notifications

---

## 📁 Project Structure

```
crypto-tracker/
├── index.html                 # Main HTML file
├── styles.css                 # Custom styles
├── images/                    # Project images
│
├── config/
│   ├── app-config.js         # Configuration constants (102 lines)
│   └── error.js              # Error messages & resolver (77 lines)
│
├── services/
│   ├── api.js                # Core fetch layer with retry (29 lines)
│   ├── coins-service.js      # Coin data operations (126 lines)
│   ├── chart-service.js      # Live chart data service (116 lines)
│   ├── news-service.js       # News fetching & filtering (60 lines)
│   ├── reports-service.js    # Reports selection logic (51 lines)
│   └── storage-manager.js    # Cache & localStorage (124 lines)
│
├── ui/
│   ├── base-ui.js            # Core UI utilities (72 lines)
│   ├── coin-ui.js            # Coin display logic (140 lines)
│   ├── news-ui.js            # News display logic (24 lines)
│   ├── error-ui.js           # Error display (43 lines)
│   ├── chart-renderer.js     # Chart rendering (127 lines)
│   │
│   └── Components/
│       ├── base-components.js    # Reusable components (45 lines)
│       ├── coin-components.js    # Coin card templates (104 lines)
│       └── page-components.js    # Page templates (102 lines)
│
├── controllers/
│   └── pages-controller.js   # Page navigation & initialization (173 lines)
│
├── events/
│   ├── coin-events.js        # Coin interaction handlers (120 lines)
│   └── reports-events.js     # Reports & compare handlers (134 lines)
│
└── utils/
    └── general-utils.js      # Helper functions (39 lines)
```
### Navigation

The app has 4 main pages:

1. **Currencies** (`#currencies`) - Browse and search all coins
2. **Live Reports** (`#reports`) - Real-time charts for selected coins
3. **News** (`#news`) - Crypto news headlines
4. **About** (`#about`) - Project information

### Key Features Guide

#### 🔍 Search Coins
```
1. Type in search box (min 2 characters)
2. Results filter in real-time
3. Click "Clear" to reset
```

#### ⭐ Favorites
```
1. Click star icon on any coin
2. Click "Favorites ⭐" button to view favorites only
3. Switch back with "All Coins" button
```

#### 📊 Live Reports
```
1. Toggle switches on up to 5 coins
2. Navigate to "Live Reports" page
3. Charts update every 2 seconds automatically
```

#### ⚖️ Compare Coins
```
1. Click "Compare" on first coin (highlight appears)
2. Click "Compare" on second coin
3. Modal opens with side-by-side comparison
4. Close modal to reset selection
```

#### ℹ️ Coin Details
```
1. Click "More Info" on any coin card
2. Panel expands with:
   - Prices in USD/EUR/ILS
   - All-time high
   - 7-day mini chart
   - Description
   - Contract address
```

#### 🔄 Refresh Data
```
1. Click refresh icon (🔄) in top bar
2. Forces fresh data from API
3. Bypasses 5-minute cache
```

---

## 🔌 API Integration

### CoinGecko API
- **Endpoint:** `https://api.coingecko.com/api/v3`
- **Used For:** Coin list, prices, market data, details
- **Rate Limit:** 10-30 calls/minute (free tier)
- **Cache Strategy:** 5 minutes for market data

### CryptoCompare API
- **Endpoint:** `https://min-api.cryptocompare.com/data`
- **Used For:** Historical hourly data for candlestick charts
- **Rate Limit:** 100,000 calls/month (free tier)
- **Cache Strategy:** Live data, no caching

### NewsData.io API
- **Endpoint:** `https://newsdata.io/api/1/crypto`
- **Used For:** Crypto news headlines
- **Rate Limit:** 200 calls/day (free tier)
- **Cache Strategy:** 15 minutes, filters to 5-hour freshness

### State Management

- **In-Memory Cache:** Map-based LRU cache for API responses
- **localStorage:** Persistent favorites and selected reports
- **Session State:** Compare selection, filter mode

### Optimizations Implemented

1. **LRU Cache (100 entries)**
   - Reduces API calls by 80%+
   - 5-minute TTL for market data
   - 15-minute TTL for news

3. **Debounced Updates**
   - Live reports: 2-second intervals
   - Search: Real-time but optimized

5. **API Retry Logic**
   - Automatic retry on rate limit (429)
   - 60-second backoff

### Required Features
- ES6 Modules
- Fetch API
- LocalStorage
- CSS Grid & Flexbox

This project was built as part of the **John Bryce Full Stack Development Course**.

**Author:** Matan Yehuda Malka  
**LinkedIn:** [linkedin.com/in/matanyehudamalka](https://www.linkedin.com/in/matanyehudamalka)

---

## 🙏 Acknowledgments

- [CoinGecko](https://www.coingecko.com) - Cryptocurrency data
- [CryptoCompare](https://www.cryptocompare.com) - Historical price data
- [NewsData.io](https://newsdata.io) - News API
- [TradingView](https://www.tradingview.com) - Lightweight Charts library
- [Bootstrap Team](https://getbootstrap.com) - UI framework
- [Notyf](https://github.com/caroso1222/notyf) - Toast notifications

---
## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact via LinkedIn

---

**Built with ❤️ using JavaScript, jQuery, and Bootstrap 5**
