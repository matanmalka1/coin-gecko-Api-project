# 🪙 Crypto Tracker - Live Cryptocurrency Dashboard

Full Stack Web Development Project – John Bryce Course
A responsive single-page application for tracking live cryptocurrency data using CoinGecko and CryptoCompare APIs.

---

## 📋 Table of Contents

    •	Overview￼
    •	Features￼
    •	Technologies￼
    •	APIs Used￼
    •	Installation￼
    •	Usage￼
    •	Project Structure￼
    •	Author￼

---

🎯 Overview

Crypto Tracker is a client-side web app that displays real-time cryptocurrency market data.
Users can browse over 100 coins, search by symbol, view detailed information, and track up to 5 coins simultaneously with live charts.

Highlights
• ⚡ Real-time data – updates every 2 seconds
• 🧠 Smart caching – reduces API calls (2-minute cache)
• 📱 Responsive design – desktop, tablet, and mobile
• 💎 Modern UI/UX – Bootstrap + animations
• 🧩 No backend required – 100% client-side

---

✨ Features

🔍 Search & Browse
• View top 100 cryptocurrencies by market cap
• Search coins by symbol (BTC, ETH, SOL)
• Quick search via Enter key

📊 Coin Details
• Live prices in USD, EUR, and ILS
• Coin image, name, and short description
• Smart cache refresh every 2 minutes

📈 Live Reports
• Real-time charts (CanvasJS) for up to 5 coins
• Updates automatically every 2 seconds
• Interactive legend and live price tracking

🎛️ Coin Selection
• Toggle switch to add/remove coins
• Limit of 5 coins with replacement modal
• Persistent visual feedback

⸻

🛠️ Technologies

Frontend:
HTML5 · CSS3 · JavaScript (ES6+) · jQuery 3.7.1 · Bootstrap 5.3.8

Libraries:
CanvasJS · Font Awesome · Bootstrap Icons

Tools:
Git · XAMPP / Live Server

## 🌐 APIs Used

### 1. **CoinGecko API** (Free, No API Key)

- **Endpoint 1:** `/coins/markets`
  - Purpose: Get list of top 100 cryptocurrencies
  - Rate Limit: 50 calls/minute
- **Endpoint 2:** `/coins/{id}`
  - Purpose: Get detailed information about a specific coin
  - Cache: 2 minutes

### 2. **CryptoCompare API** (Free, No API Key)

- **Endpoint:** `/data/pricemulti`
  - Purpose: Get real-time prices for multiple coins
  - Update Frequency: Every 2 seconds
  - Used for: Live chart data

**Documentation:**

- [CoinGecko API Docs](https://www.coingecko.com/api/documentation)
- [CryptoCompare API Docs](https://min-api.cryptocompare.com/documentation)

---

📥 Installation

1.  Clone the repository

git clone https://github.com/matanmalka1/crypto-tracker.git
cd crypto-tracker

2. **Option A: XAMPP Installation** 2. Run locally
   • Open index.html in your browser
   • (Use a local server like XAMPP or VS Code Live Server to avoid CORS issues)

🚀 Usage
• Currencies Page: Browse coins, view details, toggle favorites
• Search: Filter by coin symbol
• Reports: View real-time chart updates every 2s
• About: Learn about the project and author

Bonus:
When selecting more than 5 coins, a modal lets you choose one to replace.

📁 Project Structure

crypto-tracker/
├── index.html # Main page
├── style.css # Styles & animations
├── main.js # App logic & events
├── api.js # API communication
├── images/
│ └── 2.jpeg # Author photo
└── README.md

### File Descriptions

**index.html**

- Semantic HTML5 structure
- Bootstrap 5 integration
- External library imports
- Responsive navigation bar

**style.css**

- Custom CSS3 animations
- Parallax scrolling effect
- Toggle switch styling
- Card hover effects
- Responsive media queries

**main.js**

- Application initialization
- Event handlers
- DOM manipulation
- UI state management
- Cache management
- Chart initialization

**api.js**

- API wrapper functions
- Error handling
- Data fetching logic
- Centralized API configuration

---

## 🐛 Known Issues & Limitations

1. **Rate Limiting**

   - CoinGecko: 50 calls/minute (free tier)
   - Solution: Implemented 2-minute cache

2. **Chart Memory**

   - Keeps last 30 data points per coin
   - Automatic cleanup to prevent memory leaks

3. **Mobile Performance**
   - Chart may be slow on older devices
   - Consider reducing update frequency

---

🐛 Known Issues
• CoinGecko API limited to 50 calls/minute
• Chart stores last 30 data points per coin
• Chart performance may vary on mobile

⸻

🚧 Future Enhancements
• Add more currency conversions
• Save favorite coins (localStorage)
• Dark mode toggle
• Export chart data
• Historical data & alerts

⸻

👨‍💻 Author

Matan Yehuda Malka
🎓 John Bryce Full Stack Development Course
💼 LinkedIn￼
🌐 Portfolio (coming soon)
📜 License

Released under the MIT License — see the LICENSE￼ file for details.

⸻

Built with ❤️ using jQuery, Bootstrap, and CanvasJS
Last updated: November 2024
