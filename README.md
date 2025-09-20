
A1 Kabadiwala - Enhanced static website (green+orange, admin editable)
Files:
- index.html, admin.html, services.html, initiatives.html, franchise.html, about.html, contact.html, rates.html, calculator.html
- styles.css, scripts.js
- assets/ (placeholders): logo.svg, hero-poster.jpg, ceo1.jpg, ceo2.jpg, placeholder logos

Admin capabilities (local browser):
- Edit text content (site title, hero title/sub, about text)
- Edit founders info & upload founder photos (stored as base64 in localStorage)
- Edit city list & testimonials
- Upload partner logos
- Edit per-kg prices (saved to localStorage)
- Download submissions saved in localStorage as CSV (admin.html)

Notes:
- All changes are stored in your browser localStorage. To make them global, set up a backend (Netlify + Functions, Firebase, or server) and I can integrate.
- Replace Formspree IDs or configure Netlify Forms for server-side collection.

Preview locally:
python -m http.server 8000
open http://localhost:8000
