import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const payload = await req.json();

        const { event, data, old_data } = payload;

        // Only notify when status changes TO "offline"
        if (data?.status !== "offline" || old_data?.status === "offline") {
            return Response.json({ skipped: true });
        }

        const webhookUrl = Deno.env.get("slack_url");
        if (!webhookUrl) {
            return Response.json({ error: "SLACK_WEBHOOK_URL not set" }, { status: 500 });
        }

        const nodeName = data.name || "Unknown Node";
        const nodeType = data.type || "unknown";
        const nodeLocation = data.location || "N/A";
        const nodeIp = data.ip_address || "N/A";

        const message = {
            text: `🚨 *Service Outage Detected*`,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🚨 Service Outage Detected",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    fields: [
                        { type: "mrkdwn", text: `*Node:*\n${nodeName}` },
                        { type: "mrkdwn", text: `*Type:*\n${nodeType.replace(/_/g, " ")}` },
                        { type: "mrkdwn", text: `*Location:*\n${nodeLocation}` },
                        { type: "mrkdwn", text: `*IP Address:*\n${nodeIp}` }
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

        return Response.json({ success: true, node: nodeName });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});