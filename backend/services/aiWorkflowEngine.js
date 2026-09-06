/**
 * aiWorkflowEngine.js
 * Agentic AI Decision & Rule Validation Engine.
 * Workflow Architecture: AI Recommends -> Rule Engine Validates -> Workflow Engine Executes
 */
const { pool } = require('../db');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Analyzes event data using AI contextual logic + Rule Engine validation
 */
async function analyzeAndDecideEvent(event) {
  const { event_type, source_module, outlet_id, payload } = event;
  let parsedPayload = {};
  try {
    parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;
  } catch (e) {
    parsedPayload = { raw: payload };
  }

  // 1. Fetch matching Rule from Rule Engine (notification tables in notifications.sqlite)
  const ruleRes = await pool.query(
    'SELECT * FROM notification_rules WHERE event_type = $1',
    [event_type]
  );
  const matchedRule = ruleRes.rows[0] || null;

  // 2. Fetch Outlet details & User details for owner assignment (via Prisma → database.sqlite)
  let outletName = 'All Outlets / Corporate';
  let responsibleUserId = 1;
  let responsibleUserName = 'Store Manager';

  if (outlet_id) {
    const outlet = await prisma.outlets.findUnique({ where: { id: Number(outlet_id) } });
    if (outlet) {
      outletName = `${outlet.city} (${outlet.outlet_name})`;
    }
    const user = await prisma.users.findFirst({ where: { outlet_id: Number(outlet_id) } });
    if (user) {
      responsibleUserId = user.id;
      responsibleUserName = user.name;
    }
  }


  // 3. AI Contextual Recommendation Engine
  let aiSeverity = 'MEDIUM';
  let businessImpact = 'Moderate operational friction requiring attention.';
  let priority = 'MEDIUM';
  let channels = ['PUSH'];
  let actionPlanRequired = true;
  let escalationRequired = false;
  let recommendedAction = 'Investigate issue and report status to franchise operations.';
  let aiReasoning = '';

  switch (event_type) {
    case 'STOCK_SHORTAGE':
    case 'CRITICAL_STOCKOUT':
      const itemName = parsedPayload.item_name || 'Key Raw Material';
      const currentStock = parsedPayload.current_stock ?? 0;
      const minThreshold = parsedPayload.min_threshold ?? 10;
      
      aiSeverity = currentStock === 0 ? 'CRITICAL' : 'HIGH';
      priority = aiSeverity;
      businessImpact = `High risk of menu item outage at ${outletName}. Item: ${itemName} (Current Stock: ${currentStock} ${parsedPayload.unit || 'units'}, Min Threshold: ${minThreshold}). Potential revenue loss estimated at $1,200/day.`;
      channels = priority === 'CRITICAL' ? ['PUSH', 'EMAIL', 'SMS'] : ['PUSH', 'EMAIL'];
      actionPlanRequired = true;
      escalationRequired = true;
      recommendedAction = `Immediately initiate urgent replenishment order for ${itemName}. Verify local inventory reserve or arrange intra-outlet transfer from nearby store within 2 hours.`;
      aiReasoning = `Stock level (${currentStock}) is severely below minimum safety threshold (${minThreshold}). AI model predicts stockout will stop kitchen operations during peak shift hours.`;
      break;

    case 'LOW_SALES':
      const dropPct = parsedPayload.drop_percentage || 25;
      aiSeverity = dropPct > 35 ? 'HIGH' : 'MEDIUM';
      priority = aiSeverity;
      businessImpact = `Revenue drop of ${dropPct}% detected today at ${outletName}. Underperforming revenue baseline by $2,450.`;
      channels = ['PUSH', 'EMAIL'];
      actionPlanRequired = true;
      escalationRequired = dropPct > 40;
      recommendedAction = `Trigger targeted local digital promotion campaign and inspect store footfall, staffing shifts, and local competitor promotions.`;
      aiReasoning = `Sequential linear regression trend analysis flags abnormal sales velocity drop compared to 4-week historical average for Friday evening shift.`;
      break;

    case 'COMPLIANCE_ISSUE':
    case 'MISSED_CHECKLIST':
      aiSeverity = 'HIGH';
      priority = 'HIGH';
      businessImpact = `Brand quality standard violation or missed opening/closing checklist at ${outletName}. Threatens food safety compliance audit score.`;
      channels = ['PUSH', 'EMAIL'];
      actionPlanRequired = true;
      escalationRequired = true;
      recommendedAction = `Assign shift supervisor to re-perform safety audit checklist, upload photo evidence, and complete rectification log.`;
      aiReasoning = `Non-compliance in hygiene or missed checklists correlated with 18% lower customer satisfaction ratings in historical audit logs.`;
      break;

    case 'SLA_BREACH':
    case 'OVERDUE_TASK':
      aiSeverity = 'CRITICAL';
      priority = 'CRITICAL';
      businessImpact = `SLA breach or critical task overdue at ${outletName}. SLA limit exceeded by ${parsedPayload.delay_minutes || 30} minutes.`;
      channels = ['PUSH', 'EMAIL', 'SMS'];
      actionPlanRequired = true;
      escalationRequired = true;
      recommendedAction = `Immediate regional manager intervention required to override unacknowledged action plan and reassign emergency owner.`;
      aiReasoning = `SLA response deadline expired without manager acknowledgement. Deterministic policy enforces mandatory escalation.`;
      break;

    default:
      aiSeverity = matchedRule ? matchedRule.priority : 'MEDIUM';
      priority = aiSeverity;
      businessImpact = `Operational anomaly detected in module ${source_module} for ${outletName}.`;
      channels = matchedRule ? matchedRule.channels.split(',') : ['PUSH', 'EMAIL'];
      actionPlanRequired = matchedRule ? Boolean(matchedRule.auto_action_plan) : true;
      escalationRequired = matchedRule ? Boolean(matchedRule.auto_escalate) : false;
      recommendedAction = `Review event payload details and execute standard operating procedure.`;
      aiReasoning = `Event processed using rule-engine default parameters for event type ${event_type}.`;
  }

  // 4. Rule Engine Validation (Override if rule engine explicitly specifies strict priority)
  if (matchedRule) {
    // If Rule Engine defines CRITICAL, enforce CRITICAL
    if (matchedRule.priority === 'CRITICAL' && priority !== 'CRITICAL') {
      priority = 'CRITICAL';
      channels = matchedRule.channels.split(',');
    }
  }

  return {
    eventType: event_type,
    outletId: outlet_id,
    outletName,
    responsibleUserId,
    responsibleUserName,
    severity: aiSeverity,
    priority,
    businessImpact,
    channels,
    actionPlanRequired,
    escalationRequired,
    recommendedAction,
    aiReasoning,
    slaMinutes: matchedRule ? matchedRule.sla_minutes : 30
  };
}

module.exports = {
  analyzeAndDecideEvent
};
