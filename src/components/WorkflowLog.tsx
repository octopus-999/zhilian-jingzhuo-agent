import { useEffect, useRef } from "react";
import { useAgentStore } from "../agent/store";
import { EVENT_LABELS } from "../data/mockData";

// Agent 工作流日志
export default function WorkflowLog() {
  const events = useAgentStore((s) => s.events);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [events]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 flex flex-col h-full">
      <div className="px-4 py-2 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">AI Agent Workflow 日志</h3>
      </div>
      <div ref={ref} className="flex-1 overflow-auto p-3 space-y-1.5 font-mono text-xs">
        {events.length === 0 && (
          <div className="text-slate-400">等待任务启动……点击「一键体验 AI 全流程」开始。</div>
        )}
        {events.map((e) => {
          const t = new Date(e.timestamp);
          const time = t.toLocaleTimeString("zh-CN", { hour12: false });
          const label = EVENT_LABELS[e.type] || e.type;
          const color =
            e.type === "OBSTACLE_DETECTED" || e.type === "RESIDUE_DETECTED"
              ? "text-amber-600"
              : e.type === "TASK_COMPLETED"
              ? "text-green-600"
              : e.type === "SECONDARY_CLEANING"
              ? "text-purple-600"
              : "text-slate-600";
          return (
            <div key={e.id} className={color}>
              <span className="text-slate-400">{time}</span>{" "}
              <span className="font-semibold">{label}</span>
              <div className="ml-1 text-slate-500">{e.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
