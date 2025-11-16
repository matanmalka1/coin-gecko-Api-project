# 🏗️ Crypto Tracker – Architecture Overview

---

**Project:** Crypto Tracker  
**Version:** 1.0.0  
**Author:** Matan Yehuda Malka  
**Last Updated:** November 2024

---

## 🧠 System Design

### Pattern: Single Page Application (SPA)

┌─────────────────────────────────────────┐
│ index.html (Shell) │
│ ┌───────────────────────────────────┐ │
│ │ Navigation Bar (Sticky) │ │
│ └───────────────────────────────────┘ │
│ ┌───────────────────────────────────┐ │
│ │ Content Container (Dynamic) │ │
│ │ - Currencies │ │
│ │ - Live Reports │ │
│ │ - About │ │
│ └───────────────────────────────────┘ │
└─────────────────────────────────────────┘

### Technology Stack

| Layer            | Technology               | Purpose                      |
| ---------------- | ------------------------ | ---------------------------- |
| **Presentation** | HTML5 + CSS3             | Layout & Styling             |
| **Logic**        | JavaScript (ES6+)        | Application logic            |
| **Framework**    | jQuery 3.7.1             | DOM manipulation & AJAX      |
| **UI**           | Bootstrap 5.3.8          | Responsive grid system       |
| **Charts**       | CanvasJS                 | Real-time data visualization |
| **APIs**         | CoinGecko, CryptoCompare | External data sources        |

---

## 🧱 File Structure

crypto-tracker/
│
├── index.html # Main HTML Shell
├── style.css # Design & Animations
├── main.js # Core Logic & UI Handling
├── api.js # API Wrapper Functions
└── documentation/
├── ARCHITECTURE.md
├── FUNCTIONS.md
└── TECHNICAL_NOTES.md

---

## ⚙️ Data Flow

User Action → Event Handler → API Call → Cache → DOM Update → Chart Update

**Lifecycle Example:**

1. User clicks “Currencies” → triggers `loadCurrencies()`
2. Data fetched via `CoinAPI.getMarkets()`
3. Rendered dynamically via `displayCoins()`
4. “More Info” button → loads cached or new data
5. “Reports” → initiates live chart (`CanvasJS`)

---

## 🔄 Core Architecture Flow

Init → Load Data → Interact → Visualize → Cleanup → Repeat

| Step | Function             | Description                    |
| ---- | -------------------- | ------------------------------ |
| 1    | `loadCurrencies()`   | Fetch & render top 100 coins   |
| 2    | `showCoinInfo()`     | Display coin details           |
| 3    | `startLiveReports()` | Start live chart interval      |
| 4    | `updateLiveData()`   | Fetch and render live prices   |
| 5    | `cleanupUI()`        | Stop intervals and clear chart |

---

**➡️ Next:** [FUNCTIONS.md](FUNCTIONS.md)
