# Village Khata Manager - Frontend

A production-ready React frontend for the Village Khata Manager web application.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests

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

- **UI/UX**
  - Clean SaaS-style design
  - Responsive layout (mobile + desktop)
  - Dark sidebar with navigation
  - Logout functionality
  - Modern Tailwind CSS styling

## Project Structure

```
src/
  pages/
    Login.jsx          - Login page component
    Register.jsx       - Register page component
    Dashboard.jsx      - Dashboard page component
  components/
    ProtectedRoute.jsx - Route protection wrapper
    Sidebar.jsx        - Navigation sidebar
  services/
    api.js             - Axios instance with interceptors
  context/
    (optional)         - Auth context if needed
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
