# FinFlow - Premium Mini Expense Tracker

### Studio Graphene – Full Stack Developer Assessment (Exercise 2)

FinFlow is a premium, interactive full stack application designed to track and manage daily expenses across major spending categories, set monthly category budgets, analyze spending trends through charts, and export data logs. 

The application is structured for clean separation of concerns, featuring a responsive, modern glassmorphic React frontend and a Node.js + Express backend.

---

## Live Demo & Repositories
* **GitHub Repository:** Public link will be available upon push.
* **Architecture:** Monorepo containing `/client` and `/server`.

---

## Tech Stack & Rationale

### Frontend (`/client`)
* **Vite + React + TypeScript:** Standard setup for building highly performant SPAs. TypeScript guarantees type safety between components.
* **Vanilla CSS (Variables + Flexbox/Grid):** Implements a premium, custom glassmorphism design system. Avoids utility-class bloat while demonstrating advanced CSS layout knowledge (animations, responsive breakpoints, color variables, custom scrollbars).
* **Recharts:** Light, interactive SVG charts to render category-specific spending distributions (Pie Chart) and weekly spending histories (Bar Chart).
* **Lucide React:** Modern, clean icon package for indicators.

### Backend (`/server`)
* **Node.js + Express + TypeScript:** Minimalist, fast, and type-safe server.
* **JSON File Storage (`db.json`):** Serves as a portable flat-file database. Eliminates OS-level binary compilation problems common with SQLite/Better-SQLite3 during local evaluation, while keeping full persistence.

---

## Project Structure

```
/my-expense-tracker
  ├── /client (Vite + React Frontend)
  │     ├── /src
  │     │     ├── /components      # UI components (Sidebar, Summary, Charts, Table)
  │     │     ├── /hooks           # useExpenses custom state and API syncing hook
  │     │     ├── /types           # TypeScript interfaces for client structures
  │     │     ├── /utils           # formatters (INR Currency, Date formats)
  │     │     ├── App.tsx          # Root controller coordinating views and states
  │     │     └── index.css        # Global CSS variables, themes, animations
  │     ├── index.html
  │     └── package.json
  │
  ├── /server (Express Backend)
  │     ├── /data
  │     │     └── db.json          # Database file holding persistent records
  │     ├── /src
  │     │     ├── /config          # Database read/write helpers
  │     │     ├── /controllers     # Controllers for validation and CRUD operations
  │     │     ├── /routes          # Routes registration (expenses and budgets)
  │     │     ├── /middleware      # Express error handler middleware
  │     │     ├── /models          # Types and database schemas
  │     │     └── index.ts         # Backend entry point
  │     ├── tsconfig.json
  │     └── package.json
  │
  └── README.md
```

---

## How to Run Locally

Follow these instructions to run the frontend and backend servers concurrently.

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (v9.0.0 or higher)

### Setup & Installation

1. Clone or extract this workspace.
2. In your terminal, navigate to the root directory.

#### Running the Backend Server
```bash
cd server
npm install
npm run dev
```
*The server will boot and run on:* `http://localhost:5000`

#### Running the Frontend Client
Open a second terminal window:
```bash
cd client
npm install
npm run dev
```
*The client will run on:* `http://localhost:5173` (or the next available port). Open the URL in your browser.

---

## API Documentation

### 1. Expenses API

#### Get All Expenses
* **Method:** `GET`
* **Endpoint:** `/api/expenses`
* **Response Shape (`200 OK`):**
  ```json
  [
    {
      "id": "c62fbda9-2693-455b-b9d9-48ab54530fc9",
      "amount": 250.00,
      "category": "Food",
      "date": "2026-06-06",
      "note": "Lunch with team",
      "createdAt": "2026-06-06T17:59:38.250Z"
    }
  ]
  ```

#### Create Expense
* **Method:** `POST`
* **Endpoint:** `/api/expenses`
* **Request Body:**
  ```json
  {
    "amount": 450.50,
    "category": "Transport",
    "date": "2026-06-06",
    "note": "Taxi ride"
  }
  ```
* **Validation Rules:**
  * `amount` must be a positive number greater than `0`.
  * `category` is required and must be one of: `Food`, `Transport`, `Bills`, `Entertainment`, `Other`.
  * `date` must be YYYY-MM-DD and cannot be a future date.
  * `note` is optional (string).
* **Response Shape (`210 Created`):**
  ```json
  {
    "id": "f5169a83-a800-4bbf-9c04-f06b12a81dc1",
    "amount": 450.50,
    "category": "Transport",
    "date": "2026-06-06",
    "note": "Taxi ride",
    "createdAt": "2026-06-06T18:01:22.100Z"
  }
  ```

#### Update Expense
* **Method:** `PUT`
* **Endpoint:** `/api/expenses/:id`
* **Request Body:** Same shape as Create Expense.
* **Response Shape (`200 OK`):** Updated expense object.

#### Delete Expense
* **Method:** `DELETE`
* **Endpoint:** `/api/expenses/:id`
* **Response Shape (`200 OK`):**
  ```json
  {
    "message": "Expense deleted successfully."
  }
  ```

---

### 2. Budgets API

#### Get Category Budgets
* **Method:** `GET`
* **Endpoint:** `/api/budgets`
* **Response Shape (`200 OK`):**
  ```json
  {
    "Food": 15000,
    "Transport": 5000,
    "Bills": 30000,
    "Entertainment": 10000,
    "Other": 2000
  }
  ```

#### Update Category Budget
* **Method:** `PUT`
* **Endpoint:** `/api/budgets`
* **Request Body:**
  ```json
  {
    "category": "Food",
    "amount": 18000
  }
  ```
* **Response Shape (`200 OK`):** Updated budgets mapping object.

---

## AI Assistant Declaration

As per the ground rules of the assessment, I declare the use of **Antigravity (Google DeepMind)** in pair-programming and generating code blocks, layout structures, and API designs. Every line of code has been verified and refined for stability, validation constraints, and responsive compatibility.

---

## Next Steps / Production Refinements
1. **Database Integration:** Connect to a relational SQLite / PostgreSQL database using an ORM like Prisma or Drizzle for enterprise query scaling.
2. **User Authentication:** Introduce multi-user support by adding Firebase Auth or JWT-based authentication.
3. **Advanced CSV/PDF Report Exports:** Generate visual PDF invoices or advanced Excel worksheets with custom formulas.
