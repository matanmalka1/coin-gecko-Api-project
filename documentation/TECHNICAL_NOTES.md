---
TECHNICAL_NOTES.md

markdown
Crypto Tracker – Technical Notes
---

**Project:** Crypto Tracker  
**Version:** 1.0.0  
**Author:** Matan Yehuda Malka

---

Performance Optimization

- Cache reduces API calls by ~80%
- Chart keeps only last 30 data points
- DOM updates use `.html()` batching
- Event delegation improves efficiency
- Lazy loading for coin images (`loading="lazy"`)

---

Cache System

javascript
cache[coinId] = {
data: {...},
timestamp: Date.now(),
};

ֿCache duration: 2 minutes
Benefits: Faster responses, fewer API calls
Future upgrade: Persist cache via localStorage

---

Error Handling

const showError = (container, error) => {
let message = "Failed to load data.";
if (error?.status === 429) message = "Rate limit exceeded.";
container.html(`<div class="alert alert-danger">${message}</div>`);
};

    •	Handles 404 / 429 / 500 errors
    •	Logs unknown errors to console
    •	Provides user feedback

Security Considerations

This project runs entirely on the client side (no backend).
All API requests are public and visible in browser dev tools.
In production, calls should be proxied through a secure backend.

Key Points:
• Sanitized HTML in showCoinInfo()
• Added rel="noopener noreferrer" to external links
• No API keys exposed (public endpoints only)

---

Category - What to Test
Functional - Navigation, search, toggles, charts
Error - Rate limits, empty search, offline mode
Responsive - Desktop, tablet, mobile views
API - Data integrity, rate limit handling

---

Future Improvements
• Dark mode toggle
• LocalStorage favorites
• Multi-currency conversion
• Export chart data
• Notification system

---

Maintainer

Matan Yehuda Malka
LinkedIn￼
