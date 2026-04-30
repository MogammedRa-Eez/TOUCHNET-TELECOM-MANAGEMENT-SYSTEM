import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { nodeId, message, subject } = await req.json();

    if (!nodeId || !message) {
      return Response.json({ error: 'nodeId and message are required' }, { status: 400 });
    }

    const [node, customers] = await Promise.all([
      base44.asServiceRole.entities.NetworkNode.filter({ id: nodeId }).then(r => r[0]),
      base44.asServiceRole.entities.Customer.filter({ assigned_node: nodeId }),
    ]);

    if (!node) return Response.json({ error: 'Node not found' }, { status: 404 });

    const activeCustomers = customers.filter(c => c.status === 'active' && c.email);

    const emailSubject = subject || `Service Notice — ${node.name} — TouchNet`;
    const emailBody = `Dear Valued Customer,\n\n${message}\n\nAffected Node: ${node.name} (${node.location || 'N/A'})\n\nWe apologise for any inconvenience caused and are working to resolve this as quickly as possible.\n\nFor updates, please visit your customer portal or contact support at support@touchnet.co.za.\n\nKind regards,\nTouchNet Support Team\nsupport@touchnet.co.za`;

    let sent = 0;
    for (const customer of activeCustomers) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: emailSubject,
          body: emailBody,
        });
        sent++;
      } catch {
        // Continue with other customers
      }
    }

    return Response.json({ success: true, sent, total: activeCustomers.length, nodeName: node.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});