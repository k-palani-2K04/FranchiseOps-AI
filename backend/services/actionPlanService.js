/**
 * actionPlanService.js
 * Workflow engine for Action Plans & Tasks.
 * Workflow: Identify Issue -> Assign Owner -> Set Deadline -> Track Progress -> Verify -> Close
 */
const { pool } = require('../db');

/**
 * Creates an Action Plan for a notification
 */
async function createActionPlan({ notificationId, title, description, outletId, ownerId, ownerName, priority, deadlineMinutes = 120, tasks = [] }) {
  // Fetch notification to ensure valid
  const notifRes = await pool.query('SELECT * FROM notifications WHERE id = $1', [notificationId]);
  if (notifRes.rows.length === 0) throw new Error('Notification not found');
  const notif = notifRes.rows[0];

  const deadline = new Date(Date.now() + deadlineMinutes * 60 * 1000).toISOString();

  // Create action plan
  const planRes = await pool.query(
    `INSERT INTO action_plans (notification_id, title, description, outlet_id, owner_id, owner_name, priority, status, progress_percentage, deadline)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN', 0, $8)
     RETURNING id`,
    [
      notificationId,
      title || `Action Plan: ${notif.title}`,
      description || notif.recommended_action || 'Execute standard operating procedure and resolve issue.',
      outletId || notif.outlet_id,
      ownerId || notif.recipient_id || 1,
      ownerName || 'Store Manager',
      priority || notif.severity || 'HIGH',
      deadline
    ]
  );

  const actionPlanId = planRes.rows[0]?.id;

  // Insert Action Tasks
  const defaultTasks = tasks.length > 0 ? tasks : [
    'Inspect physical inventory and verify system disparity',
    'Place emergency replenishment order with main distribution hub',
    'Notify regional supervisor and document root cause log',
    'Perform post-delivery check and confirm stock restoration'
  ];

  for (const taskDesc of defaultTasks) {
    await pool.query(
      `INSERT INTO action_tasks (action_plan_id, task_description, is_completed)
       VALUES ($1, $2, 0)`,
      [actionPlanId, taskDesc]
    );
  }

  // Record Audit Log
  await pool.query(
    `INSERT INTO notification_audit_logs (event_id, notification_id, action_plan_id, actor_name, action, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      notif.event_id,
      notificationId,
      actionPlanId,
      ownerName || 'Action Plan Engine',
      'ACTION_PLAN_CREATED',
      JSON.stringify({ title, tasksCount: defaultTasks.length, ownerName, deadline })
    ]
  );

  return actionPlanId;
}

/**
 * Toggle Action Task completion
 */
async function toggleActionTask(taskId, isCompleted, actorName = 'User') {
  const taskRes = await pool.query('SELECT * FROM action_tasks WHERE id = $1', [taskId]);
  if (taskRes.rows.length === 0) throw new Error('Task not found');
  const task = taskRes.rows[0];

  const nowCompleted = isCompleted !== undefined ? (isCompleted ? 1 : 0) : (task.is_completed ? 0 : 1);
  const completedAt = nowCompleted ? new Date().toISOString() : null;

  await pool.query(
    `UPDATE action_tasks SET is_completed = $1, completed_at = $2, completed_by = $3 WHERE id = $4`,
    [nowCompleted, completedAt, actorName, taskId]
  );

  // Recalculate progress for parent Action Plan
  const allTasksRes = await pool.query('SELECT * FROM action_tasks WHERE action_plan_id = $1', [task.action_plan_id]);
  const total = allTasksRes.rows.length;
  const done = allTasksRes.rows.filter(t => t.is_completed == 1).length;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

  let newStatus = 'IN_PROGRESS';
  if (progressPct === 100) {
    newStatus = 'COMPLETED';
  } else if (progressPct === 0) {
    newStatus = 'OPEN';
  }

  await pool.query(
    `UPDATE action_plans SET progress_percentage = $1, status = $2 WHERE id = $3`,
    [progressPct, newStatus, task.action_plan_id]
  );

  // Record audit log
  await pool.query(
    `INSERT INTO notification_audit_logs (action_plan_id, actor_name, action, details)
     VALUES ($1, $2, $3, $4)`,
    [
      task.action_plan_id,
      actorName,
      'TASK_COMPLETED',
      JSON.stringify({ taskId, taskDescription: task.task_description, completed: Boolean(nowCompleted), progressPct })
    ]
  );

  return { actionPlanId: task.action_plan_id, progressPct, status: newStatus };
}

/**
 * Verify and close Action Plan
 */
async function verifyAndCloseActionPlan(actionPlanId, verificationNotes, evidenceUrl, actorName = 'Manager') {
  const closedAt = new Date().toISOString();
  await pool.query(
    `UPDATE action_plans 
     SET status = 'CLOSED', progress_percentage = 100, closed_at = $1, verification_notes = $2, evidence_url = $3 
     WHERE id = $4`,
    [closedAt, verificationNotes || 'Verification confirmed by manager.', evidenceUrl || 'https://via.placeholder.com/150', actionPlanId]
  );

  // Fetch linked notification and mark resolved
  const planRes = await pool.query('SELECT * FROM action_plans WHERE id = $1', [actionPlanId]);
  if (planRes.rows.length > 0) {
    const notifId = planRes.rows[0].notification_id;
    await pool.query(
      `UPDATE notifications SET status = 'RESOLVED', resolved_at = $1 WHERE id = $2`,
      [closedAt, notifId]
    );

    // Audit log
    await pool.query(
      `INSERT INTO notification_audit_logs (notification_id, action_plan_id, actor_name, action, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        notifId,
        actionPlanId,
        actorName,
        'RESOLVED',
        JSON.stringify({ verificationNotes, closedAt })
      ]
    );
  }

  return { actionPlanId, status: 'CLOSED', closedAt };
}

module.exports = {
  createActionPlan,
  toggleActionTask,
  verifyAndCloseActionPlan
};
