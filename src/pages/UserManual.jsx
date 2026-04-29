import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Printer, Download, ChevronRight, ChevronDown,
  LayoutDashboard, Users, Receipt, TicketCheck, Network,
  UserCog, Bot, Shield, Package, Settings, Mail,
  HeartHandshake, FileText, Activity, Zap, BookOpen,
  Home, HelpCircle, Globe, BarChart3, FolderOpen, Star
} from "lucide-react";

const LOGO_WHITE  = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/b3b518de6_Touchnet_LogoLongWhite.png";
const LOGO_TEAL   = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/fa247a9df_Touchnet_LogoLongTeal.png";
const CREST_WHITE = "https://media.base44.com/images/public/69a157d4dbdca56a3bccf4d3/639b91697_Touchnet-CrestDesogm_CrestFinalFullWhite.png";

/* ── Table of contents ─────────────────────────────────── */
const SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    icon: Home,
    subsections: [
      { id: "overview",    title: "1.1 System Overview" },
      { id: "roles",       title: "1.2 User Roles" },
      { id: "login",       title: "1.3 Logging In" },
    ]
  },
  {
    id: "dashboard",
    title: "2. Dashboard",
    icon: LayoutDashboard,
    subsections: [
      { id: "dash-kpis",   title: "2.1 KPI Cards" },
      { id: "dash-alerts", title: "2.2 Alerts & Ticker" },
      { id: "dash-globe",  title: "2.3 Network Globe" },
    ]
  },
  {
    id: "customers",
    title: "3. Customers",
    icon: Users,
    subsections: [
      { id: "cust-add",    title: "3.1 Adding a Customer" },
      { id: "cust-edit",   title: "3.2 Editing & Status" },
      { id: "cust-portal", title: "3.3 Customer Portal" },
    ]
  },
  {
    id: "billing",
    title: "4. Billing & Invoicing",
    icon: Receipt,
    subsections: [
      { id: "bill-create", title: "4.1 Creating Invoices" },
      { id: "bill-sage",   title: "4.2 Sage Sync" },
      { id: "bill-batch",  title: "4.3 Batch Generation" },
    ]
  },
  {
    id: "quotes",
    title: "5. Quotes",
    icon: FileText,
    subsections: [
      { id: "quote-create",title: "5.1 Creating a Quote" },
      { id: "quote-send",  title: "5.2 Sending & Acceptance" },
    ]
  },
  {
    id: "tickets",
    title: "6. Support Tickets",
    icon: TicketCheck,
    subsections: [
      { id: "tkt-create",  title: "6.1 Opening a Ticket" },
      { id: "tkt-sla",     title: "6.2 SLA & Escalation" },
      { id: "tkt-dept",    title: "6.3 Department Routing" },
    ]
  },
  {
    id: "projects",
    title: "7. Fibre Projects",
    icon: Network,
    subsections: [
      { id: "prj-create",  title: "7.1 Creating a Project" },
      { id: "prj-tasks",   title: "7.2 Tasks & Milestones" },
      { id: "prj-approval",title: "7.3 Approvals" },
    ]
  },
  {
    id: "network",
    title: "8. Network Monitoring",
    icon: Activity,
    subsections: [
      { id: "net-nodes",   title: "8.1 Network Nodes" },
      { id: "net-alerts",  title: "8.2 Outage Alerts" },
    ]
  },
  {
    id: "employees",
    title: "9. Employees & HR",
    icon: UserCog,
    subsections: [
      { id: "emp-add",     title: "9.1 Adding Employees" },
      { id: "emp-tasks",   title: "9.2 Task Management" },
      { id: "emp-dept",    title: "9.3 Department Dashboard" },
    ]
  },
  {
    id: "ai",
    title: "10. AI Assistant",
    icon: Bot,
    subsections: [
      { id: "ai-use",      title: "10.1 Using the Assistant" },
      { id: "ai-kb",       title: "10.2 Knowledge Base" },
    ]
  },
  {
    id: "roles",
    title: "11. Roles & Permissions",
    icon: Shield,
    subsections: [
      { id: "role-create", title: "11.1 Creating Roles" },
      { id: "role-perms",  title: "11.2 Permission Matrix" },
    ]
  },
  {
    id: "notifications",
    title: "12. Notifications",
    icon: Zap,
    subsections: [
      { id: "notif-rules", title: "12.1 Notification Rules" },
      { id: "notif-bell",  title: "12.2 In-App Bell" },
    ]
  },
  {
    id: "portal",
    title: "13. Customer Portal",
    icon: Globe,
    subsections: [
      { id: "portal-login",title: "13.1 Portal Login" },
      { id: "portal-tabs", title: "13.2 Portal Sections" },
    ]
  },
  {
    id: "settings",
    title: "14. Settings & Integrations",
    icon: Settings,
    subsections: [
      { id: "set-sage",    title: "14.1 Sage Integration" },
      { id: "set-outlook", title: "14.2 Outlook Mail" },
      { id: "set-slack",   title: "14.3 Slack Alerts" },
    ]
  },
];

/* ── Content map ──────────────────────────────────────── */
const CONTENT = {
  "introduction": {
    body: `TouchNet TMS (Telecommunications Management System) is a comprehensive, all-in-one platform purpose-built for South African internet service providers (ISPs). It unifies every operational department — from sales and projects to billing, technical support, and network monitoring — into a single, real-time system.

The system is accessible via a modern web browser at any time. Staff access the main portal while customers access a dedicated self-service portal. Both portals are protected by email-based authentication.`
  },
  "overview": {
    body: `TouchNet TMS covers the following core business functions:

• Customer Management — full account lifecycle from lead to termination
• Fibre Project Management — quote through civil build to go-live
• Billing & Invoicing — automated invoicing with Sage Business Cloud sync
• Support Helpdesk — multi-department ticketing with SLA enforcement
• Network Monitoring — real-time node health and outage detection
• Employee & HR Management — staff records, task assignment, payroll visibility
• Quotes & Proposals — rich digital quotes with e-signature acceptance
• AI Assistant — intelligent support powered by your knowledge base
• Customer Self-Service Portal — invoices, tickets, projects, and more`
  },
  "roles": {
    body: `TouchNet TMS uses a role-based access control (RBAC) system. Every user is assigned a role that controls which pages and features they can access.

Built-in role types:
• Admin — full unrestricted access to all modules, data, and settings
• User — default restricted role; permissions granted via custom roles

Custom roles can be created with granular per-feature permissions. Each role can be assigned to one or more users by their email address.

Department-level roles can restrict ticket and employee visibility to specific departments (e.g. Sales, Technical, Finance, HR, Projects, Cyber Security).`
  },
  "login": {
    body: `To access TouchNet TMS:

1. Navigate to the application URL provided by your administrator.
2. Click "Sign In" on the landing page.
3. Enter your registered email address and follow the sign-in link sent to your inbox.
4. You will be redirected to the Dashboard (for staff) or Customer Portal (for customers).

If your account is not found, contact your system administrator to have your account created and a role assigned. Customers must have a linked Customer record with a matching email address to access the Customer Portal.`
  },
  "dashboard": {
    body: `The Dashboard is the central operational hub of TouchNet TMS. It displays a live overview of the entire business and is available to users with the "dashboard" permission.`
  },
  "dash-kpis": {
    body: `The top section of the Dashboard displays four key performance indicator (KPI) cards:

• Total Customers — count of all active customer records
• Monthly Revenue — sum of paid invoices for the current period
• Open Tickets — count of unresolved support tickets
• Network Nodes — count of monitored network nodes and their status

Each KPI card shows a trend indicator and links to the relevant module. Cards update in real time as data changes.`
  },
  "dash-alerts": {
    body: `The alert ticker at the top of the Dashboard cycles through:

• Critical and high-priority support tickets
• Overdue invoices
• Offline or degraded network nodes

Each alert item is clickable and navigates directly to the relevant record. The ticker auto-advances every 4 seconds. If there are no active alerts the ticker is hidden.`
  },
  "dash-globe": {
    body: `The 3D Network Globe visualises your infrastructure geographically. Network nodes are plotted by location with colour-coded status indicators (green = online, amber = degraded, red = offline). 

Use mouse drag to rotate the globe. Hover over a node beacon to view its name, uptime, and status. The globe is decorative and informational — clicking a node opens its details in the Network module.`
  },
  "customers": {
    body: `The Customers module manages all customer accounts. Access is controlled by the "customers" permission.`
  },
  "cust-add": {
    body: `To add a new customer:

1. Navigate to Customers in the sidebar.
2. Click the "New Customer" button (top right).
3. Complete the form: full name, email, phone, address, service plan, connection type, and monthly rate.
4. Set the account status (default: Pending).
5. Optionally enter an account number — if left blank, one can be assigned manually.
6. Click Save.

The customer will appear in the customer list immediately. You can then create invoices, tickets, and fibre projects linked to this customer.`
  },
  "cust-edit": {
    body: `Click any customer row to open the detail panel. From here you can:

• Edit any field by clicking the edit button
• Change account status (Active, Suspended, Terminated, Pending)
• View linked invoices, tickets, and projects
• Add admin-only notes (not visible to the customer)
• View Sage Business Cloud sync status

Status changes take effect immediately and affect the customer's portal access.`
  },
  "cust-portal": {
    body: `Each customer with a registered email address can access the Customer Self-Service Portal at /CustomerPortalMain. The portal provides:

• Account overview with KPI cards
• Invoice history and PDF download
• Support ticket creation and tracking
• Fibre project progress tracking
• Document storage
• Quote viewing and digital acceptance
• Referral/reseller program management
• Network performance monitoring
• Data usage analytics
• Coverage checker`
  },
  "billing": {
    body: `The Billing module manages all financial transactions. Access is controlled by the "billing" permission.`
  },
  "bill-create": {
    body: `To create a new invoice:

1. Navigate to Billing in the sidebar.
2. Click "New Invoice".
3. Select the customer from the dropdown — their details auto-populate.
4. Enter the invoice amount, tax percentage, and due date.
5. Optionally set billing period start and end dates.
6. Set status to "Draft" until ready to send, then change to "Sent".
7. Click Save.

Invoice numbers are auto-generated in sequence. The total (including tax) is calculated automatically.`
  },
  "bill-sage": {
    body: `TouchNet TMS integrates with Sage Business Cloud for accounting synchronisation.

To sync an invoice to Sage:
1. Open the invoice detail panel.
2. Click "Sync to Sage".
3. The system will create or update the corresponding invoice in Sage and store the Sage invoice ID.

The sync status is shown on each invoice row. Customers must first be synced as Sage contacts (this happens automatically on first invoice sync). Sage credentials are managed in Settings.`
  },
  "bill-batch": {
    body: `The Batch Invoice Generator allows you to create invoices for multiple customers at once:

1. In Billing, click "Batch Generate".
2. Select the billing period and the customers to include.
3. The system creates one invoice per selected customer using their monthly rate.
4. Review and confirm before generating.

Batch-generated invoices are created in "Sent" status. Use this feature for monthly billing runs.`
  },
  "quotes": {
    body: `The Quotes module allows you to create rich, branded service proposals that customers can view and digitally accept online.`
  },
  "quote-create": {
    body: `To create a quote:

1. Navigate to Quotes in the sidebar.
2. Click "New Quote".
3. Enter the quote title, customer details, and validity date.
4. Add line items — description, quantity, unit price, and optional flag.
5. Set discount and tax percentage.
6. Add rich content sections (text blocks, images, links) via the builder.
7. Write a cover message for the customer.
8. Save as Draft.`
  },
  "quote-send": {
    body: `To send a quote to a customer:

1. Open the quote and click "Send Quote".
2. The system generates a unique shareable link and sends it to the customer's email.
3. The customer can view the quote at /quote?id=… without logging in.
4. The customer can accept the quote by providing their signature.
5. On acceptance, the quote status changes to "Accepted" and you are notified.

Quote status lifecycle: Draft → Sent → Viewed → Accepted / Declined / Expired.`
  },
  "tickets": {
    body: `The Tickets module is the helpdesk system for managing customer and internal support requests.`
  },
  "tkt-create": {
    body: `Tickets can be created by:

• Staff: Navigate to Tickets → New Ticket. Select the customer, set subject, description, category, department, and priority.
• Customers: Via the Customer Portal → Support tab.
• Automated: Via notification rules triggered by system events.

Ticket number is auto-assigned. Assign the ticket to a staff member using the "Assigned To" field.`
  },
  "tkt-sla": {
    body: `Each ticket has an SLA deadline based on its priority:

• Critical — 2 hours
• High — 8 hours
• Medium — 24 hours
• Low — 72 hours

The SLA Workflow Panel shows time remaining and highlights breached SLAs in red. Tickets approaching breach turn amber. Escalated tickets are flagged with the "escalated" status and appear prominently on the dashboard alert ticker.`
  },
  "tkt-dept": {
    body: `Tickets are routed by department (Technical, Sales, Finance, Cyber Security, Projects, HR). Staff members can only view tickets assigned to their department unless they have admin access.

To reassign a ticket to a different department, edit the "Department" field on the ticket. The ticket will immediately become visible to staff in that department and hidden from the previous one.`
  },
  "projects": {
    body: `The Fibre Projects module tracks infrastructure deployments from initial lead through to live service and billing.`
  },
  "prj-create": {
    body: `To create a fibre project:

1. Navigate to Fibre Projects → New Project.
2. Enter the quote number (unique identifier used across quote, billing, and project).
3. Link to an existing customer or enter customer details.
4. Set the project name, site address, service plan, and assigned engineer.
5. Enter financial details: annuity amount and once-off amount.
6. Set forecasted go-live date.
7. Save — the project is created in "Lead" status.

A set of standard project tasks and milestones is automatically created for each project.`
  },
  "prj-tasks": {
    body: `Each project has seven sequential tasks:

1. Welcome Communication — send welcome email to customer
2. Vendor Process — obtain and sign vendor quote, submit PO
3. Internal Cutover Booking — schedule internal resources
4. Engineer On-Site Booking — schedule field engineer visit
5. IRIS Monitoring — add device to monitoring system
6. Activate Contract — confirm contract is live
7. TNET Billing — generate first invoice

Tasks move from Pending → In Progress → Awaiting Approval → Approved → Completed. Some tasks require approval from a designated approver before proceeding.

Milestones track infrastructure build stages: Site Survey, Planning/LLA, Wayleave, Civil Build, Optical Build, Test & Handover, Cutover, Go Live.`
  },
  "prj-approval": {
    body: `Approval-required tasks generate an ApprovalRequest record when submitted for review.

To approve a task:
1. Open the project and navigate to the Tasks tab.
2. Tasks awaiting approval show an "Approve" button (visible to authorised approvers only).
3. Click Approve or Reject and add decision notes.
4. Approved tasks advance to "Completed" and the next task becomes active.

Approval requests are also visible in the Approvals section of the project detail panel.`
  },
  "network": {
    body: `The Network module provides real-time infrastructure monitoring for all registered network nodes.`
  },
  "net-nodes": {
    body: `Network nodes represent physical devices: core routers, distribution switches, access points, OLTs, BTS towers, and servers.

To add a node:
1. Navigate to Network → Add Node.
2. Enter name, type, location, IP address, and initial status.
3. Set max capacity and current bandwidth utilisation.
4. Optionally link a parent node to build the topology hierarchy.

Node statuses: Online (green), Degraded (amber), Offline (red), Maintenance (grey). Status is updated manually or via external monitoring integrations. Uptime percentage and connected customer count are tracked per node.`
  },
  "net-alerts": {
    body: `When a node goes offline or enters degraded status, the system can:

• Display an alert on the Dashboard ticker
• Send a Slack notification (if configured)
• Trigger an email to configured recipients via a notification rule

To configure outage alerts:
1. Navigate to Admin → Notifications.
2. Create a rule targeting the NetworkNode entity.
3. Set the trigger field to "status" and value to "offline" or "degraded".
4. Enable email or in-app notification.`
  },
  "employees": {
    body: `The Employees module manages all staff records. Access is controlled by the "employees" permission.`
  },
  "emp-add": {
    body: `To add an employee:

1. Navigate to Employees → Add Employee.
2. Enter full name, email, phone, department, job role, hire date, and salary.
3. Upload an avatar image (optional).
4. Set status: Active, On Leave, or Terminated.
5. Save.

The employee's email is used to link them to user accounts and to route department-specific tickets.`
  },
  "emp-tasks": {
    body: `Managers can assign tasks to employees:

1. Navigate to HR Dashboard or the employee's profile.
2. Click "Assign Task".
3. Enter task title, description, department, priority, and due date.
4. The task appears in the assignee's My Department view.

Task statuses: To Do → In Progress → Review → Completed → Cancelled. Employees can update their own task status. Overdue tasks are highlighted in the HR Dashboard.`
  },
  "emp-dept": {
    body: `The Department Dashboard gives each department a tailored view:

• Sales — pipeline, quotes, and customer counts
• Projects — active projects and milestone overview
• Finance — revenue, outstanding invoices, billing KPIs
• Technical — network health, open technical tickets
• Cyber Security — security alerts and endpoint monitoring
• HR — employee status, task completion rates, leave overview

Navigate to My Department in the sidebar. The system automatically shows the dashboard for your assigned department.`
  },
  "ai": {
    body: `The AI Assistant is powered by a large language model and has access to your knowledge base articles.`
  },
  "ai-use": {
    body: `To use the AI Assistant:

1. Navigate to AI Assistant in the sidebar.
2. Type your question or request in the chat input.
3. The assistant can answer questions about your products, troubleshoot issues, summarise data, and help draft customer communications.
4. Previous conversations are saved and can be resumed.

The assistant can access the internet for current information when needed. For best results, ask specific questions and provide context.`
  },
  "ai-kb": {
    body: `The Knowledge Base stores articles that the AI assistant uses to answer questions accurately.

To manage articles:
1. Navigate to Customer Portal → Knowledge Base (admin only).
2. Create articles with a title, category, content, and keywords.
3. Mark articles as active to make them available to the assistant.

Categories: Connectivity, Billing, Installation, General, Security, Speed Issues, Hardware. Well-written knowledge base articles significantly improve AI response accuracy.`
  },
  "roles": {
    body: `The Roles Management module is available to admin users only.`
  },
  "role-create": {
    body: `To create a custom role:

1. Navigate to Admin → Roles.
2. Click "New Role".
3. Enter a role name, description, and display colour.
4. Toggle the permissions you want to grant.
5. In the "Assigned Users" tab, enter the email addresses of users who should receive this role.
6. Save.

Changes take effect on the user's next page load. Users can be assigned to only one custom role at a time.`
  },
  "role-perms": {
    body: `Available permissions:

Page Access: Dashboard, Customers, Billing, Tickets, Network, Employees, AI Assistant, Roles Management, Fibre Projects, Outlook Mail

Data Access: View Salaries, View Financials

Actions: Delete Records, Export Data

Admin users (role = "admin") bypass all permission checks and have full system access. Custom roles apply only to non-admin users.`
  },
  "notifications": {
    body: `The Notifications system allows you to define rules that trigger alerts when data changes in the system.`
  },
  "notif-rules": {
    body: `To create a notification rule:

1. Navigate to Admin → Notifications → New Rule.
2. Select the entity to watch (Customer, Ticket, Invoice, Fibre Project).
3. Choose the event type: Create, Update, or Any.
4. Optionally specify a field and value to watch (e.g. field=status, value=overdue).
5. Choose notification type (Info, Warning, Error, Success) and category.
6. Enable in-app notifications and/or email notifications.
7. Enter recipient email addresses for email notifications.
8. Optionally write a custom message template using {name} and {status} placeholders.
9. Save and activate the rule.`
  },
  "notif-bell": {
    body: `The notification bell (top-right of the header) shows unread in-app notifications. Notifications are grouped by category: Network, Billing, Tickets, System, Customer.

Click a notification to mark it as read. Click "Mark all read" to clear the unread count. Notifications older than 30 days are automatically archived. Staff members only see notifications addressed to their email or broadcast notifications.`
  },
  "portal": {
    body: `The Customer Portal is a standalone self-service interface accessible at /CustomerPortalMain. It does not use the main staff sidebar layout.`
  },
  "portal-login": {
    body: `Customers log in using the same sign-in system as staff. After authentication, the system looks up their email in the Customer records. If a match is found, they are directed to the Customer Portal. If not, they see an "Account Not Found" message.

Customers cannot access the staff portal modules. Staff can access the Customer Portal by navigating to Customer Portal in the Tools section of the sidebar.`
  },
  "portal-tabs": {
    body: `The Customer Portal contains the following sections:

• Overview — account KPIs, service health, quick actions, recent invoices and tickets
• My Plan — service plan details, speed, contract dates
• Network — node performance for their connected node
• Data Usage — consumption charts and usage alerts
• Invoices — full invoice history with PDF download
• Quotes — view and accept/decline service proposals
• Projects — fibre installation progress and booking
• Documents — upload and manage account documents
• Support — create and track help tickets
• Troubleshoot — guided self-service diagnostics
• Referrals — reseller/referral rewards programme`
  },
  "settings": {
    body: `Settings and integrations are managed by admin users.`
  },
  "set-sage": {
    body: `Sage Business Cloud integration enables two-way sync of customers and invoices.

Configuration (admin only):
1. Navigate to Settings → Sage Sync Panel.
2. Enter your Sage subscription key, client ID, client secret, and business ID.
3. Authenticate via the OAuth flow to obtain a refresh token.
4. Test the connection.

Once configured, invoices can be synced individually from the Billing module. Customer contacts are synced automatically on first invoice sync. The Sage invoice ID is stored on each invoice for reference.`
  },
  "set-outlook": {
    body: `Outlook Mail integration connects a Microsoft 365 mailbox to TouchNet TMS, allowing staff to send and receive emails directly within the system.

Configuration:
1. Provide Azure AD application credentials (Client ID, Client Secret, Tenant ID) in environment settings.
2. Navigate to Outlook Mail in the sidebar.
3. Authenticate with your Microsoft account.

Emails sent from within the system are logged and associated with customer records where possible.`
  },
  "set-slack": {
    body: `Slack integration sends automated alerts to a configured Slack channel.

To configure:
1. Create an incoming webhook in your Slack workspace.
2. Add the webhook URL as the "slack_url" environment variable in system settings.
3. Alerts for network outages, SLA breaches, and ticket escalations will be posted automatically.

Slack notification content is configured per alert type in the backend functions (slackNodeAlert, slackSlaMonitor, slackOutageNotify).`
  },
};

/* ── Collapsible TOC item ─────────────────────────────── */
function TocSection({ section, activeId, onNavigate }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  const isActive = activeId === section.id || section.subsections?.some(s => s.id === activeId);

  return (
    <div>
      <button
        onClick={() => { setOpen(o => !o); onNavigate(section.id); }}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all"
        style={{
          background: isActive ? "rgba(0,180,180,0.1)" : "transparent",
          border: isActive ? "1px solid rgba(0,180,180,0.25)" : "1px solid transparent",
        }}>
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? "#00b4b4" : "rgba(255,255,255,0.4)" }} />
        <span className="flex-1 text-[12px] font-semibold truncate" style={{ color: isActive ? "#00b4b4" : "rgba(255,255,255,0.6)" }}>
          {section.title}
        </span>
        <ChevronDown className="w-3 h-3 flex-shrink-0 transition-transform" style={{ color: "rgba(255,255,255,0.3)", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>
      {open && section.subsections?.map(sub => (
        <button key={sub.id}
          onClick={() => onNavigate(sub.id)}
          className="w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-left transition-all"
          style={{ color: activeId === sub.id ? "#00d4d4" : "rgba(255,255,255,0.35)", fontSize: 11 }}>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          {sub.title}
        </button>
      ))}
    </div>
  );
}

/* ── Section block ────────────────────────────────────── */
function SectionBlock({ id, title, icon: Icon, body, color = "#00b4b4" }) {
  return (
    <div id={id} className="manual-section" style={{ marginBottom: 32, pageBreakInside: "avoid" }}>
      <div className="flex items-center gap-3 mb-3" style={{ borderBottom: "1px solid rgba(0,212,212,0.15)", paddingBottom: 10 }}>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        )}
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, color: "#f0f0f0", fontSize: 18, margin: 0 }}>{title}</h2>
      </div>
      {body && (
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13.5, lineHeight: 1.85, whiteSpace: "pre-line" }}>
          {body}
        </div>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
export default function UserManual() {
  const [activeId, setActiveId] = useState("introduction");
  const printRef = useRef(null);

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => window.print();

  const scrollTo = (id) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          body { background: #111111 !important; margin: 0 !important; padding: 0 !important; }

          /* Single column layout */
          .print-layout { display: block !important; }
          .print-sidebar { display: none !important; }
          .print-main { overflow: visible !important; height: auto !important; width: 100% !important; }
          .print-inner { max-width: 100% !important; padding: 20px 32px !important; }

          /* Cover page — own page */
          .cover-page {
            page-break-after: always !important;
            break-after: always !important;
            min-height: 220mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
          }

          /* Every section (chapter) starts on a new page */
          .section-break {
            page-break-before: always !important;
            break-before: always !important;
          }

          /* Every subsection starts on a new page */
          .subsection-block {
            page-break-before: always !important;
            break-before: always !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Section heading card stays with its first subsection */
          .section-heading-card {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          /* Footer on its own page */
          .manual-footer {
            page-break-before: always !important;
            break-before: always !important;
          }

          /* Add page numbers via CSS */
          @page {
            @bottom-center {
              content: "TouchNet TMS v3.0  |  Page " counter(page) " of " counter(pages);
              font-size: 9pt;
              color: #888;
              font-family: 'JetBrains Mono', monospace;
            }
            @top-right {
              content: "CONFIDENTIAL — TouchNet (Pty) Ltd";
              font-size: 8pt;
              color: #888;
            }
          }
        }
        @page { margin: 18mm 15mm; size: A4; }
      `}</style>

      <div className="min-h-screen page-bg flex flex-col">

        {/* ── Top bar ── */}
        <header className="no-print top-bar top-bar-futuristic h-[60px] flex items-center justify-between px-5 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src={LOGO_TEAL} alt="TouchNet" className="h-6 object-contain" style={{ opacity: 0.95 }} />
            </Link>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.2)" }}>
              <BookOpen className="w-3.5 h-3.5" style={{ color: "#00b4b4" }} />
              <span className="text-[13px] font-bold" style={{ color: "#00b4b4", fontFamily: "'Space Grotesk',sans-serif" }}>User Manual</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
              style={{ background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.2)", color: "#00b4b4" }}>
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black text-white transition-all hover:scale-105 active:scale-95 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a,#8B1A1A)", boxShadow: "0 4px 20px rgba(0,180,180,0.45)", border: "1px solid rgba(0,212,212,0.3)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)", backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }} />
              <Download className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Download PDF</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden print-layout">

          {/* ── TOC Sidebar ── */}
          <aside className="no-print print-sidebar w-64 flex-shrink-0 overflow-y-auto sidebar-scroll"
            style={{ background: "linear-gradient(180deg,#080d0d,#0f0f0f)", borderRight: "1px solid rgba(0,212,212,0.1)" }}>
            <div className="p-3 space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] px-2 mb-2" style={{ color: "rgba(0,212,212,0.4)", fontFamily: "'JetBrains Mono',monospace" }}>
                Table of Contents
              </p>
              {SECTIONS.map(sec => (
                <TocSection key={sec.id} section={sec} activeId={activeId} onNavigate={scrollTo} />
              ))}
            </div>
          </aside>

          {/* ── Main content ── */}
          <main ref={printRef} className="flex-1 overflow-y-auto content-scroll print-area print-main">
            <div className="max-w-4xl mx-auto px-6 py-8 print-content print-inner">

              {/* ── Download Banner ── */}
              <div className="no-print mb-8 rounded-2xl overflow-hidden relative"
                style={{ background: "linear-gradient(135deg,#0d1f1f,#1a1a1a,#1a0a0a)", border: "1px solid rgba(0,212,212,0.3)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
                <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#8B1A1A,transparent)" }} />
                <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.04) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <div className="absolute top-3 left-3 w-4 h-4 pointer-events-none" style={{ borderTop: "1.5px solid rgba(0,212,212,0.5)", borderLeft: "1.5px solid rgba(0,212,212,0.5)" }} />
                <div className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none" style={{ borderBottom: "1.5px solid rgba(139,26,26,0.5)", borderRight: "1.5px solid rgba(139,26,26,0.5)" }} />
                <div className="relative px-6 py-5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(0,180,180,0.2),rgba(139,26,26,0.1))", border: "1px solid rgba(0,212,212,0.3)", boxShadow: "0 0 24px rgba(0,180,180,0.15)" }}>
                    <Download className="w-7 h-7" style={{ color: "#00d4d4" }} />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-[16px] font-black mb-1" style={{ color: "#f0f0f0", fontFamily: "'Space Grotesk',sans-serif" }}>
                      Export Full Manual as PDF
                    </p>
                    <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Professionally formatted · All 14 chapters · Print-ready booklet layout · Each section on its own page
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={handlePrint}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button onClick={handleDownloadPdf}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-black text-white transition-all hover:scale-105 active:scale-95 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg,#00b4b4,#007a7a)", boxShadow: "0 4px 24px rgba(0,180,180,0.5)", border: "1px solid rgba(0,212,212,0.4)" }}>
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)", backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }} />
                      <Download className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Cover page ── */}
              <div className="cover-page mb-12 rounded-2xl overflow-hidden relative text-center"
                style={{ background: "linear-gradient(135deg,#141414,#1a1a1a)", border: "1px solid rgba(0,212,212,0.25)", minHeight: 260 }}>
                <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#8B1A1A,#00b4b4,#00d4d4,rgba(255,255,255,0.5),#00b4b4,transparent)" }} />
                <div className="absolute top-3 left-3 w-6 h-6" style={{ borderTop: "2px solid rgba(0,212,212,0.4)", borderLeft: "2px solid rgba(0,212,212,0.4)" }} />
                <div className="absolute top-3 right-3 w-6 h-6" style={{ borderTop: "2px solid rgba(139,26,26,0.4)", borderRight: "2px solid rgba(139,26,26,0.4)" }} />
                <div className="absolute bottom-3 left-3 w-6 h-6" style={{ borderBottom: "2px solid rgba(0,212,212,0.25)", borderLeft: "2px solid rgba(0,212,212,0.25)" }} />
                <div className="absolute bottom-3 right-3 w-6 h-6" style={{ borderBottom: "2px solid rgba(139,26,26,0.25)", borderRight: "2px solid rgba(139,26,26,0.25)" }} />
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(0,212,212,0.04) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                <div className="relative px-8 py-12 flex flex-col items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,rgba(0,180,180,0.15),rgba(139,26,26,0.08))", border: "1px solid rgba(0,212,212,0.25)", boxShadow: "0 0 40px rgba(0,180,180,0.1)" }}>
                    <img src={CREST_WHITE} alt="TouchNet Crest" className="w-14 h-14 object-contain logo-print" style={{ opacity: 0.9 }} />
                  </div>
                  <img src={LOGO_TEAL} alt="TouchNet" className="h-10 object-contain logo-print" style={{ opacity: 0.95 }} />
                  <div>
                    <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, fontSize: 28, color: "#f0f0f0", margin: 0 }}>
                      User Manual
                    </h1>
                    <p style={{ color: "rgba(0,212,212,0.6)", fontSize: 13, marginTop: 4, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.15em" }}>
                      TELECOMMUNICATIONS MANAGEMENT SYSTEM · TMS v3.0
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center mt-2">
                    {["Comprehensive Guide", "All Modules", "Print & PDF Ready"].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                        style={{ background: "rgba(0,180,180,0.1)", border: "1px solid rgba(0,180,180,0.25)", color: "#00b4b4" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>
                    Version 3.0 · {new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long" })} · TouchNet (Pty) Ltd
                  </p>
                </div>
              </div>

              {/* ── Sections ── */}
              {SECTIONS.map(sec => {
                const Icon = sec.icon;
                const topContent = CONTENT[sec.id];
                return (
                  <div key={sec.id} className="section-break">
                    {/* Section heading */}
                    <div id={sec.id} className="section-heading-card mb-4" style={{ scrollMarginTop: 80 }}>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="h-[2px] flex-1" style={{ background: "linear-gradient(90deg,#00b4b4,rgba(0,180,180,0.2),transparent)" }} />
                      </div>
                      <div className="rounded-2xl overflow-hidden"
                        style={{ background: "#1a1a1a", border: "1px solid rgba(0,212,212,0.2)" }}>
                        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00b4b4,#8B1A1A,transparent)" }} />
                        <div className="flex items-center gap-3 px-5 py-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,180,180,0.25)" }}>
                            <Icon className="w-5 h-5" style={{ color: "#00b4b4" }} />
                          </div>
                          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, color: "#f0f0f0", fontSize: 20, margin: 0 }}>
                            {sec.title}
                          </h2>
                        </div>
                        {topContent?.body && (
                          <div className="px-5 pb-5" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.85, whiteSpace: "pre-line", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
                            {topContent.body}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subsections */}
                    {sec.subsections?.map(sub => {
                      const subContent = CONTENT[sub.id];
                      if (!subContent) return null;
                      return (
                        <div key={sub.id} id={sub.id} className="subsection-block ml-0 mb-4 rounded-xl overflow-hidden"
                          style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.07)", scrollMarginTop: 80 }}>
                          <div className="flex items-center gap-2 px-5 py-3"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,180,180,0.04)" }}>
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#00b4b4" }} />
                            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "#e0e0e0", fontSize: 15, margin: 0 }}>
                              {sub.title}
                            </h3>
                          </div>
                          <div className="px-5 py-4" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.9, whiteSpace: "pre-line" }}>
                            {subContent.body}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* ── Footer ── */}
              <div className="manual-footer mt-12 rounded-2xl p-6 text-center"
                style={{ background: "linear-gradient(135deg,rgba(0,180,180,0.06),rgba(139,26,26,0.04))", border: "1px solid rgba(0,212,212,0.12)" }}>
                <img src={CREST_WHITE} alt="TouchNet" className="w-10 h-10 object-contain mx-auto mb-3 logo-print" style={{ opacity: 0.3 }} />
                <p style={{ color: "rgba(0,212,212,0.4)", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.18em" }}>
                  BUILD · CONNECT · PROTECT
                </p>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 6 }}>
                  © {new Date().getFullYear()} TouchNet (Pty) Ltd · All rights reserved · TouchNet TMS v3.0
                </p>
                <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, marginTop: 4 }}>
                  For technical support: support@touchnet.co.za
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}