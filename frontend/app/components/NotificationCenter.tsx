"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import NotificationDetailModal from "./NotificationDetailModal";

interface NotificationCenterProps {
  onOpenDashboard?: () => void;
}

interface NotificationItem {
  id: number;
  severity: string;
  created_at?: string;
  title: string;
  message: string;
  status: string;
}

export default function NotificationCenter({ onOpenDashboard }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "critical" | "action_required" | "escalated">("all");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState({ total: 0, unread: 0, critical: 0, actionRequired: 0, escalated: 0 });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState<number | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get("/notifications/summary");
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching notification summary:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications", {
        params: {
          filter: activeTab,
          search
        }
      });
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary();
    const interval = setInterval(fetchSummary, 10000);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleAcknowledge = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/acknowledge`);
      fetchSummary();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscalate = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/escalate`, { reason: "Escalated from Notification Center" });
      fetchSummary();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/resolve`);
      fetchSummary();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      {/* ── Bell Icon Button ──────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer flex items-center justify-center"
        title="Agentic AI Notification Center"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {summary.unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
            {summary.unread}
          </span>
        )}
      </button>

      {/* ── Drawer / Popover Menu ────────────────────────────────────────── */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-3 w-96 sm:w-[450px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 text-white overflow-hidden flex flex-col max-h-[600px] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold tracking-tight">Agentic Notification Center</h3>
              </div>
              {onOpenDashboard && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenDashboard();
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  Open Dashboard →
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="p-2 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-1 text-[11px] overflow-x-auto">
              {(
                [
                  { id: "all", label: `All (${summary.total})` },
                  { id: "unread", label: `Unread (${summary.unread})` },
                  { id: "critical", label: `Critical (${summary.critical})` },
                  { id: "action_required", label: `Action (${summary.actionRequired})` },
                  { id: "escalated", label: `Escalated (${summary.escalated})` }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="p-2.5 border-b border-slate-800 bg-slate-900">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications or events..."
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-2">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No notifications found for this filter.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNotifId(n.id)}
                    className="p-3 bg-slate-800/40 hover:bg-slate-800 rounded-2xl border border-slate-700/50 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          {n.severity === "CRITICAL" ? (
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-md border border-rose-500/30">
                              CRITICAL
                            </span>
                          ) : n.severity === "HIGH" ? (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md border border-amber-500/30">
                              HIGH
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-md border border-indigo-500/30">
                              {n.severity}
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-mono">
                            {n.created_at ? new Date(n.created_at).toLocaleTimeString() : ""}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {n.title}
                        </h4>
                      </div>

                      {n.status === "SENT" && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>

                    {/* Quick Action Buttons */}
                    <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-2">
                        {n.status === "SENT" && (
                          <button
                            onClick={(e) => handleAcknowledge(e, n.id)}
                            className="px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg font-semibold cursor-pointer transition-colors"
                          >
                            Ack
                          </button>
                        )}
                        {n.status !== "RESOLVED" && (
                          <button
                            onClick={(e) => handleEscalate(e, n.id)}
                            className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white rounded-lg font-semibold cursor-pointer transition-colors border border-rose-500/30"
                          >
                            Escalate
                          </button>
                        )}
                        {n.status !== "RESOLVED" && (
                          <button
                            onClick={(e) => handleResolve(e, n.id)}
                            className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white rounded-lg font-semibold cursor-pointer transition-colors border border-emerald-500/30"
                          >
                            Resolve
                          </button>
                        )}
                      </div>

                      <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        Details Trace →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedNotifId && (
        <NotificationDetailModal
          notificationId={selectedNotifId}
          onClose={() => setSelectedNotifId(null)}
          onRefresh={() => {
            fetchSummary();
            fetchNotifications();
          }}
        />
      )}
    </div>
  );
}
