# ⚙️ Crypto Tracker – Function & Event Reference

---

**Project:** Crypto Tracker  
**Author:** Matan Yehuda Malka

---

## 🧩 Core Functions

| Function                          | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| **loadCurrencies()**              | Loads and renders the main coin list              |
| **displayCoins(coins)**           | Generates coin cards dynamically                  |
| **showCoinInfo(container, data)** | Displays full coin details (prices & description) |
| **updateLiveData(symbols)**       | Updates chart with new live data                  |
| **cleanupUI()**                   | Clears intervals and resets DOM                   |
| **openReplaceModal(symbol)**      | Displays modal when user exceeds 5 selected coins |

---

### 🪙 `loadCurrencies()`

```javascript
const loadCurrencies = async () => {
  clearContent();
  content.html(`<div class="spinner-border text-primary"></div>`);

  try {
    if (allCoins.length === 0) allCoins = await CoinAPI.getMarkets();
    displayCoins(allCoins);
  } catch (error) {
    showError($("#coinsContainer"), error);
  }
};
```

Notes:
• Uses caching to prevent redundant API calls
• Displays loading spinner while fetching data

---

displayCoins(coins)
const displayCoins = (coins) => {
const cardsHTML = coins.map(createCoinCard).join("");
$("#coinsContainer").html(cardsHTML);
};
Time Complexity: O(n)

showCoinInfo(container, data)

Displays detailed coin info.

---

startLiveReports()

Initializes a CanvasJS live chart.
const startLiveReports = () => {
const symbols = selectedReports.join(",");
chart = new CanvasJS.Chart("chartContainer", {...});
updateInterval = setInterval(() => updateLiveData(symbols), 2000);
};

Best Practice:
Always call cleanupUI() before starting a new chart.

Event Handlers
Event - Selector - Function
click - #currenciesBtn - Load currency list
click - #reportsBtn - Show live chart
click - #aboutBtn - Load about section
click - .more-info - Toggle coin details
change - .coin-toggle - Select/deselect coin
click - #searchBtn - Search coins
keypress - #searchInput - Search on Enter

Utility Functions
Name Description
clearContent() - Empties the content container
showError(container, error) - Displays contextual error message
renderPrice(label, symbol, value) - Reusable price template for showCoinInfo
