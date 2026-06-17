# Village Khata Manager - Backend API

Production-ready backend for Village Khata Manager with MySQL database, JWT authentication, and financial dashboard APIs.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Prisma ORM** - Database toolkit
- **bcrypt** - Password hashing
- **JWT** - Authentication
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing

## Project Structure

```
/backend
  /src
    /controllers
      authController.js
      dashboardController.js
      expenseController.js
      reportController.js
    /routes
      authRoutes.js
      dashboardRoutes.js
      expenseRoutes.js
      reportRoutes.js
    /middlewares
      auth.js
    /config
    /services
    app.js
    server.js
  /prisma
    schema.prisma
  package.json
  .env
  .env.example
  README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```
DATABASE_URL="mysql://username:password@localhost:3306/village_khata_manager"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
```

**Important:** Change the `JWT_SECRET` to a secure random string in production.

### 3. Create MySQL Database

Create a database named `village_khata_manager` in MySQL:

```sql
CREATE DATABASE village_khata_manager;
```

### 4. Run Prisma Migrations

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 5000 (or the port specified in `.env`).

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "token": "jwt_token_here"
    }
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "token": "jwt_token_here"
    }
  }
  ```

#### Get Current User (Protected)
- **GET** `/api/auth/me`
- **Headers:**
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
  ```

### Dashboard

#### Get Summary (Protected)
- **GET** `/api/dashboard/summary`
- **Headers:**
  ```
  Authorization: Bearer jwt_token_here
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totalSales": 0,
      "totalLabourExpense": 0,
      "totalMedicineExpense": 0,
      "totalOtherExpenses": 0,
      "totalExpenses": 0,
      "netProfit": 0
    }
  }
  ```

**Note:** All values are calculated from the MySQL database using SQL aggregation queries (SUM). No frontend calculations are performed.

### Expenses (New)

#### Get All Expenses (Protected)
- **GET** `/api/expenses`
- **Query Parameters:** `type`, `startDate`, `endDate`, `search`
- **Response:** Array of expense objects

#### Get Expense Statistics (Protected)
- **GET** `/api/expenses/statistics`
- **Response:**
  ```json
  {
    "totalExpenses": 5000,
    "todayExpenses": 500,
    "monthExpenses": 2500
  }
  ```

#### Create Expense (Protected)
- **POST** `/api/expenses`
- **Body:**
  ```json
  {
    "expenseType": "Diesel",
    "amount": 1500,
    "description": "Fuel for generator",
    "date": "2024-01-15"
  }
  ```

#### Update Expense (Protected)
- **PUT** `/api/expenses/:id`
- **Body:** Same as create

#### Delete Expense (Protected)
- **DELETE** `/api/expenses/:id`

### Reports (New)

#### Get Financial Report (Protected)
- **GET** `/api/reports/financial?startDate=2024-01-01&endDate=2024-01-31`
- **Response:**
  ```json
  {
    "totalSales": 50000,
    "labourExpense": 15000,
    "medicineExpense": 8000,
    "otherExpenses": 5000,
    "totalExpenses": 28000,
    "netProfit": 22000
  }
  ```

#### Get Sales Trend (Protected)
- **GET** `/api/reports/sales-trend?days=30`
- **Response:** Array of daily sales data

#### Get Expense Trend (Protected)
- **GET** `/api/reports/expense-trend?days=30`
- **Response:** Array of daily expense data

#### Get Profit Trend (Protected)
- **GET** `/api/reports/profit-trend?days=30`
- **Response:** Array of daily profit data

#### Get Expense Breakdown (Protected)
- **GET** `/api/reports/expense-breakdown?startDate=2024-01-01&endDate=2024-01-31`
- **Response:** Array of expenses grouped by type

## Database Schema

### Users
- `id` - Primary key
- `name` - User name
- `email` - Unique email
- `password` - Hashed password (bcrypt)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Sales
- `id` - Primary key
- `amount` - Sale amount (Decimal)
- `description` - Optional description
- `date` - Transaction date
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Labour Payments
- `id` - Primary key
- `amount` - Payment amount (Decimal)
- `description` - Optional description
- `date` - Transaction date
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Medicines
- `id` - Primary key
- `amount` - Medicine expense (Decimal)
- `description` - Optional description
- `date` - Transaction date
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Expenses
- `id` - Primary key
- `expenseType` - Type of expense (Diesel, Food, Material, Transport, Equipment, Maintenance, Other)
- `amount` - Expense amount (Decimal)
- `description` - Optional description
- `date` - Transaction date
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Security Features

- **Password Hashing:** All passwords are hashed using bcrypt with salt rounds of 10
- **JWT Authentication:** Secure token-based authentication with 7-day expiration
- **Protected Routes:** Dashboard and user profile routes require valid JWT token
- **Input Validation:** Email format and password length validation
- **Environment Variables:** Sensitive data stored in environment variables
- **CORS Enabled:** Properly configured for cross-origin requests

## Development

### Prisma Studio
View and edit database data:
```bash
npx prisma studio
```

### Create New Migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset Database
```bash
npx prisma migrate reset
```

## Production Deployment

1. Set strong `JWT_SECRET` in environment variables
2. Use a production MySQL database
3. Set `NODE_ENV=production`
4. Use a process manager like PM2
5. Configure proper SSL/HTTPS
6. Set up database backups
7. Configure firewall rules

## License

ISC
