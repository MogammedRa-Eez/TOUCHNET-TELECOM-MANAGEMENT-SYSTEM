import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function getAccessToken() {
    const clientId = Deno.env.get("MICROSOFT_CLIENT_ID");
    const clientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET");
    const tenantId = Deno.env.get("MICROSOFT_TENANT_ID");
    const refreshToken = Deno.env.get("MICROSOFT_REFRESH_TOKEN");

    if (!clientId || !clientSecret || !tenantId || !refreshToken) {
        throw new Error("Outlook is not configured. Please set MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID, and MICROSOFT_REFRESH_TOKEN in the app secrets.");
    }

    const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            scope: "https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send offline_access"
        })
    });

    const data = await res.json();
    if (!data.access_token) throw new Error(data.error_description || "Failed to get Microsoft access token. The refresh token may be expired — please re-authenticate.");
    return data.access_token;
}

Deno.serve(async (req) => {
    try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    const accessToken = await getAccessToken();
    const graphBase = "https://graph.microsoft.com/v1.0/me";

    if (action === "listEmails") {
        const { folder = "inbox", top = 20, skip = 0 } = body;
        const res = await fetch(
            `${graphBase}/mailFolders/${folder}/messages?$top=${top}&$skip=${skip}&$orderby=receivedDateTime desc&$select=id,subject,from,receivedDateTime,isRead,bodyPreview`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await res.json();
        return Response.json({ emails: data.value || [], total: data["@odata.count"] });
    }

    if (action === "getEmail") {
        const { emailId } = body;
        const res = await fetch(
            `${graphBase}/messages/${emailId}?$select=id,subject,from,toRecipients,receivedDateTime,isRead,body,attachments`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await res.json();
        return Response.json({ email: data });
    }

    if (action === "sendEmail") {
        const { to, subject, body: emailBody, isHtml = false } = body;
        const res = await fetch(`${graphBase}/sendMail`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: {
                    subject,
                    body: { contentType: isHtml ? "HTML" : "Text", content: emailBody },
                    toRecipients: Array.isArray(to)
                        ? to.map(email => ({ emailAddress: { address: email } }))
                        : [{ emailAddress: { address: to } }]
                },
                saveToSentItems: true
            })
        });

        if (res.status === 202) return Response.json({ success: true });
        const err = await res.json();
        return Response.json({ error: err?.error?.message || "Failed to send" }, { status: 400 });
    }

    if (action === "markRead") {
        const { emailId } = body;
        await fetch(`${graphBase}/messages/${emailId}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: true })
        });
        return Response.json({ success: true });
    }

    if (action === "replyEmail") {
        const { emailId, comment } = body;
        const res = await fetch(`${graphBase}/messages/${emailId}/reply`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ comment })
        });
        if (res.status === 202) return Response.json({ success: true });
        const err = await res.json();
        return Response.json({ error: err?.error?.message || "Failed to reply" }, { status: 400 });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
});