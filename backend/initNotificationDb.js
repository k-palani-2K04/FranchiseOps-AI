/**
 * initNotificationDb.js
 * Ensures all tables for the Agentic AI Notification & Workflow System exist in SQLite database.
 */
const { pool } = require('./db');

async function initNotificationDb() {
  try {
    console.log('[initNotificationDb] Ensuring Notification System tables exist...');

    // 1. business_events
    await pool.query(`
      CREATE TABLE IF NOT EXISTS business_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        source_module TEXT NOT NULL,
        outlet_id INTEGER,
        payload TEXT NOT NULL,
        detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'PROCESSED'
      );
    `);

    // 2. notification_rules
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT UNIQUE NOT NULL,
        rule_name TEXT NOT NULL,
        priority TEXT NOT NULL,
        channels TEXT NOT NULL,
        sla_minutes INTEGER DEFAULT 30,
        auto_action_plan INTEGER DEFAULT 1,
        auto_escalate INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. notification_preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        email_enabled INTEGER DEFAULT 1,
        push_enabled INTEGER DEFAULT 1,
        sms_enabled INTEGER DEFAULT 1,
        min_priority TEXT DEFAULT 'LOW',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        recipient_id INTEGER,
        outlet_id INTEGER,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT DEFAULT 'MEDIUM',
        channels_sent TEXT NOT NULL,
        status TEXT DEFAULT 'SENT',
        ai_analysis TEXT,
        recommended_action TEXT,
        retry_count INTEGER DEFAULT 0,
        acknowledged_at DATETIME,
        acknowledged_by INTEGER,
        resolved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. escalations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS escalations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_id INTEGER NOT NULL,
        action_plan_id INTEGER,
        from_user_id INTEGER,
        to_user_id INTEGER,
        escalation_level INTEGER DEFAULT 1,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        escalated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. action_plans
    await pool.query(`
      CREATE TABLE IF NOT EXISTS action_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        outlet_id INTEGER,
        owner_id INTEGER,
        owner_name TEXT,
        priority TEXT DEFAULT 'HIGH',
        status TEXT DEFAULT 'OPEN',
        progress_percentage INTEGER DEFAULT 0,
        deadline DATETIME,
        evidence_url TEXT,
        verification_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME
      );
    `);

    // 7. action_tasks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS action_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_plan_id INTEGER NOT NULL,
        task_description TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        completed_at DATETIME,
        completed_by TEXT
      );
    `);

    // 8. notification_audit_logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        notification_id INTEGER,
        action_plan_id INTEGER,
        actor_id INTEGER,
        actor_name TEXT,
        action TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default rules if table is empty
    const rulesRes = await pool.query('SELECT COUNT(*) as count FROM notification_rules');
    if (rulesRes.rows[0].count == 0) {
      console.log('[initNotificationDb] Seeding default Notification Rules...');
      const defaultRules = [
        ['STOCK_SHORTAGE', 'Critical Stock Shortage Rule', 'CRITICAL', 'PUSH,EMAIL', 30, 1, 1],
        ['LOW_SALES', 'Sudden Sales Drop Rule', 'HIGH', 'PUSH,EMAIL', 60, 1, 1],
        ['CRITICAL_STOCKOUT', 'Critical Stockout Rule', 'CRITICAL', 'PUSH,EMAIL,SMS', 15, 1, 1],
        ['MISSED_CHECKLIST', 'Missed Store Audit Checklist', 'MEDIUM', 'PUSH', 120, 1, 0],
        ['COMPLIANCE_ISSUE', 'Hygiene & Brand Compliance Breach', 'HIGH', 'PUSH,EMAIL', 45, 1, 1],
        ['PENDING_APPROVAL', 'Purchase Order Pending Approval', 'MEDIUM', 'PUSH,EMAIL', 180, 0, 0],
        ['PAYMENT_ISSUE', 'POS Settlement & Payment Anomaly', 'HIGH', 'PUSH,EMAIL', 60, 1, 1],
        ['REPORTED_INCIDENT', 'Safety or Equipment Incident', 'HIGH', 'PUSH,EMAIL', 30, 1, 1],
        ['OVERDUE_TASK', 'Operational Action Task Overdue', 'MEDIUM', 'PUSH', 120, 0, 1],
        ['SLA_BREACH', 'Action Plan SLA Timeout Breach', 'CRITICAL', 'PUSH,EMAIL,SMS', 15, 1, 1]
      ];

      for (const rule of defaultRules) {
        await pool.query(
          `INSERT INTO notification_rules (event_type, rule_name, priority, channels, sla_minutes, auto_action_plan, auto_escalate)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          rule
        );
      }
    }

    console.log('[initNotificationDb] Notification System DB ready.');
  } catch (err) {
    console.error('[initNotificationDb] Error initializing DB:', err);
  }
}

module.exports = { initNotificationDb };
