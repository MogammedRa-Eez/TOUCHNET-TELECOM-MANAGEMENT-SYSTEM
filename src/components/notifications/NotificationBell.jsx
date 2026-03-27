import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Bell, X, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle,
  Network, Receipt, TicketCheck, Users, Settings, Trash2, Filter,
  ArrowRight, RefreshCw, BellOff, Zap
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const TYPE_CFG = {
  info:    { icon: Info,          color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.2)",   label: "Info"    },
  warning: { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.2)",   label: "Warning" },
  error:   { icon: AlertCircle,   color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.2)",    label: "Error"   },
  success: { icon: CheckCircle,   color: "#10b981", bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.2)",   label: "Success" },
};

const CAT_CFG = {
  network:  { icon: Network,    color: "#8b5cf6", label: "Network"  },
  billing:  { icon: Receipt,    color: "#06b6d4", label: "Billing"  },
  ticket:   { icon: TicketCheck,color: "#f59e0b", label: "Tickets"  },
  customer: { icon: Users,      color: "#10b981", label: "Customer" },
  system:   { icon: Settings,   color: "#64748b", label: "System"   },
};

const PAGE_MAP = {
  billing:  "/Billing",
  ticket:   "/Tickets",
  network:  "/Network",
  customer: "/Customers",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [justReceived, setJustReceived] = useState(false);
  const panelRef = useRef(null);

  // Load user + initial notifications
  useEffect(() => {
    base44.auth.me().then(me => {
      setUser(me);
      if (me) loadNotifications(me.email);
    }).catch(() => {});
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create" && event.data?.user_email === user.email) {
        setNotifications(prev => [event.data, ...prev]);
        // Pulse animation on new notification
        setJustReceived(true);
        setTimeout(() => setJustReceived(false), 3000);
      } else if (event.type === "update") {
        setNotifications(prev => prev.map(n => n.id === event.id ? event.data : n));
      } else if (event.type === "delete") {
        setNotifications(prev => prev.filter(n => n.id !== event.id));
      }
    });
    return unsub;
  }, [user]);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function loadNotifications(email) {
    setLoading(true);
    const data = await base44.entities.Notification.filter({ user_email: email }, "-created_date", 100);
    setNotifications(data);
    setLoading(false);
  }

  async function markRead(n) {
    if (!n.is_read) {
      await base44.entities.Notification.update(n.id, { is_read: true });
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    }
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function deleteNotification(e, id) {
    e.stopPropagation();
    await base44.entities.Notification.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  async function clearAll() {
    const all = notifications;
    await Promise.all(all.map(n => base44.entities.Notification.delete(n.id)));
    setNotifications([]);
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const tabs = [
    { key: "all",      label: "All",      count: notifications.length },
    { key: "unread",   label: "Unread",   count: unreadCount },
    { key: "billing",  label: "Billing",  count: notifications.filter(n => n.category === "billing").length },
    { key: "ticket",   label: "Tickets",  count: notifications.filter(n => n.category === "ticket").length },
    { key: "network",  label: "Network",  count: notifications.filter(n => n.category === "network").length },
  ];

  const filtered = useMemo(() => {
    if (activeTab === "all")    return notifications;
    if (activeTab === "unread") return notifications.filter(n => !n.is_read);
    return notifications.filter(n => n.category === activeTab);
  }, [notifications, activeTab]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open && user) loadNotifications(user.email); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: open ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.9)",
          border: `1px solid ${open ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.15)"}`,
          boxShadow: open ? "0 0 16px rgba(99,102,241,0.2)" : "0 1px 4px rgba(99,102,241,0.08)",
        }}>
        <Bell className="w-4 h-4" style={{ color: open ? "#6366f1" : "#64748b" }} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 2px 8px rgba(239,68,68,0.5)" }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* New notification pulse ring */}
        {justReceived && (
          <span className="absolute inset-0 rounded-xl animate-ping"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)" }} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 overflow-hidden"
          style={{
            width: 420,
            background: "#ffffff",
            borderRadius: 20,
            border: "1px solid rgba(99,102,241,0.15)",
            boxShadow: "0 24px 64px rgba(99,102,241,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          }}>
          {/* Prismatic top bar */}
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,#8b5cf6,transparent)" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: "linear-gradient(180deg,#f8f9ff,#ffffff)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <Bell className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
              </div>
              <span className="text-[14px] font-black text-slate-800 tracking-tight">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {user && (
                <button onClick={() => loadNotifications(user.email)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-indigo-50"
                  title="Refresh">
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
                </button>
              )}
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all hover:scale-105"
                  style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <CheckCheck className="w-3 h-3" /> Read all
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-50"
                  title="Clear all">
                  <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 px-3 py-2 overflow-x-auto"
            style={{ borderBottom: "1px solid rgba(99,102,241,0.07)", background: "#fafbff" }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: activeTab === tab.key ? "rgba(99,102,241,0.12)" : "transparent",
                  color: activeTab === tab.key ? "#6366f1" : "#94a3b8",
                  border: activeTab === tab.key ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                }}>
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-[9px] px-1 py-0.5 rounded-md font-black"
                    style={{
                      background: activeTab === tab.key ? "rgba(99,102,241,0.15)" : "rgba(100,116,139,0.1)",
                      color: activeTab === tab.key ? "#6366f1" : "#94a3b8",
                    }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto slim-scroll" style={{ maxHeight: 400 }}>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-[11px] text-slate-400">Loading…</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)" }}>
                  <BellOff className="w-5 h-5" style={{ color: "#6366f1", opacity: 0.4 }} />
                </div>
                <p className="text-[13px] font-semibold text-slate-400">No notifications</p>
                <p className="text-[11px] text-slate-300 mt-0.5">You're all caught up!</p>
              </div>
            ) : (
              filtered.map(n => {
                const tc = TYPE_CFG[n.type] || TYPE_CFG.info;
                const cc = CAT_CFG[n.category] || CAT_CFG.system;
                const TypeIcon = tc.icon;
                const CatIcon = cc.icon;
                const navLink = PAGE_MAP[n.category];

                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n)}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-all group relative"
                    style={{
                      borderBottom: "1px solid rgba(99,102,241,0.04)",
                      background: !n.is_read ? `${tc.color}06` : "transparent",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${tc.color}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = !n.is_read ? `${tc.color}06` : "transparent"; }}
                  >
                    {/* Unread left bar */}
                    {!n.is_read && (
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                        style={{ background: tc.color }} />
                    )}

                    {/* Type icon */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: tc.bg, border: `1px solid ${tc.border}` }}>
                      <TypeIcon className="w-4 h-4" style={{ color: tc.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className={`text-[13px] leading-snug text-slate-800 ${!n.is_read ? "font-bold" : "font-medium"}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mono">
                          {timeAgo(n.created_date)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                          style={{ background: `${cc.color}0d`, border: `1px solid ${cc.color}18` }}>
                          <CatIcon className="w-2.5 h-2.5" style={{ color: cc.color }} />
                          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: cc.color }}>{cc.label}</span>
                        </div>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: tc.color, boxShadow: `0 0 6px ${tc.color}` }} />
                        )}
                        {navLink && (
                          <Link
                            to={navLink}
                            onClick={e => { e.stopPropagation(); markRead(n); setOpen(false); }}
                            className="flex items-center gap-0.5 text-[10px] font-bold ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: "#6366f1" }}>
                            View <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => deleteNotification(e, n.id)}
                      className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                      title="Dismiss">
                      <X className="w-3 h-3 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(99,102,241,0.07)", background: "linear-gradient(180deg,#ffffff,#f8f9ff)" }}>
            <p className="text-[10px] mono" style={{ color: "rgba(100,116,139,0.5)" }}>
              {notifications.length} total · {unreadCount} unread
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] mono font-bold" style={{ color: "#10b981" }}>Live</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}