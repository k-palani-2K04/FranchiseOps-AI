# FranchiseOps AI — Enterprise Agentic Operations & Analytics Platform

**FranchiseOps AI** is an enterprise-grade, multi-agent intelligent franchise operations platform. Designed for multi-location franchise networks, it aggregates operational, financial, compliance, inventory, labor, and marketing telemetry from across all store locations into a unified intelligence engine. 

The platform features an **11-Step Agentic Operational Process Workflow**, dynamic mathematical AI insight models, real-time loss prevention audits, predictive anomaly radars, automated recommendation action plans, and a non-blocking background SLA escalation notification engine.

---

## 🌟 Key Platform Features

### 🔄 11-Step Agentic Process Workflow
The application guides operators through an end-to-end 11-step agentic lifecycle:

1. **Franchise Data Aggregation**: Ingests raw multi-location telemetry including POS sales logs, inventory stock balances, workforce shift rosters, marketing campaign spends, and store audit evaluations.
2. **Data Validation**: Sanitizes data streams, enforces schema validation, handles missing values, cleans transaction records, and reconciles input formats.
3. **Outlet Performance Agent**: 
   - **Daily Sales & Margin Analytics**: Granular sales tables with sorting, filtering, pagination, and store performance rankings.
   - **Dynamic Mathematical AI Insights**:
     - **Revenue Momentum**: Linear regression slope measuring daily growth velocity:
       $$\beta_1 = \frac{n \sum (x_i y_i) - \sum x_i \sum y_i}{n \sum x_i^2 - (\sum x_i)^2}$$
     - **Revenue Volatility**: Coefficient of Variation rating sales consistency:
       $$CV = \left( \frac{\sigma}{\mu} \right) \times 100$$
     - **Period-over-Period Growth**: First-half vs second-half sales comparison:
       $$\text{Growth \%} = \left( \frac{H_2 - H_1}{H_1} \right) \times 100$$
     - **Profit Margin Drift**: Linear regression slope of daily profit margin percentages.
     - **Peak Revenue Detection**: Outlier detection using Z-scores:
       $$z = \frac{x_i - \mu}{\sigma}$$
   - **Interactive Location Map & Side-by-Side Comparison**: Map visualization of outlet locations with side-by-side comparative modals.
4. **Inventory Agent**: Tracks real-time stock balances, calculates item depletion rates, predicts ingredient stockouts, generates automated replenishment orders, and suggests inter-outlet stock transfers.
5. **Staff Agent**: Analyzes staff performance ratings, breaks down shifts (Morning, Evening, Night), generates automated shift rosters, tracks labor fatigue, and optimizes labor costs against sales velocity.
6. **Marketing Agent**: Computes campaign ROI, tracks channel conversion rates (Social Media, Search, Influencer, Print), calculates Return on Ad Spend (ROAS), and recommends campaign budget reallocations.
7. **Audit Agent (Compliance & Loss Prevention)**:
   - **Digital Store Audits**: Executes weighted checklists across *Hygiene, Food Safety, SOPs, and Facility Opening Procedures* with automated Pass/Fail scoring ($70\%$ pass threshold).
   - **Non-Compliance Findings**: Auto-generates critical findings for failed audit items.
   - **POS Financial & Void Audit**: Reconciles sales revenue against cash/card/UPI splits to detect cash drawer discrepancies and void fraud ($>45\%$ cash dependency alerts).
   - **Inventory Variance Audit**: Compares physical stock vs. POS theoretical consumption to flag inventory shrinkage and theft ($>25\%$ variance alerts).
   - **Labor & Certification Audit**: Verifies shift coverage and flags low-performing staff ($<3.5 / 5.0$) for safety re-certification.
   - **Incident Management**: Tracks operational incidents from reported state through resolution.
8. **Franchise Intelligence Engine**:
   - **Cross-Agent Output Matrix**: Side-by-side comparative telemetry table consolidating all agent outputs per store.
   - **Multi-Dimensional Health Score (0–100 & Grades A+ to F)**: Standardized scoring formula weighting 6 core pillars:
     $$\text{Health Score} = 0.35(S_{\text{Fin}}) + 0.20(S_{\text{Comp}}) + 0.15(S_{\text{Inv}}) + 0.10(S_{\text{Rev}}) + 0.10(S_{\text{Staff}}) + 0.10(S_{\text{Ord}})$$
   - **Proactive Risk Prediction Engine**: 30-to-60 day early warning forecasts for Financial, Compliance, Inventory, Revenue, and Marketing risks.
   - **14–30 Day Predictive Anomaly Radar**: Multi-axis risk radar predicting *Stockout Risk, Labor Fatigue, CSAT Risk, and Margin Drift*.
   - **Growth Opportunities Engine**: Identifies latent financial growth opportunities, marketing scale-up candidates, star staff leverage, and overstock working capital liberation.
   - **Interactive Health Score Simulator**: What-If scenario sandbox allowing operators to adjust revenue, margins, stock issues, staff ratings, and audit scores to observe immediate ROI impact.
9. **Strategic Business Recommendations**: Algorithmic strategic advisor generating prioritized action directives (**P1 Critical, P2 High, P3 Growth**) with cross-agent data rationale, affected outlet tags, step-by-step executable action checklists, quantified financial return, and urgency dials ($0\%\text{--}100\%$).
10. **Executive Dashboard & Alerts (Command Centre)**: Executive dashboard featuring network-wide summary KPI banners, live agent performance gauges, 5-checkpoint trend snapshot sparklines, interactive multi-metric outlet bar charts, and a real-time risk alert feed with severity filtering and one-click task acknowledgment.
11. **AI Notifications & Automated Workflows**:
    - **AI Decision & Rule Validation Engine**: Ingests operational events, evaluates business impact, writes AI reasoning, and selects optimal alert dispatch channels (`PUSH`, `EMAIL`, `SMS`).
    - **Action Plans & SLA Tracking**: Creates structured action plans with strict SLA countdown timers (e.g., 30 or 120 minutes).
    - **Background SLA Escalation Engine**: Non-blocking background worker polling every 15 seconds to monitor SLA compliance, triggering SMS fallback retries and hierarchical authority escalation (`Store Owner` $\rightarrow$ `Store Manager` $\rightarrow$ `Regional Manager`).

---

## 🏗️ System Architecture & Tech Stack

```text
                               ┌──────────────────────────────────────────┐
                               │             Next.js 16 Frontend          │
                               │   (React 19, TypeScript, TailwindCSS)   │
                               └────────────────────┬─────────────────────┘
                                                    │ REST API / Axios
                               ┌────────────────────▼─────────────────────┐
                               │           Express REST API Server        │
                               │        (Node.js, Prisma ORM, JWT)        │
                               └────────┬───────────────┬───────────────┬─┘
                                        │               │               │
                  ┌─────────────────────▼─┐   ┌─────────▼─────────┐   ┌─▼──────────────────┐
                  │   Prisma ORM SQLite   │   │  SQLite3 Database │   │  Agentic AI & Background │
                  │    (database.sqlite)  │   │(notifications.sqlite)│ │   SLA Worker Engine  │
                  └───────────────────────┘   └───────────────────┘   └────────────────────┘
```

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, Recharts, Lucide Icons, Leaflet Map Component, Axios API Client.
- **Backend**: Node.js, Express REST API, Prisma ORM, SQLite3 (Dual-database architecture: `database.sqlite` for operational entities and `notifications.sqlite` for agentic notifications/rules/audit logs), bcrypt authentication with JWT tokens.
- **AI & Background Services**: Agentic event detector pipeline (`eventDetector.js`), AI workflow decision engine (`aiWorkflowEngine.js`), non-blocking SLA background worker (`backgroundWorker.js`), hierarchical escalation engine (`escalationEngine.js`), and multi-channel notification dispatcher (`channelService.js`).

---

## 🛠️ Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- `npm` (v9.x or higher)

---

## 🚀 Quick Start Guide

### Option 1: Run Frontend Only (Demo / Standalone Mode)

The frontend includes a built-in deterministic demo dataset. If the backend API is offline, the application seamlessly operates in offline demo mode.

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option 2: Run Full Stack (Frontend + Backend API + Background SLA Worker)

#### 1. Start the Backend API Server

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# (Optional) Run Prisma database migrations and seed operational data
npm run seed

# Start the Node.js Express server & SLA background worker (runs on http://localhost:5000)
npm run start
```

#### 2. Start the Frontend Application

In a separate terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend will automatically connect to `http://localhost:5000/api`.

---

## 🔑 Demo Login Credentials

You can test the platform using the following pre-seeded demo accounts:

- **Corporate Admin / Franchisor**: `admin@franchiseops.com` / `admin123`
- **Regional Manager**: `manager@franchiseops.com` / `admin123`
- **Store Manager**: `store@franchiseops.com` / `admin123`

---

## 📁 Repository Structure

```text
FranchiseOps-AI/
├── frontend/                   # Next.js 16 App Router Frontend
│   ├── app/
│   │   ├── page.tsx            # Main 11-step interactive dashboard console
│   │   ├── login/              # Authentication portal
│   │   ├── components/         # NotificationCenter, MapComponent, CompareModal
│   │   └── lib/                # Axios API configuration & utility helpers
│   ├── public/                 # Static assets
│   └── package.json
├── backend/                    # Node.js + Express REST API Server
│   ├── server.js               # Primary REST endpoints & business logic handlers
│   ├── db.js                   # SQLite3 pool connection for notification engine
│   ├── initNotificationDb.js   # Notification database schema initializer
│   ├── seed.js                 # Prisma database seeder
│   ├── prisma/
│   │   └── schema.prisma       # Prisma ORM domain schema
│   ├── services/
│   │   ├── eventDetector.js    # Ingestion & anomaly detection pipeline
│   │   ├── aiWorkflowEngine.js # AI decision & rule validation engine
│   │   ├── channelService.js   # Multi-channel notification dispatcher (Push/Email/SMS)
│   │   ├── actionPlanService.js# Action plan generation & SLA tracking
│   │   ├── escalationEngine.js # Hierarchical escalation engine
│   │   └── backgroundWorker.js # 15-second non-blocking SLA monitoring worker
│   └── package.json
└── README.md                   # Platform documentation
```

---

## 📜 License

This project is licensed under the ISC License.
