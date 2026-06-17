# Village Khata Manager - Frontend

A production-ready React frontend for the Village Khata Manager web application.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **html2pdf.js** - PDF export functionality (NEW)
- **XLSX** - Excel export functionality (NEW)

## Features

- **Authentication System**
  - Login page with email/password
  - Register page with name/email/password
  - JWT token storage in localStorage
  - Automatic redirect to dashboard on successful login

- **Protected Routing**
  - ProtectedRoute component guards dashboard access
  - Automatic redirect to login if no JWT token found
  - 401 error handling for expired/invalid tokens

- **Dashboard**
  - Fetches financial summary from backend API
  - Displays metrics in responsive card layout:
    - Total Sales
    - Total Labour Expense
    - Total Medicine Expense
    - Total Other Expenses
    - Total Expenses
    - Net Profit
  - Loading and error states
  - Indian Rupee (INR) currency formatting

- **Expenses Management** (New)
  - Create, read, update, delete expenses
  - Expense types: Diesel, Food, Material, Transport, Equipment, Maintenance, Other
  - Search and filter capabilities
  - Filter by expense type and date range
  - Statistics cards (Total, Today, This Month)
  - Responsive table layout
  - Real-time updates

- **Reports & Analytics** (New)
  - Complete financial report generation
  - Date filtering (Today, This Week, This Month, Custom)
  - Summary cards showing:
    - Total Sales
    - Labour Expense
    - Medicine Expense
    - Other Expenses
    - Total Expenses
    - Net Profit
  - Financial breakdown table by category
  - Expense breakdown by type with percentages
  - Sales and expense trend data
  - Export to PDF functionality
  - Print report functionality
  - Responsive design for mobile and desktop

## Project Structure

```
src/
  pages/
    Login.jsx          - Login page component
    Register.jsx       - Register page component
    Dashboard.jsx      - Dashboard page component
    Expenses.jsx       - Expenses management page (NEW)
    Reports.jsx        - Reports and analytics page (NEW)
  components/
    ProtectedRoute.jsx - Route protection wrapper
    Sidebar.jsx        - Navigation sidebar
    Navbar.jsx         - Top navigation with settings
    Layout.jsx         - Main layout wrapper
  services/
    api.js             - Axios instance with interceptors
  context/
    AuthContext.jsx    - Authentication context
  App.jsx             - Main app with routing
  main.jsx            - Entry point
  index.css           - Global styles with Tailwind
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api`

### Endpoints Used

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/dashboard/summary` - Get financial summary
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/statistics` - Get expense statistics
- `GET /api/reports/financial` - Get financial report
- `GET /api/reports/sales-trend` - Get sales trend
- `GET /api/reports/expense-trend` - Get expense trend
- `GET /api/reports/profit-trend` - Get profit trend
- `GET /api/reports/expense-breakdown` - Get expense breakdown

### Authentication

- JWT tokens are stored in localStorage
- Axios interceptor automatically attaches `Authorization: Bearer <token>` header
- 401 errors trigger automatic logout and redirect to login

## Security Features

- JWT-based authentication
- Protected routes
- Automatic token attachment via interceptors
- 401 error handling with redirect
- No API keys exposed in client code
- Secure localStorage usage

## Environment

The API base URL is configured in `src/services/api.js`. For production, consider using environment variables:

```javascript
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

Create a `.env` file in the root:
```
VITE_API_BASE_URL=http://your-production-api.com/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## UI/UX Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Settings Dropdown**: User profile and logout accessible from navbar
- **Navigation Sidebar**: Collapsible menu with all module links
- **Real-time Updates**: Dashboard and reports refresh automatically
- **Data Export**: PDF and print functionality for reports
- **Search & Filter**: Advanced filtering options on expenses and reports
- **Statistics Cards**: Quick overview of key metrics
- **Professional Tables**: Responsive data tables
- **Error Handling**: User-friendly error messages and loading states

## Available Modules

1. **Dashboard** - Financial metrics overview
2. **Sales** - Sales management and tracking
3. **Labour** - Labour/staff management
4. **Medicine** - Medicine/inventory management
5. **Expenses** (NEW) - Business expense tracking
6. **Reports** (NEW) - Financial reporting and analytics
