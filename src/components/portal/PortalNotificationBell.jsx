import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Bell, X, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle,
  Receipt, TicketCheck, Users, Settings, BellOff, RefreshCw, ArrowRight, Trash2
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const TYPE_CFG = {
  info:    { icon: Info,          color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)"  },
  warning: { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)"  },
  error:   { icon: AlertCircle,   color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)"   },
  success: { icon: CheckCircle,   color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)"  },
};

const CAT_CFG = {
  billing:  { icon: Receipt,    color: "#06b6d4", label: "Billing"  },
  ticket:   { icon: TicketCheck,color: "#f59e0b", label: "Support"  },
  customer: { icon: Users,      color: "#10b981", label: "Account"  },
  system:   { icon: Settings,   color: "#64748b", label: "System"   },
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

export default function PortalNotificationBell({ customerEmail }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [justReceived, setJustReceived] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (customerEmail) loadNotifications();
  }, [customerEmail]);

  // Real-time subscription
  useEffect(() => {
    if (!customerEmail) return;
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create" && event.data?.user_email === customerEmail) {
        setNotifications(prev => [event.data, ...prev]);
        setJustReceived(true);
        setTimeout(() => setJustReceived(false), 3000);
      } else if (event.type === "update") {
        setNotifications(prev => prev.map(n => n.id === event.id ? event.data : n));
      } else if (event.type === "delete") {
        setNotifications(prev => prev.filter(n => n.id !== event.id));
      }
    });
    return unsub;
  }, [customerEmail]);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function loadNotifications() {
    if (!customerEmail) return;
    setLoading(true);
    const data = await base44.entities.Notification.filter({ user_email: customerEmail }, "-created_date", 100);
    setNotifications(data);
    setLoading(false);
  }

  async function markRead(n) {
    if (n.is_read) return;
    await base44.entities.Notification.update(n.id, { is_read: true });
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
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
    await Promise.all(notifications.map(n => base44.entities.Notification.delete(n.id)));
    setNotifications([]);
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const tabs = [
    { key: "all",      label: "All",     count: notifications.length },
    { key: "unread",   label: "Unread",  count: unreadCount },
    { key: "billing",  label: "Billing", count: notifications.filter(n => n.category === "billing").length },
    { key: "ticket",   label: "Support", count: notifications.filter(n => n.category === "ticket").length },
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
        onClick={() => { setOpen(!open); if (!open) loadNotifications(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: open ? "rgba(99,102,241,0.12)" : "rgba(241,245,249,0.9)",
          border: `1px solid ${open ? "rgba(99,102,241,0.35)" : "rgba(226,232,240,0.9)"}`,
          boxShadow: open ? "0 0 16px rgba(99,102,241,0.2)" : "none",
        }}>
        <Bell className="w-4 h-4" style={{ color: open ? "#6366f1" : "#64748b" }} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-transparent"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 2px 8px rgba(239,68,68,0.5)", borderColor: "rgba(255,255,255,0.9)" }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Pulse ring on new notification */}
        {justReceived && (
          <span className="absolute inset-0 rounded-xl animate-ping opacity-60"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)" }} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 overflow-hidden"
          style={{
            width: 400,
            background: "rgba(255,255,255,0.98)",
            borderRadius: 20,
            border: "1px solid rgba(99,102,241,0.15)",
            boxShadow: "0 24px 64px rgba(99,102,241,0.12), 0 8px 32px rgba(0,0,0,0.08)",
          }}>

          {/* Top accent */}
          <div className="h-[2px] rounded-t-[20px]" style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4,#8b5cf6,transparent)" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(99,102,241,0.08)", background: "rgba(248,250,252,0.8)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <Bell className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
              </div>
              <span className="text-[14px] font-black tracking-tight" style={{ color: "#1e293b" }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={loadNotifications}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} style={{ color: "#94a3b8" }} />
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all hover:scale-105"
                  style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.18)" }}>
                  <CheckCheck className="w-3 h-3" /> Read all
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                  title="Clear all">
                  <Trash2 className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-3 py-2 overflow-x-auto"
            style={{ borderBottom: "1px solid rgba(99,102,241,0.06)", background: "rgba(248,250,252,0.5)" }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: activeTab === tab.key ? "rgba(99,102,241,0.1)" : "transparent",
                  color: activeTab === tab.key ? "#6366f1" : "#94a3b8",
                  border: activeTab === tab.key ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                }}>
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-[9px] px-1 py-0.5 rounded font-black"
                    style={{
                      background: activeTab === tab.key ? "rgba(99,102,241,0.15)" : "rgba(241,245,249,1)",
                      color: activeTab === tab.key ? "#6366f1" : "#94a3b8",
                    }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(99,102,241,0.15)", borderTopColor: "#6366f1" }} />
                  <p className="text-[11px] mono" style={{ color: "#94a3b8" }}>Loading…</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)" }}>
                  <BellOff className="w-5 h-5" style={{ color: "#a5b4fc" }} />
                </div>
                <p className="text-[13px] font-semibold" style={{ color: "#334155" }}>No notifications</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>You're all caught up!</p>
              </div>
            ) : (
              filtered.map(n => {
                const tc = TYPE_CFG[n.type] || TYPE_CFG.info;
                const cc = CAT_CFG[n.category] || CAT_CFG.system;
                const TypeIcon = tc.icon;
                const CatIcon = cc.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n)}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-all group relative"
                    style={{
                      borderBottom: "1px solid rgba(226,232,240,0.6)",
                      background: !n.is_read ? `${tc.color}05` : "transparent",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${tc.color}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = !n.is_read ? `${tc.color}05` : "transparent"; }}
                  >
                    {/* Unread left bar */}
                    {!n.is_read && (
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                        style={{ background: tc.color, boxShadow: `0 0 6px ${tc.color}` }} />
                    )}

                    {/* Type icon */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: tc.bg, border: `1px solid ${tc.border}` }}>
                      <TypeIcon className="w-4 h-4" style={{ color: tc.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className="text-[13px] leading-snug font-bold" style={{ color: n.is_read ? "#64748b" : "#1e293b" }}>
                          {n.title}
                        </p>
                        <span className="text-[10px] whitespace-nowrap flex-shrink-0 mono" style={{ color: "#94a3b8" }}>
                          {timeAgo(n.created_date)}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: n.is_read ? "#94a3b8" : "#475569" }}>{n.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                          style={{ background: `${cc.color}12`, border: `1px solid ${cc.color}20` }}>
                          <CatIcon className="w-2.5 h-2.5" style={{ color: cc.color }} />
                          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: cc.color }}>{cc.label}</span>
                        </div>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: tc.color, boxShadow: `0 0 6px ${tc.color}` }} />
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => deleteNotification(e, n.id)}
                      className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                      style={{ border: "1px solid rgba(239,68,68,0.15)" }}>
                      <X className="w-3 h-3" style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(99,102,241,0.07)", background: "rgba(248,250,252,0.8)" }}>
            <p className="text-[10px] mono font-semibold" style={{ color: "#94a3b8" }}>
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