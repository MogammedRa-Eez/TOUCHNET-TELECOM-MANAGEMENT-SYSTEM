import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body, quote_id, quote_number } = await req.json();
    if (!to || !subject || !body) {
      return Response.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Build RFC 2822 email
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      body,
    ];
    const rawEmail = emailLines.join('\r\n');
    const encoded = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: 'Gmail API error', detail: err }, { status: 500 });
    }

    const result = await res.json();

    // Mark quote as sent if quote_id provided
    // Build a direct quote view link
    const appBaseUrl = 'https://app.base44.com/apps/69a157d4dbdca56a3bccf4d3';
    const quoteLink = quote_id
      ? `${appBaseUrl}/quote?id=${quote_id}`
      : quote_number
        ? `${appBaseUrl}/quote?ref=${quote_number}`
        : null;

    if (quote_id) {
      await base44.asServiceRole.entities.Quote.update(quote_id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    }

    return Response.json({ success: true, messageId: result.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});