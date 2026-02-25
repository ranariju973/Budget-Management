# 💰 Budget Management Web Application

A full-stack budget management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Track your income, expenses, borrowings, and lendings with a modern, responsive dashboard.

## Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Frontend       | React.js + Vite                   |
| Backend        | Node.js + Express.js              |
| Database       | MongoDB + Mongoose                |
| Authentication | JWT (JSON Web Tokens)             |
| Styling        | Tailwind CSS v4                   |
| Icons          | react-icons (Feather Icons)       |
| Notifications  | react-hot-toast                   |

## Features

- **Authentication** — Signup, Login with JWT, protected routes
- **Monthly Income** — Set and edit income per month
- **Expense Tracking** — Add, edit, delete expenses with date tracking
- **Borrowing** — Track money you owe to others
- **Lending** — Track money others owe you
- **Financial Summary** — Auto-calculated remaining balance
- **Dark Mode** — Toggle between light and dark themes
- **Responsive** — Mobile-friendly sidebar and layout
- **Confirmation Dialogs** — Before destructive actions
- **Toast Notifications** — For all CRUD operations

## Formula

```
Remaining Balance = Income - Total Expenses - Total Borrowing + Total Lent
```

## Folder Structure

```
budget_managment/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Signup, Login, GetMe
│   │   ├── incomeController.js  # Income CRUD
│   │   ├── expenseController.js # Expense CRUD
│   │   ├── borrowController.js  # Borrow CRUD
│   │   ├── lendController.js    # Lend CRUD
│   │   └── summaryController.js # Financial summary
│   ├── middleware/
│   │   └── auth.js              # JWT auth middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Income.js
│   │   ├── Expense.js
│   │   ├── Borrow.js
│   │   └── Lend.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── incomeRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── borrowRoutes.js
│   │   ├── lendRoutes.js
│   │   └── summaryRoutes.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── SummaryCards.jsx
│   │   │   │   ├── IncomeSection.jsx
│   │   │   │   ├── ExpenseSection.jsx
│   │   │   │   ├── BorrowSection.jsx
│   │   │   │   └── LendSection.jsx
│   │   │   └── layout/
│   │   │       ├── Sidebar.jsx
│   │   │       └── Navbar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── useFetch.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── incomeService.js
│   │   │   ├── expenseService.js
│   │   │   ├── borrowService.js
│   │   │   ├── lendService.js
│   │   │   └── summaryService.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** v18+ 
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** or **yarn**

## Installation & Setup

### 1. Clone the repository

```bash
cd budget_managment
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (or copy from `.env.example`):

```env
MONGO_URI=mongodb://localhost:27017/budget_management
JWT_SECRET=your_strong_secret_key_here
PORT=5000
NODE_ENV=development
```

Start the backend server:

```bash
node server.js
```

Server runs on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

> The Vite dev server proxies `/api` requests to `http://localhost:5000`, so both servers can run simultaneously during development.

## API Endpoints

### Auth
| Method | Endpoint          | Description       | Auth |
| ------ | ----------------- | ----------------- | ---- |
| POST   | /api/auth/signup  | Register user     | No   |
| POST   | /api/auth/login   | Login user        | No   |
| GET    | /api/auth/me      | Get current user  | Yes  |

### Income
| Method | Endpoint          | Description           | Auth |
| ------ | ----------------- | --------------------- | ---- |
| GET    | /api/income       | Get income (by month) | Yes  |
| POST   | /api/income       | Create/upsert income  | Yes  |
| PUT    | /api/income/:id   | Update income         | Yes  |

### Expenses
| Method | Endpoint            | Description      | Auth |
| ------ | ------------------- | ---------------- | ---- |
| GET    | /api/expenses       | List expenses    | Yes  |
| POST   | /api/expenses       | Add expense      | Yes  |
| PUT    | /api/expenses/:id   | Update expense   | Yes  |
| DELETE | /api/expenses/:id   | Delete expense   | Yes  |

### Borrowing
| Method | Endpoint           | Description        | Auth |
| ------ | ------------------ | ------------------ | ---- |
| GET    | /api/borrows       | List borrow records| Yes  |
| POST   | /api/borrows       | Add borrow record  | Yes  |
| PUT    | /api/borrows/:id   | Update borrow      | Yes  |
| DELETE | /api/borrows/:id   | Delete borrow      | Yes  |

### Lending
| Method | Endpoint         | Description       | Auth |
| ------ | ---------------- | ----------------- | ---- |
| GET    | /api/lends       | List lend records | Yes  |
| POST   | /api/lends       | Add lend record   | Yes  |
| PUT    | /api/lends/:id   | Update lend       | Yes  |
| DELETE | /api/lends/:id   | Delete lend       | Yes  |

### Summary
| Method | Endpoint     | Description               | Auth |
| ------ | ------------ | ------------------------- | ---- |
| GET    | /api/summary | Get financial summary     | Yes  |

> Use `?month=2&year=2026` query params to filter by month/year.

## Environment Variables

| Variable    | Description                         | Default                                      |
| ----------- | ----------------------------------- | -------------------------------------------- |
| MONGO_URI   | MongoDB connection string           | mongodb://localhost:27017/budget_management   |
| JWT_SECRET  | Secret key for JWT signing          | (required — set a strong random string)       |
| PORT        | Backend server port                 | 5000                                         |
| NODE_ENV    | Node environment                    | development                                  |

## License

MIT
