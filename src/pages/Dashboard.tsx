import { useState } from "react";
import { Play, Mic, Sparkles, RotateCcw } from "lucide-react";
import { useAgentStore } from "../agent/store";
import { runAgentWorkflow } from "../agent/workflow";
import { MODE_PARAMS, PROJECT_METRICS, STATE_LABELS } from "../data/mockData";
import type { WorkMode } from "../types";
import type { PageKey } from "../App";
import DesktopCanvas from "../components/DesktopCanvas";
import AgentWorkflow from "../components/AgentWorkflow";
import WorkflowLog from "../components/WorkflowLog";
import ChatPanel from "../components/ChatPanel";

interface Props {
  setPage: (p: PageKey) => void;
}

const QUICK_TASKS: { label: string; mode: WorkMode; task: string }[] = [
  { label: "开始快速清洁", mode: "fast", task: "请帮我快速清洁餐桌" },
  { label: "执行标准清洁", mode: "standard", task: "请帮我把餐桌清洁干净" },
  { label: "执行深度清洁", mode: "deep", task: "启动深度清洁模式" },
  { label: "清理油污", mode: "deep", task: "重点清理桌面上的油污" },
  { label: "清理餐桌", mode: "standard", task: "请帮我清理这张餐桌" },
  { label: "儿童房专项", mode: "child", task: "儿童房专项清洁模式" },
];

export default function Dashboard({ setPage }: Props) {
  const [input, setInput] = useState("");
  const isRunning = useAgentStore((s) => s.isRunning);
  const mode = useAgentStore((s) => s.mode);
  const reset = useAgentStore((s) => s.reset);
  const detectedObjects = useAgentStore((s) => s.detectedObjects);

  const startTask = (task: string, m: WorkMode) => {
    runAgentWorkflow(task, m);
  };

  const handleSubmit = () => {
    const txt = input.trim() || "请帮我清洁餐桌";
    const m: WorkMode = txt.includes("深度") ? "deep" : txt.includes("快速") ? "fast" : txt.includes("儿童") ? "child" : "standard";
    startTask(txt, m);
  };

  const solid = detectedObjects.filter((o) => o.cls === "固体垃圾").length;
  const oil = detectedObjects.filter((o) => o.cls === "液态油污").length;
  const water = detectedObjects.filter((o) => o.cls === "汤汁水渍").length;
  const obstacle = detectedObjects.filter((o) => o.cls === "遗留物品" || o.cls === "桌面障碍物").length;

  return (
    <div className="space-y-4">
      {/* 顶部标题区 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-5 text-white">
        <h2 className="text-xl font-bold">AI 驱动的家庭桌面智能清洁中枢</h2>
        <p className="text-blue-100 text-sm mt-1">感知 · 决策 · 执行 · 质检 —— 全闭环 AI 智能体</p>
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => startTask("请帮我把这张餐桌清洁干净，桌面上的水杯不要碰。", "standard")}
            disabled={isRunning}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles size={16} /> 一键体验 AI 全流程
          </button>
          <button
            onClick={reset}
            className="bg-blue-700/40 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700/60 flex items-center gap-1.5"
          >
            <RotateCcw size={16} /> 重置
          </button>
        </div>
      </div>

      {/* Agent 工作流状态机 */}
      <AgentWorkflow />

      {/* 主体三栏 */}
      <div className="grid grid-cols-12 gap-4">
        {/* 左侧：用户请求 + AI 实时决策面板 + 工作流日志 */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">用户请求输入</h3>
            <div className="space-y-2 mb-3">
              {QUICK_TASKS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => startTask(t.task, t.mode)}
                  disabled={isRunning}
                  className="w-full text-left px-3 py-1.5 rounded-md text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="输入指令，例如：清洁餐桌，水杯别碰"
                className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
              />
              <button onClick={handleSubmit} className="bg-blue-600 text-white px-2 rounded text-xs">
                <Play size={14} />
              </button>
            </div>
            <button className="w-full mt-2 border border-slate-300 rounded py-1.5 text-xs text-slate-500 flex items-center justify-center gap-1 hover:bg-slate-50">
              <Mic size={12} /> 语音输入
            </button>
          </div>

          {/* AI 实时决策面板 */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">AI 实时决策面板</h3>
            <DecisionPanel />
          </div>

          {/* AI Agent Workflow 日志（左侧底部） */}
          <div className="h-64">
            <WorkflowLog />
          </div>
        </div>

        {/* 中间：桌面可视化 */}
        <div className="col-span-6 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700">桌面环境可视化</h3>
              <button onClick={() => setPage("perception")} className="text-xs text-blue-600 hover:underline">
                查看感知详情 →
              </button>
            </div>
            <DesktopCanvas showDetections showPath />
            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
              <div className="bg-amber-50 rounded p-2">
                <div className="text-lg font-bold text-amber-600">{solid}</div>
                <div className="text-[10px] text-slate-500">固体垃圾</div>
              </div>
              <div className="bg-orange-50 rounded p-2">
                <div className="text-lg font-bold text-orange-600">{oil}</div>
                <div className="text-[10px] text-slate-500">液态油污</div>
              </div>
              <div className="bg-cyan-50 rounded p-2">
                <div className="text-lg font-bold text-cyan-600">{water}</div>
                <div className="text-[10px] text-slate-500">汤汁水渍</div>
              </div>
              <div className="bg-blue-50 rounded p-2">
                <div className="text-lg font-bold text-blue-600">{obstacle}</div>
                <div className="text-[10px] text-slate-500">障碍物</div>
              </div>
            </div>
          </div>

          {/* 项目设计/实验指标 */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">项目设计/实验指标</h3>
            <ul className="text-xs space-y-1 text-slate-600">
              <li>单桌清洁时间：{PROJECT_METRICS.singleTableTime}</li>
              <li>油污清洁率：{PROJECT_METRICS.oilCleanRate}</li>
              <li>桌沿覆盖率：{PROJECT_METRICS.edgeCoverage}</li>
              <li>避障成功率：{PROJECT_METRICS.avoidSuccessRate}</li>
              <li>设备续航：{PROJECT_METRICS.battery}</li>
              <li>通信延迟：{PROJECT_METRICS.commLatency}</li>
            </ul>
            <p className="text-[10px] text-slate-400 mt-2">* 项目设计/实验指标</p>
          </div>
        </div>

        {/* 右侧：对话 */}
        <div className="col-span-3 h-[500px]">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}

// AI 实时决策面板（根据状态动态显示）
function DecisionPanel() {
  const state = useAgentStore((s) => s.state);
  const mode = useAgentStore((s) => s.mode);
  const detectedObjects = useAgentStore((s) => s.detectedObjects);
  const progress = useAgentStore((s) => s.progress);
  const obstacleActive = useAgentStore((s) => s.obstacleActive);
  const residue = useAgentStore((s) => s.obstacleResidue);

  const oil = detectedObjects.filter((o) => o.cls === "液态油污").length;
  const obstacle = detectedObjects.filter((o) => o.cls === "遗留物品" || o.cls === "桌面障碍物").length;

  const params = MODE_PARAMS[mode];

  const items: { label: string; value: string }[] = [];
  items.push({ label: "当前状态", value: STATE_LABELS[state] });
  items.push({ label: "工作模式", value: mode === "fast" ? "日常快速" : mode === "deep" ? "深度清洁" : mode === "child" ? "儿童房" : "标准清洁" });
  items.push({ label: "喷水量", value: `${params.waterRate}x` });
  items.push({ label: "滚刷转速", value: `${params.rollSpeed}x` });
  items.push({ label: "清洁进度", value: `${progress}%` });

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {items.map((it) => (
          <div key={it.label} className="bg-slate-50 rounded p-2 text-center">
            <div className="text-[10px] text-slate-400">{it.label}</div>
            <div className="text-sm font-semibold text-slate-700">{it.value}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-600 space-y-1.5 bg-blue-50/50 rounded p-3">
        <div><span className="text-slate-400">【当前观察】</span>发现重油污区域 {oil} 处，障碍物 {obstacle} 个。</div>
        <div><span className="text-slate-400">【约束条件】</span>{obstacle > 0 ? "附近存在遗留物品，需避让。" : "无特殊约束。"}</div>
        <div><span className="text-slate-400">【AI 决策】</span>提高油污区域优先级；{obstacle > 0 ? "绕行障碍物；" : ""}调用子机滚刷模块；完成后执行 AI 质检。</div>
        {obstacleActive && (
          <div className="text-amber-600"><span>【实时事件】</span>检测到新障碍物，已暂停并重新规划路径。</div>
        )}
        {residue && (
          <div className="text-purple-600"><span>【质检结果】</span>发现残留油污，启动二次定点清洁。</div>
        )}
      </div>
    </div>
  );
}
