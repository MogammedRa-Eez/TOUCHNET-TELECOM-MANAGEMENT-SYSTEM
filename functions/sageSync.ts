import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SAGE_BASE = "https://api.accounting.sage.com/v3.1";
const TOKEN_URL = "https://oauth.accounting.sage.com/token";

async function getAccessToken() {
  const clientId = Deno.env.get("SAGE_CLIENT_ID");
  const clientSecret = Deno.env.get("SAGE_CLIENT_SECRET");
  const refreshToken = Deno.env.get("SAGE_REFRESH_TOKEN");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sage token error: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function sageGet(path, token) {
  const businessId = Deno.env.get("SAGE_BUSINESS_ID");
  const url = `${SAGE_BASE}${path}${path.includes("?") ? "&" : "?"}business_id=${businessId}&items_per_page=200`;
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sage GET ${path} failed: ${err}`);
  }
  return res.json();
}

async function sagePost(path, token, payload) {
  const businessId = Deno.env.get("SAGE_BUSINESS_ID");
  const url = `${SAGE_BASE}${path}?business_id=${businessId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sage POST ${path} failed: ${err}`);
  }
  return res.json();
}

async function sagePut(path, token, payload) {
  const businessId = Deno.env.get("SAGE_BUSINESS_ID");
  const url = `${SAGE_BASE}${path}?business_id=${businessId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sage PUT ${path} failed: ${err}`);
  }
  return res.json();
}

// Map Sage contact -> our Customer entity format
function sageContactToCustomer(contact) {
  const addr = contact.main_address;
  return {
    full_name: contact.name,
    email: contact.email || contact.main_email || "",
    phone: contact.telephone || contact.main_phone_number?.number || "",
    address: addr ? [addr.address_line_1, addr.address_line_2, addr.city, addr.country?.name].filter(Boolean).join(", ") : "",
    notes: contact.notes || "",
    sage_contact_id: contact.id,
  };
}

// Map our Customer -> Sage contact format
function customerToSageContact(customer) {
  return {
    contact: {
      name: customer.full_name,
      contact_types: [{ id: "CUSTOMER" }],
      email: customer.email || undefined,
      telephone: customer.phone || undefined,
      notes: customer.notes || undefined,
    }
  };
}

// Map Sage sales invoice -> our Invoice entity format
function sageInvoiceToInvoice(inv) {
  const statusMap = {
    "DRAFT": "draft",
    "PUBLISHED": "sent",
    "VOIDED": "cancelled",
    "PAID": "paid",
  };
  return {
    invoice_number: inv.invoice_number || inv.displayable_reference,
    customer_name: inv.contact?.name || "",
    sage_invoice_id: inv.id,
    sage_contact_id: inv.contact?.id || "",
    amount: inv.net_amount || 0,
    tax: inv.tax_amount || 0,
    total: inv.total_amount || 0,
    status: statusMap[inv.status?.id] || "draft",
    due_date: inv.due_date || "",
    paid_date: inv.last_paid || "",
    billing_period_start: inv.date || "",
    billing_period_end: inv.due_date || "",
    description: inv.notes || "",
  };
}

// Map our Invoice -> Sage sales invoice format
function invoiceToSageInvoice(invoice, sageContactId, ledgerAccountId) {
  return {
    sales_invoice: {
      contact_id: sageContactId,
      date: invoice.billing_period_start || new Date().toISOString().slice(0, 10),
      due_date: invoice.due_date || undefined,
      invoice_number: invoice.invoice_number || undefined,
      notes: invoice.description || "",
      line_items: [
        {
          description: invoice.description || "Service",
          unit_price: invoice.amount || 0,
          quantity: 1,
          ledger_account_id: ledgerAccountId,
        }
      ]
    }
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { action } = await req.json();

  if (action === "status") {
    // Just check if token works
    const token = await getAccessToken();
    const data = await sageGet("/business", token).catch(e => ({ error: e.message }));
    return Response.json({ connected: !data.error, business: data });
  }

  if (action === "pull") {
    // Pull from Sage -> local DB
    const token = await getAccessToken();
    const results = { customers_synced: 0, invoices_synced: 0, errors: [] };

    // Pull contacts (customers)
    const contactsData = await sageGet("/contacts", token).catch(e => { results.errors.push(`Contacts: ${e.message}`); return null; });
    if (contactsData?.$items) {
      const localCustomers = await base44.asServiceRole.entities.Customer.list();
      for (const contact of contactsData.$items) {
        if (!contact.contact_types?.some(t => t.id === "CUSTOMER")) continue;
        const mapped = sageContactToCustomer(contact);
        const existing = localCustomers.find(c => c.sage_contact_id === contact.id || c.email === mapped.email);
        if (existing) {
          await base44.asServiceRole.entities.Customer.update(existing.id, { ...mapped });
        } else {
          await base44.asServiceRole.entities.Customer.create(mapped);
        }
        results.customers_synced++;
      }
    }

    // Pull sales invoices
    const invoicesData = await sageGet("/sales_invoices", token).catch(e => { results.errors.push(`Invoices: ${e.message}`); return null; });
    if (invoicesData?.$items) {
      const localInvoices = await base44.asServiceRole.entities.Invoice.list();
      const localCustomers = await base44.asServiceRole.entities.Customer.list();
      for (const inv of invoicesData.$items) {
        const mapped = sageInvoiceToInvoice(inv);
        // Match customer
        const customer = localCustomers.find(c => c.sage_contact_id === inv.contact?.id);
        if (customer) {
          mapped.customer_id = customer.id;
          mapped.customer_name = customer.full_name;
        }
        const existing = localInvoices.find(i => i.sage_invoice_id === inv.id || i.invoice_number === mapped.invoice_number);
        if (existing) {
          await base44.asServiceRole.entities.Invoice.update(existing.id, mapped);
        } else {
          await base44.asServiceRole.entities.Invoice.create(mapped);
        }
        results.invoices_synced++;
      }
    }

    return Response.json({ success: true, ...results });
  }

  if (action === "push") {
    // Push local DB -> Sage
    const token = await getAccessToken();
    const results = { customers_pushed: 0, invoices_pushed: 0, errors: [] };

    // Get a default ledger account for invoices
    const ledgerData = await sageGet("/ledger_accounts?visible_in=SALES", token).catch(() => ({ $items: [] }));
    const ledgerAccountId = ledgerData?.$items?.[0]?.id;

    // Push customers not yet in Sage
    const localCustomers = await base44.asServiceRole.entities.Customer.list();
    for (const customer of localCustomers) {
      if (customer.sage_contact_id) continue; // already synced
      const payload = customerToSageContact(customer);
      const created = await sagePost("/contacts", token, payload).catch(e => { results.errors.push(`Customer ${customer.full_name}: ${e.message}`); return null; });
      if (created?.id) {
        await base44.asServiceRole.entities.Customer.update(customer.id, { sage_contact_id: created.id });
        results.customers_pushed++;
      }
    }

    // Push invoices not yet in Sage
    const localInvoices = await base44.asServiceRole.entities.Invoice.list();
    const refreshedCustomers = await base44.asServiceRole.entities.Customer.list();
    for (const invoice of localInvoices) {
      if (invoice.sage_invoice_id) continue; // already synced
      if (!ledgerAccountId) { results.errors.push("No ledger account found"); break; }
      const customer = refreshedCustomers.find(c => c.id === invoice.customer_id);
      if (!customer?.sage_contact_id) { results.errors.push(`No Sage contact for invoice ${invoice.invoice_number}`); continue; }
      const payload = invoiceToSageInvoice(invoice, customer.sage_contact_id, ledgerAccountId);
      const created = await sagePost("/sales_invoices", token, payload).catch(e => { results.errors.push(`Invoice ${invoice.invoice_number}: ${e.message}`); return null; });
      if (created?.id) {
        await base44.asServiceRole.entities.Invoice.update(invoice.id, { sage_invoice_id: created.id });
        results.invoices_pushed++;
      }
    }

    return Response.json({ success: true, ...results });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
});