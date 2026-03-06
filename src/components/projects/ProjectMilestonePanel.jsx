import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const MILESTONES = [
  { key: "site_survey", title: "Site Survey" },
  { key: "planning_lla", title: "Planning Documents & LLA" },
  { key: "wayleave_process", title: "Wayleave Process" },
  { key: "civil_build", title: "Civil Build" },
  { key: "optical_build", title: "Optical Build" },
  { key: "test_handover", title: "Test & Vendor Handover Document" },
  { key: "cutover", title: "Cutover" },
  { key: "go_live", title: "Go Live" },
];

const STATUS_ICONS = {
  not_started: <Circle className="w-4 h-4 text-slate-300" />,
  in_progress: <Clock className="w-4 h-4 text-blue-400" />,
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  blocked: <AlertCircle className="w-4 h-4 text-red-400" />,
};

export default function ProjectMilestonePanel({ project }) {
  const qc = useQueryClient();

  const { data: milestones = [] } = useQuery({
    queryKey: ["project-milestones", project.id],
    queryFn: () => base44.entities.ProjectMilestone.filter({ project_id: project.id }),
  });

  const upsert = useMutation({
    mutationFn: async ({ key, data }) => {
      const existing = milestones.find(m => m.milestone_key === key);
      if (existing) {
        return base44.entities.ProjectMilestone.update(existing.id, data);
      } else {
        return base44.entities.ProjectMilestone.create({
          project_id: project.id,
          quote_number: project.quote_number,
          milestone_key: key,
          title: MILESTONES.find(m => m.key === key)?.title || key,
          ...data,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project-milestones", project.id] }),
  });

  const getMilestone = (key) => milestones.find(m => m.milestone_key === key) || {};

  return (
    <div className="p-5">
      <p className="text-xs text-slate-500 mb-4">Track each vendor milestone for this project. Update status and forecast dates as the project progresses.</p>
      <div className="space-y-3">
        {MILESTONES.map((ms, idx) => {
          const record = getMilestone(ms.key);
          const status = record.status || "not_started";
          return (
            <div key={ms.key} className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              style={{ background: status === "completed" ? "rgba(16,185,129,0.06)" : "#fff", border: `1px solid ${status === "completed" ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.1)"}` }}>
              <div className="flex items-center gap-3 flex-1">
                {STATUS_ICONS[status]}
                <div>
                  <p className="text-sm font-semibold text-slate-700">{idx + 1}. {ms.title}</p>
                  {record.completed_date && (
                    <p className="text-[10px] text-emerald-600">Completed: {record.completed_date}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={status} onValueChange={v => upsert.mutate({ key: ms.key, data: { status: v, completed_date: v === "completed" ? new Date().toISOString().slice(0,10) : record.completed_date } })}>
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  className="h-7 text-xs w-36"
                  placeholder="Forecast date"
                  value={record.forecasted_date || ""}
                  onChange={e => upsert.mutate({ key: ms.key, data: { ...record, forecasted_date: e.target.value } })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}