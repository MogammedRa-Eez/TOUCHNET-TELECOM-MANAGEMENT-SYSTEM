/**
 * RBAC Context — resolves the current user's permissions from the Role entity.
 */
import { useState, useEffect, createContext, useContext } from "react";
import { base44 } from "@/api/base44Client";
import { getDemoRoleOverride } from "@/components/layout/DemoUserSwitcher";

const RBACContext = createContext(null);

export const ALL_PERMISSIONS = [
  { key: "dashboard",        label: "Dashboard",         group: "Pages" },
  { key: "customers",        label: "Customers",         group: "Pages" },
  { key: "billing",          label: "Billing",           group: "Pages" },
  { key: "tickets",          label: "Tickets",           group: "Pages" },
  { key: "network",          label: "Network",           group: "Pages" },
  { key: "employees",        label: "Employees",         group: "Pages" },
  { key: "ai_assistant",     label: "AI Assistant",      group: "Pages" },
  { key: "roles_management", label: "Roles Management",  group: "Pages" },
  { key: "projects",         label: "Fibre Projects",    group: "Pages" },
  { key: "outlook",          label: "Outlook Mail",      group: "Pages" },
  { key: "view_salaries",    label: "View Salaries",     group: "Data" },
  { key: "view_financials",  label: "View Financials",   group: "Data" },
  { key: "delete_records",   label: "Delete Records",    group: "Actions" },
  { key: "export_data",      label: "Export Data",       group: "Actions" },
];

function buildAllTrue() {
  const perms = {};
  ALL_PERMISSIONS.forEach(p => { perms[p.key] = true; });
  return perms;
}

export function RBACProvider({ children }) {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const me = await base44.auth.me();
        setUser(me);

        // Check for demo role override (for presentations)
        const demoOverride = getDemoRoleOverride();
        if (demoOverride) {
          if (demoOverride._isAdmin) {
            setRole({ name: "Admin", permissions: buildAllTrue(), is_system: true });
          } else {
            setRole(demoOverride);
          }
          setLoading(false);
          return;
        }

        // App admin gets all permissions
        if (me?.role === "admin") {
          setRole({ name: "Admin", permissions: buildAllTrue(), is_system: true });
          setLoading(false);
          return;
        }

        const roles = await base44.entities.Role.list();
        const matched = roles.find(r =>
          Array.isArray(r.assigned_user_emails) &&
          r.assigned_user_emails.includes(me?.email)
        );

        setRole(matched || { name: "No Role", permissions: {}, is_system: true });
      } catch {
        setRole({ name: "No Role", permissions: {}, is_system: true });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const can = (permission) => {
    if (!role) return false;
    if (user?.role === "admin") return true;
    return role.permissions?.[permission] === true;
  };

  return (
    <RBACContext.Provider value={{ role, user, can, loading }}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  return useContext(RBACContext);
}