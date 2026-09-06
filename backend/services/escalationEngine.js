/**
 * escalationEngine.js
 * Escalation Engine for automated SLA-breach & unacknowledged notification handling.
 * Chain: Owner -> Manager -> Regional Manager
 */
const { pool } = require('../db');
const { dispatchNotification } = require('./channelService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function escalateNotification({ notificationId, actionPlanId, reason, actorId, actorName }) {
  // Fetch notification details (from notifications.sqlite via pool)
  const notifRes = await pool.query('SELECT * FROM notifications WHERE id = $1', [notificationId]);
  if (notifRes.rows.length === 0) throw new Error('Notification not found');
  const notif = notifRes.rows[0];

  // Fetch current escalations count for this notification to determine level
  const escCountRes = await pool.query('SELECT COUNT(*) as count FROM escalations WHERE notification_id = $1', [notificationId]);
  const currentLevel = (parseInt(escCountRes.rows[0].count, 10) || 0) + 1;

  let targetRole = currentLevel >= 2 ? 'REGIONAL_MANAGER' : 'MANAGER';
  let targetUser = null;

  // Find target user to escalate to (via Prisma → database.sqlite)
  let prismaUser = await prisma.users.findFirst({ where: { role: targetRole } });
  if (!prismaUser) {
    // Fallback to first user (admin)
    prismaUser = await prisma.users.findFirst({ orderBy: { id: 'asc' } });
  }
  targetUser = prismaUser
    ? { id: prismaUser.id, name: prismaUser.name, email: prismaUser.email }
    : { id: 1, name: 'Regional Director', email: 'regional@franchiseops.com' };


  // Update notification status to ESCALATED
  await pool.query(
    `UPDATE notifications SET status = 'ESCALATED', severity = 'CRITICAL' WHERE id = $1`,
    [notificationId]
  );

  // If action plan exists, update action plan status to ESCALATED
  if (actionPlanId) {
    await pool.query(
      `UPDATE action_plans SET status = 'ESCALATED', priority = 'CRITICAL' WHERE id = $1`,
      [actionPlanId]
    );
  }

  // Insert escalation log entry
  const escRes = await pool.query(
    `INSERT INTO escalations (notification_id, action_plan_id, from_user_id, to_user_id, escalation_level, reason, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
     RETURNING id`,
    [
      notificationId,
      actionPlanId || null,
      actorId || notif.recipient_id || 1,
      targetUser.id,
      currentLevel,
      reason || `Unacknowledged notification SLA breach (${currentLevel === 1 ? '30-min timeout' : 'Unresolved SLA breach'})`
    ]
  );

  // Dispatch urgent escalation alert via Push + Email + SMS
  await dispatchNotification({
    notificationId,
    recipientId: targetUser.id,
    recipientName: targetUser.name,
    recipientEmail: targetUser.email,
    channels: ['PUSH', 'EMAIL', 'SMS'],
    priority: 'CRITICAL',
    title: `[ESCALATION L${currentLevel}] ${notif.title}`,
    message: `Escalated to ${targetRole} (${targetUser.name}): ${reason}`
  });

  // Record audit log
  await pool.query(
    `INSERT INTO notification_audit_logs (event_id, notification_id, action_plan_id, actor_id, actor_name, action, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      notif.event_id,
      notificationId,
      actionPlanId || null,
      actorId || 1,
      actorName || 'Escalation Engine',
      'ESCALATED',
      JSON.stringify({
        level: currentLevel,
        escalatedToRole: targetRole,
        escalatedToUser: targetUser.name,
        reason
      })
    ]
  );

  return {
    escalationId: escRes.rows[0]?.id || 1,
    level: currentLevel,
    escalatedTo: targetUser.name,
    role: targetRole
  };
}

module.exports = {
  escalateNotification
};
