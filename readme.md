# Crypto Tracker - Live Cryptocurrency Dashboard

![Crypto Tracker Screenshot](images/3.png) <!-- Replace with actual screenshot if available -->

This is a real-time cryptocurrency tracking application built as part of the **John Bryce Full Stack Development Course**. It provides live market data, charts, news, and more for cryptocurrencies using public APIs. The app is fully client-side and runs in the browser.

## Features

- **Currencies Page**: View top cryptocurrencies with real-time prices, market cap, volume, and 24h changes. Supports searching, sorting, favoriting, and selecting coins for reports.
- **Live Reports**: Interactive candlestick charts for selected coins, updated every few seconds. Supports up to 5 coins with carousel navigation.
- **News Page**: Curated cryptocurrency news from the last 5 hours. Filter by general news or favorites-specific news.
- **Favorites System**: Star coins to track them easily and get tailored news.
- **Compare Coins**: Select up to 2 coins for quick side-by-side comparison in a modal.
- **Global Stats Bar**: Displays overall market cap, 24h volume, BTC dominance, and market change.
- **Dark Mode**: Toggle between light and dark themes with a widget.
- **About Page**: Information about the project and developer.
- **Responsive Design**: Works on desktop and mobile using Bootstrap.
- **Error Handling & Notifications**: User-friendly messages for errors, limits, and actions using Notyf.
- **Caching**: Local storage and in-memory caching for faster loads and reduced API calls.

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Libraries & Frameworks**:
  - jQuery for DOM manipulation and events
  - Bootstrap 5 for responsive UI
  - CanvasJS for mini charts
  - TradingView Lightweight Charts for live candlestick charts
  - Embla Carousel for chart sliding
  - Darkmode.js for theme toggling
  - Notyf for toast notifications
- **APIs**:
  - CoinGecko API: For coin data, market charts, and global stats
  - CryptoCompare API: For live price updates and historical data
  - NewsData.io API: For cryptocurrency news
- **Other**:
  - LocalStorage for persisting favorites and selections
  - In-memory caching with TTL for API responses
  - Parallax header background for visual appeal

## Installation

1. **Clone the Repository**:
   git clone https://github.com/your-username/crypto-tracker.git
   text(Replace with your actual repo URL if hosted on GitHub.)

2. **Navigate to the Project Directory**:
   cd crypto-tracker
 **Open in Browser**:

- Simply open `index.html` in any modern web browser (e.g., Chrome, Firefox).
- No server or dependencies installation required, as it's a static app.

**Note**: Some APIs may have rate limits. If you encounter issues, wait a minute and refresh.

## Usage

- **Navigation**: Use the top navbar to switch between Currencies, Live Reports, News, and About.
- **Currencies**:
- Search by symbol or name (e.g., "BTC" or "Bitcoin").
- Toggle favorites with the star icon.
- Select coins for reports using checkboxes (max 5).
- Click "More Info" for detailed coin data.
- Sort by market cap, price, or volume.
- **Live Reports**:
- Automatically loads charts for selected coins.
- Use prev/next buttons to navigate the carousel.
- **News**:
- Switch between "General" and "Favorites" filters.
- Click articles to open full stories in a new tab.
- **Compare**:
- In Currencies page, click "Compare" on coins (select up to 2).
- A modal will show a comparison table.
- **Dark Mode**: Click the sun/moon icon in the bottom-right corner to toggle.

If no coins are loaded initially, click the refresh button.

## API Keys

- The app uses hardcoded API keys for demonstration (from free tiers).
- In production, replace them in `app-config.js` with your own:
- `CRYPTOCOMPARE_KEY`
- `NEWS_KEY`
- Sign up for free at:
- [CoinGecko](https://www.coingecko.com/en/api) (no key needed for basic usage)
- [CryptoCompare](https://min-api.cryptocompare.com/)
- [NewsData.io](https://newsdata.io/)

## Limitations

- API rate limits: May hit limits on heavy usage (e.g., CryptoCompare allows ~15k calls/month free).
- No backend: All data is fetched client-side.
- Max 100 coins loaded by default (top by market cap).
- News limited to English and last 5 hours for freshness.

## Contributing

Feel free to fork and submit pull requests! Improvements to charts, error handling, or adding more features are welcome.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Author

- **Matan Yehuda Malka**
- LinkedIn: [matanyehudamalka](https://www.linkedin.com/in/matanyehudamalka)
- Built with ❤️ as a course project.

For questions or feedback, open an issue or reach out on LinkedIn!
