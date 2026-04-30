import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const now = new Date();
    const monthName = now.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });

    const [invoices, customers, tickets] = await Promise.all([
      base44.asServiceRole.entities.Invoice.list(),
      base44.asServiceRole.entities.Customer.list(),
      base44.asServiceRole.entities.Ticket.list(),
    ]);

    const thisMonth = now.toISOString().slice(0, 7);
    const monthlyInvoices = invoices.filter(i => (i.created_date || '').startsWith(thisMonth));

    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + (i.total || 0), 0);
    const monthlyRevenue = monthlyInvoices.filter(i => i.status === 'paid').reduce((a, i) => a + (i.total || 0), 0);
    const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((a, i) => a + (i.total || 0), 0);
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const openTickets = tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;
    const mrr = customers.filter(c => c.status === 'active').reduce((a, c) => a + (c.monthly_rate || 0), 0);

    const report = `
TouchNet TMS — Monthly Revenue Report
${monthName}
${'='.repeat(50)}

REVENUE SUMMARY
• Monthly Revenue Collected: R${monthlyRevenue.toFixed(2)}
• Total Revenue (All Time): R${totalRevenue.toFixed(2)}
• Outstanding / Overdue: R${overdueAmount.toFixed(2)}
• Monthly Recurring Revenue (MRR): R${mrr.toFixed(2)}

CUSTOMER METRICS
• Total Active Customers: ${activeCustomers}
• New Invoices This Month: ${monthlyInvoices.length}
• Paid This Month: ${monthlyInvoices.filter(i => i.status === 'paid').length}
• Overdue Invoices: ${invoices.filter(i => i.status === 'overdue').length}

SUPPORT
• Open Tickets: ${openTickets}
• Escalated Tickets: ${tickets.filter(t => t.status === 'escalated').length}

Generated: ${now.toLocaleString('en-ZA')}
TouchNet TMS v3.0
    `.trim();

    // Send email to admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: `TouchNet TMS — Monthly Report: ${monthName}`,
      body: report,
    });

    return Response.json({ success: true, report, monthName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});