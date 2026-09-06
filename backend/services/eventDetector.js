/**
 * eventDetector.js
 * Extensible Business Event Detector & Automated Trigger Pipeline.
 */
const { pool } = require('../db');
const { analyzeAndDecideEvent } = require('./aiWorkflowEngine');
const { dispatchNotification, isDuplicate } = require('./channelService');
const { createActionPlan } = require('./actionPlanService');

/**
 * Ingest and process a business event
 */
async function processBusinessEvent({ eventType, sourceModule, outletId, payload }) {
  const payloadStr = typeof payload === 'object' ? JSON.stringify(payload) : payload;

  // Insert into business_events table
  const eventRes = await pool.query(
    `INSERT INTO business_events (event_type, source_module, outlet_id, payload, status)
     VALUES ($1, $2, $3, $4, 'PROCESSED')
     RETURNING id`,
    [eventType, sourceModule, outletId || null, payloadStr]
  );
  const eventId = eventRes.rows[0]?.id;

  // 1. AI Decision Engine
  const decision = await analyzeAndDecideEvent({
    event_type: eventType,
    source_module: sourceModule,
    outlet_id: outletId,
    payload
  });

  // Check deduplication (skip for manual/demo triggers)
  if (!eventType.startsWith('MANUAL') && isDuplicate(decision.responsibleUserId, eventType, outletId)) {
    console.log(`[EventDetector] Duplicate event ${eventType} for outlet ${outletId} processed with cooldown notice.`);
  }

  // 2. Create Notification record
  const title = `[${decision.priority}] ${eventType.replace(/_/g, ' ')} Alert - ${decision.outletName}`;
  const message = `${decision.businessImpact} Recommended Action: ${decision.recommendedAction}`;

  const notifRes = await pool.query(
    `INSERT INTO notifications (event_id, recipient_id, outlet_id, title, message, severity, channels_sent, status, ai_analysis, recommended_action)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'SENT', $8, $9)
     RETURNING id`,
    [
      eventId,
      decision.responsibleUserId,
      outletId || null,
      title,
      message,
      decision.priority,
      decision.channels.join(','),
      decision.aiReasoning,
      decision.recommendedAction
    ]
  );
  const notificationId = notifRes.rows[0]?.id;

  // 3. Dispatch Notification via Channel Service
  await dispatchNotification({
    notificationId,
    recipientId: decision.responsibleUserId,
    recipientName: decision.responsibleUserName,
    channels: decision.channels,
    priority: decision.priority,
    title,
    message
  });

  // 4. Create Action Plan if required by AI decision
  let actionPlanId = null;
  if (decision.actionPlanRequired) {
    actionPlanId = await createActionPlan({
      notificationId,
      title: `Action Plan: ${eventType.replace(/_/g, ' ')} Response`,
      description: decision.recommendedAction,
      outletId,
      ownerId: decision.responsibleUserId,
      ownerName: decision.responsibleUserName,
      priority: decision.priority,
      deadlineMinutes: decision.slaMinutes || 120
    });
  }

  // Record Audit Log
  await pool.query(
    `INSERT INTO notification_audit_logs (event_id, notification_id, action_plan_id, actor_name, action, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      eventId,
      notificationId,
      actionPlanId,
      'Event Detector Pipeline',
      'DETECTED',
      JSON.stringify({ eventType, priority: decision.priority, channels: decision.channels })
    ]
  );

  return {
    eventId,
    notificationId,
    actionPlanId,
    decision
  };
}

/**
 * Scan database for automated anomalies (stockout, sales drop, audit incidents)
 */
async function scanForAnomalies() {
  try {
    // 1. Scan Inventory Stockouts
    const invRes = await pool.query(`SELECT * FROM inventory WHERE current_stock <= min_threshold LIMIT 3`);
    for (const item of invRes.rows) {
      await processBusinessEvent({
        eventType: item.current_stock === 0 ? 'CRITICAL_STOCKOUT' : 'STOCK_SHORTAGE',
        sourceModule: 'Inventory Agent',
        outletId: item.outlet_id,
        payload: {
          item_id: item.id,
          item_name: item.item_name,
          current_stock: item.current_stock,
          min_threshold: item.min_threshold,
          unit: item.unit
        }
      });
    }

    // 2. Scan Audit Incidents
    const incRes = await pool.query(`SELECT * FROM audit_incidents WHERE status = 'Open' LIMIT 2`);
    for (const inc of incRes.rows) {
      await processBusinessEvent({
        eventType: 'COMPLIANCE_ISSUE',
        sourceModule: 'Audit Agent',
        outletId: inc.outlet_id,
        payload: {
          incident_id: inc.id,
          title: inc.title,
          description: inc.description,
          type: inc.incident_type
        }
      });
    }
  } catch (err) {
    console.error('[EventDetector] Error scanning anomalies:', err.message);
  }
}

module.exports = {
  processBusinessEvent,
  scanForAnomalies
};
