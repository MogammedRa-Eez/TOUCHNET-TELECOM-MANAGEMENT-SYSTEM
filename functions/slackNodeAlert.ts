import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SLACK_URL = Deno.env.get("slack_url");

function latencyLabel(ms) {
  if (!ms || ms >= 999) return "N/A";
  return `${ms}ms`;
}

function signalLabel(pct) {
  if (pct === undefined || pct === null) return "N/A";
  return `${pct}%`;
}

function severityEmoji(latency, status) {
  if (status === "offline") return "🔴";
  if (latency >= 500) return "🟠";
  if (latency >= 200) return "🟡";
  return "🟢";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body   = await req.json();

    const { event, data, old_data } = body;
    if (!data) return Response.json({ ok: true, skipped: "no data" });

    const latency = data.latency ?? data.bandwidth_utilization ?? null;
    const status  = data.status;
    const label   = data.name || "Unknown Node";
    const signal  = data.uptime_percent ?? null;

    // Determine if alert should fire
    const isOffline       = status === "offline";
    const highLatency     = latency !== null && latency >= 200;
    const statusChanged   = old_data && old_data.status !== status && isOffline;
    const latencyTripped  = highLatency;

    if (!isOffline && !latencyTripped) {
      return Response.json({ ok: true, skipped: "no alert condition met" });
    }

    const emoji   = severityEmoji(latency, status);
    const reasons = [];
    if (isOffline)    reasons.push(`Status changed to *OFFLINE*`);
    if (highLatency)  reasons.push(`Latency at *${latencyLabel(latency)}* (threshold: 200ms)`);

    const message = {
      text: `${emoji} *TouchNet Network Alert* — ${label}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: `${emoji} Network Alert: ${label}`, emoji: true }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Node:*\n${label}` },
            { type: "mrkdwn", text: `*Status:*\n${status?.toUpperCase() ?? "UNKNOWN"}` },
            { type: "mrkdwn", text: `*Latency:*\n${latencyLabel(latency)}` },
            { type: "mrkdwn", text: `*Signal / Uptime:*\n${signalLabel(signal)}` },
          ]
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: `*Alert Reason(s):*\n• ${reasons.join("\n• ")}` }
        },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: `Triggered at ${new Date().toISOString()} · Node ID: ${data.id ?? "N/A"} · Location: ${data.location ?? "—"}` }]
        },
        { type: "divider" }
      ]
    };

    const resp = await fetch(SLACK_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(message),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return Response.json({ ok: false, error: text }, { status: 500 });
    }

    return Response.json({ ok: true, alerted: label, reasons });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});