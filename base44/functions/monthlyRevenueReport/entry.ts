import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Fetch paid invoices and filter to current month
    const allPaid = await base44.asServiceRole.entities.Invoice.filter({ status: 'paid' });
    const monthlyPaid = allPaid.filter(i => i.paid_date && i.paid_date >= monthStart);
    const totalRevenue = monthlyPaid.reduce((s, i) => s + (i.total || 0), 0);

    // Fetch overdue invoices
    const overdue = await base44.asServiceRole.entities.Invoice.filter({ status: 'overdue' });
    const overdueTotal = overdue.reduce((s, i) => s + (i.total || 0), 0);

    // Fetch pending (sent/draft)
    const sentInvoices = await base44.asServiceRole.entities.Invoice.filter({ status: 'sent' });
    const pendingTotal = sentInvoices.reduce((s, i) => s + (i.total || 0), 0);

    // Send to all admin users
    const users = await base44.asServiceRole.entities.User.list();
    const admins = users.filter(u => u.role === 'admin' && u.email);

    const emailBody = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px;">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:#0f172a;padding:28px 32px;">
    <h1 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 4px;">Monthly Revenue Report</h1>
    <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">${monthName} · TouchNet TMS</p>
  </td></tr>
  <tr><td style="padding:24px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:33%;padding:0 6px 0 0;vertical-align:top;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
            <p style="font-size:10px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Collected This Month</p>
            <p style="font-size:22px;font-weight:800;color:#16a34a;margin:0;">R${totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            <p style="font-size:11px;color:#4ade80;margin:4px 0 0;">${monthlyPaid.length} paid invoices</p>
          </div>
        </td>
        <td style="width:33%;padding:0 3px;vertical-align:top;">
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;">
            <p style="font-size:10px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Outstanding / Overdue</p>
            <p style="font-size:22px;font-weight:800;color:#ef4444;margin:0;">R${overdueTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            <p style="font-size:11px;color:#f87171;margin:4px 0 0;">${overdue.length} overdue invoices</p>
          </div>
        </td>
        <td style="width:33%;padding:0 0 0 6px;vertical-align:top;">
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;">
            <p style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Pending (Sent)</p>
            <p style="font-size:22px;font-weight:800;color:#3b82f6;margin:0;">R${pendingTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            <p style="font-size:11px;color:#60a5fa;margin:4px 0 0;">${sentInvoices.length} awaiting payment</p>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:14px 32px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="font-size:11px;color:#94a3b8;margin:0;">TouchNet TMS · Automated Monthly Report · ${new Date().toLocaleDateString('en-ZA')}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

    await Promise.all(admins.map(admin =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: `Monthly Revenue Report — ${monthName}`,
        body: emailBody,
      })
    ));

    return Response.json({
      success: true,
      month: monthName,
      revenue: totalRevenue,
      paidCount: monthlyPaid.length,
      overdueCount: overdue.length,
      emailsSent: admins.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});