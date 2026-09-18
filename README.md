# FranchiseOps AI — Enterprise Agentic Operations & Analytics

FranchiseOps AI is a multi-agent intelligent franchise operations platform designed to monitor outlet sales, run trend forecasting, measure operational efficiency, and deliver dynamic mathematical AI insights.

---

## ✨ Features

- **Collapsible Sidebar Workflow Navigation**: Clean 10-step agentic process workflow sidebar (Data Aggregation, Validation, Performance Agent, Inventory, Staff, Marketing, Audit, Intelligence Engine, Recommendations, Alerts).
- **Outlet Performance Agent Dashboard**:
  - **Monitor Daily Sales**: Interactive search, column sorting, pagination, and granular store audit logs.
  - **Revenue & Profit Trends**: Visual daily trends (Recharts Area & Bar charts) for Gross Revenue, Operating Costs, Net Profit, and Payment Split (UPI, Card, Cash).
- **Dynamic AI Revenue Insights Engine**:
  - **Revenue Momentum**: Linear regression slope (\(\beta_1 = \frac{n\sum x_i y_i - \sum x_i \sum y_i}{n\sum x_i^2 - (\sum x_i)^2}\)) measuring daily growth rate.
  - **Revenue Volatility**: Coefficient of Variation (\(CV = \frac{\sigma}{\mu} \times 100\)) rating sales consistency.
  - **Period-over-Period Growth**: First-half vs second-half average comparison (\(\frac{H_2 - H_1}{H_1} \times 100\)).
  - **Profit Margin Drift**: Regression slope of daily profit margin percentages.
  - **Peak Revenue Detection**: Outlier detection using Z-scores (\(z = \frac{x_i - \mu}{\sigma}\)).
  - **Cost Ratio Efficiency**: Operating cost as % of gross revenue drift.
- **Built-in Demo / Standalone Fallback Mode**: Automatically uses a rich local dataset if the backend API is offline so you can run and test the frontend immediately.


---

## 🛠️ Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- `npm` (v9.x or higher)

---

## 🚀 Quick Start Guide

### Option 1: Run Frontend Only (Demo Mode)

The frontend automatically falls back to an built-in deterministic demo dataset if the backend server is not running.

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

### Option 2: Run Full Stack (Frontend + Backend)

#### 1. Start the Backend API Server

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# (Optional) Seed the database with Prisma
npm run seed

# Start the Node.js Express server (runs on http://localhost:5000)
npm run start
```

#### 2. Start the Frontend Application

In a separate terminal window:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend will automatically connect to `http://localhost:5000/api`.

---

## 📁 Project Structure

```text
FranchiseOpsAI/
├── frontend/             # Next.js 16 (React 19, TailwindCSS, Recharts)
│   ├── app/              # Main App Router & page dashboard
│   ├── public/           # Static assets
│   └── package.json
├── backend/              # Node.js + Express REST API
│   ├── server.js         # Express server & endpoints
│   ├── seed.js           # Database seed script
│   ├── prisma/           # Prisma ORM schema
│   └── package.json
└── README.md             # Project documentation
```

---

## 📜 License

This project is licensed under the ISC License.
