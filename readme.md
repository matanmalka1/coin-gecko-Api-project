# Crypto Tracker – Live Cryptocurrency Dashboard

Crypto Tracker is a client-side web application that lets you explore cryptocurrencies in real time:
- Browse and search coins
- Track selected coins on a live multi-asset chart
- Mark favorites and build a personal “reports” list
- Read crypto news (general + based on your favorites)
- See global market stats in a compact stats bar

The app is built with **vanilla ES modules**, **jQuery**, **Bootstrap 5**, **CanvasJS**, and **Lightweight Charts**, and consumes public crypto APIs (CoinGecko, CryptoCompare, NewsData.io).

---

## Features

### 🪙 Currencies Page
- Paginated list of coins (from CoinGecko)
- Search by **symbol** or **name** with validation
- Sorting (e.g. by price / market cap / name – depending on your config)
- Toggle coins into a **Reports** list (compare/watchlist)
- Mark coins as **favorites** (stored in `localStorage`)
- “Show favorites” mode to filter the list

### 📈 Reports Page (Live Chart)
- Select up to a configurable max number of coins (`REPORTS_MAX`)
- Live price updates using **CryptoCompare** (`pricemulti`)
- Historical candles using **CryptoCompare** (`histohour`)
- Centralized interval update (`REPORTS_UPDATE_MS`)
- Lightweight Charts–based **multi-symbol chart**:
  - Each symbol rendered as a series
  - New candles appended in real time
  - Internal in-memory cache `liveCandlesBySymbol`

### 📰 News Page
- General crypto news feed (using NewsData.io)
- “Favorites news” mode:
  - Builds a query from user’s favorite symbols
  - Caches per query for a configurable time window
- News cards with source, time, and snippet
- Basic staleness filtering (e.g. “last X hours”) via `filterLastHours`

### ⭐ Favorites & Reports
- Favorites:
  - Stored in `localStorage` under a configurable key
  - Used for:
    - Filtering the main coins list
    - Building a favorites-based news query
- Reports (Compare List):
  - Also stored in `localStorage`
  - Enforced max size (`REPORTS_MAX`)
  - When the limit is hit:
    - User gets a **replace flow** (open modal, choose what to swap)
    - UI is synced via `updateToggleStates`

### 🌐 Global Stats Bar
- Uses CoinGecko `/global` endpoint (`getGlobalStats`)
- Shows:
  - Total market cap
  - 24h volume
  - BTC dominance (etc., depending on API response)
- Rendered through `BaseUI.renderStatsBar` in the header area

### 🌓 UI / UX Goodies
- **Dark mode** widget (via `darkmode-js`)
- Toast notifications (Notyf, wired via error UI / error codes)
- Skeleton loaders and spinners while data loads
- Responsive Bootstrap layout:
  - Search area & buttons adapt to small screens
  - Cards grid responds nicely to different viewports
- Mini **per-coin chart** inside the “More Info” collapse (CanvasJS)

---

## Tech Stack

**Frontend**

- HTML5, CSS3
- JavaScript (ES modules)
- jQuery 3.x
- Bootstrap 5.3
- Font Awesome & Bootstrap Icons
- CanvasJS (per-coin mini charts)
- TradingView Lightweight Charts (live multi-coin chart)
- Darkmode-JS
- Notyf (toast notifications)

**APIs**

- [CoinGecko API](https://www.coingecko.com/en/api/documentation)
- [CryptoCompare API](https://min-api.cryptocompare.com/)
- [NewsData.io Crypto News](https://newsdata.io/)

---

## Project Structure

> Note: In the actual project these are usually under `src/` folders; here is the logical structure.

```text
.
├─ index.html                 # Main HTML shell
├─ style.css                  # Custom styles
├─ app.js                     # App bootstrap & navigation wiring
├─ config/
│  └─ app-config.js           # APP_CONFIG & CONFIG_CHART (API URLs, keys, limits, UI text)
├─ services/
│  ├─ api.js                  # fetchWithRetry + unified HTTP/NETWORK error handling
│  ├─ coins-service.js        # Coins list, search, sort, global stats, market chart
│  ├─ chart-service.js        # Live reports chart (state + polling + normalization)
│  ├─ reports-service.js      # Reports (compare list) logic, toggle/replace, fetch compare data
│  ├─ news-service.js         # General & favorites-based news, caching & freshness
│  └─ storage-manager.js      # StorageHelper + CacheManager (LRU in-memory + localStorage)
├─ ui/
│  ├─ base-ui.js              # Generic UI helpers (showPage, spinners, stats bar, etc.)
│  ├─ error-ui.js             # Alert rendering + error resolver wiring
│  ├─ chart-renderer.js       # CanvasJS mini charts + Lightweight Charts live chart renderer
│  ├─ news-ui.js              # Rendering of news cards, skeletons, empty states
│  ├─ coin-ui.js              # Coins grid, compare/favorite states, modals, mini charts
│  ├─ Components/
│  │  ├─ base-components.js   # Shared HTML snippets (cards, skeletons, badge, etc.)
│  │  ├─ coin-components.js   # Coin card, details, mini chart container, modals
│  │  └─ page-components.js   # Page templates (currencies, reports, news, about)
├─ controllers/
│  └─ pages-controller.js     # Orchestration for pages (currencies/reports/news/about)
└─ events/
   ├─ coin-events.js          # Search, sort, favorites, expand details handlers
   └─ reports-events.js       # Filter reports, compare modal, replace selection handlers