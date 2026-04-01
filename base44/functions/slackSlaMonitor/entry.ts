import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SLACK_URL = Deno.env.get("slack_url");

// SLA thresholds in hours per priority
const SLA_HOURS = {
  critical: 4,
  high:     8,
  medium:   24,
  low:      72,
};

// Alert when this % of SLA time has elapsed
const WARN_THRESHOLD = 0.75;  // 75% elapsed = at risk
const BREACH_THRESHOLD = 1.0; // 100% elapsed = breached

const PRIORITY_EMOJI = {
  critical: "🔴",
  high:     "🟠",
  medium:   "🟡",
  low:      "🔵",
};

function getDeadline(ticket) {
  // Use stored sla_deadline if set, otherwise compute from created_date
  if (ticket.sla_deadline) return new Date(ticket.sla_deadline);
  const hours = SLA_HOURS[ticket.priority] || SLA_HOURS.medium;
  return new Date(new Date(ticket.created_date).getTime() + hours * 60 * 60 * 1000);
}

function formatDuration(ms) {
  const totalMins = Math.abs(Math.floor(ms / 60000));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all open/in-progress/escalated tickets
    const allTickets = await base44.asServiceRole.entities.Ticket.filter({});
    const activeTickets = allTickets.filter(t =>
      !["resolved", "closed"].includes(t.status)
    );

    const now = Date.now();
    const atRisk = [];
    const breached = [];

    for (const ticket of activeTickets) {
      const deadline = getDeadline(ticket);
      const deadlineMs = deadline.getTime();
      const slaHours = SLA_HOURS[ticket.priority] || SLA_HOURS.medium;
      const totalSlaMs = slaHours * 60 * 60 * 1000;
      const createdMs = new Date(ticket.created_date).getTime();
      const elapsed = now - createdMs;
      const ratio = elapsed / totalSlaMs;
      const msToDeadline = deadlineMs - now;

      if (ratio >= BREACH_THRESHOLD) {
        breached.push({ ticket, msToDeadline, ratio });
      } else if (ratio >= WARN_THRESHOLD) {
        atRisk.push({ ticket, msToDeadline, ratio });
      }
    }

    if (atRisk.length === 0 && breached.length === 0) {
      return Response.json({ ok: true, message: "No SLA alerts needed", active: activeTickets.length });
    }

    // Build Slack message
    const blocks = [
      {
        type: "header",
        text: { type: "plain_text", text: "⏰ TouchNet SLA Monitor Report", emoji: true }
      },
      {
        type: "context",
        elements: [{
          type: "mrkdwn",
          text: `Run at ${new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })} SAST · ${activeTickets.length} active tickets checked`
        }]
      },
      { type: "divider" }
    ];

    // Breached tickets section
    if (breached.length > 0) {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*🚨 SLA BREACHED — ${breached.length} ticket(s)*` }
      });

      for (const { ticket, msToDeadline } of breached) {
        const emoji = PRIORITY_EMOJI[ticket.priority] || "⚪";
        const overBy = formatDuration(Math.abs(msToDeadline));
        blocks.push({
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*${emoji} ${ticket.ticket_number || ticket.id}*\n${ticket.subject}` },
            { type: "mrkdwn", text: `*Priority:* ${ticket.priority?.toUpperCase()}\n*Overdue by:* ${overBy}` },
            { type: "mrkdwn", text: `*Customer:* ${ticket.customer_name || "—"}\n*Status:* ${ticket.status?.replace(/_/g, " ")}` },
            { type: "mrkdwn", text: `*Assigned to:* ${ticket.assigned_to || "Unassigned"}\n*Dept:* ${ticket.department?.replace(/_/g, " ") || "—"}` },
          ]
        });
        blocks.push({ type: "divider" });
      }
    }

    // At risk tickets section
    if (atRisk.length > 0) {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*⚠️ SLA AT RISK — ${atRisk.length} ticket(s)*` }
      });

      for (const { ticket, msToDeadline, ratio } of atRisk) {
        const emoji = PRIORITY_EMOJI[ticket.priority] || "⚪";
        const timeLeft = formatDuration(msToDeadline);
        const pctUsed = Math.round(ratio * 100);
        blocks.push({
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*${emoji} ${ticket.ticket_number || ticket.id}*\n${ticket.subject}` },
            { type: "mrkdwn", text: `*Priority:* ${ticket.priority?.toUpperCase()}\n*Time left:* ${timeLeft} (${pctUsed}% elapsed)` },
            { type: "mrkdwn", text: `*Customer:* ${ticket.customer_name || "—"}\n*Status:* ${ticket.status?.replace(/_/g, " ")}` },
            { type: "mrkdwn", text: `*Assigned to:* ${ticket.assigned_to || "Unassigned"}\n*Dept:* ${ticket.department?.replace(/_/g, " ") || "—"}` },
          ]
        });
        blocks.push({ type: "divider" });
      }
    }

    // Summary footer
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `📊 *Summary:* ${breached.length} breached · ${atRisk.length} at risk · ${activeTickets.length - breached.length - atRisk.length} on track`
      }
    });

    const slackPayload = {
      text: `⏰ SLA Alert: ${breached.length} breached, ${atRisk.length} at risk`,
      blocks
    };

    const resp = await fetch(SLACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackPayload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return Response.json({ ok: false, error: text }, { status: 500 });
    }

    return Response.json({
      ok: true,
      breached: breached.length,
      atRisk: atRisk.length,
      activeTickets: activeTickets.length
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});