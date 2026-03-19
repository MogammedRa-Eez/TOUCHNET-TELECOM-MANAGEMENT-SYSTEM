import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();

        const { data, old_data } = payload;

        const newStatus = data?.status;
        const oldStatus = old_data?.status;

        // Only act if status actually changed
        if (!newStatus || newStatus === oldStatus) {
            return Response.json({ skipped: true, reason: "no status change" });
        }

        const webhookUrl = Deno.env.get("slack_url");
        if (!webhookUrl) {
            return Response.json({ error: "slack_url secret not set" }, { status: 500 });
        }

        // Fetch all users and check their notification preferences
        const users = await base44.asServiceRole.entities.User.list();

        // Find at least one user who has this event type enabled
        const eventKeyMap = {
            offline: "notify_offline",
            degraded: "notify_degraded",
            maintenance: "notify_maintenance",
            online: "notify_back_online",
        };

        const eventKey = eventKeyMap[newStatus];
        if (!eventKey) {
            return Response.json({ skipped: true, reason: "unmapped status" });
        }

        // Check if any admin/user has this notification enabled
        const anyEnabled = users.some((u) => {
            const prefs = u.notification_preferences;
            if (!prefs) {
                // Default: notify_offline and notify_back_online are true by default
                return eventKey === "notify_offline" || eventKey === "notify_back_online";
            }
            return prefs.slack_enabled !== false && prefs[eventKey] === true;
        });

        if (!anyEnabled) {
            return Response.json({ skipped: true, reason: "no users have this notification enabled" });
        }

        const nodeName = data.name || "Unknown Node";
        const nodeType = (data.type || "unknown").replace(/_/g, " ");
        const nodeLocation = data.location || "N/A";
        const nodeIp = data.ip_address || "N/A";

        const statusEmoji = {
            offline: "🔴",
            degraded: "🟡",
            maintenance: "🔵",
            online: "🟢",
        }[newStatus] || "⚪";

        const statusLabel = {
            offline: "Offline",
            degraded: "Degraded",
            maintenance: "Maintenance",
            online: "Back Online",
        }[newStatus] || newStatus;

        const message = {
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `${statusEmoji} Network Node ${statusLabel}`,
                        emoji: true
                    }
                },
                {
                    type: "section",
                    fields: [
                        { type: "mrkdwn", text: `*Node:*\n${nodeName}` },
                        { type: "mrkdwn", text: `*Type:*\n${nodeType}` },
                        { type: "mrkdwn", text: `*Location:*\n${nodeLocation}` },
                        { type: "mrkdwn", text: `*IP Address:*\n${nodeIp}` },
                        { type: "mrkdwn", text: `*Previous Status:*\n${oldStatus || "N/A"}` },
                        { type: "mrkdwn", text: `*New Status:*\n${statusLabel}` },
                    ]
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `Detected at <!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} {time}|${new Date().toISOString()}>`
                        }
                    ]
                }
            ]
        };

        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message)
        });

        if (!res.ok) {
            const text = await res.text();
            return Response.json({ error: `Slack error: ${text}` }, { status: 500 });
        }

        return Response.json({ success: true, node: nodeName, status: newStatus });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});