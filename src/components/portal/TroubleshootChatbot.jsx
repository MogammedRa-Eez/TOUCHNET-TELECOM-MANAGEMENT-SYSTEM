import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bot, Send, X, Loader2, AlertTriangle, CheckCircle2,
  TicketCheck, Wifi, Zap, Router, Power, Monitor, Phone, ChevronDown
} from "lucide-react";

// ── Issue type config ──────────────────────────────────────────────────────────
const ISSUE_TYPES = [
  { id: "no_internet",  label: "No Internet",        icon: Wifi,    color: "#ef4444" },
  { id: "slow_speed",   label: "Slow Speeds",         icon: Zap,     color: "#f59e0b" },
  { id: "wifi_issues",  label: "WiFi Dropping",       icon: Router,  color: "#8b5cf6" },
  { id: "ont_lights",   label: "Strange Lights",      icon: Power,   color: "#06b6d4" },
  { id: "cant_stream",  label: "Streaming Issues",    icon: Monitor, color: "#10b981" },
  { id: "new_device",   label: "Can't Connect Device",icon: Phone,   color: "#6366f1" },
];

// ── Qualifying questions per issue type ────────────────────────────────────────
const QUESTIONS = {
  no_internet: [
    {
      id: "q1",
      text: "Have you tried restarting your router and ONT (the white box from the wall)?",
      options: ["Yes, still no internet", "No, let me try that now"],
    },
    {
      id: "q2",
      text: "What do the lights on your ONT look like? (the box connected to the fibre cable in the wall)",
      options: ["All green / normal", "LOS light is red or blinking", "Power light is off", "I'm not sure"],
    },
    {
      id: "q3",
      text: "Does the problem affect all devices (phone, laptop, TV) or just one?",
      options: ["All devices are offline", "Only one specific device"],
    },
  ],
  slow_speed: [
    {
      id: "q1",
      text: "Have you run a speed test at fast.com? What were your results approximately?",
      options: ["Less than 10 Mbps", "10–50 Mbps", "50–80% of my plan speed", "Haven't tested yet"],
    },
    {
      id: "q2",
      text: "Are you testing over WiFi or a wired ethernet cable?",
      options: ["WiFi only", "Wired ethernet", "Both — wired is also slow"],
    },
    {
      id: "q3",
      text: "How long has the speed been slow?",
      options: ["Just started today", "Past few days", "Weeks or longer"],
    },
  ],
  wifi_issues: [
    {
      id: "q1",
      text: "What happens when you try to connect to your WiFi?",
      options: ["Can't see the WiFi network at all", "Network shows but wrong password error", "Connects but drops frequently", "Connected but no internet"],
    },
    {
      id: "q2",
      text: "Have you restarted your router recently?",
      options: ["Yes, still dropping", "No, let me try that"],
    },
    {
      id: "q3",
      text: "How far are you from the router when it drops?",
      options: ["Same room as router", "One room away", "Different floor or far away"],
    },
  ],
  ont_lights: [
    {
      id: "q1",
      text: "Which light is causing concern on your ONT (white fibre box)?",
      options: ["LOS light is red", "Power light is off or blinking", "Internet/WAN light is red", "No lights at all"],
    },
    {
      id: "q2",
      text: "Have you checked that all cables are firmly plugged in?",
      options: ["Yes, everything looks secure", "Found a loose cable — fixing now", "Not sure which cables to check"],
    },
  ],
  cant_stream: [
    {
      id: "q1",
      text: "What are you experiencing?",
      options: ["Video buffering constantly", "Poor quality / pixelated", "Video call dropping or lagging", "Can't connect to the streaming service"],
    },
    {
      id: "q2",
      text: "Are you on WiFi or wired when streaming?",
      options: ["WiFi", "Wired ethernet"],
    },
    {
      id: "q3",
      text: "Does this happen on all streaming services or just one?",
      options: ["All services affected", "Only one service (e.g. Netflix)", "Only video calls (Zoom/Teams)"],
    },
  ],
  new_device: [
    {
      id: "q1",
      text: "What type of device are you trying to connect?",
      options: ["Smartphone or tablet", "Laptop or PC", "Smart TV or streaming stick", "Smart home device"],
    },
    {
      id: "q2",
      text: "What happens when you try to connect?",
      options: ["Can't see the WiFi network", "Wrong password error", "Connects but no internet", "Connected fine, something else is wrong"],
    },
  ],
};

// ── AI response logic (deterministic based on answers) ─────────────────────────
function generateResponse(issueId, answers) {
  const priority = shouldEscalate(issueId, answers) ? "high" : "medium";

  const responses = {
    no_internet: () => {
      if (answers.q2 === "LOS light is red or blinking") {
        return {
          message: "🚨 **LOS red light detected** — this indicates a physical fibre signal loss. This is a network-level issue that cannot be fixed from your side. I'm flagging this as a **high priority** issue.",
          steps: ["Do not restart further — it won't help with LOS red", "Check the green fibre cable from the wall isn't bent/kinked", "Our team will remotely check your line signal"],
          escalate: true,
          priority: "high",
          category: "connectivity",
        };
      }
      if (answers.q3 === "Only one specific device") {
        return {
          message: "✅ Good news — this looks like a **device-specific issue**, not a network problem. Your internet line is likely fine.",
          steps: ["Forget the WiFi network on that device and reconnect", "Restart the device fully (power off, not just sleep)", "Check if the device connects to mobile hotspot — if yes, it's a device config issue", "Try resetting network settings on the device"],
          escalate: false,
          priority: "low",
        };
      }
      if (answers.q1 === "No, let me try that now") {
        return {
          message: "Let's start with the basics — a restart fixes ~70% of connectivity issues.",
          steps: ["Power off your router (unplug from wall)", "Power off your ONT (white fibre box)", "Wait 60 seconds", "Power on the ONT first, wait 2 minutes", "Power on the router, wait another 2 minutes", "Test your connection"],
          escalate: false,
          priority: "medium",
        };
      }
      return {
        message: "You've already restarted and all devices are offline — this suggests a **line or provisioning issue**. Let me escalate this.",
        steps: ["Keep your ONT/router powered on", "Our team will check your line remotely", "If confirmed outage, an engineer will be dispatched"],
        escalate: true,
        priority: "high",
        category: "connectivity",
      };
    },

    slow_speed: () => {
      if (answers.q1 === "Less than 10 Mbps" && answers.q2 === "Both — wired is also slow") {
        return {
          message: "⚠️ Critically low speeds on a wired connection suggest a **line quality or provisioning issue**. This needs investigation from our side.",
          steps: ["Note your speed test result (screenshots help)", "Confirm you're plugged directly into the router LAN port", "Our team will run a line quality check remotely"],
          escalate: true,
          priority: "high",
          category: "speed_issue",
        };
      }
      if (answers.q2 === "WiFi only") {
        return {
          message: "Slow speeds on WiFi are very common. Let's optimise your setup before escalating.",
          steps: ["Test with an ethernet cable — this is the true benchmark", "Move the router to a central, elevated, open location", "Switch from 2.4GHz to 5GHz band on your device", "Ensure no large downloads are running in the background", "Restart the router and retest"],
          escalate: false,
          priority: "low",
        };
      }
      if (answers.q3 === "Weeks or longer") {
        return {
          message: "Persistent slow speeds over weeks warrant a proper investigation from our technical team.",
          steps: ["Run 3 speed tests at different times of day", "Include your results in the support ticket", "Our team will review your line stats and escalate to the network team if needed"],
          escalate: true,
          priority: "medium",
          category: "speed_issue",
        };
      }
      return {
        message: "Let's try some optimisation steps first.",
        steps: ["Restart your router (unplug 30 sec)", "Disconnect devices not in use", "Test wired speed vs WiFi speed", "If wired speed is normal, the issue is WiFi range or interference"],
        escalate: false,
        priority: "medium",
      };
    },

    wifi_issues: () => {
      if (answers.q1 === "Can't see the WiFi network at all") {
        return {
          message: "If the WiFi network isn't broadcasting at all, the router may have a hardware issue or WiFi is disabled.",
          steps: ["Check if the WiFi light on your router is on", "Log into the router admin panel (usually 192.168.1.1) and ensure WiFi is enabled", "Try a factory reset on the router (hold reset button 10 sec)", "If WiFi still doesn't appear, the router may need replacement"],
          escalate: true,
          priority: "medium",
          category: "hardware",
        };
      }
      if (answers.q3 === "Different floor or far away") {
        return {
          message: "Distance and walls are the likely culprit. This is a coverage issue, not a fault.",
          steps: ["Move the router to a more central location", "Consider purchasing a WiFi extender or mesh node", "Switch to 2.4GHz band for better range", "Our team can advise on a mesh WiFi upgrade if needed"],
          escalate: false,
          priority: "low",
        };
      }
      return {
        message: "Let's work through this systematically.",
        steps: ["Restart the router fully (unplug 30 seconds)", "Forget the network on your device and reconnect", "Check the WiFi password on the router sticker", "Try connecting a different device to isolate the issue"],
        escalate: false,
        priority: "medium",
      };
    },

    ont_lights: () => {
      if (answers.q1 === "LOS light is red" || answers.q1 === "No lights at all") {
        return {
          message: "🚨 **Critical: LOS red or no lights** indicates a physical fibre signal problem. This requires immediate attention from our team.",
          steps: ["Check the green fibre cable from wall to ONT — is it firmly plugged in?", "Do not bend or kink the fibre cable", "Do not restart repeatedly — it won't fix LOS red", "We are escalating this to our network team now"],
          escalate: true,
          priority: "high",
          category: "connectivity",
        };
      }
      if (answers.q1 === "Power light is off or blinking") {
        return {
          message: "A power issue with the ONT is often easy to fix.",
          steps: ["Try a different wall power socket", "Check the power adapter cable — ensure it's the correct one", "If using an extension cord, plug directly into the wall", "If power light stays off with different socket, the power adapter may be faulty — contact us for replacement"],
          escalate: answers.q2 === "Found a loose cable — fixing now" ? false : true,
          priority: "medium",
          category: "hardware",
        };
      }
      return {
        message: "Internet/WAN red typically means the connection is authenticated but routing has failed.",
        steps: ["Restart both the ONT and router", "Wait 3 minutes before testing", "Check if there are any scheduled maintenance alerts from us", "If it persists after restart, log a ticket for a provisioning check"],
        escalate: true,
        priority: "medium",
        category: "connectivity",
      };
    },

    cant_stream: () => {
      if (answers.q3 === "Only one service (e.g. Netflix)") {
        return {
          message: "If only one service is affected, the issue is almost certainly with that service, not your connection.",
          steps: ["Visit downdetector.com to check if the service has an outage", "Clear the app cache or reinstall the app", "Try accessing the service from a different device", "Check if your subscription is active"],
          escalate: false,
          priority: "low",
        };
      }
      if (answers.q2 === "WiFi") {
        return {
          message: "Streaming over WiFi is sensitive to signal fluctuations. Let's improve your setup.",
          steps: ["Connect your streaming device via ethernet cable if possible", "Move the router closer or use a WiFi extender", "Lower the stream quality temporarily (e.g. Netflix: Medium)", "Close background apps on your device"],
          escalate: false,
          priority: "low",
        };
      }
      return {
        message: "All services affected on a wired connection could indicate a speed or routing issue.",
        steps: ["Run a speed test at fast.com — note the result", "Restart your router", "Check if the issue occurs at specific times (peak hours = network congestion)"],
        escalate: true,
        priority: "medium",
        category: "speed_issue",
      };
    },

    new_device: () => {
      if (answers.q2 === "Connects but no internet") {
        return {
          message: "The device is connecting to your WiFi but not getting internet — this is usually a DNS or IP conflict.",
          steps: ["Forget the WiFi network and reconnect", "On Android/iPhone: go to WiFi settings → tap network → set IP to DHCP", "Try setting DNS to 8.8.8.8 (Google DNS) on the device", "Restart both the device and router"],
          escalate: false,
          priority: "low",
        };
      }
      if (answers.q2 === "Can't see the WiFi network") {
        return {
          message: "Device can't see the network — let's check a few things.",
          steps: ["Ensure WiFi is enabled on the device (not in airplane mode)", "Check if other devices see the network (to rule out router issue)", "The device may only support 2.4GHz — check if your router broadcasts separately", "Move the device closer to the router"],
          escalate: false,
          priority: "low",
        };
      }
      return {
        message: "Wrong password errors are straightforward to resolve.",
        steps: ["Check the exact password on the sticker under your router", "Passwords are case-sensitive — check for capital letters and symbols", "If you've changed the WiFi password before, use the new one", "You can reset the router password in the admin panel (192.168.1.1)"],
        escalate: false,
        priority: "low",
      };
    },
  };

  const fn = responses[issueId];
  return fn ? fn() : { message: "Let me get support to help you.", steps: [], escalate: true, priority: "medium" };
}

function shouldEscalate(issueId, answers) {
  if (issueId === "no_internet" && answers.q2 === "LOS light is red or blinking") return true;
  if (issueId === "slow_speed" && answers.q1 === "Less than 10 Mbps" && answers.q2 === "Both — wired is also slow") return true;
  if (issueId === "ont_lights" && (answers.q1 === "LOS light is red" || answers.q1 === "No lights at all")) return true;
  return false;
}

// ── Message component ──────────────────────────────────────────────────────────
function Message({ msg }) {
  const isBot = msg.role === "bot";
  return (
    <div className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isBot ? "rounded-tl-sm" : "rounded-tr-sm"}`}
        style={{
          background: isBot ? "white" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
          border: isBot ? "1px solid rgba(99,102,241,0.12)" : "none",
          boxShadow: isBot ? "0 2px 12px rgba(99,102,241,0.06)" : "0 4px 16px rgba(99,102,241,0.3)",
          color: isBot ? "#1e293b" : "white",
        }}>
        {msg.content && (
          <p className="text-[13px] leading-relaxed whitespace-pre-line">{msg.content}</p>
        )}
        {msg.steps && msg.steps.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(99,102,241,0.6)" }}>Suggested Steps</p>
            {msg.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black mt-0.5"
                  style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>{i + 1}</span>
                <p className="text-[12px] leading-relaxed" style={{ color: "#475569" }}>{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Option button ──────────────────────────────────────────────────────────────
function OptionButton({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: "rgba(99,102,241,0.06)",
        border: "1px solid rgba(99,102,241,0.2)",
        color: "#4f46e5",
      }}
    >
      {label}
    </button>
  );
}

// ── Main Chatbot ───────────────────────────────────────────────────────────────
export default function TroubleshootChatbot({ customer, onTicketCreated }) {
  const [open, setOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [phase, setPhase] = useState("select"); // select | questioning | resolved | escalated
  const [submitting, setSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(null);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  const addBotMessage = (content, steps) => {
    setMessages(prev => [...prev, { role: "bot", content, steps }]);
  };

  const addUserMessage = (content) => {
    setMessages(prev => [...prev, { role: "user", content }]);
  };

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
    setPhase("questioning");
    setCurrentQIndex(0);
    setAnswers({});
    setMessages([
      {
        role: "bot",
        content: `I can help with "${issue.label}". I'll ask you a few quick questions to diagnose the issue.\n\n${QUESTIONS[issue.id][0].text}`,
      }
    ]);
  };

  const handleAnswer = (option) => {
    const questions = QUESTIONS[selectedIssue.id];
    const currentQ = questions[currentQIndex];

    addUserMessage(option);
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);

    const nextIndex = currentQIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentQIndex(nextIndex);
      setTimeout(() => {
        addBotMessage(questions[nextIndex].text);
      }, 400);
    } else {
      // All questions answered — generate response
      setTimeout(() => {
        const response = generateResponse(selectedIssue.id, newAnswers);
        addBotMessage(response.message, response.steps);
        if (response.escalate) {
          setTimeout(() => {
            addBotMessage(
              `Based on your answers, this looks like an issue that needs our technical team. I'll automatically create a ${response.priority === "high" ? "🔴 HIGH PRIORITY" : "🟡 MEDIUM PRIORITY"} support ticket for you right now.`
            );
            setPhase("escalated");
            autoCreateTicket(response);
          }, 800);
        } else {
          setTimeout(() => {
            addBotMessage("Try these steps and let me know if they help. If the issue persists after following all steps, I can raise a support ticket for you.");
            setPhase("resolved");
          }, 800);
        }
      }, 500);
    }
  };

  const autoCreateTicket = async (response) => {
    if (!customer?.id) return;
    setSubmitting(true);
    const questionsList = QUESTIONS[selectedIssue.id];
    const answersText = questionsList
      .filter(q => answers[q.id])
      .map(q => `Q: ${q.text}\nA: ${answers[q.id]}`)
      .join("\n\n");

    const ticket = await base44.entities.Ticket.create({
      subject: `[AI Diagnosed] ${selectedIssue.label} - ${customer.full_name}`,
      description: `This ticket was automatically created by the AI troubleshooter.\n\nIssue Type: ${selectedIssue.label}\nDiagnosis: ${response.message?.replace(/\*\*/g, "")}\n\nQualifying Questions & Answers:\n${answersText}\n\nSuggested steps provided but issue requires technical investigation.`,
      customer_id: customer.id,
      customer_name: customer.full_name,
      ticket_number: `TKT-AI-${Date.now().toString().slice(-6)}`,
      status: "open",
      priority: response.priority || "high",
      category: response.category || "connectivity",
      department: "technical",
    });
    setTicketCreated(ticket);
    setSubmitting(false);
    queryClient.invalidateQueries({ queryKey: ["portal-tickets-main", customer.id] });
    if (onTicketCreated) onTicketCreated();
  };

  const manualCreateTicket = async () => {
    setSubmitting(true);
    const questionsList = QUESTIONS[selectedIssue.id];
    const answersText = questionsList
      .filter(q => answers[q.id])
      .map(q => `Q: ${q.text}\nA: ${answers[q.id]}`)
      .join("\n\n");

    const ticket = await base44.entities.Ticket.create({
      subject: `${selectedIssue.label} - Self-service steps not resolved`,
      description: `Customer followed AI troubleshooter steps but issue persists.\n\nIssue Type: ${selectedIssue.label}\n\nQualifying Questions & Answers:\n${answersText}`,
      customer_id: customer.id,
      customer_name: customer.full_name,
      ticket_number: `TKT-AI-${Date.now().toString().slice(-6)}`,
      status: "open",
      priority: "medium",
      category: "connectivity",
      department: "technical",
    });
    setTicketCreated(ticket);
    setSubmitting(false);
    addBotMessage(`✅ Ticket **${ticket.ticket_number}** has been created. Our team will follow up shortly.`);
    queryClient.invalidateQueries({ queryKey: ["portal-tickets-main", customer.id] });
    if (onTicketCreated) onTicketCreated();
    setPhase("done");
  };

  const resetChat = () => {
    setSelectedIssue(null);
    setMessages([]);
    setAnswers({});
    setCurrentQIndex(0);
    setPhase("select");
    setTicketCreated(null);
  };

  const currentQuestions = selectedIssue ? QUESTIONS[selectedIssue.id] : [];
  const currentOptions = phase === "questioning" && currentQuestions[currentQIndex]
    ? currentQuestions[currentQIndex].options
    : [];

  return (
    <>
      {/* ── FAB trigger ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[13px] font-bold text-white transition-all hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow: "0 6px 24px rgba(99,102,241,0.4)",
        }}
      >
        <Bot className="w-5 h-5" />
        AI Diagnostic Assistant
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(248,250,252,0.98)",
            border: "1px solid rgba(99,102,241,0.18)",
            boxShadow: "0 8px 40px rgba(99,102,241,0.12)",
          }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[14px] font-black text-white">AI Diagnostic Assistant</p>
                <p className="text-[10px] text-white/60">Powered by TouchNet AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedIssue && (
                <button onClick={resetChat}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white/70 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  Start Over
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Issue selector */}
          {phase === "select" && (
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex-1"
                  style={{ background: "white", border: "1px solid rgba(99,102,241,0.12)", boxShadow: "0 2px 12px rgba(99,102,241,0.06)" }}>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#1e293b" }}>
                    Hi! I'm your AI diagnostic assistant. Tell me what issue you're experiencing and I'll help diagnose it with a few quick questions.
                  </p>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-wider mb-3 px-1" style={{ color: "#94a3b8" }}>Select your issue</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ISSUE_TYPES.map(issue => {
                  const Icon = issue.icon;
                  return (
                    <button
                      key={issue.id}
                      onClick={() => handleIssueSelect(issue)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                      style={{
                        background: `${issue.color}08`,
                        border: `1px solid ${issue.color}22`,
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${issue.color}15`, border: `1px solid ${issue.color}25` }}>
                        <Icon className="w-4 h-4" style={{ color: issue.color }} />
                      </div>
                      <span className="text-[12px] font-bold leading-tight" style={{ color: "#334155" }}>{issue.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {phase !== "select" && (
            <div className="flex flex-col" style={{ maxHeight: 480 }}>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 200 }}>
                {messages.map((msg, i) => <Message key={i} msg={msg} />)}

                {/* Ticket created confirmation */}
                {(phase === "escalated" || phase === "done") && ticketCreated && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3"
                      style={{ background: "white", border: "1px solid rgba(16,185,129,0.25)", boxShadow: "0 2px 12px rgba(16,185,129,0.08)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <p className="text-[13px] font-black" style={{ color: "#059669" }}>Support Ticket Created</p>
                      </div>
                      <div className="rounded-xl px-3 py-2" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}>
                        <p className="text-[11px] font-bold mono" style={{ color: "#10b981" }}>{ticketCreated.ticket_number}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>{ticketCreated.subject}</p>
                        <p className="text-[10px] mt-1 font-semibold uppercase" style={{ color: ticketCreated.priority === "high" ? "#ef4444" : "#f59e0b" }}>
                          {ticketCreated.priority} priority
                        </p>
                      </div>
                      <p className="text-[11px] mt-2" style={{ color: "#64748b" }}>Our team will contact you shortly. You can track this in your Support tab.</p>
                    </div>
                  </div>
                )}

                {submitting && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3"
                      style={{ background: "white", border: "1px solid rgba(99,102,241,0.12)" }}>
                      <p className="text-[12px]" style={{ color: "#64748b" }}>Creating priority support ticket…</p>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Answer options */}
              {phase === "questioning" && currentOptions.length > 0 && (
                <div className="px-4 pb-4 pt-2 space-y-2 border-t" style={{ borderColor: "rgba(99,102,241,0.08)" }}>
                  {currentOptions.map((opt, i) => (
                    <OptionButton key={i} label={opt} onClick={() => handleAnswer(opt)} />
                  ))}
                </div>
              )}

              {/* Post-diagnosis actions */}
              {phase === "resolved" && !ticketCreated && (
                <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: "rgba(99,102,241,0.08)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "#94a3b8" }}>Steps didn't work?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={manualCreateTicket}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.3)" }}>
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TicketCheck className="w-3.5 h-3.5" />}
                      Raise Support Ticket
                    </button>
                    <button onClick={resetChat}
                      className="px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
                      style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#6366f1" }}>
                      Try Another Issue
                    </button>
                  </div>
                </div>
              )}

              {(phase === "escalated" || phase === "done") && ticketCreated && (
                <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: "rgba(99,102,241,0.08)" }}>
                  <button onClick={resetChat}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#6366f1" }}>
                    Diagnose Another Issue
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}