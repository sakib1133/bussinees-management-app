# Business Khata App — PWA

A full-stack **Progressive Web App (PWA)** for small business management built with **React, Node.js, and PostgreSQL**. Supports offline functionality, native app installation, and real-time business tracking across 6 modules with 43 REST APIs.

🔗 **[Live Demo](https://bussinees-management-app-7b5y.vercel.app/login)** · **[GitHub Repo](https://github.com/sakib1133/bussinees-management-app)**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| PWA | Service Worker, Web App Manifest |
| Auth | JWT, HTTPS, CORS |
| Deployment | Render |

---

## Key Features

- **Progressive Web App** — installable on iOS, Android, and Desktop with full offline support via Service Worker
- **6 Business Modules** — Dashboard, Sales, Labour, Medicine, Expenses, Reports
- **43 REST APIs** — complete CRUD operations across all modules
- **Offline-First Architecture** — Service Worker caches static assets, API responses, and user data
- **50–70% Faster Repeat Visits** — Service Worker serves cached assets instantly
- **JWT Authentication** — secure token-based auth, tokens never cached by Service Worker
- **Responsive UI** — mobile-first design optimized for low-bandwidth networks

---

## Lighthouse Scores

| Metric | Score |
|---|---|
| Performance | 85 |
| Accessibility | 93 |
| Best Practices | 100 |
| SEO | 91 |
| First Contentful Paint | < 2s |
| Repeat Load Time | < 1s |
| Cache Hit Rate | > 70% |

---

## Business Modules

| Module | Description |
|---|---|
| Dashboard | Business overview, summary stats, and key metrics |
| Sales | Sales records, invoices, and revenue tracking |
| Labour | Worker management, attendance, and payroll |
| Medicine | Inventory tracking and stock management |
| Expenses | Daily expense recording and categorization |
| Reports | Analytics, trends, and business insights |

---
## Project Structure
```
BusinessKhata-Digital-Ledger-for-Traders/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── middlewares/
│       └── utils/
│
├── frontend/
│   ├── public/
│   │   ├── icons/
│   │   ├── sw.js
│   │   ├── manifest.json
│   │   └── version.json
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── utils/
│
├── render.yaml
├── Procfile
├── README.md
└── .env.example
```

## PWA Architecture

```
frontend/public/
├── sw.js              # Service Worker — handles offline caching and background sync
├── manifest.json      # Web App Manifest — enables native installation
└── offline.html       # Offline fallback page

frontend/src/
├── components/
│   ├── InstallAppButton.jsx    # Native install prompt
│   ├── UpdateNotification.jsx  # Background update alerts
│   ├── OfflineBanner.jsx       # Connection status indicator
│   └── AppLoader.jsx           # Loading screen
└── utils/
    ├── pwaUtils.js             # PWA helper functions
    └── cacheUtils.js           # Cache management
```

---

## Security

- JWT tokens excluded from Service Worker cache
- HTTPS enforced in production
- CORS configured for trusted origins only
- Sensitive user data never stored in browser cache
- CSP (Content Security Policy) compatible

---

## Browser Support

| Browser | PWA Support |
|---|---|
| Chrome | ✅ Full |
| Edge | ✅ Full |
| Firefox | ✅ Full |
| Opera | ✅ Full |
| Safari | ✅Full |

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/sakib1133/business-khata-app.git
cd business-khata-app

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### Environment Variables

Create `.env` in the backend folder:

```env
DATABASE_URL=your_postgresql_connection_url
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Run Locally

```bash
# Terminal 1 — Backend
cd backend && npm start

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Visit `http://localhost:5173`

### Test PWA Offline Mode

```bash
cd frontend
npm run build
npx serve -s dist -l 3000
```

Open Chrome DevTools → Application → verify Service Worker is registered and green.

---

## Author

**Mohd Sakib Malik**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/mohd-sakib-malik-97ab4a283/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/sakib1133)
[![LeetCode](https://img.shields.io/badge/LeetCode-Profile-orange)](https://leetcode.com/u/sakib_malik79/)
