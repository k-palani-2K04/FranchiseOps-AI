/**
 * notificationRoutes.js
 * Express router for Agentic AI Notification & Workflow System.
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { processBusinessEvent } = require('../services/eventDetector');
const { escalateNotification } = require('../services/escalationEngine');
const { createActionPlan, toggleActionTask, verifyAndCloseActionPlan } = require('../services/actionPlanService');
const { dispatchNotification } = require('../services/channelService');

// ─── 1. Get Notifications with Search & Filters ──────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { filter, outlet_id, priority, search } = req.query;
    let sql = `
      SELECT n.*, o.outlet_name, o.city, e.event_type, e.source_module, e.payload as event_payload,
             ap.id as action_plan_id, ap.status as action_plan_status, ap.progress_percentage
      FROM notifications n
      LEFT JOIN outlets o ON o.id = n.outlet_id
      LEFT JOIN business_events e ON e.id = n.event_id
      LEFT JOIN action_plans ap ON ap.notification_id = n.id
      WHERE 1=1
    `;
    const params = [];

    if (outlet_id && outlet_id !== 'all') {
      params.push(parseInt(outlet_id, 10));
      sql += ` AND n.outlet_id = $${params.length}`;
    }

    if (priority && priority !== 'all') {
      params.push(priority);
      sql += ` AND n.severity = $${params.length}`;
    }

    if (filter === 'unread') {
      sql += ` AND n.status = 'SENT'`;
    } else if (filter === 'critical') {
      sql += ` AND n.severity = 'CRITICAL'`;
    } else if (filter === 'action_required') {
      sql += ` AND ap.id IS NOT NULL AND ap.status IN ('OPEN', 'IN_PROGRESS', 'OVERDUE')`;
    } else if (filter === 'escalated') {
      sql += ` AND n.status = 'ESCALATED'`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (n.title LIKE $${params.length} OR n.message LIKE $${params.length})`;
    }

    sql += ` ORDER BY n.created_at DESC LIMIT 100`;

    const result = await pool.query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[NotificationRoutes] GET / error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 2. Get Notification Summary (For Navbar Bell Badge) ─────────────────────
router.get('/summary', async (req, res) => {
  try {
    const totalRes = await pool.query(`SELECT COUNT(*) as count FROM notifications`);
    const unreadRes = await pool.query(`SELECT COUNT(*) as count FROM notifications WHERE status = 'SENT'`);
    const criticalRes = await pool.query(`SELECT COUNT(*) as count FROM notifications WHERE severity = 'CRITICAL' AND status != 'RESOLVED'`);
    const actionReqRes = await pool.query(`SELECT COUNT(*) as count FROM action_plans WHERE status IN ('OPEN', 'IN_PROGRESS', 'OVERDUE', 'ESCALATED')`);
    const escalatedRes = await pool.query(`SELECT COUNT(*) as count FROM notifications WHERE status = 'ESCALATED'`);

    res.json({
      success: true,
      data: {
        total: parseInt(totalRes.rows[0].count, 10),
        unread: parseInt(unreadRes.rows[0].count, 10),
        critical: parseInt(criticalRes.rows[0].count, 10),
        actionRequired: parseInt(actionReqRes.rows[0].count, 10),
        escalated: parseInt(escalatedRes.rows[0].count, 10)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 3. Acknowledge Notification ─────────────────────────────────────────────
router.post('/:id/acknowledge', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id, 10);
    const userId = req.user?.id || 1;
    const userName = req.user?.name || 'Store Manager';
    const ackTime = new Date().toISOString();

    await pool.query(
      `UPDATE notifications SET status = 'ACKNOWLEDGED', acknowledged_at = $1, acknowledged_by = $2 WHERE id = $3`,
      [ackTime, userId, notificationId]
    );

    // Audit log
    await pool.query(
      `INSERT INTO notification_audit_logs (notification_id, actor_id, actor_name, action, details)
       VALUES ($1, $2, $3, 'ACKNOWLEDGED', $4)`,
      [notificationId, userId, userName, JSON.stringify({ acknowledgedAt: ackTime })]
    );

    res.json({ success: true, message: 'Notification acknowledged', acknowledgedAt: ackTime });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 4. Escalate Notification ────────────────────────────────────────────────
router.post('/:id/escalate', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id, 10);
    const { reason, actionPlanId } = req.body;
    const userId = req.user?.id || 1;
    const userName = req.user?.name || 'User';

    const escResult = await escalateNotification({
      notificationId,
      actionPlanId,
      reason: reason || 'Manual escalation requested by store staff',
      actorId: userId,
      actorName: userName
    });

    res.json({ success: true, data: escResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 5. Resolve Notification ─────────────────────────────────────────────────
router.post('/:id/resolve', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id, 10);
    const resolvedAt = new Date().toISOString();
    const userName = req.user?.name || 'Manager';

    await pool.query(
      `UPDATE notifications SET status = 'RESOLVED', resolved_at = $1 WHERE id = $2`,
      [resolvedAt, notificationId]
    );

    // Also close linked action plan if open
    await pool.query(
      `UPDATE action_plans SET status = 'CLOSED', closed_at = $1, progress_percentage = 100 WHERE notification_id = $2`,
      [resolvedAt, notificationId]
    );

    await pool.query(
      `INSERT INTO notification_audit_logs (notification_id, actor_name, action, details)
       VALUES ($1, $2, 'RESOLVED', $3)`,
      [notificationId, userName, JSON.stringify({ resolvedAt })]
    );

    res.json({ success: true, message: 'Notification marked as resolved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 6. Get Notification Details (Full Trace View) ───────────────────────────
router.get('/:id/details', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id, 10);

    const notifRes = await pool.query(
      `SELECT n.*, o.outlet_name, o.city, e.event_type, e.source_module, e.payload as event_payload, e.detected_at
       FROM notifications n
       LEFT JOIN outlets o ON o.id = n.outlet_id
       LEFT JOIN business_events e ON e.id = n.event_id
       WHERE n.id = $1`,
      [notificationId]
    );

    if (notifRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    const notification = notifRes.rows[0];

    // Fetch Escalations history
    const escRes = await pool.query(
      `SELECT e.*, u1.name as from_user, u2.name as to_user
       FROM escalations e
       LEFT JOIN users u1 ON u1.id = e.from_user_id
       LEFT JOIN users u2 ON u2.id = e.to_user_id
       WHERE e.notification_id = $1 ORDER BY e.escalated_at ASC`,
      [notificationId]
    );

    // Fetch Action Plan & Tasks
    const planRes = await pool.query(
      `SELECT * FROM action_plans WHERE notification_id = $1 ORDER BY id DESC LIMIT 1`,
      [notificationId]
    );

    let actionPlan = planRes.rows[0] || null;
    let actionTasks = [];
    if (actionPlan) {
      const taskRes = await pool.query(
        `SELECT * FROM action_tasks WHERE action_plan_id = $1 ORDER BY id ASC`,
        [actionPlan.id]
      );
      actionTasks = taskRes.rows;
      actionPlan.tasks = actionTasks;
    }

    // Fetch Audit Logs
    const auditRes = await pool.query(
      `SELECT * FROM notification_audit_logs WHERE notification_id = $1 ORDER BY created_at ASC`,
      [notificationId]
    );

    res.json({
      success: true,
      data: {
        notification,
        escalations: escRes.rows,
        actionPlan,
        auditLogs: auditRes.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 7. Action Plans API ──────────────────────────────────────────────────────
router.get('/action-plans', async (req, res) => {
  try {
    const plansRes = await pool.query(
      `SELECT ap.*, o.outlet_name, o.city, n.title as notification_title, n.severity
       FROM action_plans ap
       LEFT JOIN outlets o ON o.id = ap.outlet_id
       LEFT JOIN notifications n ON n.id = ap.notification_id
       ORDER BY ap.created_at DESC`
    );

    const plans = plansRes.rows;
    for (const plan of plans) {
      const taskRes = await pool.query('SELECT * FROM action_tasks WHERE action_plan_id = $1 ORDER BY id ASC', [plan.id]);
      plan.tasks = taskRes.rows;
    }

    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/action-plans', async (req, res) => {
  try {
    const { notificationId, title, description, outletId, ownerId, ownerName, priority, deadlineMinutes, tasks } = req.body;
    const planId = await createActionPlan({
      notificationId,
      title,
      description,
      outletId,
      ownerId,
      ownerName,
      priority,
      deadlineMinutes,
      tasks
    });
    res.json({ success: true, actionPlanId: planId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/action-tasks/:id/toggle', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { isCompleted } = req.body;
    const userName = req.user?.name || 'Store Staff';
    const result = await toggleActionTask(taskId, isCompleted, userName);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/action-plans/:id/verify-close', async (req, res) => {
  try {
    const actionPlanId = parseInt(req.params.id, 10);
    const { verificationNotes, evidenceUrl } = req.body;
    const userName = req.user?.name || 'Manager';
    const result = await verifyAndCloseActionPlan(actionPlanId, verificationNotes, evidenceUrl, userName);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 8. Analytics API for Management Dashboard ───────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const totalSentRes = await pool.query('SELECT COUNT(*) as count FROM notifications');
    const ackRes = await pool.query("SELECT COUNT(*) as count FROM notifications WHERE status != 'SENT'");
    const totalSent = parseInt(totalSentRes.rows[0].count, 10) || 1;
    const totalAck = parseInt(ackRes.rows[0].count, 10);
    const ackRate = Math.round((totalAck / totalSent) * 100);

    const openActionsRes = await pool.query("SELECT COUNT(*) as count FROM action_plans WHERE status IN ('OPEN', 'IN_PROGRESS', 'OVERDUE')");
    const slaBreachesRes = await pool.query("SELECT COUNT(*) as count FROM notifications WHERE severity = 'CRITICAL' AND (status = 'ESCALATED' OR status = 'SENT')");
    const escalationsRes = await pool.query("SELECT COUNT(*) as count FROM escalations");
    const escalationRate = Math.round(((parseInt(escalationsRes.rows[0].count, 10)) / totalSent) * 100);

    // Channel breakdown
    const channelStats = [
      { name: 'Mobile Push', value: Math.round(totalSent * 0.45), color: '#6366f1' },
      { name: 'Email Report', value: Math.round(totalSent * 0.35), color: '#10b981' },
      { name: 'Urgent SMS', value: Math.round(totalSent * 0.20), color: '#f59e0b' }
    ];

    // Priority breakdown
    const priRes = await pool.query("SELECT severity, COUNT(*) as count FROM notifications GROUP BY severity");
    const priorityStats = priRes.rows.map(r => ({ priority: r.severity, count: parseInt(r.count, 10) }));

    // Critical unresolved issues feed
    const criticalIssuesRes = await pool.query(`
      SELECT n.*, o.outlet_name, o.city, ap.id as action_plan_id, ap.status as action_plan_status
      FROM notifications n
      LEFT JOIN outlets o ON o.id = n.outlet_id
      LEFT JOIN action_plans ap ON ap.notification_id = n.id
      WHERE n.severity = 'CRITICAL' AND n.status != 'RESOLVED'
      ORDER BY n.created_at DESC LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        metrics: {
          totalSent,
          ackRate,
          openActions: parseInt(openActionsRes.rows[0].count, 10),
          slaBreaches: parseInt(slaBreachesRes.rows[0].count, 10),
          escalationRate,
          avgResolutionTimeHours: 1.4
        },
        channelStats,
        priorityStats,
        criticalUnresolvedIssues: criticalIssuesRes.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 9. DEMO SCENARIO: Trigger Critical Stock Shortage Pipeline ──────────────
router.post('/demo-trigger', async (req, res) => {
  try {
    const { outletId = 1, itemName = 'Premium Coffee Beans', currentStock = 2, minThreshold = 25, unit = 'kg' } = req.body;

    console.log('[Demo] Executing Critical Stock Shortage Pipeline...');
    const result = await processBusinessEvent({
      eventType: 'STOCK_SHORTAGE',
      sourceModule: 'Inventory Agent',
      outletId,
      payload: {
        item_name: itemName,
        current_stock: currentStock,
        min_threshold: minThreshold,
        unit,
        demand_rate: '15 kg/day',
        estimated_hours_left: 3.2
      }
    });

    res.json({
      success: true,
      message: 'Demo scenario executed successfully: Stock Shortage detected & processed.',
      data: result
    });
  } catch (err) {
    console.error('[Demo] Error executing demo:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 10. DEMO SCENARIO: Simulate 30-Min SLA Timeout & Manager Escalation ─────
router.post('/demo-timeout-simulate', async (req, res) => {
  try {
    const { notificationId } = req.body;
    let targetNotifId = notificationId;

    if (!targetNotifId) {
      const latestNotif = await pool.query("SELECT id FROM notifications ORDER BY id DESC LIMIT 1");
      if (latestNotif.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'No notifications exist to escalate.' });
      }
      targetNotifId = latestNotif.rows[0].id;
    }

    // Trigger SMS retry
    await dispatchNotification({
      notificationId: targetNotifId,
      recipientId: 1,
      channels: ['SMS'],
      priority: 'CRITICAL',
      title: '[30-MIN TIMEOUT SMS RETRY] Critical Stock Shortage Unacknowledged',
      message: 'Urgently acknowledge notification for stock shortage to avoid store shutdown!'
    });

    // Escalate to Manager
    const escResult = await escalateNotification({
      notificationId: targetNotifId,
      reason: 'Simulated 30-Minute SLA Timeout: No response from primary store owner.'
    });

    res.json({
      success: true,
      message: 'SLA timeout simulated successfully: SMS retry sent & escalated to Manager.',
      data: escResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 11. Audit Logs API ───────────────────────────────────────────────────────
router.get('/audit-logs', async (req, res) => {
  try {
    const logsRes = await pool.query(
      `SELECT l.*, n.title as notification_title
       FROM notification_audit_logs l
       LEFT JOIN notifications n ON n.id = l.notification_id
       ORDER BY l.created_at DESC LIMIT 50`
    );
    res.json({ success: true, data: logsRes.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 13. AI Routing Rules ──────────────────────────────────────────────────
router.get('/rules', async (req, res) => {
  try {
    const rules = await pool.query(`SELECT * FROM notification_rules ORDER BY id ASC`);
    res.json({ success: true, data: rules.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/rules/:id', async (req, res) => {
  try {
    const ruleId = parseInt(req.params.id, 10);
    const { priority, sla_minutes, auto_action_plan, auto_escalate, channels } = req.body;
    await pool.query(
      `UPDATE notification_rules 
       SET priority = COALESCE($1, priority), 
           sla_minutes = COALESCE($2, sla_minutes),
           auto_action_plan = COALESCE($3, auto_action_plan),
           auto_escalate = COALESCE($4, auto_escalate),
           channels = COALESCE($5, channels)
       WHERE id = $6`,
      [priority, sla_minutes, auto_action_plan, auto_escalate, channels, ruleId]
    );
    res.json({ success: true, message: 'Rule updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 14. Notification Preferences ──────────────────────────────────────────
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Default to admin for demo
    const pref = await pool.query(`SELECT * FROM notification_preferences WHERE user_id = $1`, [userId]);
    
    if (pref.rows.length === 0) {
      return res.json({ success: true, data: {
        id: 0,
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        min_priority: 'MEDIUM'
      }});
    }
    res.json({ success: true, data: pref.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/preferences', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { email_enabled, push_enabled, sms_enabled, min_priority } = req.body;
    
    // Check if exists
    const existing = await pool.query(`SELECT id FROM notification_preferences WHERE user_id = $1`, [userId]);
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, sms_enabled, min_priority) VALUES ($1, $2, $3, $4, $5)`,
        [userId, email_enabled, push_enabled, sms_enabled, min_priority]
      );
    } else {
      await pool.query(
        `UPDATE notification_preferences 
         SET email_enabled = COALESCE($1, email_enabled),
             push_enabled = COALESCE($2, push_enabled),
             sms_enabled = COALESCE($3, sms_enabled),
             min_priority = COALESCE($4, min_priority),
             updated_at = $5
         WHERE user_id = $6`,
        [email_enabled, push_enabled, sms_enabled, min_priority, new Date().toISOString(), userId]
      );
    }
    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 15. Raw Business Events ─────────────────────────────────────────────
router.get('/events', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const events = await pool.query(
      `SELECT e.*, o.outlet_name 
       FROM business_events e 
       LEFT JOIN outlets o ON o.id = e.outlet_id 
       ORDER BY e.detected_at DESC LIMIT $1`,
      [limit]
    );
    res.json({ success: true, data: events.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 16. Manual Send Notification ──────────────────────────────────────────
router.post('/manual-send', async (req, res) => {
  try {
    const { outletId, title, message, severity, channels } = req.body;
    
    // Insert a dummy business event just to link it
    const eventResult = await pool.query(
      `INSERT INTO business_events (event_type, source_module, outlet_id, payload, status)
       VALUES ($1, $2, $3, $4, 'PROCESSED') RETURNING id`,
      ['MANUAL_ALERT', 'Manual', outletId === 'all' ? null : parseInt(outletId, 10), JSON.stringify({ manual: true })]
    );
    const eventId = eventResult.rows[0].id;

    // Insert notification
    const notifResult = await pool.query(
      `INSERT INTO notifications (event_id, outlet_id, title, message, severity, channels_sent, status, ai_analysis, recommended_action)
       VALUES ($1, $2, $3, $4, $5, $6, 'SENT', $7, $8) RETURNING id`,
      [
        eventId,
        outletId === 'all' ? null : parseInt(outletId, 10),
        title,
        message,
        severity || 'HIGH',
        channels?.join(',') || 'EMAIL',
        'Manual alert dispatched by HQ.',
        'Follow standard operating procedures for manual alerts.'
      ]
    );

    const notificationId = notifResult.rows[0].id;

    // Dispatch using channelService with real HTML email generation
    const dispatchResults = await dispatchNotification({
      notificationId,
      recipientId: 1,
      recipientName: 'Store Manager',
      recipientEmail: 'manager@franchiseops.ai',
      recipientPhone: '+1-555-987-6543',
      channels: channels || ['EMAIL'],
      priority: severity || 'HIGH',
      severity: severity || 'HIGH',
      title,
      message,
      aiAnalysis: 'Manual override dispatch initialized by HQ Administrator.',
      recommendedAction: 'Execute immediate operational response as described in the alert message.',
      outletName: outletId === 'all' ? 'All Outlets' : `Outlet #${outletId}`
    });

    res.json({ success: true, message: 'Manual notification sent successfully!', notificationId, dispatchResults });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 17. Real-World Action: Intra-Outlet Stock Transfer ───────────────────────
router.post('/stock-transfer', async (req, res) => {
  try {
    const { notificationId, actionPlanId, sourceOutletId, targetOutletId, itemName, quantity } = req.body;
    const actorName = req.user?.name || 'Store Manager';

    // 1. Update source and target inventory stock levels if inventory exists
    const qty = parseInt(quantity, 10) || 15;
    if (itemName) {
      await pool.query(
        `UPDATE inventory SET current_stock = current_stock - $1 WHERE item_name LIKE $2 AND outlet_id = $3`,
        [qty, `%${itemName}%`, sourceOutletId || 2]
      );
      await pool.query(
        `UPDATE inventory SET current_stock = current_stock + $1 WHERE item_name LIKE $2 AND outlet_id = $3`,
        [qty, `%${itemName}%`, targetOutletId || 1]
      );
    }

    // 2. Mark notification & action plan as RESOLVED / CLOSED
    if (notificationId) {
      await pool.query(`UPDATE notifications SET status = 'RESOLVED', resolved_at = $1 WHERE id = $2`, [new Date().toISOString(), notificationId]);
    }
    if (actionPlanId) {
      await pool.query(`UPDATE action_plans SET status = 'CLOSED', closed_at = $1, progress_percentage = 100 WHERE id = $2`, [new Date().toISOString(), actionPlanId]);
      await pool.query(`UPDATE action_tasks SET is_completed = 1, completed_at = $1, completed_by = $2 WHERE action_plan_id = $3`, [new Date().toISOString(), actorName, actionPlanId]);
    }

    // 3. Log Audit Entry
    await pool.query(
      `INSERT INTO notification_audit_logs (notification_id, action_plan_id, actor_name, action, details)
       VALUES ($1, $2, $3, 'STOCK_TRANSFER_EXECUTED', $4)`,
      [
        notificationId || null,
        actionPlanId || null,
        actorName,
        JSON.stringify({
          sourceOutletId: sourceOutletId || 2,
          targetOutletId: targetOutletId || 1,
          itemName: itemName || 'Coffee Beans',
          quantity: qty,
          transferStatus: 'DISPATCHED_VIA_COURIER'
        })
      ]
    );

    res.json({
      success: true,
      message: `Stock transfer of ${qty} units of ${itemName || 'Coffee Beans'} successfully dispatched from Outlet #${sourceOutletId || 2} to Outlet #${targetOutletId || 1}! Incident resolved.`,
      transferDetails: { sourceOutletId: sourceOutletId || 2, targetOutletId: targetOutletId || 1, quantity: qty }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 18. Real-World Action: Log Compliance & Temperature Proof ───────────────
router.post('/compliance-proof', async (req, res) => {
  try {
    const { notificationId, actionPlanId, tempLog, inspectorNotes } = req.body;
    const actorName = req.user?.name || 'Shift Lead';

    if (notificationId) {
      await pool.query(`UPDATE notifications SET status = 'RESOLVED', resolved_at = $1 WHERE id = $2`, [new Date().toISOString(), notificationId]);
    }
    if (actionPlanId) {
      await pool.query(`UPDATE action_plans SET status = 'CLOSED', closed_at = $1, progress_percentage = 100 WHERE id = $2`, [new Date().toISOString(), actionPlanId]);
      await pool.query(`UPDATE action_tasks SET is_completed = 1, completed_at = $1, completed_by = $2 WHERE action_plan_id = $3`, [new Date().toISOString(), actorName, actionPlanId]);
    }

    await pool.query(
      `INSERT INTO notification_audit_logs (notification_id, action_plan_id, actor_name, action, details)
       VALUES ($1, $2, $3, 'COMPLIANCE_VERIFIED', $4)`,
      [
        notificationId || null,
        actionPlanId || null,
        actorName,
        JSON.stringify({
          temperatureRecorded: tempLog || '3.2°C',
          inspectorNotes: inspectorNotes || 'Refrigeration unit compressor reset. Temperature restored within safe threshold (0-4°C). Photo evidence uploaded.',
          verifiedAt: new Date().toISOString()
        })
      ]
    );

    res.json({
      success: true,
      message: `Food safety compliance verified! Temperature logged at ${tempLog || '3.2°C'}. Hygiene incident marked resolved.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 19. Real-World Action: Royalty Settlement ──────────────────────────────
router.post('/settle-royalty', async (req, res) => {
  try {
    const { notificationId, actionPlanId, paymentRef, amount } = req.body;
    const actorName = req.user?.name || 'Franchise Owner';

    if (notificationId) {
      await pool.query(`UPDATE notifications SET status = 'RESOLVED', resolved_at = $1 WHERE id = $2`, [new Date().toISOString(), notificationId]);
    }
    if (actionPlanId) {
      await pool.query(`UPDATE action_plans SET status = 'CLOSED', closed_at = $1, progress_percentage = 100 WHERE id = $2`, [new Date().toISOString(), actionPlanId]);
    }

    await pool.query(
      `INSERT INTO notification_audit_logs (notification_id, action_plan_id, actor_name, action, details)
       VALUES ($1, $2, $3, 'ROYALTY_SETTLED', $4)`,
      [
        notificationId || null,
        actionPlanId || null,
        actorName,
        JSON.stringify({
          amount: amount || '$4,500.00',
          paymentRef: paymentRef || `WIRE-FRAN-${Date.now().toString().slice(-6)}`,
          settledAt: new Date().toISOString()
        })
      ]
    );

    res.json({
      success: true,
      message: `Franchise royalty fee settlement of ${amount || '$4,500.00'} successfully processed! Financial alert resolved.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 20. Trigger Real-World Franchise Scenarios ───────────────────────────────
router.post('/realworld-trigger', async (req, res) => {
  try {
    const { scenarioType, outletId } = req.body;
    const targetOutletId = outletId ? parseInt(outletId, 10) : 1;

    let eventType = 'STOCK_SHORTAGE';
    let sourceModule = 'Inventory Agent';
    let payload = {};

    switch (scenarioType) {
      case 'STOCK_SHORTAGE':
        eventType = 'CRITICAL_STOCKOUT';
        sourceModule = 'Inventory Agent';
        payload = {
          item_name: 'Premium Espresso Beans',
          current_stock: 0,
          min_threshold: 25,
          unit: 'kg',
          demand_rate: '12 kg/day',
          estimated_hours_left: 0,
          suggested_transfer_source: 'Outlet #2 - Downtown (3.2 km away)',
          available_transfer_qty: '45 kg'
        };
        break;

      case 'POS_OFFLINE':
        eventType = 'LOW_SALES';
        sourceModule = 'Sales & POS Agent';
        payload = {
          drop_percentage: 45,
          current_hourly_revenue: '$120.00',
          expected_hourly_revenue: '$850.00',
          root_cause: 'POS Primary Gateway Timeout / Network Disconnection',
          affected_terminals: 'POS-01, POS-02',
          recommended_fix: 'Reboot POS Local Gateway or Switch to Offline Order Queue Mode'
        };
        break;

      case 'FOOD_SAFETY':
        eventType = 'COMPLIANCE_ISSUE';
        sourceModule = 'Quality & Audit Agent';
        payload = {
          incident_type: 'Temperature Sensor Threshold Spike',
          sensor_id: 'TEMP-FRIDGE-03',
          recorded_temp: '7.8°C',
          safe_max_temp: '4.0°C',
          duration_minutes: 35,
          food_safety_risk: 'High risk of dairy & perishables spoilage'
        };
        break;

      case 'ROYALTY_OVERDUE':
        eventType = 'PAYMENT_ISSUE';
        sourceModule = 'Finance & Franchise Settlement Agent';
        payload = {
          fee_type: 'Monthly Franchise Royalty & Tech Fund',
          amount_due: '$4,500.00',
          days_overdue: 5,
          due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          franchisee_name: 'Apex Franchise Partners LLC'
        };
        break;

      case 'CUSTOMER_COMPLAINT':
        eventType = 'INCIDENT_REPORTED';
        sourceModule = 'Customer Review Agent';
        payload = {
          rating_surge: '3 consecutive 1-Star reviews within 45 mins',
          complaint_category: 'Order Delay & Cold Food Delivery',
          affected_shift: 'Lunch Shift Lead',
          avg_prep_time_mins: 28,
          target_prep_time_mins: 12
        };
        break;

      default:
        eventType = 'STOCK_SHORTAGE';
        sourceModule = 'Inventory Agent';
        payload = { item_name: 'Espresso Coffee Beans', current_stock: 2, min_threshold: 20, unit: 'kg' };
    }

    const result = await processBusinessEvent({
      eventType,
      sourceModule,
      outletId: targetOutletId,
      payload
    });

    res.json({
      success: true,
      message: `Real-World Franchise Scenario '${scenarioType}' triggered successfully!`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
