import { useAgentStore } from "../agent/store";
import { STATE_LABELS } from "../data/mockData";

export default function Collaboration() {
  const subRobot = useAgentStore((s) => s.subRobot);
  const motherRobot = useAgentStore((s) => s.motherRobot);
  const state = useAgentStore((s) => s.state);
  const isRunning = useAgentStore((s) => s.isRunning);

  const activeLine = isRunning;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-800">子母机器人协同执行中心</h2>
        <p className="text-sm text-slate-500 mt-1">
          AI Agent 统一调度子机器人与母机器人，通过 RS485 通信完成协同作业。
        </p>
      </div>

      {/* 协同动画示意图 */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <svg viewBox="0 0 800 320" className="w-full h-auto">
          {/* AI Agent 中枢 */}
          <g>
            <circle cx={400} cy={60} r={36} fill="#2563eb" />
            <circle cx={400} cy={60} r={44} fill="none" stroke="#3b82f6" strokeWidth={2} opacity={activeLine ? 0.6 : 0.2} className={activeLine ? "breathing" : ""} />
            <text x={400} y={65} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">
              AI Agent
            </text>
          </g>

          {/* 连线到各模块 */}
          {[
            { x: 120, y: 180, label: "视觉感知" },
            { x: 280, y: 180, label: "路径规划" },
            { x: 520, y: 180, label: "子机控制" },
            { x: 680, y: 180, label: "母机控制" },
          ].map((m) => (
            <g key={m.label}>
              <line
                x1={400}
                y1={96}
                x2={m.x}
                y2={160}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6 3"
                className={activeLine ? "flow-path" : ""}
                opacity={activeLine ? 0.7 : 0.25}
              />
              <circle cx={m.x} cy={180} r={28} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.5} />
              <text x={m.x} y={184} textAnchor="middle" fill="#1e40af" fontSize={11} fontWeight="bold">
                {m.label}
              </text>
            </g>
          ))}

          {/* 母机 - 升降 - 子机 - 桌面 流程 */}
          <g transform="translate(0, 240)">
            <FlowNode x={140} label="母机器人" color="#475569" status={motherRobot} />
            <FlowArrow x1={180} x2={250} active={activeLine} />
            <FlowNode x={300} label="升降机构" color="#64748b" status="升降" />
            <FlowArrow x1={340} x2={410} active={activeLine} />
            <FlowNode x={460} label="子机器人" color="#2563eb" status={subRobot} />
            <FlowArrow x1={500} x2={570} active={activeLine} />
            <FlowNode x={620} label="桌面作业" color="#059669" status="清洁中" />
          </g>
        </svg>
      </div>

      {/* 状态卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <StatusCard title="子机器人" status={subRobot} color="blue" />
        <StatusCard title="母机器人" status={motherRobot} color="slate" />
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">RS485 通信</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full ${activeLine ? "bg-green-500 breathing" : "bg-slate-400"}`} />
            <span className="text-sm text-slate-600">连接正常</span>
          </div>
          <div className="text-xs text-slate-400">延迟：8ms · 波特率：115200</div>
          <div className="text-xs text-slate-400">当前 Agent 状态：{STATE_LABELS[state]}</div>
        </div>
      </div>

      {/* AI 调度说明 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">AI 调度关系</h3>
        <div className="text-sm text-slate-600 space-y-1.5">
          <p>• AI Agent → 视觉感知模块：获取桌面目标识别结果</p>
          <p>• AI Agent → 路径规划模块：根据污染分布生成动态清洁路径</p>
          <p>• AI Agent → 子机控制模块：下发移动、喷水、滚刷、盘刷指令</p>
          <p>• AI Agent → 母机控制模块：控制剪叉升降、子机投放/回收、供电</p>
          <p>• AI Agent → 质检模块：清洁完成后复检，必要时触发二次清洁</p>
        </div>
      </div>
    </div>
  );
}

function FlowNode({ x, label, color, status }: { x: number; label: string; color: string; status: string }) {
  return (
    <g>
      <rect x={x - 44} y={-22} width={88} height={44} rx={8} fill={color} opacity={0.85} />
      <text x={x} y={-4} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold">
        {label}
      </text>
      <text x={x} y={12} textAnchor="middle" fill="#e2e8f0" fontSize={9}>
        {status}
      </text>
    </g>
  );
}

function FlowArrow({ x1, x2, active }: { x1: number; x2: number; active: boolean }) {
  return (
    <g>
      <line x1={x1} y1={0} x2={x2} y2={0} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 3" className={active ? "flow-path" : ""} opacity={active ? 0.7 : 0.3} />
      <polygon points={`${x2},0 ${x2 - 6},-4 ${x2 - 6},4`} fill="#3b82f6" opacity={active ? 0.7 : 0.3} />
    </g>
  );
}

function StatusCard({ title, status, color }: { title: string; status: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${colorMap[color]}`}>
        {status}
      </span>
    </div>
  );
}
