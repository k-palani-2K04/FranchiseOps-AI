"use client";

import React from "react";

interface NotificationDetailModalProps {
  notificationId: number | null;
  onClose: () => void;
  onRefresh: () => void;
}

interface NotificationRecord {
  id: number;
  event_id?: number;
  outlet_name?: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  created_at?: string;
  event_payload?: string;
  ai_analysis?: string;
  recommended_action?: string;
  channels_sent?: string;
  acknowledged_at?: string;
}

interface ActionTaskRecord {
  id: number;
  task_description: string;
  is_completed: boolean;
}

interface ActionPlanRecord {
  id: number;
  title: string;
  description: string;
  status: string;
  progress_percentage: number;
  tasks?: ActionTaskRecord[];
}

interface EscalationRecord {
  id: number;
  escalation_level: number;
  reason: string;
  escalated_at: string;
}

interface AuditLogRecord {
  id: number;
  actor_name: string;
  action: string;
  details?: string;
  created_at: string;
}

interface DetailsState {
  notification?: NotificationRecord;
  actionPlan?: ActionPlanRecord;
  auditLogs?: AuditLogRecord[];
  escalations?: EscalationRecord[];
}

// Render JSON Payload in a clean Light-Themed Tabular Column
function renderTabularPayload(payloadStr?: string) {
  if (!payloadStr) return null;
  try {
    const data = typeof payloadStr === "string" ? JSON.parse(payloadStr) : payloadStr;
    if (typeof data !== "object" || data === null) return <div className="text-xs text-slate-600 font-sans mt-2">{String(payloadStr)}</div>;

    const entries = Object.entries(data);
    if (entries.length === 0) return null;

    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Operational Anomaly Parameters</span>
          <span className="font-mono text-[9px] text-slate-400">{entries.length} Parameters</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-2 font-bold w-5/12 text-slate-700">Parameter Name</th>
              <th className="px-3.5 py-2 font-bold text-slate-700">Detected Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {entries.map(([key, val]) => (
              <tr key={key} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-3.5 py-2 font-bold text-slate-700 capitalize bg-slate-50/40">
                  {key.replace(/_/g, " ")}
                </td>
                <td className="px-3.5 py-2 text-slate-900 font-medium">
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
    return <div className="text-xs text-slate-600 font-sans mt-2">{String(payloadStr)}</div>;
  }
}

export default function NotificationDetailModal({ notificationId, onClose, onRefresh }: NotificationDetailModalProps) {
  const [details, setDetails] = React.useState<DetailsState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionNotes, setActionNotes] = React.useState("");

  const fetchDetails = React.useCallback(async () => {
    if (!notificationId) return;
    try {
      const api = (await import("../lib/api")).default;
      const res = await api.get(`/notifications/${notificationId}/details`);
      if (res.data.success) {
        setDetails(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching notification details:", err);
    } finally {
      setLoading(false);
    }
  }, [notificationId]);

  React.useEffect(() => {
    let isMounted = true;
    if (notificationId) {
      (async () => {
        try {
          const api = (await import("../lib/api")).default;
          const res = await api.get(`/notifications/${notificationId}/details`);
          if (isMounted && res.data.success) {
            setDetails(res.data.data);
          }
        } catch (err) {
          console.error("Error fetching notification details:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      })();
    }
    return () => {
      isMounted = false;
    };
  }, [notificationId]);

  if (!notificationId) return null;

  const handleAcknowledge = async () => {
    try {
      const api = (await import("../lib/api")).default;
      await api.post(`/notifications/${notificationId}/acknowledge`);
      fetchDetails();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscalate = async () => {
    try {
      const api = (await import("../lib/api")).default;
      await api.post(`/notifications/${notificationId}/escalate`, {
        reason: "Manual escalation triggered from notification trace viewer."
      });
      fetchDetails();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskToggle = async (taskId: number, currentCompleted: boolean) => {
    try {
      const api = (await import("../lib/api")).default;
      await api.put(`/notifications/action-tasks/${taskId}/toggle`, {
        isCompleted: !currentCompleted
      });
      fetchDetails();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyClose = async () => {
    if (!details?.actionPlan?.id) return;
    try {
      const api = (await import("../lib/api")).default;
      await api.put(`/notifications/action-plans/${details.actionPlan.id}/verify-close`, {
        verificationNotes: actionNotes || "Physical verification complete and stock levels restored.",
        evidenceUrl: "https://via.placeholder.com/300?text=Inspection+Proof"
      });
      fetchDetails();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const notif = details?.notification;
  const plan = details?.actionPlan;
  const auditLogs = details?.auditLogs || [];
  const escalations = details?.escalations || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Light Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-200">
              AI TRACE
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span>{notif?.title || "Notification Details"}</span>
                {notif?.severity === "CRITICAL" && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2.5 py-0.5 rounded-full border border-rose-200 animate-pulse">
                    CRITICAL
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Event ID #{notif?.event_id || 0} • Outlet: {notif?.outlet_name || "Corporate"} • {notif?.created_at ? new Date(notif.created_at).toLocaleString() : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading full workflow trace...</div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/30">
            {/* Step-by-Step AI Trace Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs font-semibold overflow-x-auto">
              <div className="flex items-center space-x-2 shrink-0">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span className="text-slate-800">Event Detected</span>
              </div>
              <span className="text-slate-400">→</span>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span className="text-slate-800">AI Decision</span>
              </div>
              <span className="text-slate-400">→</span>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span className="text-slate-800">Multi-Channel Alert</span>
              </div>
              <span className="text-slate-400">→</span>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                <span className="text-slate-800">Action Plan</span>
              </div>
              <span className="text-slate-400">→</span>
              <div className="flex items-center space-x-2 shrink-0">
                <span className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${notif?.status === "RESOLVED" ? "bg-emerald-500" : "bg-slate-300 text-slate-700"}`}>5</span>
                <span className="text-slate-800">Resolution</span>
              </div>
            </div>

            {/* 1. What Happened & Tabular Payload */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5">
                <span>📍 What Happened</span>
              </h3>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">{notif?.message}</p>
              
              {/* TABULAR COLUMN PARAMETERS TABLE */}
              {renderTabularPayload(notif?.event_payload)}
            </div>

            {/* 2. AI Analysis & Recommended Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-700 flex items-center space-x-1.5">
                  <span>🧠 AI Contextual Rationale</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{notif?.ai_analysis || "No specific rationale recorded."}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1.5">
                  <span>🎯 AI Recommended Action</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{notif?.recommended_action || "Follow standard operating procedures."}</p>
              </div>
            </div>

            {/* 3. Notification History & Channels */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5">
                <span>📡 Multi-Channel Delivery History</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(notif?.channels_sent || "PUSH").split(",").map((ch: string) => (
                  <span key={ch} className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Channel: {ch.trim()}</span>
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-600">
                Status: <strong className="text-slate-900 font-bold">{notif?.status}</strong> • Acknowledged: {notif?.acknowledged_at ? new Date(notif.acknowledged_at).toLocaleString() : "Pending"}
              </p>
            </div>

            {/* 4. Escalation Timeline */}
            {escalations.length > 0 && (
              <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center space-x-1.5">
                  <span>⚠️ Escalation History</span>
                </h3>
                <div className="space-y-2">
                  {escalations.map((esc: EscalationRecord) => (
                    <div key={esc.id} className="p-3 bg-white rounded-xl text-xs border border-rose-200 flex justify-between items-center shadow-2xs">
                      <div>
                        <div className="font-bold text-rose-800">Escalation Level #{esc.escalation_level}</div>
                        <div className="text-slate-700">{esc.reason}</div>
                      </div>
                      <span className="text-[10px] font-mono text-rose-600 font-bold">{new Date(esc.escalated_at).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Action Plan & Subtask Tracking */}
            {plan ? (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      📋 Linked Action Plan #{plan.id}
                    </h3>
                    <p className="text-xs text-slate-900 font-bold mt-0.5">{plan.title}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-600">{plan.progress_percentage}% Completed</span>
                    <div className="w-28 bg-slate-100 rounded-full h-1.5 mt-1 border border-slate-200">
                      <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${plan.progress_percentage}%` }} />
                    </div>
                  </div>
                </div>

                {/* Subtasks checklist */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="text-[11px] text-slate-500 font-bold uppercase">Required Operational Tasks</h4>
                  {plan.tasks?.map((t: ActionTaskRecord) => (
                    <label key={t.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors text-xs text-slate-800 border border-transparent hover:border-slate-200">
                      <input
                        type="checkbox"
                        checked={Boolean(t.is_completed)}
                        onChange={() => handleTaskToggle(t.id, Boolean(t.is_completed))}
                        className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                      />
                      <span className={t.is_completed ? "line-through text-slate-400" : "font-semibold text-slate-900"}>
                        {t.task_description}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Verification & Close controls */}
                {plan.status !== "CLOSED" && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Enter verification notes or resolution details..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                      rows={2}
                    />
                    <button
                      onClick={handleVerifyClose}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                    >
                      ✓ Confirm Verification & Resolve Action Plan
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 shadow-2xs">
                No active Action Plan linked to this notification.
              </div>
            )}

            {/* 6. Complete Audit Trail */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">📜 Audit Logs</h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {auditLogs.map((log: AuditLogRecord) => (
                  <div key={log.id} className="text-[11px] font-mono text-slate-600 flex items-center justify-between border-b border-slate-100 pb-1">
                    <span>[{new Date(log.created_at).toLocaleTimeString()}] <strong className="text-slate-900">{log.actor_name}</strong> - {log.action}</span>
                    <span className="text-slate-500 text-[10px] truncate max-w-xs">{log.details}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Light Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Real-World Action Buttons */}
            {notif?.status !== "RESOLVED" && (notif?.title?.includes("STOCK") || notif?.title?.includes("Stock")) && (
              <button
                onClick={async () => {
                  try {
                    const api = (await import("../lib/api")).default;
                    const res = await api.post("/notifications/stock-transfer", {
                      notificationId: notif.id,
                      actionPlanId: plan?.id,
                      sourceOutletId: 2,
                      targetOutletId: notif.event_id || 1,
                      itemName: "Espresso Beans",
                      quantity: 15
                    });
                    alert(res.data.message);
                    fetchDetails();
                    onRefresh();
                  } catch (e: any) {
                    alert("Stock transfer failed: " + e.message);
                  }
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center space-x-1.5"
              >
                <span>📦 Dispatch Intra-Outlet Stock Transfer (15 kg)</span>
              </button>
            )}

            {notif?.status !== "RESOLVED" && (notif?.title?.includes("COMPLIANCE") || notif?.title?.includes("Food Safety") || notif?.title?.includes("Checklist")) && (
              <button
                onClick={async () => {
                  try {
                    const api = (await import("../lib/api")).default;
                    const res = await api.post("/notifications/compliance-proof", {
                      notificationId: notif.id,
                      actionPlanId: plan?.id,
                      tempLog: "3.2°C",
                      inspectorNotes: "Compressor reset. Temperature logged."
                    });
                    alert(res.data.message);
                    fetchDetails();
                    onRefresh();
                  } catch (e: any) {
                    alert("Verification failed: " + e.message);
                  }
                }}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center space-x-1.5"
              >
                <span>🌡️ Log Food Temp Proof (3.2°C) & Clear Alert</span>
              </button>
            )}

            {notif?.status !== "RESOLVED" && (notif?.title?.includes("PAYMENT") || notif?.title?.includes("Royalty") || notif?.title?.includes("Fee")) && (
              <button
                onClick={async () => {
                  try {
                    const api = (await import("../lib/api")).default;
                    const res = await api.post("/notifications/settle-royalty", {
                      notificationId: notif.id,
                      actionPlanId: plan?.id,
                      amount: "$4,500.00"
                    });
                    alert(res.data.message);
                    fetchDetails();
                    onRefresh();
                  } catch (e: any) {
                    alert("Settlement failed: " + e.message);
                  }
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center space-x-1.5"
              >
                <span>💰 Settle Royalty Wire ($4,500.00) & Resolve</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {notif?.status === "SENT" && (
              <button
                onClick={handleAcknowledge}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs"
              >
                Acknowledge Event
              </button>
            )}

            {notif?.status !== "RESOLVED" && (
              <button
                onClick={handleEscalate}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs"
              >
                Escalate to Management
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer transition-all"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
