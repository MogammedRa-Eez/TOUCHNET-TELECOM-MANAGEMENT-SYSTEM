import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;
    if (!event || !data) {
      return Response.json({ skipped: true, reason: "no event/data" });
    }

    const entityName = event.entity_name;
    const eventType = event.type; // create | update | delete

    // Load active rules for this entity
    const rules = await base44.asServiceRole.entities.NotificationRule.filter({
      entity_name: entityName,
      is_active: true,
    });

    if (!rules || rules.length === 0) {
      return Response.json({ processed: 0 });
    }

    let processed = 0;

    for (const rule of rules) {
      // Check event type match
      if (rule.event_type !== "any" && rule.event_type !== eventType) continue;

      // Check field/value conditions
      if (rule.field_name) {
        const newVal = data[rule.field_name];
        const oldVal = old_data ? old_data[rule.field_name] : undefined;

        // If a specific value is required, check it
        if (rule.field_value) {
          if (newVal !== rule.field_value) continue;
          // For updates, only fire if the value actually changed
          if (eventType === "update" && oldVal === newVal) continue;
        } else {
          // No specific value required, but still only fire if value changed on update
          if (eventType === "update" && oldVal === newVal) continue;
        }
      }

      // Build notification message
      const entityLabel = entityName;
      const recordName =
        data.full_name ||
        data.customer_name ||
        data.subject ||
        data.invoice_number ||
        data.project_name ||
        data.title ||
        data.id ||
        "Record";

      let message = rule.message_template || "";
      if (!message) {
        if (eventType === "create") {
          message = `New ${entityLabel} created: ${recordName}`;
        } else if (rule.field_name && rule.field_value) {
          message = `${entityLabel} "${recordName}" — ${rule.field_name} changed to ${rule.field_value}`;
        } else if (rule.field_name) {
          const newVal = data[rule.field_name];
          message = `${entityLabel} "${recordName}" — ${rule.field_name} updated to ${newVal}`;
        } else {
          message = `${entityLabel} "${recordName}" was updated`;
        }
      } else {
        // Replace placeholders
        message = message
          .replace("{name}", recordName)
          .replace("{status}", data.status || "")
          .replace("{entity}", entityLabel);
      }

      const title = rule.name;

      // Send in-app notifications
      if (rule.send_in_app && rule.notify_emails && rule.notify_emails.length > 0) {
        for (const email of rule.notify_emails) {
          if (!email) continue;
          await base44.asServiceRole.entities.Notification.create({
            user_email: email,
            title,
            message,
            type: rule.notification_type || "info",
            category: rule.category || "system",
            is_read: false,
          });
        }
      }

      // Send email notifications
      if (rule.send_email && rule.notify_emails && rule.notify_emails.length > 0) {
        for (const email of rule.notify_emails) {
          if (!email) continue;
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: `TouchNet Alert: ${title}`,
            body: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg,#6366f1,#8b5cf6); padding: 24px 28px;">
      <h2 style="margin:0; color:white; font-size: 18px;">${title}</h2>
      <p style="margin:4px 0 0; color:rgba(255,255,255,0.8); font-size:13px;">TouchNet Automated Alert</p>
    </div>
    <div style="padding: 24px 28px;">
      <p style="color:#1e293b; font-size:15px; margin:0 0 16px;">${message}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
      <p style="color:#94a3b8; font-size:12px; margin:0;">This is an automated notification from TouchNet Operations Platform.</p>
    </div>
  </div>
</body>
</html>`,
          });
        }
      }

      processed++;
    }

    return Response.json({ processed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});