import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const LATENCY_THRESHOLD = 200; // ms
const ALERT_TIMEOUT_MINUTES = 5;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const db = base44.asServiceRole;

  const now = new Date();
  const alertCutoff = new Date(now.getTime() - ALERT_TIMEOUT_MINUTES * 60 * 1000);

  // Fetch all nodes and active (unresolved) alerts
  const [nodes, activeAlerts] = await Promise.all([
    db.entities.NetworkNode.list(),
    db.entities.NodeAlert.filter({ resolved: false }),
  ]);

  const ticketsCreated = [];

  for (const node of nodes) {
    const isOffline = node.status === "offline";
    const isHighLatency = !isOffline && (node.bandwidth_utilization >= LATENCY_THRESHOLD || node.status === "degraded");
    const alertType = isOffline ? "offline" : isHighLatency ? "high_latency" : null;

    const existingAlert = activeAlerts.find(
      a => a.node_id === node.id && a.alert_type === alertType
    );

    if (alertType) {
      if (!existingAlert) {
        // First time seeing this node in critical state — record it
        await db.entities.NodeAlert.create({
          node_id: node.id,
          node_name: node.name,
          alert_type: alertType,
          first_detected_at: now.toISOString(),
          ticket_created: false,
          resolved: false,
        });
      } else if (!existingAlert.ticket_created) {
        // Check if it's been critical for 5+ minutes
        const firstDetected = new Date(existingAlert.first_detected_at);
        if (firstDetected <= alertCutoff) {
          // Create the ticket
          const alertLabel = alertType === "offline" ? "Node Offline" : "Critical Latency";
          const description = alertType === "offline"
            ? `Network node "${node.name}" has been offline since ${firstDetected.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}. Automatic alert triggered after ${ALERT_TIMEOUT_MINUTES} minutes.`
            : `Network node "${node.name}" has been in a critical latency/degraded state since ${firstDetected.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}. Automatic alert triggered after ${ALERT_TIMEOUT_MINUTES} minutes.`;

          const ticket = await db.entities.Ticket.create({
            subject: `[AUTO] ${alertLabel}: ${node.name}`,
            description,
            status: "open",
            priority: alertType === "offline" ? "critical" : "high",
            category: "connectivity",
            department: "technical",
            ticket_number: `AUTO-${Date.now()}`,
          });

          // Mark alert as having a ticket
          await db.entities.NodeAlert.update(existingAlert.id, {
            ticket_created: true,
            ticket_id: ticket.id,
          });

          ticketsCreated.push({ node: node.name, alertType, ticketId: ticket.id });
        }
      }
    } else {
      // Node is healthy — resolve any open alerts for it
      const staleAlerts = activeAlerts.filter(a => a.node_id === node.id);
      for (const alert of staleAlerts) {
        await db.entities.NodeAlert.update(alert.id, { resolved: true });
      }
    }
  }

  return Response.json({
    success: true,
    checked: nodes.length,
    ticketsCreated,
    timestamp: now.toISOString(),
  });
});