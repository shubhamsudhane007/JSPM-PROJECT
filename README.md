# DukaanSaathi (दुकान साथी) - Smart Shopkeeper Copilot

> A modern, colorful, mobile-friendly Progressive Web App (PWA) built for small local retail shop owners in India (kirana stores, tea stalls, tailors, provision stores).

![DukaanSaathi Banner](public/pwa-512x512.png)

---

## 🌟 Key Features

### 1. ☀️ Morning Energy Welcome Screen
- Personal greeting: *"Welcome Shubham! 👋"* and *"Let's grow today with extra energy ⚡"*.
- Live clock and auto-generated calendar date.
- Daily rotating motivational quotes for Indian business owners.
- Smooth transition to the dashboard.

### 2. 📊 Home Dashboard
- **4 Gradient Metric Cards**: Today's Income, Today's Expense, Net Profit, and Total Pending Udhaar.
- **Daily Store Summary**: Best-selling items, low-stock alerts, and pending customer dues.
- **Weekly Profit Chart**: Visual 7-day profit bar graph.
- **Quick Action Bar**: 1-tap shortcuts to add income, expenses, credit, create ads, and voice entry.

### 3. 📖 Daily Ledger (Khata)
- Timeline-style grouped view of daily transactions with category badges (*Sales, Rent, Stock, Salary, Electricity, Transport, Other*).
- Filters: *Today, This Week, This Month, All Time*.
- **Speech-to-Khata Voice Entry**: Speak in Hindi, Marathi, or English (e.g. *"sold 200 rupees of rice"*) to automatically parse amount, category, and notes via Gemini AI.
- **Printable Monthly Statement**: Export or print receipts directly from the browser.

### 4. 👥 Credit / Udhaar Management
- Customer profile cards with contact details, items taken, balance due, and trust ratings (*Pays on time ⭐, Sometimes late ⚠️, Often late 🚨*).
- **1-Tap WhatsApp & SMS Reminders**: Polite pre-written reminder messages with the customer's name, balance, and shop UPI ID.
- **Remind All Pending**: Scheduled broadcast helper for weekly collections.
- Quick actions to add credit, record partial payments, or mark as fully settled.

### 5. ✨ AI Smart Ad Maker
- Powered by Google Gemini (`gemini-3.8-flash`).
- Choose items from stock, select campaign occasion (*Diwali Sale, Weekend Drop, Clearance, New Arrivals*), and tone.
- Generates:
  1. Storefront poster headline and tagline.
  2. WhatsApp broadcast copy with emojis and call-to-action.
  3. Instagram caption with hashtags (#Kirana #LocalShop #DiwaliOffer).
  4. Twitter / X announcement.
- Attractive poster preview card with Copy, Share, and Regenerate buttons.

### 6. 📈 AI Commodity Price Trends
- 7-day wholesale market price charts for staples (Basmati Rice, Wheat, Sugar, Mustard Oil, Onions, Tomatoes, Milk).
- Gemini-powered restock recommendations (*"Buy 3 days stock now"*, *"Wait 2 days for dip"*).
- **"Today's Best Buy Opportunities"** banner.

### 7. 📦 Stock & Low-Stock Alerts
- Visual stock cards with health progress bars (green for healthy, amber for low, red for critical).
- Direct alerts on Home dashboard and integration with the Ad Maker.

### 8. 🧾 Digital Bill & Dynamic UPI QR Receipts
- Create itemized bills with stock picker or custom line items.
- Live **UPI QR code** generation configured to the shop's UPI ID and bill total.
- Instant WhatsApp bill sharing and thermal receipt print support.

### 9. 🌐 Multilingual & PWA
- Full language support: **English**, **हिंदी (Hindi)**, and **मराठी (Marathi)**.
- Dark mode toggle with persistent preferences in `localStorage`.
- Progressive Web App (PWA) with service worker and offline capability.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or bun

### Installation
```bash
git clone <YOUR_REPO_URL>
cd dukaansaathi
npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
```

### Running the App
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion, Lucide Icons
- **Backend**: Express, Node.js (`server.ts`)
- **AI Engine**: `@google/genai` (Gemini 3.8 Flash)
- **Utilities**: `vite-plugin-pwa`, `qrcode`, `canvas-confetti`
- **Storage**: Browser LocalStorage (zero setup, works offline)

---

## 📄 License
Apache-2.0
