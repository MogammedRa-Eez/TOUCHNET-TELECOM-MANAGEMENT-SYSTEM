import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { node_id, node_name, command } = await req.json();

  if (!node_id || !command) {
    return Response.json({ error: 'Missing node_id or command' }, { status: 400 });
  }

  const VALID_COMMANDS = ['remote_reboot', 'flush_cache'];
  if (!VALID_COMMANDS.includes(command)) {
    return Response.json({ error: 'Invalid command' }, { status: 400 });
  }

  const timestamp = new Date().toISOString();
  const label = command === 'remote_reboot' ? 'Remote Reboot' : 'Flush Cache';

  // Log as a ticket/note for audit trail
  await base44.asServiceRole.entities.Ticket.create({
    subject: `[CMD] ${label} issued on: ${node_name}`,
    description: `Command "${label}" was manually triggered on node "${node_name}" (ID: ${node_id}) by ${user.full_name || user.email} at ${new Date(timestamp).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}.`,
    status: 'open',
    priority: 'medium',
    category: 'connectivity',
    department: 'technical',
    ticket_number: `CMD-${Date.now()}`,
    assigned_to: user.full_name || user.email,
  });

  // Simulate command execution delay
  await new Promise(r => setTimeout(r, 800));

  return Response.json({
    success: true,
    node_id,
    node_name,
    command,
    executed_by: user.email,
    timestamp,
    message: `${label} successfully dispatched to ${node_name}.`,
  });
});