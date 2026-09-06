"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import NotificationDetailModal from "./NotificationDetailModal";

interface OutletItem {
  id: number;
  outlet_name: string;
  city: string;
}

interface ActionTaskItem {
  id: number;
  task_description: string;
  is_completed: boolean | number;
}

interface ActionPlanItem {
  id: number;
  title: string;
  description: string;
  progress_percentage: number;
  owner_name?: string;
  priority?: string;
  tasks?: ActionTaskItem[];
}

interface AuditLogItem {
  id: number;
  action: string;
  actor_name?: string;
  details?: string;
  created_at: string;
}

interface CriticalIssueItem {
  id: number;
  outlet_name?: string;
  created_at?: string;
  title: string;
  message: string;
  status: string;
  severity?: string;
  ai_analysis?: string;
  recommended_action?: string;
}

interface ChannelStatItem {
  name: string;
  value: number;
  color: string;
}

interface PriorityStatItem {
  priority: string;
  count: number;
}

interface AnalyticsData {
  metrics: {
    totalSent: number;
    ackRate: number;
    openActions: number;
    slaBreaches: number;
    escalationRate: number;
    avgResolutionTimeHours: number;
  };
  channelStats: ChannelStatItem[];
  priorityStats: PriorityStatItem[];
  criticalUnresolvedIssues: CriticalIssueItem[];
}

interface RuleItem {
  id: number;
  event_type: string;
  rule_name: string;
  priority: string;
  channels: string;
  sla_minutes: number;
}

interface PrefItem {
  id: number;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  min_priority: string;
}

interface EventItem {
  id: number;
  event_type: string;
  source_module: string;
  outlet_name?: string;
  payload: string;
  detected_at: string;
  status: string;
}



// Helper to parse raw JSON payloads into clean Light-Themed Tabular Column Data Tables
function renderParsedPayload(payloadStr: string) {
  try {
    const data = typeof payloadStr === "string" ? JSON.parse(payloadStr) : payloadStr;
    if (typeof data !== "object" || data === null) return <span className="text-xs text-slate-600 font-sans mt-1">{String(payloadStr)}</span>;

    const entries = Object.entries(data);
    if (entries.length === 0) return null;

    return (
      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-3 py-1.5 font-bold w-5/12 text-slate-700">Parameter</th>
              <th className="px-3 py-1.5 font-bold text-slate-700">Detected Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map(([key, val]) => (
              <tr key={key} className="hover:bg-indigo-50/20 transition-colors">
                <td className="px-3 py-1.5 font-bold text-slate-700 capitalize bg-slate-50/40">
                  {key.replace(/_/g, " ")}
                </td>
                <td className="px-3 py-1.5 text-slate-900 font-medium">
                  {typeof val === "object" ? JSON.stringify(val) : (
                    <span className={
                      String(val).toLowerCase().includes("critical") || String(val) === "0"
                        ? "text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100"
                        : "text-slate-800 font-semibold"
                    }>
                      {String(val)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch {
    return <span className="text-xs text-slate-600 font-sans mt-1">{String(payloadStr)}</span>;
  }
}

// Helper to parse raw JSON audit logs into clean human-readable UI elements
function renderParsedAuditDetails(detailsStr?: string) {
  if (!detailsStr) return null;
  try {
    const data = JSON.parse(detailsStr);
    
    if (data.channels || data.results) {
      return (
        <div className="mt-1.5 space-y-1.5 text-xs font-sans">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase">CHANNELS:</span>
            {(data.channels || []).map((ch: string) => (
              <span key={ch} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                {ch}
              </span>
            ))}
          </div>
          {data.results && Array.isArray(data.results) && (
            <div className="space-y-1 mt-1 bg-white p-2 rounded-lg border border-slate-200">
              {data.results.map((res: any, idx: number) => (
                <div key={idx} className="flex items-center space-x-2 text-slate-600 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-slate-800">{res.channel}:</span>
                  <span>{res.detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (data.level || data.escalatedToUser) {
      return (
        <div className="mt-1.5 text-xs font-sans space-y-1 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
              LEVEL {data.level || 1} ESCALATION
            </span>
            <span className="font-bold text-slate-800">Escalated To: {data.escalatedToUser} ({data.escalatedToRole})</span>
          </div>
          <p className="text-slate-600 text-xs italic">{data.reason}</p>
        </div>
      );
    }

    return (
      <div className="mt-1 text-xs font-sans text-slate-600">
        {Object.entries(data).map(([k, v]) => (
          <span key={k} className="mr-3 inline-block">
            <strong className="text-slate-700 capitalize">{k.replace(/_/g, " ")}:</strong> {String(v)}
          </span>
        ))}
      </div>
    );
  } catch {
    return <div className="mt-1 text-xs font-sans text-slate-600">{detailsStr}</div>;
  }
}

export default function NotificationDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [pref, setPref] = useState<PrefItem | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutlet, setSelectedOutlet] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedNotifId, setSelectedNotifId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Demo & Manual state
  const [demoLog, setDemoLog] = useState<string[]>([]);
  const [demoRunning, setDemoRunning] = useState(false);
  const [manualForm, setManualForm] = useState({
    outletId: "all",
    title: "",
    message: "",
    severity: "HIGH",
    channels: ["EMAIL", "PUSH"]
  });
  const [manualLoading, setManualLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, plansRes, logsRes, outletsRes, rulesRes, prefRes, eventsRes] = await Promise.all([
        api.get("/notifications/analytics"),
        api.get("/notifications/action-plans"),
        api.get("/notifications/audit-logs"),
        api.get("/outlets"),
        api.get("/notifications/rules"),
        api.get("/notifications/preferences"),
        api.get("/notifications/events")
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (plansRes.data.success) setActionPlans(plansRes.data.data);
      if (logsRes.data.success) setAuditLogs(logsRes.data.data);
      if (outletsRes.data) setOutlets(outletsRes.data);
      if (rulesRes.data.success) setRules(rulesRes.data.data);
      if (prefRes.data.success) setPref(prefRes.data.data);
      if (eventsRes.data.success) setEvents(eventsRes.data.data);
    } catch (err) {
      console.error("Error fetching notification dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 12000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Handle Preferences Checkbox Updates
  const handleTogglePref = async (field: keyof PrefItem, currentValue: boolean) => {
    if (!pref) return;
    const updatedPref = { ...pref, [field]: !currentValue };
    setPref(updatedPref); // Optimistic UI update

    try {
      await api.put("/notifications/preferences", {
        email_enabled: field === "email_enabled" ? !currentValue : pref.email_enabled,
        push_enabled: field === "push_enabled" ? !currentValue : pref.push_enabled,
        sms_enabled: field === "sms_enabled" ? !currentValue : pref.sms_enabled,
        min_priority: pref.min_priority
      });
    } catch (err) {
      console.error("Error updating preferences:", err);
      fetchDashboardData();
    }
  };

  // Handle Action Task Checkbox Toggle with Optimistic State Update
  const handleTaskToggle = async (taskId: number, current: boolean) => {
    // Optimistic UI state update
    setActionPlans((prevPlans) =>
      prevPlans.map((plan) => {
        if (!plan.tasks) return plan;
        const hasTask = plan.tasks.some((t) => t.id === taskId);
        if (!hasTask) return plan;

        const newTasks = plan.tasks.map((t) =>
          t.id === taskId ? { ...t, is_completed: !current } : t
        );
        const doneCount = newTasks.filter((t) => Boolean(t.is_completed)).length;
        const newPct = Math.round((doneCount / newTasks.length) * 100);

        return { ...plan, tasks: newTasks, progress_percentage: newPct };
      })
    );

    try {
      await api.put(`/notifications/action-tasks/${taskId}/toggle`, { isCompleted: !current });
      fetchDashboardData();
    } catch (err) {
      console.error("Task toggle error:", err);
      fetchDashboardData();
    }
  };


  // Real-World Franchise Operational Scenarios Trigger
  const runRealWorldScenario = async (scenarioType: string) => {
    setDemoRunning(true);
    setDemoLog((prev) => [`[${new Date().toLocaleTimeString()}] Triggering Real-World Franchise Scenario: ${scenarioType}...`, ...prev]);
    try {
      const res = await api.post("/notifications/realworld-trigger", {
        scenarioType,
        outletId: selectedOutlet !== "all" ? parseInt(selectedOutlet, 10) : 1
      });

      if (res.data?.success) {
        const notifId = res.data.data?.notificationId;
        const priority = res.data.data?.decision?.priority || "HIGH";
        const impact = res.data.data?.decision?.businessImpact || res.data.message || "Operational anomaly processed.";
        
        setDemoLog((prev) => [
          `[${new Date().toLocaleTimeString()}] AI Decision Engine: ${priority} priority assigned. Rich HTML Email + Push dispatched.`,
          `[${new Date().toLocaleTimeString()}] ${impact}`,
          ...prev
        ]);
        if (notifId) setSelectedNotifId(notifId);
        fetchDashboardData();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setDemoLog((prev) => [`[ERROR] Scenario failed: ${errorMsg}`, ...prev]);
    } finally {
      setDemoRunning(false);
    }
  };

  // Demo Trigger: Critical Stock Shortage
  const runDemoStockShortage = async () => {
    setDemoRunning(true);
    setDemoLog((prev) => [`[${new Date().toLocaleTimeString()}] Initiating Demo: Critical Stock Shortage Anomaly Detected...`, ...prev]);
    try {
      const res = await api.post("/notifications/demo-trigger", {
        outletId: selectedOutlet !== "all" ? parseInt(selectedOutlet, 10) : 1,
        itemName: "Premium Espresso Blend Coffee Beans",
        currentStock: 0,
        minThreshold: 30,
        unit: "kg"
      });

      if (res.data?.success) {
        const notifId = res.data.data?.notificationId;
        const planId = res.data.data?.actionPlanId || 1;
        setDemoLog((prev) => [
          `[${new Date().toLocaleTimeString()}] AI Decision Engine: CRITICAL priority assigned. Rich HTML Email + Push dispatched to Outlet Manager.`,
          `[${new Date().toLocaleTimeString()}] Action Plan #${planId} automatically generated with step checklist.`,
          ...prev
        ]);
        if (notifId) setSelectedNotifId(notifId);
        fetchDashboardData();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setDemoLog((prev) => [`[ERROR] Demo failed: ${errorMsg}`, ...prev]);
    } finally {
      setDemoRunning(false);
    }
  };

  // Demo Trigger: Simulate SLA Timeout
  const runDemoTimeoutSimulate = async () => {
    setDemoRunning(true);
    setDemoLog((prev) => [`[${new Date().toLocaleTimeString()}] Simulating 30-Minute SLA Timeout (No Response from Store Owner)...`, ...prev]);
    try {
      const res = await api.post("/notifications/demo-timeout-simulate");
      if (res.data.success) {
        setDemoLog((prev) => [
          `[${new Date().toLocaleTimeString()}] Background Worker: SLA limit exceeded! Urgent SMS fallback retry dispatched.`,
          `[${new Date().toLocaleTimeString()}] Escalation Engine: Event escalated to Regional Manager (${res.data.data.escalatedTo}).`,
          ...prev
        ]);
        fetchDashboardData();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setDemoLog((prev) => [`[ERROR] Timeout simulation failed: ${errorMsg}`, ...prev]);
    } finally {
      setDemoRunning(false);
    }
  };

  const handleManualSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    try {
      const res = await api.post("/notifications/manual-send", manualForm);
      if (res.data.success) {
        alert("Notification dispatched successfully across selected channels!");
        setManualForm({ outletId: "all", title: "", message: "", severity: "HIGH", channels: ["EMAIL", "PUSH"] });
        fetchDashboardData();
        setActiveTab("overview");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert("Failed to send manual notification: " + errorMsg);
    } finally {
      setManualLoading(false);
    }
  };

  const toggleManualChannel = (ch: string) => {
    setManualForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch) ? prev.channels.filter((c) => c !== ch) : [...prev.channels, ch]
    }));
  };

  // Dynamic Filtering based on Priority
  const filteredCriticalIssues = (analytics?.criticalUnresolvedIssues || []).filter((item) => {
    if (selectedPriority !== "all" && item.severity !== selectedPriority) return false;
    return true;
  });

  const filteredActionPlans = actionPlans;

  const metrics = analytics?.metrics || {
    totalSent: 0,
    ackRate: 0,
    openActions: 0,
    slaBreaches: 0,
    escalationRate: 0,
    avgResolutionTimeHours: 0
  };

  const channelStats = analytics?.channelStats || [
    { name: "Mobile Push", value: 12, color: "#6366f1" },
    { name: "Email Report", value: 8, color: "#10b981" },
    { name: "Urgent SMS", value: 4, color: "#f59e0b" }
  ];

  const priorityStats = analytics?.priorityStats || [
    { priority: "CRITICAL", count: 4 },
    { priority: "HIGH", count: 7 },
    { priority: "MEDIUM", count: 9 },
    { priority: "LOW", count: 3 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Mentor Presentation & Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 border border-indigo-500/30 text-white shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/40">
              🎓 Mentor & Team Demo Mode • 5 Team Roles Integrated
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Agentic AI Notification & Workflow Management System
          </h1>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Real-time event detection → Explainable AI decisions → Priority multi-channel routing (HTML Email, Push, SMS) → Automated Action Plans & 30-min SLA Escalation.
          </p>
        </div>

        {/* Global Outlet & Priority Filters */}
        <div className="flex flex-wrap gap-2.5 items-center bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Outlet Filter</div>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="bg-slate-800 text-xs text-white px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Outlets (Corporate)</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.city} ({o.outlet_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Priority Filter</div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-800 text-xs text-white px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>



      {/* TOP NAVIGATION BUTTONS (FEATURE TABS) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {[
          { id: "overview", label: "📊 Overview & Action Plans" },
          { id: "events", label: "📡 Live Event Stream" },
          { id: "rules", label: "⚙️ AI Rules & Preferences" },
          { id: "manual", label: "✉️ Send Manual Alert" },
          { id: "audit", label: "📜 Audit Log Timeline" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-indigo-600 shadow-md border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-2 text-xs text-slate-400 font-medium animate-pulse">
          Connecting to AI Notification & Workflow Engine...
        </div>
      )}

      {/* TAB 1: OVERVIEW & ACTION PLANS */}
      {activeTab === "overview" && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notifications Sent</div>
              <div className="text-2xl font-black text-slate-900">{metrics.totalSent}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">100% Tracked</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acknowledgement Rate</div>
              <div className="text-2xl font-black text-indigo-600">{metrics.ackRate}%</div>
              <div className="text-[10px] text-indigo-500 font-semibold">Target &gt; 95%</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Action Plans</div>
              <div className="text-2xl font-black text-amber-600">{metrics.openActions}</div>
              <div className="text-[10px] text-amber-600 font-semibold">Auto-Generated</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">30-Min SLA Breaches</div>
              <div className="text-2xl font-black text-rose-600">{metrics.slaBreaches}</div>
              <div className="text-[10px] text-rose-500 font-semibold">SMS Fallback Sent</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Escalation Count</div>
              <div className="text-2xl font-black text-purple-600">{metrics.escalationRate}</div>
              <div className="text-[10px] text-purple-500 font-semibold">Level 1 & 2</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Resolution Time</div>
              <div className="text-2xl font-black text-emerald-600">{metrics.avgResolutionTimeHours}h</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Fast Operational Recovery</div>
            </div>
          </div>

          {/* Real-World Franchise Operational Workflow Simulator */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 text-slate-900 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider border border-rose-200">
                    Real-World Operational Simulator
                  </span>
                  <span className="text-xs text-slate-500">Click any scenario to simulate real franchise incidents:</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">Real Franchise Operational Incident Pipeline</h3>
                <p className="text-xs text-slate-600">
                  Select a real-world scenario: Anomaly Detection → AI Reasoning → Priority Dispatch → 1-Click Resolution Action (Stock Transfer / Compliance Proof / Royalty Settlement).
                </p>
              </div>
            </div>

            {/* 6 Real-World Franchise Scenario Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <button
                disabled={demoRunning}
                onClick={() => runRealWorldScenario("STOCK_SHORTAGE")}
                className="p-3 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-2xl border border-indigo-500/40 text-left transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <div className="text-[10px] font-bold text-indigo-200 uppercase">Inventory Agent</div>
                <div className="text-xs font-bold mt-1">☕ Espresso Stockout</div>
                <div className="text-[9px] text-indigo-200 mt-0.5">Intra-Outlet Transfer</div>
              </button>

              <button
                disabled={demoRunning}
                onClick={() => runRealWorldScenario("POS_OFFLINE")}
                className="p-3 bg-amber-600/90 hover:bg-amber-600 text-white rounded-2xl border border-amber-500/40 text-left transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <div className="text-[10px] font-bold text-amber-200 uppercase">POS & Sales Agent</div>
                <div className="text-xs font-bold mt-1">📉 POS Terminal Offline</div>
                <div className="text-[9px] text-amber-200 mt-0.5">45% Revenue Drop</div>
              </button>

              <button
                disabled={demoRunning}
                onClick={() => runRealWorldScenario("FOOD_SAFETY")}
                className="p-3 bg-teal-600/90 hover:bg-teal-600 text-white rounded-2xl border border-teal-500/40 text-left transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <div className="text-[10px] font-bold text-teal-200 uppercase">Quality & Audit</div>
                <div className="text-xs font-bold mt-1">🌡️ Fridge Sensor Temp (7.8°C)</div>
                <div className="text-[9px] text-teal-200 mt-0.5">Hygiene Risk Audit</div>
              </button>

              <button
                disabled={demoRunning}
                onClick={() => runRealWorldScenario("ROYALTY_OVERDUE")}
                className="p-3 bg-purple-600/90 hover:bg-purple-600 text-white rounded-2xl border border-purple-500/40 text-left transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <div className="text-[10px] font-bold text-purple-200 uppercase">Finance Agent</div>
                <div className="text-xs font-bold mt-1">💰 Royalty Fee Overdue</div>
                <div className="text-[9px] text-purple-200 mt-0.5">$4,500 Settlement</div>
              </button>

              <button
                disabled={demoRunning}
                onClick={() => runRealWorldScenario("CUSTOMER_COMPLAINT")}
                className="p-3 bg-blue-600/90 hover:bg-blue-600 text-white rounded-2xl border border-blue-500/40 text-left transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <div className="text-[10px] font-bold text-blue-200 uppercase">Customer Agent</div>
                <div className="text-xs font-bold mt-1">⭐ 1-Star Review Surge</div>
                <div className="text-[9px] text-blue-200 mt-0.5">Delivery Delay Alert</div>
              </button>

              <button
                disabled={demoRunning}
                onClick={runDemoTimeoutSimulate}
                className="p-3 bg-rose-600/90 hover:bg-rose-600 text-white rounded-2xl border border-rose-500/40 text-left transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <div className="text-[10px] font-bold text-rose-200 uppercase">Escalation Engine</div>
                <div className="text-xs font-bold mt-1">⏱️ 30-Min SLA Timeout</div>
                <div className="text-[9px] text-rose-200 mt-0.5">Manager Fallback</div>
              </button>
            </div>

            {/* Live Console Output */}
            {demoLog.length > 0 && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1 max-h-40 overflow-y-auto">
                <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">Execution Output Console</div>
                {demoLog.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual Analytics Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>📡 Notification Channels Breakdown</span>
                <span className="text-xs text-slate-400 font-normal">Multi-Channel Delivery</span>
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelStats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {channelStats.map((entry: ChannelStatItem, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#6366f1"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>⚡ Priority Distribution</span>
                <span className="text-xs text-slate-400 font-normal">LOW → CRITICAL</span>
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Critical Unresolved Issues Feed & Active Action Plans */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Unresolved Feed */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Critical Unresolved Issues</h3>
                  <p className="text-xs text-slate-500">Requires immediate manager action</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">
                  {filteredCriticalIssues.length} Visible
                </span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredCriticalIssues.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No matching unresolved issues for selected role filter.</div>
                ) : (
                  filteredCriticalIssues.map((item: CriticalIssueItem) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNotifId(item.id)}
                      className="p-4 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-200 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-md uppercase">
                            {item.severity || "CRITICAL"}
                          </span>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                            {item.outlet_name || "All Outlets"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.created_at ? new Date(item.created_at).toLocaleTimeString() : ""}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{item.message}</p>
                      
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-indigo-600 font-semibold group-hover:underline">Inspect AI Rationale & Action Plan →</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">{item.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Plans Tracker */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Active Action Plans Checklist</h3>
                  <p className="text-xs text-slate-500">Auto-generated operational tasks (Click checkbox to update task completion!)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200">
                  {filteredActionPlans.length} Visible
                </span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredActionPlans.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No active action plans matching selected role filter.</div>
                ) : (
                  filteredActionPlans.map((plan: ActionPlanItem) => (
                    <div key={plan.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Plan #{plan.id}</span>
                          <h4 className="text-xs font-bold text-slate-900">{plan.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-indigo-600">{plan.progress_percentage}% Done</span>
                          <div className="w-20 bg-slate-200 rounded-full h-1.5 mt-1">
                            <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${plan.progress_percentage}%` }} />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{plan.description}</p>

                      {/* Interactive Task Checkboxes */}
                      <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                        {plan.tasks?.map((t: ActionTaskItem) => {
                          const isDone = Boolean(t.is_completed);
                          return (
                            <label
                              key={t.id}
                              className="flex items-center space-x-3 text-xs text-slate-800 cursor-pointer select-none hover:bg-slate-50 p-1 rounded-lg transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleTaskToggle(t.id, isDone)}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className={isDone ? "line-through text-slate-400" : "font-semibold"}>
                                {t.task_description}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: LIVE EVENT STREAM */}
      {activeTab === "events" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Business Event Ingestion Stream</h3>
              <p className="text-xs text-slate-500">
                Raw operational anomalies (stock shortage, low sales, missed checklists) ingested into the Agentic AI system before routing.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              {events.length} Ingested Events
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No raw business events ingested yet.</div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                        {ev.source_module} AGENT
                      </span>
                      <span className="text-xs font-bold text-slate-900">{ev.event_type}</span>
                      {ev.outlet_name && (
                        <span className="text-xs text-slate-500 font-medium">({ev.outlet_name})</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(ev.detected_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Parsed Anomaly Metadata Payload:</div>
                    {renderParsedPayload(ev.payload)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RULES & PREFERENCES */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Preferences with Working Interactive Checkboxes */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Delivery Preferences</h3>
              <p className="text-xs text-slate-500">Configure your personal notification channel settings (Click checkbox to toggle!).</p>
            </div>

            {pref ? (
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Email Alerts</div>
                    <div className="text-[10px] text-slate-500">Receive rich HTML reports</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(pref.email_enabled)}
                    onChange={() => handleTogglePref("email_enabled", Boolean(pref.email_enabled))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Push Notifications</div>
                    <div className="text-[10px] text-slate-500">Mobile app instant popups</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(pref.push_enabled)}
                    onChange={() => handleTogglePref("push_enabled", Boolean(pref.push_enabled))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Urgent SMS Fallback</div>
                    <div className="text-[10px] text-slate-500">Sent on 30-min SLA timeout</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(pref.sms_enabled)}
                    onChange={() => handleTogglePref("sms_enabled", Boolean(pref.sms_enabled))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800">Min Alert Threshold</span>
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                    {pref.min_priority}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4">Loading user channel preferences...</div>
            )}
          </div>

          {/* AI Routing Rules */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Routing Rules & SLA Policies</h3>
              <p className="text-xs text-slate-500">Rules configured to map incoming events to priority, target channels, and 30-min SLA escalation limits.</p>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold">Rule Name</th>
                    <th className="p-3 font-bold">Event Type</th>
                    <th className="p-3 font-bold">Priority</th>
                    <th className="p-3 font-bold">SLA (min)</th>
                    <th className="p-3 font-bold">Channels</th>
                    <th className="p-3 font-bold">Auto Action Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{rule.rule_name}</td>
                      <td className="p-3 font-mono text-slate-600">{rule.event_type}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                          {rule.priority}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-mono font-bold">{rule.sla_minutes}m</td>
                      <td className="p-3 text-slate-600">{rule.channels}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ENABLED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEND MANUAL ALERT & MAILER SANDBOX */}
      {activeTab === "manual" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Send Manual Alert to Store Manager</h3>
              <p className="text-xs text-slate-500">Dispatch custom notifications via Email, Push, or SMS directly to an outlet manager.</p>
            </div>

            <form onSubmit={handleManualSend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Franchise Outlet</label>
                <select
                  value={manualForm.outletId}
                  onChange={(e) => setManualForm((p) => ({ ...p, outletId: e.target.value }))}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50 font-medium"
                >
                  <option value="all">All Outlets / HQ Broadcast</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.outlet_name} ({o.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alert Title</label>
                <input
                  required
                  type="text"
                  value={manualForm.title}
                  onChange={(e) => setManualForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-medium"
                  placeholder="e.g. Mandatory Staff Safety Briefing"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Details</label>
                <textarea
                  required
                  rows={3}
                  value={manualForm.message}
                  onChange={(e) => setManualForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-medium"
                  placeholder="Provide instructions for the outlet manager..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Severity</label>
                  <select
                    value={manualForm.severity}
                    onChange={(e) => setManualForm((p) => ({ ...p, severity: e.target.value }))}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50 font-medium"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Channels</label>
                  <div className="flex gap-2 pt-1">
                    {["EMAIL", "PUSH", "SMS"].map((ch) => (
                      <button
                        type="button"
                        key={ch}
                        onClick={() => toggleManualChannel(ch)}
                        className={`px-3 py-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                          manualForm.channels.includes(ch)
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={manualLoading || manualForm.channels.length === 0}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {manualLoading ? "Dispatching Alert..." : "🚀 Dispatch Alert Now"}
                </button>
              </div>
            </form>
          </div>

          {/* Mailer Sandbox & HTML Email Previewer */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 text-slate-900 shadow-xs space-y-4">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                Live Mailer Engine & Sandbox
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">Rich HTML Email Dispatch Sandbox</h3>
              <p className="text-xs text-slate-600">
                Our mailing engine automatically renders professional, mobile-responsive HTML templates when emailing outlet managers.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between text-slate-600 border-b border-slate-200 pb-2">
                <span>To: <strong className="text-slate-900">manager@franchiseops.ai</strong></span>
                <span>From: <strong className="text-indigo-600">notifications@franchiseops.ai</strong></span>
              </div>

              <div className="bg-white text-slate-900 p-4 rounded-xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase">
                    {manualForm.severity} PRIORITY
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">HTML Render Preview</span>
                </div>

                <div className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                  {manualForm.title || "Subject: Alert Title Preview"}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Hello Store Manager,<br />
                  {manualForm.message || "This is a preview of the rich HTML email that will be dispatched to the store manager's inbox."}
                </p>

                <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] text-indigo-900 font-medium">
                  🤖 <strong>AI Action Plan:</strong> Follow standard operating procedures and confirm acknowledgement within 30 minutes.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG TIMELINE */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Immutable Audit Log Timeline</h3>
              <p className="text-xs text-slate-500">
                Complete tamper-proof operational record of event detection, AI analysis, channel dispatches, acknowledgements, and SLA escalations.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {auditLogs.length} Total Audit Entries
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {auditLogs.map((log: AuditLogItem) => (
              <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase">
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{log.actor_name || "AI Workflow Engine"}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Details:</div>
                  {renderParsedAuditDetails(log.details)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedNotifId && (
        <NotificationDetailModal
          notificationId={selectedNotifId}
          onClose={() => setSelectedNotifId(null)}
          onRefresh={fetchDashboardData}
        />
      )}
    </div>
  );
}
