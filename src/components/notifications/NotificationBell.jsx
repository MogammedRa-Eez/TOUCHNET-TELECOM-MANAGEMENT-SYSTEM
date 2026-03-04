import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle, Network, Receipt, TicketCheck, Users, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

const TYPE_ICONS = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50" },
  error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
  success: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
};

const CATEGORY_ICONS = {
  network: Network,
  billing: Receipt,
  ticket: TicketCheck,
  customer: Users,
  system: Settings,
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
  const panelRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(me => {
      setUser(me);
      if (me) loadNotifications(me.email);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create" && event.data?.user_email === user.email) {
        setNotifications(prev => [event.data, ...prev]);
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
    const data = await base44.entities.Notification.filter({ user_email: email }, "-created_date", 50);
    setNotifications(data);
  }

  async function markRead(n) {
    if (n.is_read) return;
    await base44.entities.Notification.update(n.id, { is_read: true });
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    if (n.link_page) window.location.href = createPageUrl(n.link_page);
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 transition-colors"
        style={{ background: "#f1f5f9", border: "1px solid rgba(0,0,0,0.1)" }}>
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-800 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const typeConfig = TYPE_ICONS[n.type] || TYPE_ICONS.info;
                const TypeIcon = typeConfig.icon;
                const CatIcon = CATEGORY_ICONS[n.category] || Settings;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors group relative ${!n.is_read ? "bg-blue-50/40" : ""}`}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${typeConfig.bg}`}>
                      <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium text-slate-800 leading-tight ${!n.is_read ? "font-semibold" : ""}`}>{n.title}</p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">{timeAgo(n.created_date)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <CatIcon className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400 capitalize">{n.category}</span>
                        {!n.is_read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-1" />}
                      </div>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={(e) => deleteNotification(e, n.id)}
                      className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 text-center" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <span className="text-xs text-slate-400">{notifications.length} total notifications</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}