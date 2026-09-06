"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "./lib/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import MapComponent from "./components/MapComponent";
import CompareModal from "./components/CompareModal";
import AuthModal from "./components/AuthModal";
import NotificationCenter from "./components/NotificationCenter";
import NotificationDashboard from "./components/NotificationDashboard";
import { useAuth } from "./context/AuthContext";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  Workflow: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Trend: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Database: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Location: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Brain: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Sparkle: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  TrendUp: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
    </svg>
  ),
  TrendDown: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
    </svg>
  ),
  Stable: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  ),
  Inventory: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Staff: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Marketing: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  Audit: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Intelligence: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Recommend: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 003.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

const WORKFLOW_STEPS = [
  { id: 1,  name: "Franchise Data",           icon: "Database",      category: "input",  desc: "Aggregates sales logs, inventory status, staff shifts, marketing spends, and store audit logs.", active: false },
  { id: 2,  name: "Data Validation",          icon: "Check",         category: "process",desc: "Validates schema compliance, handles missing values, cleans transaction records, and processes inputs.", active: false },
  { id: 3,  name: "Outlet Performance Agent", icon: "Trend",         category: "agent",  desc: "Monitors sales, health scores, map location comparisons, and identifies underperforming stores.", active: true },
  { id: 4,  name: "Inventory Agent",          icon: "Inventory",     category: "agent",  desc: "Tracks stock levels, calculates depletion rates, predicts stockouts, and automates replenishment.", active: false },
  { id: 5,  name: "Staff Agent",              icon: "Staff",         category: "agent",  desc: "Analyzes staff efficiency, generates automated shifts, and optimizes staffing against sales trends.", active: false },
  { id: 6,  name: "Marketing Agent",          icon: "Marketing",     category: "agent",  desc: "Computes campaign ROI, tracks promotion conversions, and optimizes discount allocations.", active: false },
  { id: 7,  name: "Audit Agent",              icon: "Audit",         category: "agent",  desc: "Validates compliance with brand guidelines, analyzes safety audits, and flags non-compliance.", active: false },
  { id: 8,  name: "Franchise Intelligence",   icon: "Intelligence",  category: "engine", desc: "Fuses domain-specific insights into a centralized reasoning engine to find correlations.", active: false },
  { id: 9,  name: "Business Recommendations", icon: "Recommend",     category: "engine", desc: "Generates actionable strategy recommendations for managers to reduce costs and boost sales.", active: false },
  { id: 10, name: "Dashboard & Alerts",       icon: "Dashboard",     category: "output", desc: "Serves high-level summaries for the franchisor and triggers real-time alerts for critical anomalies.", active: false },
  { id: 11, name: "AI Notifications & Workflows", icon: "Alert",     category: "agent",  desc: "Agentic AI notification engine, SLA monitoring, multi-channel dispatch, and automated escalation workflows.", active: false },
];

// Base URL is configured in lib/api.ts

interface AiInsight {
  title: string;
  value: string;
  subtext: string;
  tag: string;
  tagColor: string;
  icon: "TrendUp" | "TrendDown" | "Stable" | "Warning" | "Sparkle";
}

function computeLinearRegressionSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  values.forEach((y, x) => {
    sumX  += x;
    sumY  += y;
    sumXY += x * y;
    sumX2 += x * x;
  });
  const denom = n * sumX2 - sumX * sumX;
  return denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
}

function computeCV(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  return (Math.sqrt(variance) / mean) * 100;
}

function computeAiInsights(
  trendsData: any[],
  salesRecords: any[],
  outletName: string
): AiInsight[] {
  if (trendsData.length < 3) return [];

  const revenues = trendsData.map((d: any) => d.grossRevenue as number);
  const insights: AiInsight[] = [];
  const n = revenues.length;

  const revenueSlope = computeLinearRegressionSlope(revenues);
  const slopePercent = revenues[0] > 0 ? (revenueSlope / revenues[0]) * 100 : 0;
  const momentumLabel =
    slopePercent >  1.5 ? "Strong Uptrend"  :
    slopePercent > -1.5 ? "Stable Trend"    : "Declining Trend";
  const momentumIcon: AiInsight["icon"] =
    slopePercent >  1.5 ? "TrendUp"  :
    slopePercent > -1.5 ? "Stable"   : "TrendDown";
  const momentumColor =
    slopePercent >  1.5 ? "bg-emerald-100 text-emerald-700" :
    slopePercent > -1.5 ? "bg-blue-100 text-blue-700"       : "bg-red-100 text-red-700";

  insights.push({
    title:    "Revenue Momentum",
    value:    `${slopePercent >= 0 ? "+" : ""}${slopePercent.toFixed(2)}% / day`,
    subtext:  `Linear regression slope β₁ = ₹${revenueSlope.toFixed(0)}/day across ${n} days. ${momentumLabel} detected for ${outletName}.`,
    tag:      momentumLabel,
    tagColor: momentumColor,
    icon:     momentumIcon,
  });

  const revCV = computeCV(revenues);
  const stabilityLabel = revCV < 15 ? "Low Volatility" : revCV < 30 ? "Moderate Fluctuation" : "High Variance";
  const stabilityColor = revCV < 15 ? "bg-emerald-100 text-emerald-700" : revCV < 30 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
  insights.push({
    title:    "Sales Stability (CV)",
    value:    `${revCV.toFixed(1)}% CV`,
    subtext:  `Coefficient of variation σ/μ = ${revCV.toFixed(1)}%. Lower score indicates predictable store demand pattern.`,
    tag:      stabilityLabel,
    tagColor: stabilityColor,
    icon:     revCV < 15 ? "Sparkle" : "Warning",
  });

  const half = Math.floor(n / 2);
  const h1Rev = revenues.slice(0, half).reduce((a, b) => a + b, 0);
  const h2Rev = revenues.slice(half).reduce((a, b) => a + b, 0);
  const momGrowth = h1Rev > 0 ? ((h2Rev - h1Rev) / h1Rev) * 100 : 0;
  insights.push({
    title:    "Period Growth (H2 vs H1)",
    value:    `${momGrowth >= 0 ? "+" : ""}${momGrowth.toFixed(1)}%`,
    subtext:  `Total revenue in second half of window vs first half. ${momGrowth >= 0 ? "Expansion" : "Contraction"} phase.`,
    tag:      momGrowth >= 0 ? "Positive Growth" : "Revenue Drop",
    tagColor: momGrowth >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
    icon:     momGrowth >= 0 ? "TrendUp" : "TrendDown",
  });

  return insights;
}

function getTabClass(tabName: string, isActive: boolean) {
  if (isActive) {
    return "bg-[#152033] text-white shadow-md font-bold px-3.5 py-2 text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all border border-slate-800";
  }
  return "bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold px-3.5 py-2 text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all border border-transparent";
}

export default function OperationsDashboard() {
  const [activeStepId, setActiveStepId] = useState<number>(3);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [performanceSubTab, setPerformanceSubTab] = useState<"overview" | "map" | "health" | "underperforming" | "logs">("overview");
  const [inventorySubTab, setInventorySubTab] = useState<"roster" | "ai" | "reorders">("roster");
  const [staffSubTab, setStaffSubTab] = useState<"roster" | "ai" | "shifts" | "performers" | "underperformers" | "allocate">("roster");
  const [intelligenceSubTab, setIntelligenceSubTab] = useState<"overview" | "health" | "risks" | "opportunities" | "recommendations">("risks");


  // Data States
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [salesList, setSalesList] = useState<any[]>([]);
  const [mapLocations, setMapLocations] = useState<any[]>([]);
  const [healthScores, setHealthScores] = useState<any[]>([]);
  const [underperformingStores, setUnderperformingStores] = useState<any[]>([]);

  // Page Segmentation / Pagination State for Sales Records Table
  const [salesPage, setSalesPage] = useState<number>(1);
  const [salesPageSize, setSalesPageSize] = useState<number>(10);
  const [totalSalesRecords, setTotalSalesRecords] = useState<number>(0);

  // Stock Inventory State & Pagination
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [inventoryInsights, setInventoryInsights] = useState<any>(null);
  const [invPage, setInvPage] = useState<number>(1);
  const [invPageSize, setInvPageSize] = useState<number>(8);

  // Staff Agent State & Pagination
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [staffInsights, setStaffInsights] = useState<any>(null);
  const [staffPerformers, setStaffPerformers] = useState<any>(null);
  const [staffPage, setStaffPage] = useState<number>(1);
  const [staffPageSize, setStaffPageSize] = useState<number>(8);

  // Job Allocation State
  const [allocatingStaffId, setAllocatingStaffId] = useState<number | null>(null);
  const [allocatingJob, setAllocatingJob] = useState<string>("");
  const [allocatingShift, setAllocatingShift] = useState<string>("");
  const [allocatingLoginTime, setAllocatingLoginTime] = useState<string>("");
  const [allocatingLogoffTime, setAllocatingLogoffTime] = useState<string>("");
  const [allocationSuccess, setAllocationSuccess] = useState<string | null>(null);

  // Marketing Agent States
  const [marketingSubTab, setMarketingSubTab] = useState<"overview" | "powerbi" | "ai" | "recommendations">("overview");
  const [marketingKpis, setMarketingKpis] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [aiSegments, setAiSegments] = useState<any>(null);
  const [aiSentiment, setAiSentiment] = useState<any>(null);
  const [aiForecast, setAiForecast] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [predictBudget, setPredictBudget] = useState<number>(25000);
  const [predictChannel, setPredictChannel] = useState<string>("Social Media");
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [applyingRecId, setApplyingRecId] = useState<number | null>(null);
  const [rerunningAi, setRerunningAi] = useState<boolean>(false);

  // Audit Agent States
  const [auditSubTab, setAuditSubTab] = useState<"sessions" | "checklist" | "inventory" | "pos" | "shifts" | "incidents" | "anomalies" | "report">("sessions");
  const [auditSessions, setAuditSessions] = useState<any[]>([]);
  const [auditInventoryVariance, setAuditInventoryVariance] = useState<any>(null);
  const [auditPosDiscrepancies, setAuditPosDiscrepancies] = useState<any>(null);
  const [auditShiftVerification, setAuditShiftVerification] = useState<any>(null);
  const [auditIncidents, setAuditIncidents] = useState<any>(null);
  const [auditAnomalies, setAuditAnomalies] = useState<any>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [activeAuditSessionId, setActiveAuditSessionId] = useState<number | null>(null);
  const [activeAuditSession, setActiveAuditSession] = useState<any>(null);
  const [auditSessionLoading, setAuditSessionLoading] = useState(false);
  const [newAuditForm, setNewAuditForm] = useState({ outletId: "", auditorName: "", auditDate: "", notes: "" });
  const [creatingAudit, setCreatingAudit] = useState(false);
  const [checklistUpdating, setChecklistUpdating] = useState<number | null>(null);

  // Intelligence Engine States
  const [intelligenceConsolidated, setIntelligenceConsolidated] = useState<any>(null);
  const [intelligenceHealthScores, setIntelligenceHealthScores] = useState<any[]>([]);
  const [intelligenceRisks, setIntelligenceRisks] = useState<any>(null);
  const [intelligenceOpportunities, setIntelligenceOpportunities] = useState<any>(null);
  const [intelligenceRecommendations, setIntelligenceRecommendations] = useState<any>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);

  // Intelligence Health Score Simulator States
  const [simulatedOutletId, setSimulatedOutletId] = useState<number | null>(null);
  const [simulatedRevenue, setSimulatedRevenue] = useState<number>(500000);
  const [simulatedMargin, setSimulatedMargin] = useState<number>(20);
  const [simulatedStockIssues, setSimulatedStockIssues] = useState<number>(0);
  const [simulatedStaffRating, setSimulatedStaffRating] = useState<number>(4.0);
  const [simulatedAuditScore, setSimulatedAuditScore] = useState<number>(75);
  const [simulatedOrders, setSimulatedOrders] = useState<number>(2500);


  // UI / Modal States
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);

  // Dashboard & Alerts (Step 10) States
  const [alertFilter, setAlertFilter] = useState<"All" | "Critical" | "High" | "Medium">("All");
  const [comparisonTab, setComparisonTab] = useState<"Health" | "Revenue" | "Margin" | "Audit">("Health");
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<number>>(new Set());

  // ── Auth: use global context, redirect if not authenticated ──
  const { currentUser, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [authLoading, currentUser, router]);

  useEffect(() => {
    api
      .get("/outlets")
      .then((res) => {
        setOutlets(res.data);
        if (res.data.length >= 2) {
          setSelectedLocationIds([res.data[0].id, res.data[1].id]);
        }
      })
      .catch((err) => console.error("Error loading outlets:", err));
  }, []);

  useEffect(() => {
    if (activeStepId === 3) {
      setLoading(true);
      const params = {
        outletId: selectedOutlet,
        startDate,
        endDate,
        limit: salesPageSize,
        offset: (salesPage - 1) * salesPageSize
      };

      Promise.all([
        api.get("/sales/summary", { params: { outletId: selectedOutlet, startDate, endDate } }),
        api.get("/sales/trends", { params: { outletId: selectedOutlet, startDate, endDate } }),
        api.get("/sales/list", { params }),
        api.get("/outlets/locations"),
        api.get("/outlets/health-scores"),
        api.get("/outlets/underperforming")
      ])
        .then(([sumRes, trendRes, listRes, mapRes, healthRes, underRes]) => {
          setSummary(sumRes.data);
          setTrends(trendRes.data);
          setSalesList(listRes.data.records);
          setTotalSalesRecords(listRes.data.pagination.total);
          setMapLocations(mapRes.data);
          setHealthScores(healthRes.data);
          setUnderperformingStores(underRes.data);
        })
        .catch((err) => console.error("Error fetching performance agent data:", err))
        .finally(() => setLoading(false));
    }
  }, [activeStepId, selectedOutlet, startDate, endDate, salesPage, salesPageSize]);

  useEffect(() => {
    if (activeStepId === 4) {
      setLoading(true);
      const params = { outletId: selectedOutlet };

      Promise.all([
        api.get("/inventory", { params }),
        api.get("/inventory/agent-insights", { params })
      ])
        .then(([invRes, insightRes]) => {
          setInventoryItems(invRes.data);
          setInventoryInsights(insightRes.data);
        })
        .catch((err) => console.error("Error fetching inventory data:", err))
        .finally(() => setLoading(false));
    }
  }, [activeStepId, selectedOutlet]);

  useEffect(() => {
    if (activeStepId === 5) {
      setLoading(true);
      const params = { outletId: selectedOutlet };

      Promise.all([
        api.get("/staff", { params }),
        api.get("/staff/agent-insights", { params }),
        api.get("/staff/performers", { params })
      ])
        .then(([staffRes, insightRes, performersRes]) => {
          setStaffMembers(staffRes.data);
          setStaffInsights(insightRes.data);
          setStaffPerformers(performersRes.data);
        })
        .catch((err) => console.error("Error fetching staff data:", err))
        .finally(() => setLoading(false));
    }
  }, [activeStepId, selectedOutlet]);

  // Marketing Agent API Effect
  useEffect(() => {
    if (activeStepId === 6) {
      setLoading(true);
      Promise.all([
        api.get("/marketing/kpis"),
        api.get("/marketing/campaigns"),
        api.get("/marketing/ai/segmentation"),
        api.get("/marketing/ai/sentiment"),
        api.get("/marketing/ai/forecast"),
        api.get("/marketing/ai/recommendations")
      ])
        .then(([kpisRes, campaignsRes, segRes, sentRes, foreRes, recRes]) => {
          setMarketingKpis(kpisRes.data);
          setCampaigns(campaignsRes.data);
          setAiSegments(segRes.data);
          setAiSentiment(sentRes.data);
          setAiForecast(foreRes.data);
          setAiRecommendations(recRes.data);
        })
        .catch((err) => console.error("Error loading marketing data:", err))
        .finally(() => setLoading(false));
    }
  }, [activeStepId]);

  // Audit Agent API Effect
  useEffect(() => {
    if (activeStepId === 7) {
      setAuditLoading(true);
      Promise.all([
        api.get("/audit/sessions"),
        api.get("/audit/inventory-variance"),
        api.get("/audit/pos-discrepancies"),
        api.get("/audit/shift-verification"),
        api.get("/audit/incidents"),
        api.get("/audit/anomalies"),
      ])
        .then(([sessRes, invRes, posRes, shiftRes, incRes, anomRes]) => {
          setAuditSessions(sessRes.data);
          setAuditInventoryVariance(invRes.data);
          setAuditPosDiscrepancies(posRes.data);
          setAuditShiftVerification(shiftRes.data);
          setAuditIncidents(incRes.data);
          setAuditAnomalies(anomRes.data);
        })
        .catch((err) => console.error("Error loading audit data:", err))
        .finally(() => setAuditLoading(false));
    }
  }, [activeStepId, selectedOutlet]);

  // Intelligence Engine API Effect
  useEffect(() => {
    if ([8, 9, 10].includes(activeStepId)) {
      setIntelligenceLoading(true);
      Promise.all([
        api.get("/intelligence/consolidate"),
        api.get("/intelligence/health-scores"),
        api.get("/intelligence/risks"),
        api.get("/intelligence/opportunities"),
        api.get("/intelligence/recommendations"),
      ])
        .then(([conRes, healthRes, riskRes, oppRes, recRes]) => {
          setIntelligenceConsolidated(conRes.data);
          setIntelligenceHealthScores(healthRes.data);
          setIntelligenceRisks(riskRes.data);
          setIntelligenceOpportunities(oppRes.data);
          setIntelligenceRecommendations(recRes.data);

          if (conRes.data && conRes.data.outlets && conRes.data.outlets.length > 0) {
            const first = conRes.data.outlets[0];
            setSimulatedOutletId(first.outletId);
            setSimulatedRevenue(first.agentOutputs.sales.revenue);
            setSimulatedMargin(first.agentOutputs.sales.margin);
            setSimulatedStockIssues(first.agentOutputs.inventory.criticalStock + first.agentOutputs.inventory.lowStock);
            setSimulatedStaffRating(first.agentOutputs.staff.avgRating);
            setSimulatedAuditScore(first.agentOutputs.audit.avgScore || 75);
            setSimulatedOrders(first.agentOutputs.sales.orders);
          }
        })
        .catch((err) => console.error("Error loading intelligence data:", err))
        .finally(() => setIntelligenceLoading(false));
    }
  }, [activeStepId]);


  const handleLoadAuditSession = async (sessionId: number) => {
    setActiveAuditSessionId(sessionId);
    setAuditSessionLoading(true);
    try {
      const res = await api.get(`/audit/sessions/${sessionId}`);
      setActiveAuditSession(res.data);
    } catch (err) {
      console.error("Error loading session detail:", err);
    } finally {
      setAuditSessionLoading(false);
    }
  };

  const handleCreateAuditSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditForm.outletId || !newAuditForm.auditorName || !newAuditForm.auditDate) {
      alert("Please fill in all required fields.");
      return;
    }
    setCreatingAudit(true);
    try {
      const res = await api.post("/audit/sessions", {
        outletId: parseInt(newAuditForm.outletId, 10),
        auditorName: newAuditForm.auditorName,
        auditDate: newAuditForm.auditDate,
        notes: newAuditForm.notes,
      });
      // Load the new session immediately
      await handleLoadAuditSession(res.data.sessionId);
      setAuditSubTab("checklist");
      setNewAuditForm({ outletId: "", auditorName: "", auditDate: "", notes: "" });
      // Refresh sessions list
      const sessRes = await api.get("/audit/sessions");
      setAuditSessions(sessRes.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create audit session.");
    } finally {
      setCreatingAudit(false);
    }
  };

  const handleUpdateChecklistItem = async (itemId: number, answer: string, notes?: string) => {
    setChecklistUpdating(itemId);
    try {
      await api.put(`/audit/checklist-items/${itemId}`, { answer, notes });
      if (activeAuditSession) {
        setActiveAuditSession((prev: any) => ({
          ...prev,
          checklist_items: prev.checklist_items.map((item: any) =>
            item.id === itemId ? { ...item, answer, notes: notes || item.notes } : item
          ),
        }));
      }
    } catch (err) {
      console.error("Error updating checklist item:", err);
    } finally {
      setChecklistUpdating(null);
    }
  };

  const handleCompleteAuditSession = async (sessionId: number) => {
    try {
      const res = await api.post(`/audit/sessions/${sessionId}/complete`, {});
      alert(`Audit completed! Score: ${res.data.overallScore}/100 — ${res.data.passFail}`);
      await handleLoadAuditSession(sessionId);
      const sessRes = await api.get("/audit/sessions");
      setAuditSessions(sessRes.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to complete audit session.");
    }
  };

  const handleUpdateIncident = async (incidentId: number, status: string) => {
    try {
      await api.put(`/audit/incidents/${incidentId}`, {
        status,
        resolvedDate: status === "Resolved" ? new Date().toISOString().slice(0, 10) : null,
      });
      const incRes = await api.get("/audit/incidents");
      setAuditIncidents(incRes.data);
    } catch (err) {
      console.error("Error updating incident:", err);
    }
  };

  const handleApplyRecommendation = async (rec: any) => {
    setApplyingRecId(rec.id);
    try {
      const res = await api.post("/marketing/recommendations/apply", {
        reallocation_details: rec.reallocation_details,
        campaign_id: rec.campaign_id
      });
      alert(res.data.message || "Recommendation applied successfully!");
      // Reload states
      setLoading(true);
      const [kpisRes, campaignsRes, recRes] = await Promise.all([
        api.get("/marketing/kpis"),
        api.get("/marketing/campaigns"),
        api.get("/marketing/ai/recommendations")
      ]);
      setMarketingKpis(kpisRes.data);
      setCampaigns(campaignsRes.data);
      setAiRecommendations(recRes.data);
    } catch (err: any) {
      console.error("Error applying recommendation:", err);
      alert(err.response?.data?.error || "Error applying recommendation");
    } finally {
      setApplyingRecId(null);
      setLoading(false);
    }
  };

  const handlePredictCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setRerunningAi(true);
    try {
      const res = await api.post("/marketing/ai/predict", {
        budget: Number(predictBudget),
        channel: predictChannel
      });
      setPredictionResult(res.data);
    } catch (err: any) {
      console.error("Error predicting campaign:", err);
      alert("Failed to predict campaign success.");
    } finally {
      setRerunningAi(false);
    }
  };

  const handleAllocateJob = async (staffId: number) => {
    if (!allocatingJob) return;
    try {
      await api.put(`/staff/${staffId}/allocate-job`, {
        assignedJob: allocatingJob,
        shiftType: allocatingShift || undefined,
        loginTime: allocatingLoginTime || undefined,
        logoffTime: allocatingLogoffTime || undefined
      });
      setAllocationSuccess(`Job successfully allocated!`);
      setAllocatingStaffId(null);
      setAllocatingJob("");
      setAllocatingShift("");
      setAllocatingLoginTime("");
      setAllocatingLogoffTime("");
      // Refresh staff data
      const params = { outletId: selectedOutlet };
      const [staffRes, performersRes] = await Promise.all([
        api.get("/staff", { params }),
        api.get("/staff/performers", { params })
      ]);
      setStaffMembers(staffRes.data);
      setStaffPerformers(performersRes.data);
      setTimeout(() => setAllocationSuccess(null), 3000);
    } catch (err) {
      console.error("Error allocating job:", err);
    }
  };

  const activeOutletName = useMemo(() => {
    if (selectedOutlet === "all") return "All Outlets";
    const found = outlets.find((o) => o.id === parseInt(selectedOutlet, 10));
    return found ? `${found.city} (${found.outlet_name})` : "Selected Outlet";
  }, [selectedOutlet, outlets]);

  const aiInsights = useMemo(() => {
    return computeAiInsights(trends, salesList, activeOutletName);
  }, [trends, salesList, activeOutletName]);

  const paymentSplitData = useMemo(() => {
    if (!summary || !summary.paymentSplit) return [];
    return [
      { name: "UPI", value: summary.paymentSplit.upi, color: "#10b981" },
      { name: "Card", value: summary.paymentSplit.card, color: "#4f46e5" },
      { name: "Cash", value: summary.paymentSplit.cash, color: "#f59e0b" },
    ];
  }, [summary]);

  const storeComparisonData = useMemo(() => {
    if (!healthScores) return [];
    return healthScores.map(hs => ({
      name: hs.outletName,
      Revenue: hs.metrics.revenue,
      Profit: hs.metrics.profit,
    }));
  }, [healthScores]);

  const inventoryCategoryData = useMemo(() => {
    if (!inventoryItems || inventoryItems.length === 0) return [];
    const counts: { [key: string]: number } = {};
    inventoryItems.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + (item.currentStock * item.unitPrice);
    });
    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6"];
    return Object.keys(counts).map((category, idx) => ({
      name: category,
      value: Math.round(counts[category]),
      color: colors[idx % colors.length]
    }));
  }, [inventoryItems]);

  const inventoryThresholdData = useMemo(() => {
    if (!inventoryItems || inventoryItems.length === 0) return [];
    const lowStockItems = inventoryItems
      .filter(item => item.status === "Critical" || item.status === "Low Stock" || item.currentStock <= item.minThreshold * 1.5)
      .slice(0, 10);
    const displayItems = lowStockItems.length > 0 ? lowStockItems : inventoryItems.slice(0, 8);
    return displayItems.map(item => ({
      name: `${item.itemName} (${item.city.slice(0,3)})`,
      Stock: item.currentStock,
      MinThreshold: item.minThreshold,
    }));
  }, [inventoryItems]);

  const staffPerformanceData = useMemo(() => {
    if (!staffMembers || staffMembers.length === 0) return [];
    const sorted = [...staffMembers].sort((a, b) => b.performanceRating - a.performanceRating).slice(0, 10);
    return sorted.map(s => ({
      name: s.name,
      Rating: s.performanceRating,
    }));
  }, [staffMembers]);

  const staffShiftDistributionData = useMemo(() => {
    if (!staffInsights || !staffInsights.summary || !staffInsights.summary.shiftDistribution) return [];
    const dist = staffInsights.summary.shiftDistribution;
    return [
      { name: "Morning", value: dist.Morning || 0, color: "#f59e0b" },
      { name: "Evening", value: dist.Evening || 0, color: "#3b82f6" },
      { name: "Night", value: dist.Night || 0, color: "#4f46e5" },
    ];
  }, [staffInsights]);

  const campaignBudgetVsRevenueData = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return [];
    return campaigns.map(c => {
      const rep = c.roi_reports[0] || { total_spend: c.budget, attributed_revenue: 0 };
      return {
        name: c.name.length > 12 ? c.name.slice(0, 10) + ".." : c.name,
        Spend: rep.total_spend,
        Revenue: rep.attributed_revenue
      };
    });
  }, [campaigns]);

  const auditComplianceData = useMemo(() => {
    if (!auditSessions) return [];
    return auditSessions
      .filter((s: any) => s.passFail !== "Pending")
      .map((s: any) => ({
        name: s.outletName.length > 12 ? s.outletName.slice(0, 10) + ".." : s.outletName,
        Score: s.overallScore,
        Hygiene: s.hygieneScore,
        FoodSafety: s.foodSafetyScore,
      }));
  }, [auditSessions]);

  const recommendationsPriorityData = useMemo(() => {
    if (!intelligenceRecommendations || !intelligenceRecommendations.recommendations) return [];
    let p1 = 0, p2 = 0, p3 = 0;
    intelligenceRecommendations.recommendations.forEach((r: any) => {
      if (r.priority === "P1" || r.priority?.includes("P1")) p1++;
      else if (r.priority === "P2" || r.priority?.includes("P2")) p2++;
      else p3++;
    });
    return [
      { name: "P1 Critical", value: p1, color: "#ef4444" },
      { name: "P2 High", value: p2, color: "#f59e0b" },
      { name: "P3 Medium", value: p3, color: "#3b82f6" },
    ].filter(d => d.value > 0);
  }, [intelligenceRecommendations]);

  const recommendationsCategoryData = useMemo(() => {
    if (!intelligenceRecommendations || !intelligenceRecommendations.recommendations) return [];
    const counts: { [key: string]: number } = {};
    intelligenceRecommendations.recommendations.forEach((r: any) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];
    return Object.keys(counts).map((category, idx) => ({
      name: category,
      value: counts[category],
      color: colors[idx % colors.length]
    }));
  }, [intelligenceRecommendations]);

  // Dashboard & Alerts computed data
  const outletComparisonData = useMemo(() => {
    if (!intelligenceConsolidated?.outlets) return [];
    return intelligenceConsolidated.outlets.map((o: any) => ({
      name: o.outletName.length > 12 ? o.outletName.slice(0, 10) + ".." : o.outletName,
      Health: o.healthScore,
      Revenue: Math.round(o.agentOutputs.sales.revenue / 100000 * 10) / 10,
      Margin: Math.round(o.agentOutputs.sales.profit / Math.max(o.agentOutputs.sales.revenue, 1) * 100),
      Audit: o.agentOutputs.audit?.avgScore ?? 75,
    }));
  }, [intelligenceConsolidated]);

  const alertSeverityData = useMemo(() => {
    if (!intelligenceRecommendations?.recommendations) return [
      { name: "Critical", value: 0, fill: "#ef4444" },
      { name: "High", value: 0, fill: "#f97316" },
      { name: "Medium", value: 0, fill: "#eab308" },
    ];
    const recs = intelligenceRecommendations.recommendations;
    return [
      { name: "Critical", value: recs.filter((r: any) => r.priority === "P1").length, fill: "#ef4444" },
      { name: "High", value: recs.filter((r: any) => r.priority === "P2").length, fill: "#f97316" },
      { name: "Medium", value: recs.filter((r: any) => r.priority === "P3").length, fill: "#eab308" },
    ];
  }, [intelligenceRecommendations]);

  const agentPerformanceScores = useMemo(() => {
    if (!intelligenceConsolidated) return null;
    const ns = intelligenceConsolidated.networkSummary;
    const totalStock = (ns.criticalStockAlerts || 0) + (ns.lowStockAlerts || 0);
    const invScore = Math.max(0, Math.round(100 - totalStock * 7));
    const avgAudit = auditSessions.length > 0
      ? Math.round(auditSessions.filter((s: any) => s.passFail !== "Pending").reduce((acc: number, s: any) => acc + s.overallScore, 0) / Math.max(auditSessions.filter((s: any) => s.passFail !== "Pending").length, 1))
      : 70;
    const mktScore = Math.min(100, Math.round((ns.marketingRoas || 1) / 25 * 100));
    return {
      outlet: ns.avgHealthScore ?? 79,
      inventory: invScore,
      workforce: Math.round(Math.min(100, ((ns.avgStaffRating ?? 4.0) / 5) * 100)),
      marketing: mktScore,
      audit: avgAudit,
    };
  }, [intelligenceConsolidated, auditSessions]);

  const agentTrendData = useMemo(() => {
    // Build synthetic 5-checkpoint sparkline data per agent for trend visualization
    const base = agentPerformanceScores;
    if (!base) return null;
    const mkSeries = (final: number) => {
      const v = [final - 8, final - 5, final - 3, final - 1, final].map(n => Math.max(20, Math.min(100, n + (Math.random() * 4 - 2))));
      return [1, 2, 3, 4, 5].map((x, i) => ({ x, v: Math.round(v[i]) }));
    };
    return {
      outlet: mkSeries(base.outlet),
      inventory: mkSeries(base.inventory),
      workforce: mkSeries(base.workforce),
      marketing: mkSeries(base.marketing),
      audit: mkSeries(base.audit),
    };
  }, [agentPerformanceScores]);

  const filteredAlerts = useMemo(() => {
    if (!intelligenceRecommendations?.recommendations) return [];
    const recs = intelligenceRecommendations.recommendations;
    if (alertFilter === "All") return recs;
    const priorityMap: Record<string, string> = { Critical: "P1", High: "P2", Medium: "P3" };
    return recs.filter((r: any) => r.priority === priorityMap[alertFilter]);
  }, [intelligenceRecommendations, alertFilter]);

  // Franchise Health Score Simulator Memo
  const simulatedHealthScore = useMemo(() => {
    const financialScore  = Math.min(35, Math.max(0, (simulatedMargin / 45) * 35));
    const revenueScore    = Math.min(10, Math.max(0, (simulatedRevenue / 1500000) * 10));
    const inventoryScore  = Math.min(15, Math.max(0, 15 - simulatedStockIssues * 4));
    const staffScore      = Math.min(10, Math.max(0, ((simulatedStaffRating - 3.0) / 2.0) * 10));
    const complianceScore = Math.min(20, Math.max(0, (simulatedAuditScore / 100) * 20));
    const orderScore      = Math.min(10, Math.max(0, (simulatedOrders / 5000) * 10));
    const total = Math.round(financialScore + revenueScore + inventoryScore + staffScore + complianceScore + orderScore);
    const cappedTotal = Math.min(100, Math.max(0, total));

    let grade = 'F', gradeColor = 'bg-red-100 text-red-800 border-red-200';
    if (cappedTotal >= 90)      { grade = 'A+'; gradeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200'; }
    else if (cappedTotal >= 80) { grade = 'A';  gradeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200'; }
    else if (cappedTotal >= 70) { grade = 'B';  gradeColor = 'bg-blue-100 text-blue-800 border-blue-200'; }
    else if (cappedTotal >= 60) { grade = 'C';  gradeColor = 'bg-amber-100 text-amber-800 border-amber-200'; }
    else if (cappedTotal >= 50) { grade = 'D';  gradeColor = 'bg-orange-100 text-orange-800 border-orange-200'; }

    return { score: cappedTotal, grade, gradeColor };
  }, [simulatedMargin, simulatedRevenue, simulatedStockIssues, simulatedStaffRating, simulatedAuditScore, simulatedOrders]);

  // Franchise Benchmarking Outliers Memo
  const outliers = useMemo(() => {
    if (!intelligenceConsolidated || !intelligenceConsolidated.outlets || intelligenceConsolidated.outlets.length === 0) return null;
    const list = intelligenceConsolidated.outlets;
    
    let maxRev = list[0], maxMargin = list[0], maxAudit = list[0], minHealth = list[0];
    list.forEach((o: any) => {
      if (o.agentOutputs.sales.revenue > maxRev.agentOutputs.sales.revenue) maxRev = o;
      if (o.agentOutputs.sales.margin > maxMargin.agentOutputs.sales.margin) maxMargin = o;
      if (o.agentOutputs.audit.avgScore > maxAudit.agentOutputs.audit.avgScore) maxAudit = o;
      if (o.healthScore < minHealth.healthScore) minHealth = o;
    });

    return { maxRev, maxMargin, maxAudit, minHealth };
  }, [intelligenceConsolidated]);

  const handleToggleSelectLocation = (id: number) => {
    setSelectedLocationIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAuthSuccess = (user: any, token: string) => {
    // kept for compatibility — context handles state now
  };

  const handleSignOut = () => {
    logout();
    router.replace("/login");
  };

  const paginatedInventoryItems = useMemo(() => {
    const start = (invPage - 1) * invPageSize;
    return inventoryItems.slice(start, start + invPageSize);
  }, [inventoryItems, invPage, invPageSize]);

  const totalInvPages = Math.ceil(inventoryItems.length / invPageSize) || 1;

  const paginatedStaffMembers = useMemo(() => {
    const start = (staffPage - 1) * staffPageSize;
    return staffMembers.slice(start, start + staffPageSize);
  }, [staffMembers, staffPage, staffPageSize]);

  const totalStaffPages = Math.ceil(staffMembers.length / staffPageSize) || 1;

  const totalSalesPages = Math.ceil(totalSalesRecords / salesPageSize) || 1;

  // ── Auth Loading Guard ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-indigo-500/30">
            FO
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-white font-semibold text-sm">Loading your workspace…</p>
          <p className="text-slate-500 text-xs">Verifying session</p>
        </div>
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: "60%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* ─── Top Header Navbar ──────────────────────────────────────────────── */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-md text-white font-black text-xl tracking-tighter">
              FO
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>FranchiseOps AI</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Step {activeStepId} Active
                </span>
              </h1>
              <p className="text-xs text-slate-400">Enterprise Operations Intelligence Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 space-x-2">
              <span className="text-xs text-slate-400">Outlet:</span>
              <select
                value={selectedOutlet}
                onChange={(e) => {
                  setSelectedOutlet(e.target.value);
                  setSalesPage(1);
                  setInvPage(1);
                  setStaffPage(1);
                }}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-800 text-white">All Outlets</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id} className="bg-slate-800 text-white">
                    {o.city} ({o.outlet_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Bell Center */}
            <NotificationCenter onOpenDashboard={() => setActiveStepId(11)} />

            {currentUser ? (
              <div className="flex items-center space-x-3 bg-slate-800/80 px-3.5 py-1.5 rounded-2xl border border-slate-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-indigo-400 font-mono leading-tight">{currentUser.role}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-400 hover:text-red-400 font-medium pl-2 border-l border-slate-700 transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <Icons.User />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Content Layout ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* ── Static Sidebar: Agentic Workflow Navigation ─────────────────── */}
        <aside className="lg:col-span-3 h-full overflow-y-auto pb-6">
          <div
            className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl"
            style={{ background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)" }}
          >
            {/* Sidebar Header */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-700/50">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                >
                  FO
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-none">Agentic Pipeline</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">10-step AI workflow</p>
                </div>
                <div className="ml-auto flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
                </div>
              </div>
            </div>

            {/* Step Groups */}
            {([
              {
                label: "AI Agents & Workflows",
                color: "text-indigo-400",
                dot: "bg-indigo-500",
                ids: [3, 4, 5, 6, 7, 11],
              },
              {
                label: "Intelligence Engine",
                color: "text-violet-400",
                dot: "bg-violet-500",
                ids: [8, 9],
              },
              {
                label: "Output",
                color: "text-emerald-400",
                dot: "bg-emerald-500",
                ids: [10],
              },
            ] as Array<{ label: string; color: string; dot: string; ids: number[] }>).map((group) => (
              <div key={group.label} className="px-3 py-3">
                {/* Group Label */}
                <div className="flex items-center space-x-2 px-2 mb-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${group.dot}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${group.color}`}>
                    {group.label}
                  </span>
                </div>

                <nav className="space-y-0.5">
                  {WORKFLOW_STEPS.filter((s) => group.ids.includes(s.id)).map((step) => {
                    const IconComponent = (Icons as any)[step.icon] || Icons.Workflow;
                    const isActive = activeStepId === step.id;

                    return (
                      <button
                        key={step.id}
                        onClick={() => setActiveStepId(step.id)}
                        className={`w-full text-left px-2.5 py-2.5 rounded-xl transition-all duration-150 flex items-center space-x-3 cursor-pointer group relative overflow-hidden ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                        }`}
                        style={
                          isActive
                            ? { background: "linear-gradient(135deg, rgba(79,70,229,0.35), rgba(124,58,237,0.20))", border: "1px solid rgba(99,102,241,0.3)" }
                            : { border: "1px solid transparent" }
                        }
                      >
                        {/* Active left accent bar */}
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                            style={{ background: "linear-gradient(180deg, #818cf8, #a78bfa)" }}
                          />
                        )}

                        {/* Icon */}
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                            isActive
                              ? "text-indigo-200"
                              : "text-slate-500 group-hover:text-slate-300"
                          }`}
                          style={
                            isActive
                              ? { background: "rgba(99,102,241,0.25)" }
                              : { background: "rgba(148,163,184,0.07)" }
                          }
                        >
                          <span className="scale-75">
                            <IconComponent />
                          </span>
                        </span>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold leading-tight ${
                              isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                            }`}>
                              {step.name}
                            </span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className={`text-[10px] truncate mt-0.5 leading-tight ${
                            isActive ? "text-indigo-300/70" : "text-slate-600"
                          }`}>
                            {step.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}

            {/* Sidebar Footer */}
            <div className="mx-3 mb-3 p-3 rounded-xl border border-slate-700/50 space-y-2" style={{ background: "rgba(15,23,42,0.6)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Step</span>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">#{activeStepId} / 10</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1">
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${(activeStepId / 10) * 100}%`,
                    background: "linear-gradient(90deg, #4f46e5, #7c3aed)"
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-600 truncate">
                {WORKFLOW_STEPS.find((s) => s.id === activeStepId)?.name}
              </p>
            </div>
          </div>
        </aside>

        {/* Dynamic Main Workspace Tab Content */}
        <main className="lg:col-span-9 h-full overflow-y-auto pb-6 space-y-6">
          {/* STEP 3: OUTLET PERFORMANCE AGENT */}
          {activeStepId === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Feature Rendering Buttons Bar (In-section feature toggle to prevent overflow!) */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-wrap gap-2">
                <button
                  onClick={() => setPerformanceSubTab("overview")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    performanceSubTab === "overview" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>📊 Sales Overview & Trends</span>
                </button>
                <button
                  onClick={() => setPerformanceSubTab("map")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    performanceSubTab === "map" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>🗺️ Compare Locations (Map)</span>
                </button>
                <button
                  onClick={() => setPerformanceSubTab("health")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    performanceSubTab === "health" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>🏥 Health Scores (0-100)</span>
                </button>
                <button
                  onClick={() => setPerformanceSubTab("underperforming")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    performanceSubTab === "underperforming" ? "bg-rose-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>⚠️ Underperforming Stores ({underperformingStores.length})</span>
                </button>
                <button
                  onClick={() => setPerformanceSubTab("logs")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    performanceSubTab === "logs" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>📋 Daily Transaction Logs</span>
                </button>
              </div>

              {/* 1. SALES OVERVIEW & TRENDS SUB-TAB */}
              {performanceSubTab === "overview" && (
                <div className="space-y-4">
                  {summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-xs text-slate-500 font-medium">Gross Revenue</span>
                        <div className="text-xl font-black text-slate-900 mt-1">₹{summary.grossRevenue.toLocaleString('en-IN')}</div>
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center mt-1">
                          <Icons.TrendUp /> <span className="ml-1">+14.2% MoM</span>
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-xs text-slate-500 font-medium">Net Profit Margin</span>
                        <div className="text-xl font-black text-indigo-600 mt-1">{summary.profitMargin}%</div>
                        <span className="text-[11px] text-slate-500 mt-1 block">Net: ₹{summary.netProfit.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-xs text-slate-500 font-medium">Total Orders</span>
                        <div className="text-xl font-black text-slate-900 mt-1">{summary.totalOrders.toLocaleString('en-IN')}</div>
                        <span className="text-[11px] text-slate-500 mt-1 block">AOV: ₹{summary.averageOrderValue}</span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-xs text-slate-500 font-medium">Digital Payments</span>
                        <div className="text-xl font-black text-cyan-600 mt-1">
                          {(((summary.paymentSplit.upi + summary.paymentSplit.card) / (summary.grossRevenue || 1)) * 100).toFixed(1)}%
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">UPI + Card dominant</span>
                      </div>
                    </div>
                  )}

                  {aiInsights.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {aiInsights.map((ins, idx) => {
                        const IconComp = (Icons as any)[ins.icon] || Icons.Sparkle;
                        return (
                          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">{ins.title}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ins.tagColor}`}>
                                {ins.tag}
                              </span>
                            </div>
                            <div className="text-lg font-black text-slate-900 flex items-center space-x-1">
                              <IconComp />
                              <span>{ins.value}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug">{ins.subtext}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
                      <h3 className="text-base font-bold text-slate-900">Revenue & Operating Cost Daily Trends</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']} />
                            <Area type="monotone" dataKey="grossRevenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Gross Revenue" />
                            <Area type="monotone" dataKey="netProfit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
                      <h3 className="text-base font-bold text-slate-900">Payment Split</h3>
                      <div className="h-64 w-full">
                        {paymentSplitData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={paymentSplitData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={75}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {paymentSplitData.map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-slate-400">No payment data</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedOutlet === "all" && storeComparisonData.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-base font-bold text-slate-900">Outlet Sales & Profit Performance Comparison</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={storeComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']} />
                            <Legend />
                            <Bar dataKey="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Gross Revenue" />
                            <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Net Profit" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. COMPARE LOCATIONS MAP SUB-TAB */}
              {performanceSubTab === "map" && (
                <MapComponent
                  locations={mapLocations}
                  selectedLocationIds={selectedLocationIds}
                  onToggleSelectLocation={handleToggleSelectLocation}
                  onOpenCompare={() => setIsCompareModalOpen(true)}
                />
              )}

              {/* 3. OUTLET HEALTH SCORES SUB-TAB */}
              {performanceSubTab === "health" && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Franchise Outlet Health Score Engine</h3>
                      <p className="text-xs text-slate-500">Multi-factor algorithmic scores evaluating profitability, inventory stability, and staff efficiency</p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                      Network Score Avg: 76/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {healthScores.map((h) => (
                      <div key={h.outletId} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{h.outletName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${h.badgeColor}`}>
                            {h.badge}
                          </span>
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-black text-slate-900">{h.healthScore}</span>
                          <span className="text-xs text-slate-400">/ 100 score</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              h.healthScore >= 80 ? "bg-emerald-500" : h.healthScore >= 65 ? "bg-blue-500" : h.healthScore >= 50 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${h.healthScore}%` }}
                          ></div>
                        </div>
                        <div className="text-[11px] text-slate-500 flex justify-between pt-1">
                          <span>Margin: {h.metrics.profitMargin}%</span>
                          <span>Stock Alerts: {h.metrics.stockIssues}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. UNDERPERFORMING STORES DIAGNOSTIC SUB-TAB */}
              {performanceSubTab === "underperforming" && (
                <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-200 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 text-rose-700 font-bold text-base">
                    <Icons.Warning />
                    <span>Underperforming Store Diagnostic Flags & Action Plans</span>
                  </div>

                  {underperformingStores.map((store) => (
                    <div key={store.outletId} className="bg-white rounded-xl p-4 border border-rose-200 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{store.outletName} ({store.city})</h4>
                          <p className="text-xs text-red-600 font-semibold mt-0.5">Primary Issue: {store.primaryDiagnostic}</p>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full self-start">
                          Action Required
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div><span className="text-slate-400 block text-[10px]">Margin</span><span className="font-bold text-red-600">{store.metrics.profitMargin}%</span></div>
                        <div><span className="text-slate-400 block text-[10px]">Revenue</span><span className="font-bold text-slate-800">₹{store.metrics.revenue.toLocaleString('en-IN')}</span></div>
                        <div><span className="text-slate-400 block text-[10px]">Stock Alerts</span><span className="font-bold text-amber-600">{store.metrics.stockAlerts}</span></div>
                        <div><span className="text-slate-400 block text-[10px]">Staff Rating</span><span className="font-bold text-slate-800">{store.metrics.staffRating}/5.0</span></div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-700 block mb-1">AI Turnaround Action Plan:</span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                          {store.actionPlan.map((act: string, idx: number) => (
                            <li key={idx} className="flex items-start space-x-1.5 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
                              <span className="text-indigo-600 font-bold shrink-0">✓</span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. DAILY TRANSACTION LOGS SUB-TAB (PAGE SEGMENTATION) */}
              {performanceSubTab === "logs" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Daily Sales Transaction Ledger</h3>
                      <p className="text-xs text-slate-500">Historical transaction log with page segmentation</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Rows per page:</span>
                      <select
                        value={salesPageSize}
                        onChange={(e) => {
                          setSalesPageSize(parseInt(e.target.value, 10));
                          setSalesPage(1);
                        }}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-800 cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-900 uppercase font-semibold text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Outlet</th>
                          <th className="py-3 px-4">Orders</th>
                          <th className="py-3 px-4">Gross Revenue</th>
                          <th className="py-3 px-4">Operating Cost</th>
                          <th className="py-3 px-4">Net Profit</th>
                          <th className="py-3 px-4">AOV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {salesList.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-semibold text-slate-900">{row.saleDate}</td>
                            <td className="py-3 px-4 text-slate-700">{row.city} ({row.outletName})</td>
                            <td className="py-3 px-4 text-slate-800 font-medium">{row.totalOrders}</td>
                            <td className="py-3 px-4 font-bold text-emerald-600">₹{row.grossRevenue.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 text-slate-600">₹{row.operatingCost.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 font-bold text-cyan-600">₹{row.netProfit.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 text-slate-800">₹{row.averageOrderValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Page Segmentation Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Showing <strong className="text-slate-800">{(salesPage - 1) * salesPageSize + 1}</strong> to{" "}
                      <strong className="text-slate-800">{Math.min(salesPage * salesPageSize, totalSalesRecords)}</strong> of{" "}
                      <strong className="text-slate-800">{totalSalesRecords}</strong> records
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSalesPage((p) => Math.max(1, p - 1))}
                        disabled={salesPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                      >
                        <Icons.ChevronLeft />
                        <span>Previous</span>
                      </button>

                      <span className="font-semibold text-slate-800 px-2">
                        Page {salesPage} of {totalSalesPages}
                      </span>

                      <button
                        onClick={() => setSalesPage((p) => Math.min(totalSalesPages, p + 1))}
                        disabled={salesPage >= totalSalesPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Next</span>
                        <Icons.ChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: STOCK INVENTORY AGENT */}
          {activeStepId === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Feature Rendering Buttons Bar */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-wrap gap-2">
                <button
                  onClick={() => setInventorySubTab("roster")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    inventorySubTab === "roster" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>📦 Stock Inventory Table</span>
                </button>
                <button
                  onClick={() => setInventorySubTab("ai")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    inventorySubTab === "ai" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>🤖 AI Stock Depletion Forecast</span>
                </button>
                <button
                  onClick={() => setInventorySubTab("reorders")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    inventorySubTab === "reorders" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>📑 Reorder Purchase Orders</span>
                </button>
              </div>

              {inventoryInsights?.summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Monitored Items</span>
                    <div className="text-xl font-black text-slate-900 mt-1">{inventoryInsights.summary.totalItems} Items</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Total Valuation</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">₹{inventoryInsights.summary.totalValuation.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Stock Risk Alerts</span>
                    <div className="text-xl font-black text-amber-600 mt-1">
                      {inventoryInsights.summary.criticalItems + inventoryInsights.summary.lowStockItems} Low
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Health Index</span>
                    <div className="text-xl font-black text-indigo-600 mt-1">{inventoryInsights.summary.healthIndex}%</div>
                  </div>
                </div>
              )}

              {/* 1. STOCK INVENTORY ROSTER SUB-TAB (PAGE SEGMENTATION) */}
              {inventorySubTab === "roster" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
                      <h3 className="text-base font-bold text-slate-900">Stock Safety Level Check</h3>
                      <p className="text-xs text-slate-500">Current stock compared against minimum safety thresholds</p>
                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={inventoryThresholdData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Stock" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Current Stock" />
                            <Bar dataKey="MinThreshold" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Min Threshold" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
                      <h3 className="text-base font-bold text-slate-900">Stock Capital Breakdown</h3>
                      <p className="text-xs text-slate-500">Capital value of inventory categories</p>
                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={inventoryCategoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {inventoryCategoryData.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Valuation']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Store Stock Inventory Roster</h3>
                      <p className="text-xs text-slate-500">Live item stock levels and reorder parameters</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Items per page:</span>
                      <select
                        value={invPageSize}
                        onChange={(e) => { setInvPageSize(parseInt(e.target.value, 10)); setInvPage(1); }}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-800 cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-900 uppercase font-semibold text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Item Name</th>
                          <th className="py-3 px-4">Outlet</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Current Stock</th>
                          <th className="py-3 px-4">Unit Price</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {paginatedInventoryItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900">{item.itemName}</td>
                            <td className="py-3 px-4 text-slate-600">{item.city} ({item.outletName})</td>
                            <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">{item.category}</span></td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{item.currentStock} {item.unit}</td>
                            <td className="py-3 px-4 text-slate-700">₹{item.unitPrice}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                item.status === 'Critical' ? "bg-red-100 text-red-800" : item.status === 'Low Stock' ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Showing <strong className="text-slate-800">{(invPage - 1) * invPageSize + 1}</strong> to{" "}
                      <strong className="text-slate-800">{Math.min(invPage * invPageSize, inventoryItems.length)}</strong> of{" "}
                      <strong className="text-slate-800">{inventoryItems.length}</strong> items
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setInvPage((p) => Math.max(1, p - 1))}
                        disabled={invPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                      >
                        <Icons.ChevronLeft />
                        <span>Previous</span>
                      </button>

                      <span className="font-semibold text-slate-800 px-2">
                        Page {invPage} of {totalInvPages}
                      </span>

                      <button
                        onClick={() => setInvPage((p) => Math.min(totalInvPages, p + 1))}
                        disabled={invPage >= totalInvPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Next</span>
                        <Icons.ChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* 2. AI DEPLETION FORECAST SUB-TAB */}
              {inventorySubTab === "ai" && inventoryInsights && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl space-y-3">
                  <h3 className="text-base font-bold text-white">AI Depletion Velocity Forecast</h3>
                  <div className="space-y-2">
                    {inventoryInsights.depletionForecasts.map((dep: any) => (
                      <div key={dep.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold text-white block">{dep.itemName} ({dep.city})</span>
                          <span className="text-slate-400">Stock: {dep.currentStock} {dep.unit}</span>
                        </div>
                        <span className={`font-bold px-2.5 py-1 rounded-full ${dep.riskLevel === 'High' ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
                          ~{dep.daysRemaining} days remaining
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. REORDER PURCHASE ORDERS SUB-TAB */}
              {inventorySubTab === "reorders" && inventoryInsights && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-base font-bold text-slate-900">Automated Purchase Order Recommendations</h3>
                  <div className="space-y-2">
                    {inventoryInsights.restockRecommendations.map((rec: any) => (
                      <div key={rec.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{rec.itemName} ({rec.city})</span>
                          <span className="text-slate-500">Reorder Qty: {rec.recommendedQuantity} {rec.unit}</span>
                        </div>
                        <span className="font-bold text-emerald-600 text-sm">₹{rec.estimatedCost.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: STAFF AGENT */}
          {activeStepId === 5 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Feature Rendering Buttons Bar */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-wrap gap-2">
                <button
                  onClick={() => setStaffSubTab("roster")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    staffSubTab === "roster" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>👥 Staff Roster Table</span>
                </button>
                <button
                  onClick={() => setStaffSubTab("performers")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    staffSubTab === "performers" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>🏆 Top 5 Performers</span>
                </button>
                <button
                  onClick={() => setStaffSubTab("underperformers")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    staffSubTab === "underperformers" ? "bg-rose-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>⚠️ Bottom 5 Underperformers</span>
                </button>
                <button
                  onClick={() => setStaffSubTab("allocate")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    staffSubTab === "allocate" ? "bg-violet-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>📋 Job Allocation</span>
                </button>
                <button
                  onClick={() => setStaffSubTab("ai")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    staffSubTab === "ai" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>🧠 AI Labor Efficiency</span>
                </button>
                <button
                  onClick={() => setStaffSubTab("shifts")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    staffSubTab === "shifts" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>📅 Shift Distribution</span>
                </button>
              </div>

              {staffInsights?.summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Active Staff</span>
                    <div className="text-xl font-black text-slate-900 mt-1">{staffInsights.summary.totalStaff} Members</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Monthly Payroll</span>
                    <div className="text-xl font-black text-indigo-600 mt-1">₹{staffInsights.summary.totalMonthlyPayroll.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Labor Cost Ratio</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">{staffInsights.summary.laborCostRatioPercentage}%</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Avg Rating</span>
                    <div className="text-xl font-black text-amber-500 mt-1">★ {staffInsights.summary.averageRating}</div>
                  </div>
                </div>
              )}

              {/* 1. STAFF ROSTER SUB-TAB (PAGE SEGMENTATION) */}
              {staffSubTab === "roster" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
                      <h3 className="text-base font-bold text-slate-900">Staff Performance Ratings</h3>
                      <p className="text-xs text-slate-500">Overview of employee performance score out of 5.0</p>
                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={staffPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Rating" fill="#10b981" radius={[4, 4, 0, 0]} name="Performance Rating" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
                      <h3 className="text-base font-bold text-slate-900">Shift Coverage Distribution</h3>
                      <p className="text-xs text-slate-500">Staff count by shift type</p>
                      <div className="h-60 w-full">
                        {staffShiftDistributionData.length > 0 && staffShiftDistributionData.some(d => d.value > 0) ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={staffShiftDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {staffShiftDistributionData.map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v: any) => [`${v} Members`, 'Count']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-slate-400">No shift data</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Franchise Staff Roster & Performance Ratings</h3>
                      <p className="text-xs text-slate-500">Employee performance, shifts, and wage analytics</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Staff per page:</span>
                      <select
                        value={staffPageSize}
                        onChange={(e) => { setStaffPageSize(parseInt(e.target.value, 10)); setStaffPage(1); }}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-800 cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={15}>15</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-900 uppercase font-semibold text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Staff Name</th>
                          <th className="py-3 px-4">Outlet</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Assigned Job</th>
                          <th className="py-3 px-4">Shift</th>
                          <th className="py-3 px-4">Login Time</th>
                          <th className="py-3 px-4">Logoff Time</th>
                          <th className="py-3 px-4">Monthly Wages</th>
                          <th className="py-3 px-4">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {paginatedStaffMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{member.name}</td>
                            <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{member.city}</td>
                            <td className="py-3 px-4"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium whitespace-nowrap">{member.role}</span></td>
                            <td className="py-3 px-4 text-slate-600 max-w-[160px]">
                              <span className="block truncate" title={member.assignedJob}>{member.assignedJob}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                member.shiftType === 'Morning' ? 'bg-amber-100 text-amber-800' : member.shiftType === 'Evening' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                              }`}>{member.shiftType}</span>
                            </td>
                            <td className="py-3 px-4 text-emerald-700 font-semibold whitespace-nowrap">🕐 {member.loginTime}</td>
                            <td className="py-3 px-4 text-rose-600 font-semibold whitespace-nowrap">🕔 {member.logoffTime}</td>
                            <td className="py-3 px-4 font-semibold text-emerald-600 whitespace-nowrap">₹{member.monthlyWages.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 font-bold text-amber-500 whitespace-nowrap">★ {member.performanceRating}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Showing <strong className="text-slate-800">{(staffPage - 1) * staffPageSize + 1}</strong> to{" "}
                      <strong className="text-slate-800">{Math.min(staffPage * staffPageSize, staffMembers.length)}</strong> of{" "}
                      <strong className="text-slate-800">{staffMembers.length}</strong> staff members
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                        disabled={staffPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                      >
                        <Icons.ChevronLeft />
                        <span>Previous</span>
                      </button>

                      <span className="font-semibold text-slate-800 px-2">
                        Page {staffPage} of {totalStaffPages}
                      </span>

                      <button
                        onClick={() => setStaffPage((p) => Math.min(totalStaffPages, p + 1))}
                        disabled={staffPage >= totalStaffPages}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Next</span>
                        <Icons.ChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* 2. TOP 5 PERFORMERS SUB-TAB */}
              {staffSubTab === "performers" && staffPerformers && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <span className="text-xl">🏆</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Top 5 Performing Employees</h3>
                      <p className="text-xs text-slate-500">Ranked by performance rating and hours contributed this month</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {staffPerformers.top5.map((member: any, idx: number) => (
                      <div key={member.id} className="flex items-center space-x-4 bg-gradient-to-r from-emerald-50 to-teal-50/60 p-4 rounded-xl border border-emerald-200">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0 ${
                          idx === 0 ? 'bg-amber-400 shadow-lg shadow-amber-200' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-emerald-500'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{member.name}</span>
                            <span className="font-black text-emerald-600 text-sm">★ {member.performanceRating}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                            <span>{member.role}</span>
                            <span>·</span>
                            <span>{member.city}</span>
                            <span>·</span>
                            <span>🕐 {member.loginTime} – 🕔 {member.logoffTime}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1 font-medium truncate">{member.assignedJob}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-emerald-700">{member.hoursWorked}h</div>
                          <div className="text-[10px] text-slate-400">hrs worked</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. BOTTOM 5 UNDERPERFORMERS SUB-TAB */}
              {staffSubTab === "underperformers" && staffPerformers && (
                <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 border-b border-rose-100 pb-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Bottom 5 Underperforming Employees</h3>
                      <p className="text-xs text-slate-500">Staff members needing coaching, reassignment, or performance improvement plans</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {staffPerformers.bottom5.map((member: any, idx: number) => (
                      <div key={member.id} className="bg-gradient-to-r from-rose-50/80 to-amber-50/60 p-4 rounded-xl border border-rose-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center font-black text-rose-600 text-sm shrink-0">
                              #{idx + 1}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">{member.name}</span>
                              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                                <span>{member.role}</span>
                                <span>·</span>
                                <span>{member.city}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-rose-600 text-sm">★ {member.performanceRating}</span>
                            <div className="text-[10px] text-slate-400">{member.hoursWorked}h worked</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                          <span>🕐 Login: <strong className="text-slate-700">{member.loginTime}</strong></span>
                          <span>🕔 Logoff: <strong className="text-slate-700">{member.logoffTime}</strong></span>
                          <span>📋 {member.assignedJob}</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800">
                          <span className="font-bold">AI Diagnostic: </span>{member.diagnosticNote}
                        </div>
                        <div className="text-[11px] text-indigo-700 font-semibold">
                          💡 Recommended: {member.recommendedJobAllocation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. JOB ALLOCATION SUB-TAB */}
              {staffSubTab === "allocate" && staffPerformers && (
                <div className="bg-white rounded-2xl p-5 border border-violet-200 shadow-sm space-y-4">
                  <div className="flex items-center space-x-2 border-b border-violet-100 pb-3">
                    <span className="text-xl">📋</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">AI-Assisted Job Allocation Manager</h3>
                      <p className="text-xs text-slate-500">Assign or update job roles, shift types, and login/logoff times for any staff member</p>
                    </div>
                  </div>

                  {allocationSuccess && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl p-3 flex items-center space-x-2">
                      <span>✅</span><span>{allocationSuccess}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {staffMembers.slice(0, 15).map((member: any) => (
                      <div key={member.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-300 flex items-center justify-center font-bold text-violet-700 text-xs shrink-0">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{member.name}</div>
                              <div className="text-[11px] text-slate-500">{member.role} · {member.city} · <span className="text-slate-600 font-medium truncate">{member.assignedJob}</span></div>
                              <div className="text-[11px] text-slate-500">🕐 {member.loginTime} – 🕔 {member.logoffTime} · {member.shiftType} Shift</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setAllocatingStaffId(allocatingStaffId === member.id ? null : member.id);
                              setAllocatingJob(member.assignedJob);
                              setAllocatingShift(member.shiftType);
                              setAllocatingLoginTime(member.loginTime);
                              setAllocatingLogoffTime(member.logoffTime);
                            }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              allocatingStaffId === member.id ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100'
                            }`}
                          >
                            {allocatingStaffId === member.id ? '✕ Cancel' : '✎ Allocate'}
                          </button>
                        </div>

                        {allocatingStaffId === member.id && (
                          <div className="border-t border-violet-100 p-4 bg-violet-50/50 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Assign Job Role</label>
                                <select
                                  value={allocatingJob}
                                  onChange={(e) => setAllocatingJob(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 text-xs rounded-lg text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                                >
                                  {staffPerformers.availableJobs.map((job: string) => (
                                    <option key={job} value={job}>{job}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Shift Type</label>
                                <select
                                  value={allocatingShift}
                                  onChange={(e) => setAllocatingShift(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 text-xs rounded-lg text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                                >
                                  <option value="Morning">Morning</option>
                                  <option value="Evening">Evening</option>
                                  <option value="Night">Night</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Login Time</label>
                                <input
                                  type="text"
                                  value={allocatingLoginTime}
                                  onChange={(e) => setAllocatingLoginTime(e.target.value)}
                                  placeholder="e.g. 08:00 AM"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 text-xs rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Logoff Time</label>
                                <input
                                  type="text"
                                  value={allocatingLogoffTime}
                                  onChange={(e) => setAllocatingLogoffTime(e.target.value)}
                                  placeholder="e.g. 04:30 PM"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 text-xs rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleAllocateJob(member.id)}
                              disabled={!allocatingJob}
                              className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ✅ Confirm Job Allocation
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. AI LABOR EFFICIENCY RATIO SUB-TAB */}
              {staffSubTab === "ai" && staffInsights && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-base font-bold text-slate-900">AI Labor Cost & Efficiency Optimization</h3>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {staffInsights.optimizationSuggestions.map((sug: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 6. SHIFT ROSTER DISTRIBUTION SUB-TAB */}
              {staffSubTab === "shifts" && staffInsights && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Shift Coverage Roster Distribution</h3>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                      <span className="text-slate-500 block text-[10px] font-bold">MORNING SHIFT</span>
                      <span className="font-black text-indigo-700 text-2xl mt-1 block">{staffInsights.summary.shiftDistribution.Morning || 0}</span>
                      <span className="text-[10px] text-slate-400">8 AM - 4 PM</span>
                    </div>
                    <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                      <span className="text-slate-500 block text-[10px] font-bold">EVENING SHIFT</span>
                      <span className="font-black text-blue-700 text-2xl mt-1 block">{staffInsights.summary.shiftDistribution.Evening || 0}</span>
                      <span className="text-[10px] text-slate-400">4 PM - 12 AM</span>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px] font-bold">NIGHT SHIFT</span>
                      <span className="font-black text-slate-700 text-2xl mt-1 block">{staffInsights.summary.shiftDistribution.Night || 0}</span>
                      <span className="text-[10px] text-slate-400">12 AM - 8 AM</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: MARKETING AGENT */}
          {activeStepId === 6 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Feature Sub-Tabs Toggles */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-wrap gap-2">
                <button
                  onClick={() => setMarketingSubTab("overview")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    marketingSubTab === "overview" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>📈 Campaign Performance</span>
                </button>
                <button
                  onClick={() => setMarketingSubTab("powerbi")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    marketingSubTab === "powerbi" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>📊 PowerBI Embedded</span>
                </button>
                <button
                  onClick={() => setMarketingSubTab("ai")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    marketingSubTab === "ai" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>🤖 AI Marketing Engine</span>
                </button>
                <button
                  onClick={() => setMarketingSubTab("recommendations")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                    marketingSubTab === "recommendations" ? "bg-rose-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>💡 AI Recommendations Panel ({aiRecommendations.length})</span>
                </button>
              </div>

              {/* KPIs Header */}
              {marketingKpis && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Net ROI</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">₹{marketingKpis.netRoi.toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Efficiency: {marketingKpis.roas}x ROAS</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Total Attributed Revenue</span>
                    <div className="text-xl font-black text-slate-900 mt-1">₹{marketingKpis.attributedRevenue.toLocaleString('en-IN')}</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Total Spend: ₹{marketingKpis.totalSpend.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Avg CTR / Conv Rate</span>
                    <div className="text-xl font-black text-indigo-600 mt-1">{marketingKpis.averageCtr}% / {marketingKpis.averageConvRate}%</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Interactive clicks</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Customer Engagement Index</span>
                    <div className="text-xl font-black text-cyan-600 mt-1">{marketingKpis.engagementIndex} / 100</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{marketingKpis.totalCustomers} profiles tracked</span>
                  </div>
                </div>
              )}

              {/* 1. CAMPAIGN PERFORMANCE OVERVIEW */}
              {marketingSubTab === "overview" && (
                <div className="space-y-4">
                  {/* Campaign Rankings Grid */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Campaign Rankings & Sales Impact</h3>
                      <p className="text-xs text-slate-500">Live ROI tracking and attribution metrics across franchise promotional campaigns</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">Campaign Name</th>
                            <th className="py-3 px-4">Channel</th>
                            <th className="py-3 px-4">Budget</th>
                            <th className="py-3 px-4">Revenue</th>
                            <th className="py-3 px-4">ROAS</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {campaigns.map((camp) => {
                            const rep = camp.roi_reports[0] || { attributed_revenue: 0, efficiency_ratio: 0 };
                            const roas = rep.efficiency_ratio;
                            let statusBadge = "bg-slate-100 text-slate-600";
                            if (camp.status === "Active") statusBadge = "bg-blue-100 text-blue-800 animate-pulse";
                            else if (camp.status === "Completed") statusBadge = "bg-emerald-100 text-emerald-800";
                            else if (camp.status === "Draft") statusBadge = "bg-amber-100 text-amber-800";

                            return (
                              <tr key={camp.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4 font-bold text-slate-800">{camp.name}</td>
                                <td className="py-3 px-4 text-slate-600">{camp.channel}</td>
                                <td className="py-3 px-4 font-semibold text-slate-700">₹{camp.budget.toLocaleString('en-IN')}</td>
                                <td className="py-3 px-4 font-semibold text-emerald-600">₹{rep.attributed_revenue.toLocaleString('en-IN')}</td>
                                <td className={`py-3 px-4 font-bold ${roas >= 2.0 ? "text-emerald-600" : roas >= 1.0 ? "text-indigo-600" : "text-rose-600"}`}>
                                  {roas > 0 ? `${roas}x` : "-"}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBadge}`}>
                                    {camp.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Visual charts */}
                  {campaigns.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900">Campaign Conversions Trends</h3>
                        <p className="text-xs text-slate-500">Active clicks and sales conversions tracked over time</p>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={campaigns.flatMap(c => c.marketing_metrics || []).slice(0, 30)}
                              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorConvs" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="recorded_date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                              <Tooltip formatter={(value: any) => [Number(value).toLocaleString(), '']} />
                              <Area type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" name="Clicks" />
                              <Area type="monotone" dataKey="pos_sales_conversions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorConvs)" name="Conversions" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900">Campaign Budget vs. Attributed Revenue</h3>
                        <p className="text-xs text-slate-500">Side-by-side ROI comparison for each campaign</p>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={campaignBudgetVsRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                              <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']} />
                              <Legend />
                              <Bar dataKey="Spend" fill="#6366f1" radius={[4, 4, 0, 0]} name="Budget Spend" />
                              <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Attributed Revenue" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. POWERBI EMBEDDED VISUALIZATION */}
              {marketingSubTab === "powerbi" && (
                <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-700/60 shadow-lg overflow-hidden flex flex-col h-[520px]">
                  {/* Mock PowerBI Toolbar */}
                  <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700/60 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center space-x-3">
                      <span className="bg-yellow-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase shadow-xs">Power BI</span>
                      <span className="text-slate-300">Marketing ROI Analysis - Embedded Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                      <button type="button" className="hover:text-white flex items-center space-x-1 cursor-pointer"><span className="scale-75">🔄</span> <span>Refresh</span></button>
                      <button type="button" className="hover:text-white flex items-center space-x-1 cursor-pointer"><span className="scale-75">🖨️</span> <span>Print</span></button>
                      <button type="button" className="hover:text-white flex items-center space-x-1 cursor-pointer"><span className="scale-75">🖥️</span> <span>Full Screen</span></button>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-12 overflow-hidden bg-slate-950 p-4 gap-4">
                    {/* Filters Pane */}
                    <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-4 text-xs overflow-y-auto">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">Filters</div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase block">Campaign Status</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300">
                          <option>All Statuses</option>
                          <option>Active</option>
                          <option>Completed</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase block">Marketing Channel</label>
                        <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300">
                          <option>All Channels</option>
                          <option>Social Media</option>
                          <option>POS Coupons</option>
                          <option>CRM System Data</option>
                        </select>
                      </div>
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dashboard KPI Metrics</div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Top Channel</span>
                          <span className="font-black text-amber-500 text-sm mt-0.5 block">POS Coupons</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">Acquisition Efficiency</span>
                          <span className="font-black text-emerald-500 text-sm mt-0.5 block">1.82x Net Lift</span>
                        </div>
                      </div>
                    </div>

                    {/* Report Canvas */}
                    <div className="col-span-9 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col space-y-4 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-black text-slate-100">Attribution Revenue by Marketing Channel</h4>
                          <p className="text-[10px] text-slate-500">Cross-channel efficiency comparison and budget mapping</p>
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">Status: Live Sync</span>
                      </div>

                      {/* Mock Chart Area */}
                      <div className="flex-1 min-h-[220px]">
                        {campaigns.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={campaigns.map(c => {
                                const rep = c.roi_reports[0] || { total_spend: c.budget, attributed_revenue: 0 };
                                return {
                                  name: c.name.slice(0, 14) + "..",
                                  Spend: rep.total_spend,
                                  Revenue: rep.attributed_revenue
                                };
                              })}
                              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#334155" />
                              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#334155" />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Bar dataKey="Spend" fill="#6366f1" name="Budget Spend" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="Revenue" fill="#10b981" name="Attributed Revenue" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-500 text-xs">No active campaign data loaded.</div>
                        )}
                      </div>

                      {/* Mini cards */}
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-500 block">Total Interactions</span>
                          <span className="text-base font-black text-slate-100 mt-1 block">42,500</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-500 block">Sentiment Score</span>
                          <span className="text-base font-black text-emerald-400 mt-1 block">78.5% Positive</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                          <span className="text-[9px] text-slate-500 block">Target Conversion Rate</span>
                          <span className="text-base font-black text-indigo-400 mt-1 block">22.4%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. AI MARKETING ENGINE */}
              {marketingSubTab === "ai" && (
                <div className="space-y-6">
                  {/* Segmentation and Predictor Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Segmentation Results */}
                    {aiSegments && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">K-Means Customer Segmentation</h3>
                          <p className="text-xs text-slate-500">Clustering based on total spend, visit frequency, and customer age profile</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {Object.keys(aiSegments.stats || {}).map((segKey) => {
                            const stat = aiSegments.stats[segKey];
                            let cardColor = "border-slate-100 bg-slate-50/50";
                            let textColor = "text-slate-900";
                            if (segKey === "High-Value") { cardColor = "border-emerald-200 bg-emerald-50/20"; textColor = "text-emerald-700"; }
                            else if (segKey === "Churn-Risk") { cardColor = "border-rose-200 bg-rose-50/20"; textColor = "text-rose-700"; }

                            return (
                              <div key={segKey} className={`p-3 rounded-xl border text-center ${cardColor}`}>
                                <span className="text-[10px] text-slate-500 font-bold block uppercase">{segKey}</span>
                                <span className={`text-lg font-black mt-1 block ${textColor}`}>{stat.count}</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Spend: ₹{Math.round(stat.average_spend)}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Mini listing */}
                        <div className="border border-slate-100 rounded-xl overflow-hidden text-[11px]">
                          <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 font-bold text-slate-600 flex justify-between">
                            <span>Sample Customer Name</span>
                            <span>Engagement Segment</span>
                          </div>
                          <div className="divide-y divide-slate-50 max-h-32 overflow-y-auto">
                            {aiSegments.customers?.slice(0, 5).map((cust: any, idx: number) => (
                              <div key={idx} className="px-3 py-2 flex justify-between hover:bg-slate-50/30">
                                <span className="text-slate-800 font-semibold">{cust.name}</span>
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                                  cust.segment === 'High-Value' ? "bg-emerald-100 text-emerald-800" : cust.segment === 'Churn-Risk' ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"
                                }`}>
                                  {cust.segment}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Campaign Performance Predictor */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Campaign Success Predictor</h3>
                        <p className="text-xs text-slate-500">Evaluate prospective campaign efficiency and impressions prior to launching</p>
                      </div>

                      <form onSubmit={handlePredictCampaign} className="space-y-3.5 text-xs text-slate-700">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 block">Marketing Channel</label>
                            <select
                              value={predictChannel}
                              onChange={(e) => setPredictChannel(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer text-slate-800"
                            >
                              <option value="Social Media">Social Media</option>
                              <option value="POS Coupons">POS Coupons</option>
                              <option value="CRM System Data">CRM System Data</option>
                              <option value="Google Analytics">Google Analytics</option>
                              <option value="Website Analytics">Website Analytics</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-600 block">Target Audience Budget (₹)</label>
                            <input
                              type="number"
                              value={predictBudget}
                              onChange={(e) => setPredictBudget(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-semibold"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={rerunningAi}
                          className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg shadow-sm cursor-pointer hover:bg-indigo-700 transition-all disabled:bg-indigo-400"
                        >
                          {rerunningAi ? "Running Regression Predictor..." : "🔍 Run Prediction Algorithm"}
                        </button>
                      </form>

                      {/* Prediction Result Display */}
                      {predictionResult ? (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-3 gap-2.5 text-[11px] animate-in fade-in duration-200">
                          <div className="col-span-3 font-bold text-slate-800 border-b border-slate-200/60 pb-1 flex justify-between">
                            <span>Predicted Impact ({predictionResult.channel})</span>
                            <span className="text-indigo-600 uppercase text-[9px] font-black">{predictionResult.effectiveness_tag}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] font-bold">CONVERSIONS</span>
                            <span className="font-black text-slate-800 text-sm mt-0.5 block">{predictionResult.predicted_conversions}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] font-bold">EST REVENUE</span>
                            <span className="font-black text-emerald-600 text-sm mt-0.5 block">₹{Math.round(predictionResult.attributed_revenue).toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] font-bold">EST ROAS</span>
                            <span className="font-black text-indigo-600 text-sm mt-0.5 block">{predictionResult.roas}x</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center text-slate-400 text-xs py-6">
                          Select inputs above to evaluate simulated campaign ROI.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sentiment and Forecasting Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sentiment NLP */}
                    {aiSentiment && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Social Media Feedback Sentiment (NLP)</h3>
                          <p className="text-xs text-slate-500">Live NLP sentiment classification of customer comments and store mentions</p>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center w-24">
                            <span className="text-[10px] text-slate-500 block font-bold">INDEX</span>
                            <span className="font-black text-slate-800 text-xl mt-1 block">{Math.round(aiSentiment.average_sentiment_score * 100)}%</span>
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-slate-500">Feedback Distribution</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                              <div className="bg-emerald-500" style={{ width: `${(aiSentiment.sentiment_distribution.Positive / (aiSentiment.comments?.length || 1)) * 100}%` }} />
                              <div className="bg-slate-300" style={{ width: `${(aiSentiment.sentiment_distribution.Neutral / (aiSentiment.comments?.length || 1)) * 100}%` }} />
                              <div className="bg-rose-500" style={{ width: `${(aiSentiment.sentiment_distribution.Negative / (aiSentiment.comments?.length || 1)) * 100}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                              <span className="text-emerald-600 flex items-center">● Pos ({aiSentiment.sentiment_distribution.Positive})</span>
                              <span className="text-slate-500 flex items-center">● Neu ({aiSentiment.sentiment_distribution.Neutral})</span>
                              <span className="text-rose-600 flex items-center">● Neg ({aiSentiment.sentiment_distribution.Negative})</span>
                            </div>
                          </div>
                        </div>

                        {/* Comments listing */}
                        <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl max-h-32 overflow-y-auto text-[10px]">
                          {aiSentiment.comments?.map((comment: any, idx: number) => (
                            <div key={idx} className="p-2 flex justify-between hover:bg-slate-50/50">
                              <span className="text-slate-700 truncate max-w-sm font-semibold">"{comment.text}"</span>
                              <span className={`font-bold px-1 py-0.5 rounded text-[8px] tracking-wider ${
                                comment.sentiment === 'Positive' ? "bg-emerald-100 text-emerald-800" : comment.sentiment === 'Negative' ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-800"
                              }`}>
                                {comment.sentiment}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Time Series Forecasting */}
                    {aiForecast.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Revenue & Engagement 14-Day Forecast</h3>
                          <p className="text-xs text-slate-500">ML Random Forest trend projection for marketing-attributed revenue volume</p>
                        </div>

                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={aiForecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                              <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                              <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']} />
                              <Line type="monotone" dataKey="predicted_revenue" stroke="#7c3aed" strokeWidth={2.5} name="Forecast Revenue" dot={{ r: 2 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. AI RECOMMENDATIONS PANEL */}
              {marketingSubTab === "recommendations" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">AI-Generated Campaign Optimization Board</h3>
                      <p className="text-xs text-slate-500">Real-time budget reallocation advice and targeted audience refinements</p>
                    </div>
                    <span className="text-[10px] text-rose-500 bg-rose-50 border border-rose-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Action Required</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiRecommendations.map((rec) => {
                      const isHigh = rec.priority === "High";
                      const isApplying = applyingRecId === rec.id;

                      return (
                        <div
                          key={rec.id}
                          className={`bg-white rounded-2xl border p-5 space-y-4 shadow-sm flex flex-col justify-between transition-all duration-150 ${
                            isHigh ? "border-rose-200 bg-rose-50/5" : "border-slate-200"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                isHigh ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-600"
                              }`}>
                                {rec.priority} Priority
                              </span>
                              <span className="text-[10px] font-mono text-emerald-600 font-bold">{rec.estimated_roi_impact}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">{rec.type}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                          </div>

                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => handleApplyRecommendation(rec)}
                              disabled={isApplying}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs shadow-xs cursor-pointer transition-all flex items-center justify-center space-x-1 disabled:bg-slate-600"
                            >
                              {isApplying ? (
                                <>
                                  <span className="animate-spin text-xs">🌀</span>
                                  <span>Applying Adjustments...</span>
                                </>
                              ) : (
                                <span>Apply Optimization Suggestion</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: AUDIT AGENT */}
          {activeStepId === 7 && (
            <div className="space-y-4 animate-in fade-in duration-300">

              {/* Sub-tab Navigation */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-wrap gap-2">
                {([
                  { key: "sessions",   label: "📋 Audit Sessions" },
                  { key: "checklist",  label: "✅ SOP Checklist" },
                  { key: "inventory",  label: "📦 Inventory Variance" },
                  { key: "pos",        label: "💳 POS Discrepancies" },
                  { key: "shifts",     label: "👤 Shift Verification" },
                  { key: "incidents",  label: "🔧 Facility Incidents" },
                  { key: "anomalies",  label: "⚠️ Anomaly Flags" },
                  { key: "report",     label: "📊 Audit Report" },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    id={`audit-tab-${tab.key}`}
                    onClick={() => setAuditSubTab(tab.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      auditSubTab === tab.key
                        ? tab.key === "anomalies"
                          ? "bg-rose-600 text-white shadow-sm"
                          : "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* KPI Summary Cards */}
              {!auditLoading && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Network Compliance",
                      value: auditSessions.length > 0
                        ? `${Math.round(auditSessions.filter(s => s.overallScore > 0).reduce((acc, s) => acc + s.overallScore, 0) / Math.max(auditSessions.filter(s => s.overallScore > 0).length, 1))}%`
                        : "—",
                      sub: "Avg. across completed sessions",
                      color: "text-indigo-600",
                    },
                    {
                      label: "Passed / Failed",
                      value: `${auditSessions.filter(s => s.passFail === "Pass").length} / ${auditSessions.filter(s => s.passFail === "Fail").length}`,
                      sub: `${auditSessions.filter(s => s.status === "Escalated").length} escalated`,
                      color: "text-emerald-600",
                    },
                    {
                      label: "Critical Anomalies",
                      value: auditAnomalies?.summary?.critical ?? "—",
                      sub: `${auditAnomalies?.summary?.total ?? 0} total flags`,
                      color: "text-rose-600",
                    },
                    {
                      label: "Open Incidents",
                      value: auditIncidents?.summary?.open ?? "—",
                      sub: `${auditIncidents?.summary?.critical ?? 0} critical priority`,
                      color: "text-amber-600",
                    },
                  ].map((kpi, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{kpi.label}</span>
                      <span className={`text-2xl font-black mt-1 block ${kpi.color}`}>{kpi.value}</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">{kpi.sub}</span>
                    </div>
                  ))}
                </div>
              )}

              {auditLoading && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-sm">
                  Loading audit data...
                </div>
              )}

              {/* ── 1. AUDIT SESSIONS ─────────────────────────────── */}
              {auditSubTab === "sessions" && !auditLoading && (
                <div className="space-y-4">
                  {/* Create new session form */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">🆕 Start New Audit Session</h3>
                    <form onSubmit={handleCreateAuditSession} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Outlet</label>
                        <select
                          value={newAuditForm.outletId}
                          onChange={e => setNewAuditForm(f => ({ ...f, outletId: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 cursor-pointer"
                        >
                          <option value="">Select Outlet...</option>
                          {outlets.map(o => <option key={o.id} value={o.id}>{o.outlet_name} — {o.city}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Auditor Name</label>
                        <input
                          type="text"
                          placeholder="Full name + role"
                          value={newAuditForm.auditorName}
                          onChange={e => setNewAuditForm(f => ({ ...f, auditorName: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Audit Date</label>
                        <input
                          type="date"
                          value={newAuditForm.auditDate}
                          onChange={e => setNewAuditForm(f => ({ ...f, auditDate: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={creatingAudit}
                          id="btn-create-audit-session"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer transition-all disabled:bg-indigo-400"
                        >
                          {creatingAudit ? "Creating..." : "➕ Start Audit"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Sessions table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">All Audit Sessions</h3>
                      <span className="text-[10px] text-slate-400 font-mono">{auditSessions.length} total sessions</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-4 py-2.5 text-left">Outlet</th>
                            <th className="px-4 py-2.5 text-left">Auditor</th>
                            <th className="px-4 py-2.5 text-left">Date</th>
                            <th className="px-4 py-2.5 text-center">Score</th>
                            <th className="px-4 py-2.5 text-center">Result</th>
                            <th className="px-4 py-2.5 text-center">Status</th>
                            <th className="px-4 py-2.5 text-center">Findings</th>
                            <th className="px-4 py-2.5 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {auditSessions.map((session: any) => (
                            <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900">{session.outletName}</div>
                                <div className="text-[10px] text-slate-400">{session.city}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">{session.auditorName}</td>
                              <td className="px-4 py-3 text-slate-600 font-mono">{session.auditDate}</td>
                              <td className="px-4 py-3 text-center">
                                {session.overallScore > 0 ? (
                                  <span className={`font-black text-sm ${session.overallScore >= 80 ? "text-emerald-600" : session.overallScore >= 70 ? "text-amber-600" : "text-rose-600"}`}>
                                    {session.overallScore.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  session.passFail === "Pass" ? "bg-emerald-100 text-emerald-700" :
                                  session.passFail === "Fail" ? "bg-rose-100 text-rose-700" :
                                  "bg-slate-100 text-slate-600"
                                }`}>
                                  {session.passFail}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  session.status === "Completed" ? "bg-blue-100 text-blue-700" :
                                  session.status === "Escalated" ? "bg-red-100 text-red-700" :
                                  "bg-amber-100 text-amber-700"
                                }`}>
                                  {session.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {session.criticalFindings > 0 ? (
                                  <span className="text-rose-600 font-bold">{session.criticalFindings} 🔴</span>
                                ) : (
                                  <span className="text-slate-400">{session.totalFindings}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  id={`btn-load-session-${session.id}`}
                                  onClick={() => { handleLoadAuditSession(session.id); setAuditSubTab("checklist"); }}
                                  className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-slate-700 transition-all"
                                >
                                  Open →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 2. SOP CHECKLIST ──────────────────────────────── */}
              {auditSubTab === "checklist" && !auditLoading && (
                <div className="space-y-4">
                  {!activeAuditSession ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center text-slate-400 text-sm space-y-3">
                      <div className="text-3xl">📋</div>
                      <p>No audit session loaded. Select a session from the Sessions tab, or create a new one.</p>
                      <button onClick={() => setAuditSubTab("sessions")} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-700">
                        Go to Sessions
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Session header */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{activeAuditSession.outletName} — {activeAuditSession.audit_date}</h3>
                          <p className="text-[10px] text-slate-400">Auditor: {activeAuditSession.auditor_name} · Session #{activeAuditSession.id}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Score breakdown mini cards */}
                          {[
                            { label: "Hygiene", val: activeAuditSession.hygiene_score },
                            { label: "Food Safety", val: activeAuditSession.food_safety_score },
                            { label: "SOP", val: activeAuditSession.sop_score },
                          ].map(s => (
                            <div key={s.label} className="text-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100">
                              <span className="text-[9px] text-slate-400 block">{s.label}</span>
                              <span className={`text-sm font-black ${s.val >= 80 ? "text-emerald-600" : s.val >= 70 ? "text-amber-600" : s.val > 0 ? "text-rose-600" : "text-slate-300"}`}>
                                {s.val > 0 ? `${s.val}%` : "—"}
                              </span>
                            </div>
                          ))}
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${
                            activeAuditSession.pass_fail === "Pass" ? "bg-emerald-100 text-emerald-700" :
                            activeAuditSession.pass_fail === "Fail" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {activeAuditSession.overall_score > 0 ? `${activeAuditSession.overall_score}/100` : "Pending"}
                          </span>
                          {activeAuditSession.status === "In Progress" && (
                            <button
                              id={`btn-complete-session-${activeAuditSession.id}`}
                              onClick={() => handleCompleteAuditSession(activeAuditSession.id)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all"
                            >
                              ✓ Finalize Audit
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Checklist by category */}
                      {auditSessionLoading ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">Loading checklist...</div>
                      ) : (
                        ["Hygiene", "Food Safety", "Opening Procedure", "Closing Procedure", "SOP"].map(category => {
                          const items = activeAuditSession.checklist_items?.filter((i: any) => i.category === category) || [];
                          const passed = items.filter((i: any) => i.answer === "Pass").length;
                          const failed = items.filter((i: any) => i.answer === "Fail").length;
                          return (
                            <div key={category} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-700">{category}</h4>
                                <div className="flex gap-2 text-[10px] font-bold">
                                  <span className="text-emerald-600">{passed} Pass</span>
                                  <span className="text-rose-600">{failed} Fail</span>
                                  <span className="text-slate-400">{items.filter((i:any) => i.answer === "Pending").length} Pending</span>
                                </div>
                              </div>
                              <div className="divide-y divide-slate-50">
                                {items.map((item: any) => (
                                  <div key={item.id} className={`px-5 py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 ${item.answer === "Fail" ? "border-l-4 border-rose-400" : item.answer === "Pass" ? "border-l-4 border-emerald-400" : "border-l-4 border-slate-200"}`}>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-slate-800 font-medium leading-relaxed">{item.question}</p>
                                      {item.notes && <p className="text-[10px] text-rose-600 mt-0.5 italic">{item.notes}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[9px] text-slate-400 font-bold">Wt:{item.score_weight}</span>
                                      {(["Pass", "Fail", "N/A"] as const).map(ans => (
                                        <button
                                          key={ans}
                                          id={`checklist-${item.id}-${ans}`}
                                          disabled={checklistUpdating === item.id || activeAuditSession.status !== "In Progress"}
                                          onClick={() => handleUpdateChecklistItem(item.id, ans)}
                                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                                            item.answer === ans
                                              ? ans === "Pass" ? "bg-emerald-500 text-white border-emerald-500"
                                              : ans === "Fail" ? "bg-rose-500 text-white border-rose-500"
                                              : "bg-slate-500 text-white border-slate-500"
                                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                                          } disabled:opacity-50`}
                                        >
                                          {ans}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── 3. INVENTORY VARIANCE ─────────────────────────── */}
              {auditSubTab === "inventory" && !auditLoading && auditInventoryVariance && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Items Audited", value: auditInventoryVariance.summary?.totalItems ?? 0, color: "text-slate-900" },
                      { label: "Critical Variance", value: auditInventoryVariance.summary?.criticalVariance ?? 0, color: "text-rose-600" },
                      { label: "High Variance", value: auditInventoryVariance.summary?.highVariance ?? 0, color: "text-amber-600" },
                      { label: "Within Normal", value: auditInventoryVariance.summary?.normal ?? 0, color: "text-emerald-600" },
                    ].map((k, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{k.label}</span>
                        <span className={`text-2xl font-black mt-1 block ${k.color}`}>{k.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Stock Variance Analysis</h3>
                      <span className="text-[10px] text-slate-400">Physical stock vs POS-estimated consumption</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-4 py-2.5 text-left">Item</th>
                            <th className="px-4 py-2.5 text-left">Outlet</th>
                            <th className="px-4 py-2.5 text-center">Current Stock</th>
                            <th className="px-4 py-2.5 text-center">Est. Consumption</th>
                            <th className="px-4 py-2.5 text-center">Theoretical</th>
                            <th className="px-4 py-2.5 text-center">Variance</th>
                            <th className="px-4 py-2.5 text-center">Var %</th>
                            <th className="px-4 py-2.5 text-center">Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(auditInventoryVariance.items || []).slice(0, 20).map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900">{item.itemName}</div>
                                <div className="text-[10px] text-slate-400">{item.category}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{item.outletName}</td>
                              <td className="px-4 py-3 text-center font-mono text-slate-700">{item.currentStock} {item.unit}</td>
                              <td className="px-4 py-3 text-center font-mono text-slate-500">{item.estimatedConsumption}</td>
                              <td className="px-4 py-3 text-center font-mono text-slate-500">{item.theoreticalRemaining.toFixed(1)}</td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">{item.variance > 0 ? `+${item.variance}` : item.variance}</td>
                              <td className="px-4 py-3 text-center font-bold">
                                <span className={item.variancePct > 12 ? "text-rose-600" : item.variancePct > 5 ? "text-amber-600" : "text-emerald-600"}>
                                  {item.variancePct}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  item.flagLevel === "Critical" ? "bg-rose-100 text-rose-700" :
                                  item.flagLevel === "High" ? "bg-amber-100 text-amber-700" :
                                  item.flagLevel === "Medium" ? "bg-blue-100 text-blue-700" :
                                  "bg-emerald-100 text-emerald-700"
                                }`}>{item.flagLevel}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 4. POS DISCREPANCIES ──────────────────────────── */}
              {auditSubTab === "pos" && !auditLoading && auditPosDiscrepancies && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Mismatch (₹)", value: `₹${(auditPosDiscrepancies.summary?.totalMismatch || 0).toLocaleString("en-IN")}`, color: "text-rose-600" },
                      { label: "Critical Outlets", value: auditPosDiscrepancies.summary?.criticalOutlets ?? 0, color: "text-rose-600" },
                      { label: "High Risk", value: auditPosDiscrepancies.summary?.highRisk ?? 0, color: "text-amber-600" },
                    ].map((k, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{k.label}</span>
                        <span className={`text-2xl font-black mt-1 block ${k.color}`}>{k.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(auditPosDiscrepancies.discrepancies || []).map((d: any) => (
                      <div key={d.outletId} className={`bg-white rounded-2xl border shadow-xs p-4 space-y-3 ${d.riskLevel === "Critical" ? "border-rose-200" : d.riskLevel === "High" ? "border-amber-200" : "border-slate-200"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{d.outletName}</h4>
                            <p className="text-[10px] text-slate-400">{d.city} · Manager: {d.manager}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            d.riskLevel === "Critical" ? "bg-rose-100 text-rose-700" :
                            d.riskLevel === "High" ? "bg-amber-100 text-amber-700" :
                            d.riskLevel === "Medium" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                          }`}>{d.riskLevel}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                            <span className="text-slate-400 block text-[9px] font-bold">MISMATCH</span>
                            <span className="font-black text-rose-600">₹{d.mismatch.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                            <span className="text-slate-400 block text-[9px] font-bold">CASH RATIO</span>
                            <span className="font-black text-amber-600">{d.cashRatio}%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                            <span className="text-slate-400 block text-[9px] font-bold">EST. VOIDS</span>
                            <span className="font-black text-slate-700">{d.estimatedVoids}</span>
                          </div>
                        </div>
                        {d.overrideFlag && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[10px] text-amber-800 font-semibold">
                            ⚠️ {d.overrideFlag}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 flex gap-4">
                          <span>Cash: ₹{d.paymentSplit.cash.toLocaleString("en-IN")}</span>
                          <span>Card: ₹{d.paymentSplit.card.toLocaleString("en-IN")}</span>
                          <span>UPI: ₹{d.paymentSplit.upi.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 5. SHIFT VERIFICATION ─────────────────────────── */}
              {auditSubTab === "shifts" && !auditLoading && auditShiftVerification && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Cert Gaps", value: auditShiftVerification.summary?.totalCertGaps ?? 0, color: "text-rose-600" },
                      { label: "Understaffed Outlets", value: auditShiftVerification.summary?.understaffedOutlets ?? 0, color: "text-amber-600" },
                      { label: "Missing Managers", value: auditShiftVerification.summary?.missingManagers ?? 0, color: "text-rose-600" },
                    ].map((k, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{k.label}</span>
                        <span className={`text-2xl font-black mt-1 block ${k.color}`}>{k.value}</span>
                      </div>
                    ))}
                  </div>
                  {(auditShiftVerification.outlets || []).map((outlet: any) => (
                    <div key={outlet.outletId} className={`bg-white rounded-2xl border shadow-xs p-4 space-y-3 ${outlet.riskLevel === "Critical" ? "border-rose-200" : outlet.riskLevel === "High" ? "border-amber-200" : "border-slate-200"}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{outlet.outletName}</h4>
                          <p className="text-[10px] text-slate-400">{outlet.city} · {outlet.manager}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${outlet.coverageFlag === "Adequate" ? "bg-emerald-100 text-emerald-700" : outlet.coverageFlag === "Borderline" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                            {outlet.coverageFlag}
                          </span>
                          {!outlet.managerPresent && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">No Manager On-Site</span>
                          )}
                          <span className="text-xs font-bold text-slate-600">Attendance: {outlet.attendanceRate}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[11px]">
                        {[
                          { label: "Scheduled", val: outlet.scheduled },
                          { label: "Active", val: outlet.active },
                          { label: "Morning", val: outlet.shiftBreakdown.morning },
                          { label: "Evening", val: outlet.shiftBreakdown.evening },
                        ].map((s, i) => (
                          <div key={i} className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                            <span className="text-[9px] text-slate-400 block font-bold">{s.label}</span>
                            <span className="font-black text-slate-700 text-base">{s.val}</span>
                          </div>
                        ))}
                      </div>
                      {outlet.certificationGaps.length > 0 && (
                        <div className="border border-rose-100 rounded-xl overflow-hidden">
                          <div className="bg-rose-50 px-3 py-1.5 text-[10px] font-bold text-rose-700 uppercase">Certification Gaps ({outlet.certificationGaps.length})</div>
                          <div className="divide-y divide-rose-50">
                            {outlet.certificationGaps.slice(0, 4).map((gap: any) => (
                              <div key={gap.staffId} className="px-3 py-2 flex justify-between text-[10px]">
                                <span className="font-semibold text-slate-800">{gap.name} ({gap.role})</span>
                                <span className="text-rose-600 font-bold">Rating: {gap.rating}/5</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── 6. FACILITY INCIDENTS ─────────────────────────── */}
              {auditSubTab === "incidents" && !auditLoading && auditIncidents && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Open", value: auditIncidents.summary?.open ?? 0, color: "text-rose-600" },
                      { label: "In Progress", value: auditIncidents.summary?.inProgress ?? 0, color: "text-amber-600" },
                      { label: "Resolved", value: auditIncidents.summary?.resolved ?? 0, color: "text-emerald-600" },
                      { label: "Critical Priority", value: auditIncidents.summary?.critical ?? 0, color: "text-rose-600" },
                    ].map((k, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{k.label}</span>
                        <span className={`text-2xl font-black mt-1 block ${k.color}`}>{k.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(auditIncidents.incidents || []).map((inc: any) => (
                      <div key={inc.id} className={`bg-white rounded-2xl border shadow-xs p-4 space-y-3 ${inc.priority === "Critical" ? "border-rose-200" : inc.priority === "High" ? "border-amber-200" : "border-slate-200"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${inc.priority === "Critical" ? "bg-rose-100 text-rose-700" : inc.priority === "High" ? "bg-amber-100 text-amber-700" : inc.priority === "Medium" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                                {inc.priority}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">{inc.incident_type}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${inc.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : inc.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"}`}>
                                {inc.status}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">{inc.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-1">{inc.outletName} · {inc.city}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">{inc.description}</p>
                        {inc.assigned_to && (
                          <p className="text-[10px] text-slate-400">Assigned: <span className="font-semibold text-slate-600">{inc.assigned_to}</span></p>
                        )}
                        <div className="flex gap-2 pt-1">
                          {inc.status !== "In Progress" && inc.status !== "Resolved" && (
                            <button id={`btn-incident-${inc.id}-progress`} onClick={() => handleUpdateIncident(inc.id, "In Progress")} className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-blue-700 transition-all">
                              Mark In Progress
                            </button>
                          )}
                          {inc.status !== "Resolved" && (
                            <button id={`btn-incident-${inc.id}-resolve`} onClick={() => handleUpdateIncident(inc.id, "Resolved")} className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-emerald-700 transition-all">
                              ✓ Resolve
                            </button>
                          )}
                          {inc.status === "Resolved" && (
                            <span className="text-[10px] text-emerald-600 font-bold">✓ Resolved {inc.resolved_date ? `on ${inc.resolved_date}` : ""}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 7. ANOMALY FLAGS ──────────────────────────────── */}
              {auditSubTab === "anomalies" && !auditLoading && auditAnomalies && (
                <div className="space-y-4">
                  <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">AI Anomaly Detection Engine</h3>
                      <p className="text-[10px] text-slate-400">Cross-domain risk signals from inventory, POS, staffing, and audit sessions</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <span className="text-[9px] text-slate-400 block">CRITICAL</span>
                        <span className="text-xl font-black text-rose-400">{auditAnomalies.summary?.critical ?? 0}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] text-slate-400 block">HIGH</span>
                        <span className="text-xl font-black text-amber-400">{auditAnomalies.summary?.high ?? 0}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] text-slate-400 block">TOTAL</span>
                        <span className="text-xl font-black text-slate-100">{auditAnomalies.summary?.total ?? 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(auditAnomalies.anomalies || []).map((anomaly: any) => (
                      <div key={anomaly.id} className={`bg-white rounded-2xl border shadow-xs p-4 ${anomaly.severity === "Critical" ? "border-rose-200" : "border-amber-200"}`}>
                        <div className="flex items-start gap-3">
                          <div className={`text-xl shrink-0 ${anomaly.severity === "Critical" ? "text-rose-500" : "text-amber-500"}`}>
                            {anomaly.severity === "Critical" ? "🔴" : "🟡"}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${anomaly.severity === "Critical" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                                  {anomaly.severity}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900">{anomaly.type}</h4>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{anomaly.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{anomaly.description}</p>
                            <div className="bg-slate-50 rounded-xl border border-slate-100 px-3 py-2">
                              <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Recommended Action</span>
                              <p className="text-[10px] text-slate-700 font-semibold">{anomaly.action}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(auditAnomalies.anomalies || []).length === 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-emerald-600 font-bold text-sm">
                        ✅ No anomalies detected. Franchise network is operating within normal parameters.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── 8. AUDIT REPORT ───────────────────────────────── */}
              {auditSubTab === "report" && !auditLoading && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Network Compliance Audit Report</h3>
                        <p className="text-xs text-slate-400">Auto-generated from all completed audit sessions · {new Date().toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-wider">Live Data</span>
                    </div>

                    {/* Compliance Scores Bar Chart */}
                    {auditComplianceData.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Compliance Scores Overview</h4>
                        <div className="h-64 w-full bg-slate-50 border border-slate-100 rounded-xl p-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={auditComplianceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="Score" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Overall Score" />
                              <Bar dataKey="Hygiene" fill="#10b981" radius={[4, 4, 0, 0]} name="Hygiene Score" />
                              <Bar dataKey="FoodSafety" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Food Safety Score" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Per-outlet grading */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Outlet-Level Compliance Grades</h4>
                      <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                        <div className="bg-slate-50 px-4 py-2 grid grid-cols-5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                          <span>Outlet</span>
                          <span className="text-center">Score</span>
                          <span className="text-center">Grade</span>
                          <span className="text-center">Hygiene</span>
                          <span className="text-center">Food Safety</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {auditSessions
                            .filter((s: any) => s.passFail !== "Pending")
                            .sort((a: any, b: any) => b.overallScore - a.overallScore)
                            .map((s: any) => {
                              const grade = s.overallScore >= 90 ? "A" : s.overallScore >= 80 ? "B" : s.overallScore >= 70 ? "C" : "F";
                              const gradeColor = grade === "A" ? "text-emerald-600" : grade === "B" ? "text-blue-600" : grade === "C" ? "text-amber-600" : "text-rose-600";
                              return (
                                <div key={s.id} className="px-4 py-2.5 grid grid-cols-5 items-center hover:bg-slate-50/50">
                                  <span className="font-semibold text-slate-800">{s.outletName}</span>
                                  <span className="text-center font-black text-slate-700">{s.overallScore.toFixed(1)}</span>
                                  <span className={`text-center font-black text-lg ${gradeColor}`}>{grade}</span>
                                  <span className="text-center text-slate-600">{s.hygieneScore.toFixed(0)}%</span>
                                  <span className="text-center text-slate-600">{s.foodSafetyScore.toFixed(0)}%</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Top risks */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Top Risk Areas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { risk: "Cold Chain Compliance", detail: "2 outlets flagged for temperature deviations above safe threshold", severity: "Critical" },
                          { risk: "Cash POS Reconciliation", detail: "Payment settlement mismatch detected across 3 outlets", severity: "High" },
                          { risk: "Staff Certification Gaps", detail: "Multiple staff members below re-certification threshold", severity: "High" },
                        ].map((r, i) => (
                          <div key={i} className={`p-3 rounded-xl border text-xs ${r.severity === "Critical" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
                            <span className={`text-[9px] font-bold uppercase ${r.severity === "Critical" ? "text-rose-600" : "text-amber-600"}`}>{r.severity}</span>
                            <p className="font-bold text-slate-900 mt-0.5">{r.risk}</p>
                            <p className="text-[10px] text-slate-600 mt-1">{r.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended actions */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recommended Actions</h4>
                      <div className="space-y-2">
                        {[
                          "📦 Immediate refrigeration audit at Anna Nagar Cafe — verify cold chain compliance and replace faulty unit",
                          "💳 Pull POS void logs for Mumbai Central and cross-reference with supervisor sign-off records",
                          "👤 Schedule mandatory food safety re-certification for flagged staff before next audit cycle",
                          "🔧 Prioritize resolution of 2 Critical facility incidents within 24-hour SLA window",
                          "📋 Establish monthly rolling audit schedule — minimum quarterly visits per outlet",
                        ].map((action, i) => (
                          <div key={i} className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-2.5 text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-slate-400 font-bold text-[10px] shrink-0 mt-0.5">{i + 1}.</span>
                            <span className="leading-relaxed">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 8: FRANCHISE INTELLIGENCE ENGINE */}
          {activeStepId === 8 && (
            <div className="space-y-4 animate-in fade-in duration-300">

              {/* Sub-Tab Nav Bar */}
              <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-wrap gap-2">
                {/* 1. AI Problem & Resolution Solver */}
                <button
                  onClick={() => setIntelligenceSubTab("recommendations")}
                  className={getTabClass("recommendations", intelligenceSubTab === "recommendations")}
                >
                  <span>🛠️ AI Problem & Resolution Solver</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    intelligenceSubTab === "recommendations" 
                      ? "bg-emerald-500/20 text-emerald-300" 
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {intelligenceRecommendations?.summary?.total ?? 6}
                  </span>
                </button>

                {/* 2. Predictive Anomaly & Risk Radar */}
                <button
                  onClick={() => setIntelligenceSubTab("risks")}
                  className={getTabClass("risks", intelligenceSubTab === "risks")}
                >
                  <span className="text-amber-400 font-bold">⚠️</span>
                  <span>Predictive Anomaly & Risk Radar</span>
                </button>

                {/* 3. Autonomous AI Operations Agents */}
                <button
                  onClick={() => setIntelligenceSubTab("overview")}
                  className={getTabClass("overview", intelligenceSubTab === "overview")}
                >
                  <span>🤖 Autonomous AI Operations Agents</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    intelligenceSubTab === "overview" 
                      ? "bg-indigo-500/20 text-indigo-300" 
                      : "bg-indigo-100 text-indigo-700"
                  }`}>
                    {outlets?.length || 6} Active
                  </span>
                </button>

                {/* 4. Multi-Store Benchmark & SOP Trans... */}
                <button
                  onClick={() => setIntelligenceSubTab("health")}
                  className={getTabClass("health", intelligenceSubTab === "health")}
                >
                  <span>🥞 Multi-Store Benchmark & SOP Trans...</span>
                </button>
              </div>

              {/* Loading State */}
              {intelligenceLoading && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 flex flex-col items-center space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center animate-pulse">
                    <Icons.Intelligence />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Intelligence Engine Processing…</p>
                  <p className="text-xs text-slate-400">Consolidating outputs from all agents</p>
                  <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse" style={{ width: "70%" }} />
                  </div>
                </div>
              )}

              {/* ── 1. COMMAND CENTER OVERVIEW ─────────────────────── */}
              {intelligenceSubTab === "overview" && !intelligenceLoading && intelligenceConsolidated && (
                <div className="space-y-4">
                  {/* Network Summary KPI Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500 font-medium">Network Health Score</span>
                      <div className="text-2xl font-black mt-1" style={{ color: intelligenceConsolidated.networkSummary.avgHealthScore >= 75 ? "#10b981" : intelligenceConsolidated.networkSummary.avgHealthScore >= 55 ? "#f59e0b" : "#ef4444" }}>
                        {intelligenceConsolidated.networkSummary.avgHealthScore}<span className="text-sm font-semibold text-slate-400">/100</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{intelligenceConsolidated.networkSummary.totalOutlets} outlets monitored</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500 font-medium">Total Network Revenue</span>
                      <div className="text-xl font-black text-slate-900 mt-1">₹{(intelligenceConsolidated.networkSummary.totalRevenue / 100000).toFixed(1)}L</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Profit: ₹{(intelligenceConsolidated.networkSummary.totalProfit / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500 font-medium">Stock Risk Alerts</span>
                      <div className="text-xl font-black text-amber-600 mt-1">{intelligenceConsolidated.networkSummary.criticalStockAlerts + intelligenceConsolidated.networkSummary.lowStockAlerts}</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{intelligenceConsolidated.networkSummary.criticalStockAlerts} critical · {intelligenceConsolidated.networkSummary.lowStockAlerts} low</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500 font-medium">Marketing ROAS</span>
                      <div className={`text-xl font-black mt-1 ${intelligenceConsolidated.networkSummary.marketingRoas >= 2 ? "text-emerald-600" : intelligenceConsolidated.networkSummary.marketingRoas >= 1 ? "text-indigo-600" : "text-rose-600"}`}>
                        {intelligenceConsolidated.networkSummary.marketingRoas}x
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{intelligenceConsolidated.networkSummary.totalCampaigns} active campaigns</span>
                    </div>
                  </div>



                  {/* Per-Outlet Consolidated Matrix */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Consolidated Agent Outputs Matrix</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Cross-agent data aggregated per franchise outlet</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{intelligenceConsolidated.outlets.length} outlets</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-4 py-3 text-left">Outlet</th>
                            <th className="px-4 py-3 text-center">Health</th>
                            <th className="px-4 py-3 text-right">Revenue</th>
                            <th className="px-4 py-3 text-center">Margin</th>
                            <th className="px-4 py-3 text-center">Inventory</th>
                            <th className="px-4 py-3 text-center">Staff Avg</th>
                            <th className="px-4 py-3 text-center">Audit %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {intelligenceConsolidated.outlets.map((o: any) => (
                            <tr key={o.outletId} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900">{o.outletName}</div>
                                <div className="text-[10px] text-slate-400">{o.city} · Mgr: {o.manager}</div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" style={{ background: o.healthScore >= 75 ? "rgba(16,185,129,0.15)" : o.healthScore >= 55 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", color: o.healthScore >= 75 ? "#059669" : o.healthScore >= 55 ? "#d97706" : "#dc2626" }}>
                                    {o.healthScore}
                                  </div>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${o.gradeColor}`}>{o.grade}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-800">₹{(o.agentOutputs.sales.revenue / 100000).toFixed(1)}L</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-bold ${o.agentOutputs.sales.margin >= 30 ? "text-emerald-600" : o.agentOutputs.sales.margin >= 20 ? "text-indigo-600" : "text-rose-600"}`}>{o.agentOutputs.sales.margin}%</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {o.agentOutputs.inventory.criticalStock > 0 ? (
                                  <span className="text-rose-600 font-bold">{o.agentOutputs.inventory.criticalStock} 🔴</span>
                                ) : o.agentOutputs.inventory.lowStock > 0 ? (
                                  <span className="text-amber-600 font-bold">{o.agentOutputs.inventory.lowStock} ⚠️</span>
                                ) : (
                                  <span className="text-emerald-600 font-bold">✓ OK</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-bold ${o.agentOutputs.staff.avgRating >= 4.2 ? "text-emerald-600" : o.agentOutputs.staff.avgRating >= 3.5 ? "text-indigo-600" : "text-rose-600"}`}>{o.agentOutputs.staff.avgRating}/5</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-bold ${o.agentOutputs.audit.passRate >= 75 ? "text-emerald-600" : o.agentOutputs.audit.passRate >= 50 ? "text-amber-600" : "text-rose-600"}`}>{o.agentOutputs.audit.passRate}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Benchmark Outliers & Health Score Simulator Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Performance Benchmarks Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 lg:col-span-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Network Performance Benchmarks</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 mb-4">Top and bottom multi-dimensional outliers</p>
                        
                        {outliers && (
                          <div className="space-y-3.5">
                            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center space-x-3">
                              <span className="text-2xl">🏆</span>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Revenue Champion</div>
                                <div className="text-xs font-bold text-slate-800 truncate">{outliers.maxRev.outletName}</div>
                                <div className="text-[10px] text-slate-500">₹{(outliers.maxRev.agentOutputs.sales.revenue / 100000).toFixed(1)}L Gross Revenue</div>
                              </div>
                            </div>

                            <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 flex items-center space-x-3">
                              <span className="text-2xl">📈</span>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-sky-800">Margin Champion</div>
                                <div className="text-xs font-bold text-slate-800 truncate">{outliers.maxMargin.outletName}</div>
                                <div className="text-[10px] text-slate-500">{outliers.maxMargin.agentOutputs.sales.margin}% operating margin</div>
                              </div>
                            </div>

                            <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100 flex items-center space-x-3">
                              <span className="text-2xl">📋</span>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-violet-800">Audit Champion</div>
                                <div className="text-xs font-bold text-slate-800 truncate">{outliers.maxAudit.outletName}</div>
                                <div className="text-[10px] text-slate-500">{outliers.maxAudit.agentOutputs.audit.avgScore}/100 audit score</div>
                              </div>
                            </div>

                            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center space-x-3">
                              <span className="text-2xl">⚠️</span>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-rose-800">Needs Support</div>
                                <div className="text-xs font-bold text-slate-800 truncate">{outliers.minHealth.outletName}</div>
                                <div className="text-[10px] text-rose-500 font-medium">Health Score: {outliers.minHealth.healthScore} ({outliers.minHealth.grade})</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Franchise Health Score Simulator */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 lg:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Franchise Health Score Simulator</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Simulate how KPIs affect Health Score & Grade in real-time</p>
                        </div>
                        
                        {/* Selector to load outlet values */}
                        <select 
                          className="text-[11px] font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={simulatedOutletId || ""}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setSimulatedOutletId(val);
                            const found = intelligenceConsolidated.outlets.find((o: any) => o.outletId === val);
                            if (found) {
                              setSimulatedRevenue(found.agentOutputs.sales.revenue);
                              setSimulatedMargin(found.agentOutputs.sales.margin);
                              setSimulatedStockIssues(found.agentOutputs.inventory.criticalStock + found.agentOutputs.inventory.lowStock);
                              setSimulatedStaffRating(found.agentOutputs.staff.avgRating);
                              setSimulatedAuditScore(found.agentOutputs.audit.avgScore || 75);
                              setSimulatedOrders(found.agentOutputs.sales.orders);
                            }
                          }}
                        >
                          {intelligenceConsolidated.outlets.map((o: any) => (
                            <option key={o.outletId} value={o.outletId}>Load: {o.outletName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                        {/* Sliders panel */}
                        <div className="md:col-span-2 space-y-3">
                          <div>
                            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                              <span>Gross Revenue</span>
                              <span className="font-bold text-slate-800">₹{(simulatedRevenue / 100000).toFixed(1)}L</span>
                            </div>
                            <input 
                              type="range" min="100000" max="1500000" step="50000"
                              value={simulatedRevenue}
                              onChange={(e) => setSimulatedRevenue(parseInt(e.target.value, 10))}
                              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                              <span>Operating Profit Margin</span>
                              <span className="font-bold text-slate-800">{simulatedMargin}%</span>
                            </div>
                            <input 
                              type="range" min="0" max="50" step="1"
                              value={simulatedMargin}
                              onChange={(e) => setSimulatedMargin(parseInt(e.target.value, 10))}
                              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                              <span>Stock Shortages (Low / Critical)</span>
                              <span className="font-bold text-slate-800">{simulatedStockIssues} items</span>
                            </div>
                            <input 
                              type="range" min="0" max="10" step="1"
                              value={simulatedStockIssues}
                              onChange={(e) => setSimulatedStockIssues(parseInt(e.target.value, 10))}
                              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-1">
                                <span>Staff Rating</span>
                                <span className="font-bold text-slate-800">{simulatedStaffRating}/5</span>
                              </div>
                              <input 
                                type="range" min="1" max="5" step="0.1"
                                value={simulatedStaffRating}
                                onChange={(e) => setSimulatedStaffRating(parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-1">
                                <span>Audit Score</span>
                                <span className="font-bold text-slate-800">{simulatedAuditScore}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" step="1"
                                value={simulatedAuditScore}
                                onChange={(e) => setSimulatedAuditScore(parseInt(e.target.value, 10))}
                                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Visual output panel */}
                        <div className="md:col-span-1 bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Simulated Score</span>
                          
                          <div className="relative flex items-center justify-center mt-3 mb-2">
                            {/* Inner circle with values */}
                            <div className="w-24 h-24 rounded-full bg-white border border-slate-100 shadow-xs flex flex-col items-center justify-center">
                              <span className="text-3xl font-black text-slate-800">{simulatedHealthScore.score}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border mt-1.5 ${simulatedHealthScore.gradeColor}`}>
                                Grade {simulatedHealthScore.grade}
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] font-medium text-slate-500 leading-normal mt-1">
                            {simulatedHealthScore.score >= 80 ? (
                              <span className="text-emerald-600 font-semibold">Healthy performance & high standards. Ready for expansion.</span>
                            ) : simulatedHealthScore.score >= 60 ? (
                              <span className="text-indigo-600 font-semibold">Moderately healthy. Focus on inventory and audit compliance to raise score.</span>
                            ) : (
                              <span className="text-rose-600 font-bold">Needs critical support! Urgently audit cost structure and compliance gaps.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 2. HEALTH SCORE ENGINE ─────────────────────────── */}
              {intelligenceSubTab === "health" && !intelligenceLoading && intelligenceHealthScores.length > 0 && (
                <div className="space-y-4">
                  {/* Summary Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Avg Network Score", val: Math.round(intelligenceHealthScores.reduce((s, o) => s + o.healthScore, 0) / (intelligenceHealthScores.length || 1)), unit: "/100", color: "text-indigo-600" },
                      { label: "Excellent (≥80)", val: intelligenceHealthScores.filter(o => o.healthScore >= 80).length, unit: " outlets", color: "text-emerald-600" },
                      { label: "At Risk (50–64)", val: intelligenceHealthScores.filter(o => o.healthScore >= 50 && o.healthScore < 65).length, unit: " outlets", color: "text-amber-600" },
                      { label: "Critical (<50)", val: intelligenceHealthScores.filter(o => o.healthScore < 50).length, unit: " outlets", color: "text-rose-600" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-xs text-slate-500 font-medium">{s.label}</span>
                        <div className={`text-2xl font-black mt-1 ${s.color}`}>{s.val}<span className="text-sm font-semibold text-slate-400">{s.unit}</span></div>
                      </div>
                    ))}
                  </div>

                  {/* Bar Chart */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900">Composite Health Score by Outlet</h3>
                    <p className="text-xs text-slate-500">Weighted across Financial (35%), Operational (25%), Compliance (20%), Marketing (20%)</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={intelligenceHealthScores} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="city" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <Tooltip formatter={(v: any) => [`${v}/100`, "Health Score"]} labelFormatter={(l) => `Outlet: ${l}`} />
                          <Bar dataKey="healthScore" radius={[6, 6, 0, 0]} fill="#4f46e5"
                            label={{ position: "top", fontSize: 10, fill: "#475569", fontWeight: "bold" }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Score Breakdown Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900">Score Component Breakdown</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Individual KPI contribution per outlet (out of max points)</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-4 py-3 text-left">Outlet</th>
                            <th className="px-4 py-3 text-center">Total</th>
                            <th className="px-4 py-3 text-center">Grade</th>
                            <th className="px-4 py-3 text-center">Financial /35</th>
                            <th className="px-4 py-3 text-center">Revenue /10</th>
                            <th className="px-4 py-3 text-center">Inventory /15</th>
                            <th className="px-4 py-3 text-center">Staff /10</th>
                            <th className="px-4 py-3 text-center">Compliance /20</th>
                            <th className="px-4 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {intelligenceHealthScores.map((o: any) => (
                            <tr key={o.outletId} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900">{o.outletName}</div>
                                <div className="text-[10px] text-slate-400">{o.city}</div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="font-black text-sm" style={{ color: o.healthScore >= 75 ? "#059669" : o.healthScore >= 55 ? "#d97706" : "#dc2626" }}>{o.healthScore}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${o.gradeColor}`}>{o.grade}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${(o.components.financial / 35) * 100}%` }} />
                                  </div>
                                  <span className="text-slate-600 w-6 text-right">{o.components.financial}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-slate-700 font-semibold">{o.components.revenue}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-semibold ${o.components.inventory >= 12 ? "text-emerald-600" : o.components.inventory >= 7 ? "text-amber-600" : "text-rose-600"}`}>{o.components.inventory}</span>
                              </td>
                              <td className="px-4 py-3 text-center text-slate-700 font-semibold">{o.components.staff}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-semibold ${o.components.compliance >= 16 ? "text-emerald-600" : o.components.compliance >= 12 ? "text-amber-600" : "text-rose-600"}`}>{o.components.compliance}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-[10px] font-bold ${o.trendColor}`}>{o.trend}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 3. RISK PREDICTION ENGINE ──────────────────────── */}
              {intelligenceSubTab === "risks" && !intelligenceLoading && intelligenceRisks && (
                <div className="space-y-6">
                  
                  {/* Predictive Anomaly & Risk Radar Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                          <span className="text-amber-500 text-lg">⚠️</span>
                          <span>14-30 Day Multi-Store Predictive Anomaly Radar</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Proactive forecasting across 4 critical risk dimensions: Stockout Probability, Labor Fatigue, CSAT Erosion, and Margin Squeeze.
                        </p>
                      </div>
                      
                      {/* Legend */}
                      <div className="flex items-center space-x-4 text-xs font-bold shrink-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                          <span className="text-rose-700 text-[10px]">High/Critical Risk (&gt;60%)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                          <span className="text-emerald-700 text-[10px]">Safe (&lt;30%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Grouped Bar Chart */}
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={intelligenceRisks.predictiveRadar || []}
                          margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="outletName" tick={{ fontSize: 10, fill: '#475569', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                            formatter={(value: any, name: any) => {
                              let displayName = String(name || '');
                              if (displayName === "stockoutRisk") displayName = "Stockout Probability";
                              else if (displayName === "laborFatigue") displayName = "Labor Fatigue";
                              else if (displayName === "csatRisk") displayName = "CSAT Erosion";
                              else if (displayName === "marginRisk") displayName = "Margin Squeeze";
                              return [`${value}%`, displayName];
                            }}
                          />
                          <Bar dataKey="stockoutRisk" fill="#f59e0b" name="Stockout Probability" radius={[4, 4, 0, 0]} maxBarSize={16} />
                          <Bar dataKey="laborFatigue" fill="#ef4444" name="Labor Fatigue" radius={[4, 4, 0, 0]} maxBarSize={16} />
                          <Bar dataKey="csatRisk" fill="#3b82f6" name="CSAT Erosion" radius={[4, 4, 0, 0]} maxBarSize={16} />
                          <Bar dataKey="marginRisk" fill="#10b981" name="Margin Squeeze" radius={[4, 4, 0, 0]} maxBarSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3">Outlet Store</th>
                            <th className="px-4 py-3 text-center">Stockout Risk</th>
                            <th className="px-4 py-3 text-center">Labor Fatigue</th>
                            <th className="px-4 py-3 text-center">CSAT Risk</th>
                            <th className="px-4 py-3 text-center">Margin Risk</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3">AI Preventive Prescription</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(intelligenceRisks.predictiveRadar || []).map((row: any) => {
                            const getRiskColor = (val: number) => {
                              if (val > 60) return "text-rose-600 font-bold";
                              if (val < 30) return "text-emerald-600 font-semibold";
                              return "text-slate-600";
                            };

                            const getStatusBadge = (status: string) => {
                              if (status === 'CRITICAL') return "bg-rose-100 text-rose-800 border-rose-200";
                              if (status === 'HIGH') return "bg-amber-100 text-amber-800 border-amber-200";
                              if (status === 'MEDIUM') return "bg-yellow-100 text-yellow-800 border-yellow-200";
                              return "bg-emerald-100 text-emerald-800 border-emerald-200";
                            };

                            return (
                              <tr key={row.outletId} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-bold text-slate-800">{row.outletFullName}</div>
                                  <div className="text-[10px] text-slate-400">{row.city}</div>
                                </td>
                                <td className={`px-4 py-3 text-center ${getRiskColor(row.stockoutRisk)}`}>{row.stockoutRisk}%</td>
                                <td className={`px-4 py-3 text-center ${getRiskColor(row.laborFatigue)}`}>{row.laborFatigue}%</td>
                                <td className={`px-4 py-3 text-center ${getRiskColor(row.csatRisk)}`}>{row.csatRisk}%</td>
                                <td className={`px-4 py-3 text-center ${getRiskColor(row.marginRisk)}`}>{row.marginRisk}%</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getStatusBadge(row.status)}`}>
                                    {row.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-lg max-w-sm">
                                    <span className="text-emerald-600 shrink-0">✨</span>
                                    <span className="text-[11px] leading-snug">{row.prescription}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detailed Risk Signals Section */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Granular Risk Alerts</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      {[
                        { label: "Critical Risks", val: intelligenceRisks.summary.critical, bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", num: "text-rose-600" },
                        { label: "High Risks", val: intelligenceRisks.summary.high, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", num: "text-amber-600" },
                        { label: "Medium Risks", val: intelligenceRisks.summary.medium, bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", num: "text-yellow-600" },
                        { label: "Total Identified", val: intelligenceRisks.summary.total, bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", num: "text-slate-800" },
                      ].map((s) => (
                        <div key={s.label} className={`${s.bg} p-4 rounded-2xl border ${s.border}`}>
                          <span className={`text-xs font-bold ${s.text}`}>{s.label}</span>
                          <div className={`text-3xl font-black mt-1 ${s.num}`}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Cards */}
                  <div className="space-y-3">
                    {intelligenceRisks.risks.map((risk: any) => {
                      const sev = risk.severity;
                      const sevStyle = sev === "Critical"
                        ? { border: "border-rose-200", bg: "bg-rose-50", badge: "bg-rose-100 text-rose-800 border-rose-300", icon: "🔴" }
                        : sev === "High"
                        ? { border: "border-amber-200", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-800 border-amber-300", icon: "🟠" }
                        : { border: "border-yellow-200", bg: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: "🟡" };

                      return (
                        <div key={risk.id} className={`bg-white rounded-2xl border ${sevStyle.border} shadow-xs overflow-hidden`}>
                          <div className={`px-4 py-2 ${sevStyle.bg} border-b ${sevStyle.border} flex items-center justify-between`}>
                            <div className="flex items-center space-x-2">
                              <span>{sevStyle.icon}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sevStyle.badge}`}>{risk.severity}</span>
                              <span className="text-[10px] font-semibold text-slate-600">{risk.type}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{risk.city !== "All Outlets" ? `${risk.outletName} · ${risk.city}` : "🌐 Network-Wide"}</span>
                          </div>
                          <div className="p-4 space-y-2">
                            <h4 className="text-sm font-bold text-slate-900">{risk.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{risk.description}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-xs">
                                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide block mb-1">Business Impact</span>
                                <span className="text-slate-700 leading-relaxed">{risk.impact}</span>
                              </div>
                              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-xs">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">Mitigation Action</span>
                                <span className="text-slate-700 leading-relaxed">{risk.mitigation}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}



              {/* ── 5. STRATEGIC RECOMMENDATIONS (AI Solver) ──────────────────── */}
              {intelligenceSubTab === "recommendations" && !intelligenceLoading && intelligenceRecommendations && (
                <div className="space-y-6">
                  {/* Summary Strip */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900">Strategic Recommendation Engine</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Prioritized actions ranked by urgency × impact across all outlets</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="font-bold text-rose-700">P1 Critical: {intelligenceRecommendations.summary.p1}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="font-bold text-amber-700">P2 High: {intelligenceRecommendations.summary.p2}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-bold text-blue-700">P3 Medium: {intelligenceRecommendations.summary.p3}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Cards */}
                  <div className="space-y-3">
                    {intelligenceRecommendations.recommendations.map((rec: any, idx: number) => (
                      <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        {/* Card Header */}
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-black text-slate-400 w-5">{String(idx + 1).padStart(2, "0")}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${rec.priorityColor}`}>{rec.priority} · {rec.priorityLabel}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{rec.category}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px]">
                            {rec.affectedOutlets.map((o: any) => (
                              <span key={o.id ?? 0} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{o.name} · {o.city}</span>
                            ))}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-start space-x-3">
                            <span className="text-xl shrink-0">{rec.icon}</span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rec.rationale}</p>
                            </div>
                          </div>

                          {/* Action Checklist */}
                          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Action Plan</span>
                            {rec.actions.map((action: string, i: number) => (
                              <div key={i} className="flex items-start space-x-2 text-xs">
                                <span className="text-indigo-500 font-black mt-0.5 shrink-0">{i + 1}.</span>
                                <span className="text-slate-700 leading-relaxed">{action}</span>
                              </div>
                            ))}
                          </div>

                          {/* Estimated Impact */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide shrink-0">Estimated Impact:</span>
                            <span className="text-xs text-emerald-800 font-semibold leading-relaxed">{rec.estimatedImpact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Operational Growth Opportunities Integrated */}
                  {intelligenceOpportunities && intelligenceOpportunities.opportunities && (
                    <div className="pt-6 border-t border-slate-200">
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-slate-900">Operational Growth Opportunities</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Targeted growth triggers discovered by market intelligence agents</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {intelligenceOpportunities.opportunities.map((opp: any) => {
                          const priStyle = opp.priority === "High"
                            ? { border: "border-emerald-200", headerBg: "bg-emerald-50 border-b border-emerald-200", badge: "bg-emerald-100 text-emerald-800" }
                            : opp.priority === "Medium"
                            ? { border: "border-amber-200", headerBg: "bg-amber-50 border-b border-amber-200", badge: "bg-amber-100 text-amber-800" }
                            : { border: "border-slate-200", headerBg: "bg-slate-50 border-b border-slate-200", badge: "bg-slate-100 text-slate-600" };

                          return (
                            <div key={opp.id} className={`bg-white rounded-2xl border ${priStyle.border} shadow-xs overflow-hidden`}>
                              <div className={`px-4 py-2.5 ${priStyle.headerBg} flex items-center justify-between`}>
                                <div className="flex items-center space-x-2">
                                  <span className="text-base">{opp.icon}</span>
                                  <div>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${priStyle.badge}`}>{opp.priority} Priority</span>
                                    <span className="text-[10px] text-slate-500 ml-1.5">{opp.type}</span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{opp.impactLabel}</span>
                              </div>
                              <div className="p-4 space-y-2.5">
                                <h4 className="text-sm font-bold text-slate-900 leading-tight">{opp.title}</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{opp.description}</p>
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2.5">
                                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide block mb-1">Recommended Action</span>
                                  <span className="text-xs text-slate-700 leading-relaxed">{opp.action}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                                  <span>{opp.outletName} · {opp.city}</span>
                                  <span className="font-semibold text-slate-500">{opp.category}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 9: STRATEGIC BUSINESS RECOMMENDATIONS */}
          {activeStepId === 9 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">Strategic Recommendations Panel</h2>
                  <p className="text-xs text-slate-400">Algorithmic action plans generated by cross-agent reasoning</p>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30">
                  Step 9 Active
                </span>
              </div>

              {intelligenceLoading && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 flex flex-col items-center space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center animate-pulse">
                    <Icons.Intelligence />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Synthesizing Recommendations...</p>
                  <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: "80%" }} />
                  </div>
                </div>
              )}

              {!intelligenceLoading && intelligenceRecommendations && (
                <div className="space-y-6">
                  {/* KPI cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Directives</span>
                      <div className="text-2xl font-black text-slate-900 mt-1">{intelligenceRecommendations.summary.total}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">P1 Critical</span>
                      <div className="text-2xl font-black text-rose-600 mt-1">{intelligenceRecommendations.summary.p1}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">P2 High</span>
                      <div className="text-2xl font-black text-amber-500 mt-1">{intelligenceRecommendations.summary.p2}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">P3 Medium</span>
                      <div className="text-2xl font-black text-blue-500 mt-1">{intelligenceRecommendations.summary.p3}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visual Analytics Column (1/3) */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Priority Distribution</h3>
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={recommendationsPriorityData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value">
                                {recommendationsPriorityData.map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v: any) => [`${v} Directives`, 'Count']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Categories Affected</h3>
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={recommendationsCategoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value">
                                {recommendationsCategoryData.map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v: any) => [`${v} Directives`, 'Count']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Action Items Column (2/3) */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Prioritized Action Pipeline</h3>
                      <div className="space-y-4">
                        {intelligenceRecommendations.recommendations.map((rec: any) => (
                          <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-2.5 flex-wrap gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${rec.priorityColor}`}>
                                  {rec.priority}
                                </span>
                                <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{rec.category}</span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {rec.affectedOutlets.map((o: any) => o.name).join(", ")}
                                </span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <span className="text-base mt-0.5">{rec.icon}</span>
                                <div>
                                  <h4 className="text-xs font-black text-slate-900 leading-tight">{rec.title}</h4>
                                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{rec.rationale}</p>
                                </div>
                              </div>
                              {/* Short actions strip */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {rec.actions.map((act: string, i: number) => (
                                  <span key={i} className="text-[9px] bg-indigo-50/50 border border-indigo-100/50 text-indigo-700 font-medium px-2 py-0.5 rounded-lg">
                                    ✓ {act.length > 32 ? act.slice(0, 30) + "..." : act}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Urgency Progress Dial */}
                            <div className="shrink-0 flex flex-col items-center justify-between sm:text-right border-l border-slate-100 pl-0 sm:pl-4 self-stretch justify-center">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Urgency</span>
                              <span className="text-lg font-black text-slate-800">{rec.urgency}%</span>
                              <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${rec.urgency}%` }} />
                              </div>
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5 mt-2 block w-max leading-tight text-center">
                                ROI Boost
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 10: EXECUTIVE COMMAND CENTER */}
          {activeStepId === 10 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* SECTION 1: LIVE FRANCHISE COMMAND CENTRE HEADER */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                      <span>LIVE FRANCHISE COMMAND CENTRE</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Connected data from sales, inventory, workforce, marketing and audit operations.</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-full px-3.5 py-1 text-xs font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>All agents live</span>
                  </div>
                </div>

                {/* 6 Clickable Nav Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { id: 3, name: "1. Outlet Performance", sub: "Sales, margin & ranking", icon: "Trend", active: false },
                    { id: 4, name: "2. Inventory Intelligence", sub: "Stock cover & wastage", icon: "Inventory", active: false },
                    { id: 5, name: "3. Workforce & Roster", sub: "Attendance & productivity", icon: "Staff", active: false },
                    { id: 6, name: "4. Marketing Engine", sub: "Campaign ROAS & CAC", icon: "Marketing", active: false },
                    { id: 7, name: "5. Audit & Compliance", sub: "SOP & safety checks", icon: "Audit", active: false },
                    { id: 10, name: "6. Executive Overview", sub: "Consolidated health radar", icon: "Dashboard", active: true },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveStepId(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-20 ${
                        item.active
                          ? "bg-white border-indigo-600 shadow-md ring-1 ring-indigo-500/20"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-slate-900 tracking-tight leading-snug">{item.name}</span>
                        <div className={`p-1 rounded-md ${item.active ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"}`}>
                          {item.icon === "Trend" && <Icons.Trend />}
                          {item.icon === "Inventory" && <Icons.Inventory />}
                          {item.icon === "Staff" && <Icons.Staff />}
                          {item.icon === "Marketing" && <Icons.Marketing />}
                          {item.icon === "Audit" && <Icons.Audit />}
                          {item.icon === "Dashboard" && <Icons.Dashboard />}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium truncate">{item.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Dark Banner */}
                <div className="bg-[#0b1329] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-slate-800/10 via-transparent to-transparent pointer-events-none" />
                  <div className="space-y-1 z-10">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Live Network Monitoring</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Dashboard & Alerts</h2>
                    <p className="text-xs text-slate-400">Executive signals, exceptions and next actions across every franchise outlet.</p>
                  </div>
                  <button
                    onClick={() => setAlertFilter("All")}
                    className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-xs font-bold transition-all z-10 cursor-pointer shadow-xs"
                  >
                    All-agent view
                  </button>
                </div>
              </div>

              {/* SECTION 2: TOP KPI STRIP (4 cards) */}
              {intelligenceConsolidated && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between h-28">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network Health</span>
                    <div className="text-3xl font-black text-emerald-600 tracking-tight mt-1">
                      {intelligenceConsolidated.networkSummary.avgHealthScore}/100
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2 font-medium">{outlets.length} outlets monitored</span>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between h-28">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network Revenue</span>
                    <div className="text-3xl font-black text-indigo-600 tracking-tight mt-1">
                      ₹{(intelligenceConsolidated.networkSummary.totalRevenue / 100000).toFixed(1)}L
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2 font-medium">
                      Profit ₹{(intelligenceConsolidated.networkSummary.totalProfit / 100000).toFixed(1)}L
                    </span>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between h-28">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock Alerts</span>
                    <div className="text-3xl font-black text-amber-500 tracking-tight mt-1">
                      {intelligenceConsolidated.networkSummary.criticalStockAlerts + intelligenceConsolidated.networkSummary.lowStockAlerts}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2 font-medium">
                      {intelligenceConsolidated.networkSummary.criticalStockAlerts} critical
                    </span>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between h-28">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Marketing ROAS</span>
                    <div className="text-3xl font-black text-violet-600 tracking-tight mt-1">
                      {intelligenceConsolidated.networkSummary.marketingRoas}x
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2 font-medium">{campaigns.length} campaigns active</span>
                  </div>
                </div>
              )}

              {/* SECTION 3: TWO COLUMN AGENT OVERVIEW / COMMAND CENTRE GUIDELINES */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Agent Performance Overview */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Agent performance overview</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Visual health score across the connected franchise agents.</p>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200/40">
                      Live scoring
                    </span>
                  </div>

                  {agentPerformanceScores && (
                    <div className="space-y-4">
                      {[
                        { name: "Outlet Performance", label: "Network health", val: agentPerformanceScores.outlet, color: "bg-cyan-500" },
                        { name: "Inventory Control", label: "stock alerts", val: agentPerformanceScores.inventory, color: "bg-amber-500" },
                        { name: "Workforce", label: "Staff quality", val: agentPerformanceScores.workforce, color: "bg-indigo-500" },
                        { name: "Marketing", label: "ROI tracking", val: agentPerformanceScores.marketing, color: "bg-rose-500" },
                        { name: "Audit Compliance", label: "Compliance score", val: agentPerformanceScores.audit, color: "bg-emerald-500" },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{item.name}</span>
                            <span className="text-slate-500">{item.val}% <span className="text-[10px] font-normal text-slate-400">{item.label}</span></span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Command Centre */}
                <div className="lg:col-span-5 bg-indigo-50/20 border border-indigo-100 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Command Centre</span>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">From signals to action</h3>
                  </div>
                  
                  <div className="space-y-4 my-6">
                    {[
                      { num: "1", title: "Monitor", desc: "Track live KPIs and agent signals across your network." },
                      { num: "2", title: "Prioritize", desc: "Identify critical risks and below-threshold operations." },
                      { num: "3", title: "Act", desc: "Assign recommended actions and acknowledge resolution tasks." }
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3 text-xs">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                          {step.num}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800">{step.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-normal">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 4: AGENT TREND SNAPSHOTS (5 mini charts) */}
              {agentTrendData && agentPerformanceScores && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Agent trend snapshots</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Visual performance patterns for each agent across the latest reporting checkpoints.</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">Last 5 checkpoints</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { name: "Outlet Performance", desc: "Network health", val: agentPerformanceScores.outlet, data: agentTrendData.outlet, color: "#06b6d4" },
                      { name: "Inventory Control", desc: "stock alerts", val: agentPerformanceScores.inventory, data: agentTrendData.inventory, color: "#f59e0b" },
                      { name: "Workforce", desc: "Staff quality", val: agentPerformanceScores.workforce, data: agentTrendData.workforce, color: "#6366f1" },
                      { name: "Marketing", desc: "ROI tracking", val: agentPerformanceScores.marketing, data: agentTrendData.marketing, color: "#f43f5e" },
                      { name: "Audit Compliance", desc: "Compliance score", val: agentPerformanceScores.audit, data: agentTrendData.audit, color: "#10b981" },
                    ].map((card, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs h-36">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-slate-900 leading-tight w-2/3">{card.name}</span>
                            <span className="text-base font-black text-slate-800 shrink-0">{card.val}%</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{card.desc}</span>
                        </div>
                        <div className="h-14 w-full mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={card.data} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                              <defs>
                                <linearGradient id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={card.color} stopOpacity={0.2} />
                                  <stop offset="95%" stopColor={card.color} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="v" stroke={card.color} strokeWidth={1.5} fillOpacity={1} fill={`url(#gradient-${idx})`} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 5: TWO-COLUMN COMPARISON GRAPH ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Outlet Comparison Graph */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Outlet comparison graph</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Compare every outlet without leaving this screen.</p>
                    </div>
                    
                    {/* Toggle tabs */}
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      {["Health", "Revenue", "Margin", "Audit"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setComparisonTab(tab as any)}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            comparisonTab === tab
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    {outletComparisonData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={outletComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                          <Tooltip formatter={(value) => [value, comparisonTab === "Revenue" ? "₹ (Lakhs)" : "%"]} />
                          <Bar dataKey={comparisonTab} fill="#6366f1" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading outlets data...</div>
                    )}
                  </div>
                </div>

                {/* Right: Alert Severity Graph */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Alert severity graph</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Risk distribution across the network.</p>
                  </div>

                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={alertSeverityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                          {alertSeverityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
                    Total alerts active: {alertSeverityData.reduce((acc, curr) => acc + curr.value, 0)}
                  </div>
                </div>
              </div>

              {/* SECTION 6: AGENT COVERAGE AT A GLANCE (5 colored cards) */}
              {intelligenceConsolidated && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Agent coverage at a glance</h3>
                      <p className="text-[11px] text-slate-400 font-medium font-bold">All agent signals are summarized on this dashboard.</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                      5 agents connected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-sky-800 block">Outlet</span>
                        <span className="text-[9px] text-sky-500 block">Revenue & demand</span>
                      </div>
                      <span className="text-sm font-black text-slate-800 mt-2 block">
                        ₹{(intelligenceConsolidated.networkSummary.totalRevenue / 100000).toFixed(1)}L
                      </span>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-amber-800 block">Inventory</span>
                        <span className="text-[9px] text-amber-500 block">Stock availability</span>
                      </div>
                      <span className="text-sm font-black text-slate-800 mt-2 block">
                        {intelligenceConsolidated.networkSummary.criticalStockAlerts + intelligenceConsolidated.networkSummary.lowStockAlerts} alerts
                      </span>
                    </div>

                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-indigo-800 block">Workforce</span>
                        <span className="text-[9px] text-indigo-500 block">People capacity</span>
                      </div>
                      <span className="text-xs font-black text-indigo-600 mt-2 block cursor-pointer hover:underline" onClick={() => setActiveStepId(5)}>
                        View productivity
                      </span>
                    </div>

                    <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-rose-800 block">Marketing</span>
                        <span className="text-[9px] text-rose-500 block">Customer demand</span>
                      </div>
                      <span className="text-sm font-black text-slate-800 mt-2 block">
                        {intelligenceConsolidated.networkSummary.marketingRoas}x ROAS
                      </span>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-emerald-800 block">Audit</span>
                        <span className="text-[9px] text-emerald-500 block">Standards & risk</span>
                      </div>
                      <span className="text-sm font-black text-slate-800 mt-2 block">
                        {intelligenceConsolidated.networkSummary.criticalStockAlerts} critical
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: PER-AGENT DETAIL CARDS */}
              {agentTrendData && agentPerformanceScores && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Card 1: Outlet Performance */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">Outlet Performance</h4>
                      <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded-full">{agentPerformanceScores.outlet}%</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block -mt-3">Network health</span>
                    <div className="grid grid-cols-2 gap-2 h-20">
                      <div className="border border-slate-100 rounded-lg p-1.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">Trend</span>
                        <div className="h-10 w-full mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={agentTrendData.outlet}>
                              <Area type="monotone" dataKey="v" stroke="#06b6d4" fill="#ecfeff" strokeWidth={1} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="border border-slate-100 rounded-lg p-1.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">KPI Readiness</span>
                        <div className="h-10 w-full mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{ name: 'F', val: 70 }, { name: 'R', val: 85 }]}>
                              <Bar dataKey="val" fill="#06b6d4" radius={[1, 1, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    <ul className="text-[10px] text-slate-500 font-semibold space-y-1 list-disc pl-4">
                      <li>5 outlets monitored.</li>
                      <li>Compare health and revenue to identify stores needing support.</li>
                    </ul>
                  </div>

                  {/* Card 2: Inventory Control */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">Inventory Control</h4>
                      <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full">{agentPerformanceScores.inventory}%</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block -mt-3">5 stock alerts</span>
                    <div className="grid grid-cols-2 gap-2 h-20">
                      <div className="border border-slate-100 rounded-lg p-1.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">Trend</span>
                        <div className="h-10 w-full mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={agentTrendData.inventory}>
                              <Area type="monotone" dataKey="v" stroke="#f59e0b" fill="#fffbeb" strokeWidth={1} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="border border-slate-100 rounded-lg p-1.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">KPI Readiness</span>
                        <div className="h-10 w-full mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{ name: 'F', val: 65 }, { name: 'R', val: 78 }]}>
                              <Bar dataKey="val" fill="#f59e0b" radius={[1, 1, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    <ul className="text-[10px] text-slate-500 font-semibold space-y-1 list-disc pl-4">
                      <li>2 critical stock risks active.</li>
                      <li>Replenish urgent items first to protect sales.</li>
                    </ul>
                  </div>

                  {/* Card 3: Workforce */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">Workforce</h4>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">{agentPerformanceScores.workforce}%</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block -mt-3">Staff quality</span>
                    <div className="grid grid-cols-2 gap-2 h-20">
                      <div className="border border-slate-100 rounded-lg p-1.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">Trend</span>
                        <div className="h-10 w-full mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={agentTrendData.workforce}>
                              <Area type="monotone" dataKey="v" stroke="#6366f1" fill="#eef2ff" strokeWidth={1} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="border border-slate-100 rounded-lg p-1.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">KPI Readiness</span>
                        <div className="h-10 w-full mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{ name: 'F', val: 78 }, { name: 'R', val: 88 }]}>
                              <Bar dataKey="val" fill="#6366f1" radius={[1, 1, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    <ul className="text-[10px] text-slate-500 font-semibold space-y-1 list-disc pl-4">
                      <li>Coverage and staff quality monitored.</li>
                      <li>Align peak-hour schedules with outlet demand.</li>
                    </ul>
                  </div>

                  {/* Card 4: Marketing */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">Marketing</h4>
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full">{agentPerformanceScores.marketing}%</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block -mt-3">ROI tracking</span>
                    <div className="grid grid-cols-2 gap-2 h-20">
                      <div className="border border-slate-100 rounded-lg p-1.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">Trend</span>
                        <div className="h-10 w-full mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={agentTrendData.marketing}>
                              <Area type="monotone" dataKey="v" stroke="#rose-500" fill="#fff1f2" strokeWidth={1} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="border border-slate-100 rounded-lg p-1.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">KPI Readiness</span>
                        <div className="h-10 w-full mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{ name: 'F', val: 80 }, { name: 'R', val: 95 }]}>
                              <Bar dataKey="val" fill="#f43f5e" radius={[1, 1, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    <ul className="text-[10px] text-slate-500 font-semibold space-y-1 list-disc pl-4">
                      <li>{intelligenceConsolidated.networkSummary.marketingRoas}x network ROAS achieved.</li>
                      <li>Move budget toward campaigns with stronger returns.</li>
                    </ul>
                  </div>

                  {/* Card 5: Audit Compliance */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">Audit Compliance</h4>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">{agentPerformanceScores.audit}%</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block -mt-3">Compliance score</span>
                    <div className="grid grid-cols-2 gap-2 h-20">
                      <div className="border border-slate-100 rounded-lg p-1.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">Trend</span>
                        <div className="h-10 w-full mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={agentTrendData.audit}>
                              <Area type="monotone" dataKey="v" stroke="#10b981" fill="#ecfdf5" strokeWidth={1} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="border border-slate-100 rounded-lg p-1.5">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">KPI Readiness</span>
                        <div className="h-10 w-full mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{ name: 'F', val: 72 }, { name: 'R', val: 85 }]}>
                              <Bar dataKey="val" fill="#10b981" radius={[1, 1, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    <ul className="text-[10px] text-slate-500 font-semibold space-y-1 list-disc pl-4">
                      <li>2 critical compliance risks.</li>
                      <li>Close high-severity audit findings and verify completion.</li>
                    </ul>
                  </div>

                </div>
              )}

              {/* SECTION 8: OPEN DASHBOARD VIEW (Outlet Performance Deep Dive Panel) */}
              {agentTrendData && agentPerformanceScores && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Open Dashboard View</span>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Outlet Performance</h3>
                    <span className="text-sm font-extrabold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg">
                      {agentPerformanceScores.outlet}% health
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 -mt-2 font-medium">Important AI-agent signals, shown here without leaving the dashboard.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                    
                    {/* Performance movement chart */}
                    <div className="lg:col-span-8 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-700">Performance movement <span className="text-[10px] font-normal text-slate-400">Latest agent checkpoints</span></span>
                        <span className="text-[10px] text-slate-400 font-semibold">Hover for values</span>
                      </div>
                      
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={agentTrendData.outlet} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="x" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                            <Tooltip />
                            <Area type="monotone" dataKey="v" stroke="#06b6d4" fill="#ecfeff" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Right Info blocks */}
                    <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Important Points</span>
                        {[
                          { num: "1", text: "5 outlets monitored" },
                          { num: "2", text: "Compare health and revenue to identify stores needing support." }
                        ].map((point, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-xs font-semibold text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-cyan-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {point.num}
                            </span>
                            <span>{point.text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#0b1329] text-white rounded-xl p-4 space-y-1">
                        <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-widest block">Current Focus</span>
                        <h4 className="text-xs font-black">Network health</h4>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Use the two agent graphs above to track change before taking action in the dedicated agent workspace.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 9: TWO-COLUMN BOTTOM ALERTS & ACTIONS PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Priority Alerts */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase flex items-center space-x-2">
                        <span>Priority alerts</span>
                        {filteredAlerts.length > 0 && (
                          <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200/40 shrink-0">
                            {filteredAlerts.filter((a: any) => !acknowledgedAlerts.has(a.id)).length} new
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">Exceptions that need manager attention</p>
                    </div>

                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      {["All", "Critical", "High", "Medium"].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setAlertFilter(lvl as any)}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            alertFilter === lvl
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {filteredAlerts.length > 0 ? (
                      filteredAlerts.map((rec: any, idx: number) => {
                        const isAcked = acknowledgedAlerts.has(rec.id);
                        return (
                          <div
                            key={idx}
                            className={`flex justify-between items-center p-3.5 border border-slate-100 rounded-xl transition-all ${
                              isAcked ? "opacity-40 bg-slate-50/50" : "bg-white hover:border-slate-200"
                            }`}
                          >
                            <div className="flex items-start space-x-3 text-xs w-3/4">
                              <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                                rec.priority === "P1" ? "bg-red-500" : rec.priority === "P2" ? "bg-orange-400" : "bg-yellow-400"
                              }`} />
                              <div>
                                <h4 className="font-extrabold text-slate-900 tracking-tight">{rec.title}</h4>
                                <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{rec.rationale}</p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-2 shrink-0">
                              <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                                {rec.affectedOutlets?.map((o: any) => o.name).join(", ") || "Network wide"}
                              </span>
                              <button
                                onClick={() => {
                                  const updated = new Set(acknowledgedAlerts);
                                  if (updated.has(rec.id)) {
                                    updated.delete(rec.id);
                                  } else {
                                    updated.add(rec.id);
                                  }
                                  setAcknowledgedAlerts(updated);
                                }}
                                className="text-[10px] text-indigo-600 font-extrabold cursor-pointer hover:text-indigo-800 transition-colors"
                              >
                                {isAcked ? "Reset" : "Acknowledge"}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400 font-medium">No alerts matching this filter.</div>
                    )}
                  </div>
                </div>

                {/* Right Column: Recommended Next Actions */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Recommended next actions</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Top actions ranked by urgency and impact</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { num: "1", title: "Emergency Re-Audit: Anna Nagar Cafe", cat: "P1 · Compliance" },
                      { num: "2", title: "Emergency Restocking: HITECH City Hub", cat: "P1 · Inventory" },
                      { num: "3", title: "Margin Improvement Program: HITECH City Hub", cat: "P2 · Financial" },
                      { num: "4", title: "Staff Performance Intervention: Indiranagar Flagship", cat: "P2 · Staff" },
                    ].map((act, idx) => (
                      <div key={idx} className="flex items-center space-x-3.5 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 hover:border-slate-200 transition-all">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {act.num}
                        </div>
                        <div className="text-xs">
                          <h4 className="font-extrabold text-slate-900 tracking-tight">{act.title}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{act.cat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* OTHER STEPS (1, 2) Rendering within section */}
          {![3, 4, 5, 6, 7, 8, 9, 10, 11].includes(activeStepId) && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mx-auto">
                <Icons.Workflow />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {WORKFLOW_STEPS.find((s) => s.id === activeStepId)?.name} Active
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {WORKFLOW_STEPS.find((s) => s.id === activeStepId)?.desc}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveStepId(3)}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-indigo-700 transition-all"
                >
                  Return to Outlet Performance Agent
                </button>
              </div>
            </div>
          )}

          {/* STEP 11: AGENTIC AI NOTIFICATIONS & WORKFLOWS */}
          {activeStepId === 11 && (
            <NotificationDashboard />
          )}


        </main>
      </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        outlets={outlets}
      />

      {/* Location Comparison Matrix Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        selectedLocationIds={selectedLocationIds}
      />
    </div>
  );
}
