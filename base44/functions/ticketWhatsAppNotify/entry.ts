import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN  = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM        = Deno.env.get("TWILIO_WHATSAPP_FROM"); // e.g. whatsapp:+14155238886

const STATUS_LABELS = {
  open:             "🔵 Open",
  in_progress:      "🔧 In Progress",
  waiting_customer: "⏳ Waiting on You",
  escalated:        "🔴 Escalated",
  resolved:         "✅ Resolved",
  closed:           "⬛ Closed",
};

async function sendWhatsApp(to, message) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const body = new URLSearchParams({
    From: TWILIO_FROM,
    To:   `whatsapp:${to}`,
    Body: message,
  });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Twilio error");
  return data;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const payload = await req.json().catch(() => ({}));
  const { event, data, old_data } = payload;

  if (!data || !event) {
    return Response.json({ error: "No event data" }, { status: 400 });
  }

  const ticket = data;

  // Determine notification type
  const statusChanged = old_data && old_data.status !== ticket.status;
  const notesChanged  = old_data && old_data.resolution_notes !== ticket.resolution_notes && ticket.resolution_notes;

  if (!statusChanged && !notesChanged) {
    return Response.json({ skipped: true, reason: "No relevant change" });
  }

  // Look up the customer to get their phone number
  if (!ticket.customer_id) {
    return Response.json({ skipped: true, reason: "No customer_id on ticket" });
  }

  const customers = await base44.asServiceRole.entities.Customer.filter({ id: ticket.customer_id });
  const customer = customers[0];

  if (!customer?.phone) {
    return Response.json({ skipped: true, reason: "Customer has no phone number" });
  }

  const ticketRef = ticket.ticket_number || ticket.id;
  let message = "";

  if (statusChanged) {
    const newLabel = STATUS_LABELS[ticket.status] || ticket.status;
    message = `Hi ${customer.full_name || "there"} 👋\n\nYour TouchNet support ticket *${ticketRef}* has been updated.\n\n*Status:* ${newLabel}\n*Subject:* ${ticket.subject}\n\nIf you have any questions, reply to this message or visit your customer portal.`;
  } else if (notesChanged) {
    // Strip AI Suggestion prefix if present
    const notes = ticket.resolution_notes.replace(/^\[AI Suggestion\]\n?/, "");
    message = `Hi ${customer.full_name || "there"} 👋\n\nA note has been added to your TouchNet support ticket *${ticketRef}*:\n\n_"${notes}"_\n\nSubject: ${ticket.subject}\n\nReply here or visit your portal for more details.`;
  }

  const result = await sendWhatsApp(customer.phone, message);

  return Response.json({ success: true, message_sid: result.sid, to: customer.phone, type: statusChanged ? "status_change" : "note_added" });
});