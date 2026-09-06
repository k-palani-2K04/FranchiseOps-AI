/**
 * backgroundWorker.js
 * Non-blocking background worker process running inside the Node server.
 * Handles: Delivery Retries, SLA Monitoring, Timeout Escalations, Action-plan Deadlines.
 */
const { pool } = require('../db');
const { escalateNotification } = require('./escalationEngine');
const { dispatchNotification } = require('./channelService');

let isRunning = false;

async function runBackgroundCycle() {
  if (isRunning) return;
  isRunning = true;

  try {
    const now = new Date();

    // 1. SLA Check: Unacknowledged Notifications older than 30 minutes (or SLA limit)
    const unackRes = await pool.query(
      `SELECT n.*, r.sla_minutes 
       FROM notifications n
       LEFT JOIN notification_rules r ON r.event_type = n.title
       WHERE n.status = 'SENT' AND n.acknowledged_at IS NULL`
    );

    for (const notif of unackRes.rows) {
      const created = new Date(notif.created_at);
      const diffMins = (now - created) / (1000 * 60);
      const slaLimit = notif.sla_minutes || 30;

      if (diffMins > slaLimit && notif.severity === 'CRITICAL') {
        console.log(`[BackgroundWorker] SLA Timeout detected for notification #${notif.id} (${diffMins.toFixed(1)}m > ${slaLimit}m). Triggering SMS retry & escalation...`);
        
        // Trigger SMS fallback
        await dispatchNotification({
          notificationId: notif.id,
          recipientId: notif.recipient_id,
          channels: ['SMS'],
          priority: 'CRITICAL',
          title: `[UNACKNOWLEDGED SLA TIMEOUT] ${notif.title}`,
          message: `SLA Warning: Action required immediately for ${notif.title}`
        });

        // Trigger Escalation to Manager
        await escalateNotification({
          notificationId: notif.id,
          reason: `Unacknowledged notification exceeded ${slaLimit}-minute SLA window. Escalating to Store/Regional Manager.`
        });
      }
    }

    // 2. SLA Check: Action Plans past deadline
    const overduePlansRes = await pool.query(
      `SELECT * FROM action_plans WHERE status IN ('OPEN', 'IN_PROGRESS') AND deadline < CURRENT_TIMESTAMP`
    );

    for (const plan of overduePlansRes.rows) {
      console.log(`[BackgroundWorker] Action Plan #${plan.id} is OVERDUE. Escalating...`);
      await pool.query(
        `UPDATE action_plans SET status = 'OVERDUE', priority = 'CRITICAL' WHERE id = $1`,
        [plan.id]
      );

      await escalateNotification({
        notificationId: plan.notification_id,
        actionPlanId: plan.id,
        reason: `Action plan target deadline missed without completion. Status set to OVERDUE and escalated to Regional Manager.`
      });
    }

  } catch (err) {
    console.error('[BackgroundWorker] Error during background processing cycle:', err.message);
  } finally {
    isRunning = false;
  }
}

function startBackgroundWorker(intervalMs = 15000) {
  console.log(`[BackgroundWorker] Starting Agentic Notification & SLA background worker (interval: ${intervalMs}ms)...`);
  setInterval(runBackgroundCycle, intervalMs);
}

module.exports = {
  startBackgroundWorker,
  runBackgroundCycle
};
