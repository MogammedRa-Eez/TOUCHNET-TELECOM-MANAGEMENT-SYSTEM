import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Send, Inbox, RefreshCw, Eye, Reply, ChevronLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function OutlookMail() {
    const [view, setView] = useState("inbox"); // inbox | compose | read
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replying, setReplying] = useState(false);
    const [compose, setCompose] = useState({ to: "", subject: "", body: "" });
    const [error, setError] = useState(null);

    const invoke = (action, params = {}) =>
        base44.functions.invoke("outlookMail", { action, ...params });

    const loadEmails = async () => {
        setLoading(true);
        setError(null);
        const res = await invoke("listEmails", { folder: "inbox", top: 30 });
        setEmails(res.data.emails || []);
        setLoading(false);
    };

    useEffect(() => { loadEmails(); }, []);

    const openEmail = async (email) => {
        setSelectedEmail({ ...email, loading: true });
        setView("read");
        const res = await invoke("getEmail", { emailId: email.id });
        setSelectedEmail(res.data.email);
        if (!email.isRead) {
            await invoke("markRead", { emailId: email.id });
            setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isRead: true } : e));
        }
    };

    const handleSend = async () => {
        if (!compose.to || !compose.subject || !compose.body) return;
        setSending(true);
        const res = await invoke("sendEmail", compose);
        setSending(false);
        if (res.data.success) {
            setSent(true);
            setTimeout(() => { setSent(false); setView("inbox"); setCompose({ to: "", subject: "", body: "" }); }, 2000);
        } else {
            setError(res.data.error || "Failed to send");
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setReplying(true);
        await invoke("replyEmail", { emailId: selectedEmail.id, comment: replyText });
        setReplying(false);
        setReplyText("");
    };

    const unread = emails.filter(e => !e.isRead).length;

    return (
        <div className="flex h-full" style={{ minHeight: "calc(100vh - 64px)" }}>
            {/* Sidebar */}
            <div className="w-56 border-r border-slate-200 bg-white flex flex-col py-4 px-3 gap-1 flex-shrink-0">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2 mb-2">Outlook</p>
                <button
                    onClick={() => { setView("inbox"); setSelectedEmail(null); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${view !== "compose" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
                    <Inbox className="w-4 h-4" />
                    Inbox
                    {unread > 0 && <Badge className="ml-auto bg-blue-600 text-white text-[10px] px-1.5 py-0">{unread}</Badge>}
                </button>
                <button
                    onClick={() => setView("compose")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${view === "compose" ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-100"}`}>
                    <Send className="w-4 h-4" />
                    Compose
                </button>
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
                {/* Inbox */}
                {view === "inbox" && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
                            <h2 className="font-bold text-slate-800">Inbox</h2>
                            <Button variant="outline" size="sm" onClick={loadEmails} disabled={loading}>
                                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : emails.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                <Mail className="w-8 h-8 mb-2" />
                                <p className="text-sm">No emails found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {emails.map(email => (
                                    <div
                                        key={email.id}
                                        onClick={() => openEmail(email)}
                                        className={`flex items-start gap-3 px-6 py-4 cursor-pointer hover:bg-white transition-all ${!email.isRead ? "bg-blue-50/50" : "bg-white"}`}>
                                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!email.isRead ? "bg-blue-500" : "bg-transparent"}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-sm truncate ${!email.isRead ? "font-semibold text-slate-800" : "font-medium text-slate-600"}`}>
                                                    {email.from?.emailAddress?.name || email.from?.emailAddress?.address}
                                                </p>
                                                <p className="text-xs text-slate-400 flex-shrink-0">
                                                    {email.receivedDateTime ? format(new Date(email.receivedDateTime), "MMM d, HH:mm") : ""}
                                                </p>
                                            </div>
                                            <p className={`text-sm truncate ${!email.isRead ? "text-slate-700 font-medium" : "text-slate-500"}`}>{email.subject}</p>
                                            <p className="text-xs text-slate-400 truncate mt-0.5">{email.bodyPreview}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Read Email */}
                {view === "read" && selectedEmail && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200">
                            <Button variant="ghost" size="sm" onClick={() => { setView("inbox"); setSelectedEmail(null); setReplyText(""); }}>
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back
                            </Button>
                        </div>
                        {selectedEmail.loading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto px-6 py-6">
                                <h2 className="text-xl font-bold text-slate-800 mb-3">{selectedEmail.subject}</h2>
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                        {(selectedEmail.from?.emailAddress?.name || "?").slice(0, 1).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{selectedEmail.from?.emailAddress?.name}</p>
                                        <p className="text-xs text-slate-400">{selectedEmail.from?.emailAddress?.address}</p>
                                    </div>
                                    <p className="ml-auto text-xs text-slate-400">
                                        {selectedEmail.receivedDateTime ? format(new Date(selectedEmail.receivedDateTime), "PPPp") : ""}
                                    </p>
                                </div>
                                <div
                                    className="prose prose-sm max-w-none text-slate-700 mb-8"
                                    dangerouslySetInnerHTML={{ __html: selectedEmail.body?.content || "" }}
                                />
                                {/* Reply */}
                                <div className="bg-white rounded-xl border border-slate-200 p-4">
                                    <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Reply className="w-4 h-4" /> Reply</p>
                                    <Textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Write your reply..."
                                        className="mb-3 resize-none"
                                        rows={4}
                                    />
                                    <Button onClick={handleReply} disabled={replying || !replyText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {replying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                        Send Reply
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Compose */}
                {view === "compose" && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex items-center px-6 py-4 bg-white border-b border-slate-200">
                            <h2 className="font-bold text-slate-800">New Email</h2>
                        </div>
                        <div className="max-w-2xl mx-auto px-6 py-6">
                            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                                {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">To</label>
                                    <Input
                                        value={compose.to}
                                        onChange={e => setCompose(p => ({ ...p, to: e.target.value }))}
                                        placeholder="recipient@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Subject</label>
                                    <Input
                                        value={compose.subject}
                                        onChange={e => setCompose(p => ({ ...p, subject: e.target.value }))}
                                        placeholder="Subject"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Message</label>
                                    <Textarea
                                        value={compose.body}
                                        onChange={e => setCompose(p => ({ ...p, body: e.target.value }))}
                                        placeholder="Write your message..."
                                        rows={10}
                                        className="resize-none"
                                    />
                                </div>
                                <Button
                                    onClick={handleSend}
                                    disabled={sending || sent || !compose.to || !compose.subject || !compose.body}
                                    className={`w-full ${sent ? "bg-emerald-600 hover:bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"} text-white`}>
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : sent ? <CheckCircle className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                    {sending ? "Sending..." : sent ? "Sent!" : "Send Email"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}