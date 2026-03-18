import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const COLUMNS = [
  { key: "lead",        label: "Lead",        color: "#94a3b8", bg: "rgba(148,163,184,0.08)",  border: "rgba(148,163,184,0.2)" },
  { key: "quoted",      label: "Quoted",      color: "#f59e0b", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.2)" },
  { key: "approved",    label: "Approved",    color: "#3b82f6", bg: "rgba(59,130,246,0.08)",   border: "rgba(59,130,246,0.2)" },
  { key: "in_progress", label: "In Progress", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",   border: "rgba(139,92,246,0.2)" },
  { key: "testing",     label: "Testing",     color: "#06b6d4", bg: "rgba(6,182,212,0.08)",    border: "rgba(6,182,212,0.2)" },
  { key: "live",        label: "Live",        color: "#10b981", bg: "rgba(16,185,129,0.08)",   border: "rgba(16,185,129,0.2)" },
  { key: "billed",      label: "Billed",      color: "#6366f1", bg: "rgba(99,102,241,0.08)",   border: "rgba(99,102,241,0.2)" },
  { key: "cancelled",   label: "Cancelled",   color: "#ef4444", bg: "rgba(239,68,68,0.08)",    border: "rgba(239,68,68,0.2)" },
];

function ProjectKanbanCard({ project, index, onClick }) {
  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(project)}
          className="bg-white rounded-xl p-3 mb-2 cursor-pointer select-none transition-shadow"
          style={{
            border: "1px solid rgba(99,102,241,0.1)",
            boxShadow: snapshot.isDragging
              ? "0 8px 24px rgba(99,102,241,0.2)"
              : "0 1px 4px rgba(0,0,0,0.04)",
            ...provided.draggableProps.style,
          }}
        >
          <p className="text-[12px] font-semibold text-slate-800 leading-snug line-clamp-2">{project.project_name}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{project.quote_number}</p>
          {project.customer_name && (
            <p className="text-[11px] text-slate-500 mt-1 truncate">{project.customer_name}</p>
          )}
          {(project.annuity_amount > 0 || project.once_off_amount > 0) && (
            <div className="mt-2 flex gap-2">
              {project.annuity_amount > 0 && (
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-mono">
                  R{project.annuity_amount.toLocaleString()}/mo
                </span>
              )}
              {project.once_off_amount > 0 && (
                <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-mono">
                  R{project.once_off_amount.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default function ProjectKanbanBoard({ projects, onStatusChange, onProjectClick }) {
  const [isDragging, setIsDragging] = useState(false);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = projects.filter(p => p.status === col.key);
    return acc;
  }, {});

  const onDragStart = () => setIsDragging(true);

  const onDragEnd = (result) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    onStatusChange(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "60vh" }}>
        {COLUMNS.map(col => {
          const items = grouped[col.key] || [];
          return (
            <div
              key={col.key}
              className="flex-shrink-0 rounded-2xl flex flex-col"
              style={{
                width: 220,
                background: col.bg,
                border: `1px solid ${col.border}`,
              }}
            >
              {/* Column header */}
              <div className="px-3 py-2.5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${col.border}` }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-[12px] font-bold" style={{ color: col.color }}>{col.label}</span>
                </div>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${col.color}22`, color: col.color }}>
                  {items.length}
                </span>
              </div>

              {/* Drop zone */}
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 p-2 transition-all rounded-b-2xl"
                    style={{
                      background: snapshot.isDraggingOver ? `${col.color}18` : "transparent",
                      minHeight: 80,
                    }}
                  >
                    {items.map((project, index) => (
                      <ProjectKanbanCard
                        key={project.id}
                        project={project}
                        index={index}
                        onClick={onProjectClick}
                      />
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-[10px] text-center py-6 opacity-40" style={{ color: col.color }}>
                        Drop here
                      </p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}