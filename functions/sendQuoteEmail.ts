import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body } = await req.json();
    if (!to || !subject || !body) {
      return Response.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TouchNet Sales <onboarding@resend.dev>",
        to: [to],
        subject,
        text: body,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return Response.json({ error: err.message || "Failed to send email" }, { status: res.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});