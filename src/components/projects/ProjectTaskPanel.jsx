import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Lock, ChevronRight, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const TASKS = [
  {
    key: "welcome_communication",
    title: "Task 1: Welcome Communication",
    description: "Submit Client Take-On Form and send welcome email to client.",
    requires_approval: false,
    checklist: ["Send client take-on form", "Send welcome email"],
  },
  {
    key: "vendor_process",
    title: "Task 2: Vendor Process",
    description: "Sign vendor quote, submit PO, send PO to vendor. Update client on project status.",
    requires_approval: true,
    checklist: ["Sign vendor quote", "Submit for PO", "Send PO to vendor", "Send client status update"],
  },
  {
    key: "internal_cutover_booking",
    title: "Task 3: Book TNET Engineer – Internal Cutover",
    description: "Internal booking for TNET engineer to perform the cutover.",
    requires_approval: false,
    checklist: ["Book engineer for internal cutover"],
  },
  {
    key: "engineer_onsite_booking",
    title: "Task 4: TNET Engineer – Onsite Cutover",
    description: "Engineer booked and confirmed onsite for cutover.",
    requires_approval: false,
    checklist: ["Confirm engineer onsite booking", "Confirm date with client"],
  },
  {
    key: "iris_monitoring",
    title: "Task 5: IRIS – Device Monitoring",
    description: "Engineer to update Ops Manager with Circuit ID and Monitoring IP.",
    requires_approval: false,
    checklist: ["Update Circuit ID", "Update Monitoring IP", "Confirm IRIS monitoring active"],
  },
  {
    key: "activate_contract",
    title: "Task 6: Activate Contract",
    description: "Activate the client contract and send activation email.",
    requires_approval: true,
    checklist: ["Activate contract in system", "Send activation email to client"],
  },
  {
    key: "tnet_billing",
    title: "Task 7: TNet Invoice Billing",
    description: "Generate and send invoice for the project.",
    requires_approval: false,
    checklist: ["Generate invoice", "Send invoice to client", "Mark project as billed"],
  },
];

export default function ProjectTaskPanel({ project, onRefresh }) {
  const qc = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["project-tasks", project.id],
    queryFn: () => base44.entities.ProjectTask.filter({ project_id: project.id }),
  });

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.ProjectTask.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project-tasks", project.id] }),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectTask.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-tasks", project.id] });
      onRefresh();
    },
  });

  const updateProject = useMutation({
    mutationFn: (data) => base44.entities.FibreProject.update(project.id, data),
    onSuccess: () => onRefresh(),
  });

  const getTaskRecord = (key) => tasks.find(t => t.task_key === key);
  const currentIdx = project.current_task_index || 0;

  const handleCompleteTask = (taskDef, idx) => {
    const existing = getTaskRecord(taskDef.key);
    const now = new Date().toISOString();
    const payload = { status: "completed", completed_date: now };
    if (existing) {
      updateTask.mutate({ id: existing.id, data: payload });
    } else {
      createTask.mutate({
        project_id: project.id,
        quote_number: project.quote_number,
        task_index: idx,
        task_key: taskDef.key,
        title: taskDef.title,
        status: "completed",
        completed_date: now,
        requires_approval: taskDef.requires_approval,
      });
    }
    // Advance project task index
    if (idx >= currentIdx) {
      updateProject.mutate({ current_task_index: idx + 1 });
    }
    // Auto actions
    if (taskDef.key === "welcome_communication") {
      updateProject.mutate({ welcome_email_sent: true, current_task_index: idx + 1 });
    }
    if (taskDef.key === "activate_contract") {
      updateProject.mutate({ contract_activated: true, activation_email_sent: true, current_task_index: idx + 1 });
    }
    if (taskDef.key === "tnet_billing") {
      updateProject.mutate({ status: "billed", billing_start_date: now.slice(0,10), current_task_index: idx + 1 });
    }
  };

  return (
    <div className="p-5 space-y-3">
      <p className="text-xs text-slate-500 mb-4">Tasks must be completed in order. The next task unlocks only after the current one is marked complete.</p>
      {TASKS.map((taskDef, idx) => {
        const record = getTaskRecord(taskDef.key);
        const isCompleted = record?.status === "completed";
        const isActive = idx === currentIdx && !isCompleted;
        const isLocked = idx > currentIdx;

        return (
          <div key={taskDef.key}
            className={`rounded-xl p-4 transition-all ${isLocked ? "opacity-50" : ""}`}
            style={{
              background: isCompleted ? "rgba(16,185,129,0.06)" : isActive ? "rgba(99,102,241,0.08)" : "#fff",
              border: `1px solid ${isCompleted ? "rgba(16,185,129,0.2)" : isActive ? "rgba(99,102,241,0.25)" : "rgba(0,0,0,0.07)"}`,
            }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : isLocked ? (
                  <Lock className="w-5 h-5 text-slate-300" />
                ) : (
                  <Circle className="w-5 h-5 text-indigo-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-semibold ${isCompleted ? "text-emerald-700" : isActive ? "text-indigo-700" : "text-slate-600"}`}>
                    {taskDef.title}
                  </p>
                  {taskDef.requires_approval && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#d97706" }}>
                      Requires Approval
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{taskDef.description}</p>

                {/* Checklist */}
                <ul className="mt-2 space-y-1">
                  {taskDef.checklist.map(item => (
                    <li key={item} className="flex items-center gap-1.5">
                      {isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                      <span className="text-[11px] text-slate-500">{item}</span>
                    </li>
                  ))}
                </ul>

                {isCompleted && record?.completed_date && (
                  <p className="text-[10px] text-emerald-600 mt-1.5">Completed: {new Date(record.completed_date).toLocaleString()}</p>
                )}

                {isActive && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleCompleteTask(taskDef, idx)}
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Mark as Complete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}