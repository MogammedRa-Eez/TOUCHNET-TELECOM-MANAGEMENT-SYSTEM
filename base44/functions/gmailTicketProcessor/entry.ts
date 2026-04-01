import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Called by Gmail webhook automation when new emails arrive
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    // Support both direct invocation (with email data) and webhook payload
    const emailData = body.email || body.data?.email || body;
    const fromEmail = emailData.from || emailData.sender || body.from;
    const subject   = emailData.subject || body.subject || "(No Subject)";
    const emailBody = emailData.body || emailData.text || emailData.snippet || body.body || "";

    if (!fromEmail || fromEmail === 'undefined') {
      return Response.json({ message: "No email data provided" });
    }

    // Check if a ticket already exists for this email (avoid duplicates via message_id)
    const messageId = emailData.message_id || emailData.id || null;
    if (messageId) {
      const existing = await base44.asServiceRole.entities.Ticket.filter({ ticket_number: `EMAIL-${messageId}` });
      if (existing.length > 0) {
        return Response.json({ message: "Ticket already created for this email", ticket_id: existing[0].id });
      }
    }

    // Find the customer by email
    const customers = await base44.asServiceRole.entities.Customer.filter({ email: fromEmail });
    const customer = customers[0] || null;

    // Fetch knowledge base articles
    const kbArticles = await base44.asServiceRole.entities.KnowledgeBase.filter({ is_active: true });
    const kbSummary = kbArticles.map(a => `Title: ${a.title}\nCategory: ${a.category}\nContent: ${a.content}`).join("\n\n---\n\n");

    // AI: analyze email + suggest solution from KB
    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a customer support AI for TouchNet, a South African fibre ISP.

A customer sent this email:
Subject: ${subject}
Body: ${emailBody}
From: ${fromEmail}

Here is our knowledge base:
${kbSummary || "No KB articles available yet."}

Your tasks:
1. Classify the ticket: category (connectivity/billing/installation/speed_issue/hardware/security/general), priority (low/medium/high/critical)
2. Suggest the best solution from the knowledge base, or provide a general helpful response if no KB article matches
3. Write a brief internal summary for the support team

Return JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          category: { type: "string" },
          priority: { type: "string" },
          ai_suggestion: { type: "string" },
          internal_summary: { type: "string" },
          kb_article_title: { type: "string" }
        }
      }
    });

    // Create the ticket
    const ticketNumber = messageId ? `EMAIL-${messageId.slice(-8)}` : `EMAIL-${Date.now().toString().slice(-6)}`;
    const ticket = await base44.asServiceRole.entities.Ticket.create({
      ticket_number: ticketNumber,
      subject: subject,
      description: emailBody.slice(0, 2000),
      customer_id: customer?.id || "",
      customer_name: customer?.full_name || fromEmail,
      status: "open",
      priority: aiResult.priority || "medium",
      category: aiResult.category || "general",
      department: "technical",
      resolution_notes: aiResult.ai_suggestion ? `[AI Suggestion]\n${aiResult.ai_suggestion}` : "",
    });

    return Response.json({
      success: true,
      ticket_id: ticket.id,
      ticket_number: ticketNumber,
      category: aiResult.category,
      priority: aiResult.priority,
      ai_suggestion: aiResult.ai_suggestion,
      kb_article_matched: aiResult.kb_article_title || null,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});