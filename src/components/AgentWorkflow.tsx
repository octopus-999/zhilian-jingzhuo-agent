import { useAgentStore } from "../agent/store";
import { STATE_ORDER, STATE_LABELS } from "../data/mockData";

// Agent 状态机工作流时间轴
export default function AgentWorkflow() {
  const state = useAgentStore((s) => s.state);
  const currentIndex = STATE_ORDER.indexOf(state);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">AI Agent 工作流状态机</h3>
      <div className="flex flex-wrap items-center gap-1">
        {STATE_ORDER.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={s} className="flex items-center">
              <div
                className={`px-2 py-1 rounded text-[11px] whitespace-nowrap transition ${
                  active
                    ? "bg-blue-600 text-white font-medium shadow"
                    : done
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {STATE_LABELS[s]}
              </div>
              {i < STATE_ORDER.length - 1 && (
                <span className={`mx-0.5 text-xs ${done ? "text-green-400" : "text-slate-300"}`}>→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
