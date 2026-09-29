import { useState } from "react";
import {
  LayoutDashboard,
  Eye,
  BrainCircuit,
  Cpu,
  Activity,
  ShieldCheck,
  FileText,
  HelpCircle,
  X,
} from "lucide-react";
import type { PageKey } from "../App";
import { useAgentStore } from "../agent/store";
import { STATE_LABELS } from "../data/mockData";

interface Props {
  page: PageKey;
  setPage: (p: PageKey) => void;
  children: React.ReactNode;
}

const NAV: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "AI 总控中心", icon: <LayoutDashboard size={18} /> },
  { key: "perception", label: "AI 视觉感知", icon: <Eye size={18} /> },
  { key: "decision", label: "AI 决策规划", icon: <BrainCircuit size={18} /> },
  { key: "collaboration", label: "子母协同", icon: <Cpu size={18} /> },
  { key: "execution", label: "执行监控", icon: <Activity size={18} /> },
  { key: "inspection", label: "AI 质检", icon: <ShieldCheck size={18} /> },
  { key: "report", label: "任务报告", icon: <FileText size={18} /> },
];

const STATUS_ITEMS = [
  { label: "系统在线", key: "sys" },
  { label: "AI Agent", key: "ai" },
  { label: "视觉感知", key: "vis" },
  { label: "子机在线", key: "sub" },
  { label: "母机在线", key: "mother" },
  { label: "通信正常", key: "comm" },
];

export default function Layout({ page, setPage, children }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const agentState = useAgentStore((s) => s.state);
  const currentTask = useAgentStore((s) => s.currentTask);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* 左侧导航 */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-base font-bold text-blue-700">智联净桌</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">AI 智能清洁中枢</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setPage(n.key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${page === n.key
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="text-[11px] text-slate-400">系统版本 v1.0</div>
        </div>
      </aside>

      {/* 主区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部状态栏 */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${agentState === "IDLE" ? "bg-slate-400" : "bg-green-500 breathing"
                }`}
            />
            <span className="text-sm font-medium text-slate-700">
              Agent: {STATE_LABELS[agentState]}
            </span>
          </div>
          <div className="text-sm text-slate-500">当前任务：{currentTask}</div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-3">
            {STATUS_ITEMS.map((it) => (
              <div key={it.key} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500">{it.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowHelp(true)}
            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100"
            title="使用说明"
          >
            <HelpCircle size={16} />
          </button>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto p-5">{children}</main>
      </div>

      {/* 使用说明 Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">使用说明 / 系统介绍</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 text-sm text-slate-700 space-y-3 leading-relaxed">
          <section>
            <h4 className="font-semibold text-blue-700 mb-1">1. 系统是什么</h4>
            <p>智联净桌是一套由 AI Agent 驱动的桌面清洁智能体系统，核心闭环为「感知 → 决策 → 执行 → 质检」。</p>
          </section>
          <section>
            <h4 className="font-semibold text-blue-700 mb-1">2. AI Agent 负责什么</h4>
            <p>负责任务理解、桌面环境感知、污染目标识别、差异化清洁策略生成、子母机器人协同调度、执行监控、清洁效果质检与二次补净决策。</p>
          </section>
          <section>
            <h4 className="font-semibold text-blue-700 mb-1">3. 如何开始一次清洁任务</h4>
            <p>在「AI 总控中心」输入清洁指令，或点击快捷任务按钮，系统将自动跑完整个 Agent 工作流。</p>
          </section>
          <section>
            <h4 className="font-semibold text-blue-700 mb-1">4. 如何使用一键清洁流程</h4>
            <p>在总控中心点击「一键体验 AI 全流程」，系统将按节奏执行：接收请求 → 视觉识别 → 策略决策 → 子母协同 → 执行（含避障）→ AI质检 → 残留二次清洁 → 最终报告。</p>
          </section>
          <section>
            <h4 className="font-semibold text-blue-700 mb-1">5. 如何观察 AI 决策</h4>
            <p>右侧「AI 实时决策面板」与底部「Agent 工作流日志」会按时间轴展示每个阶段的结构化决策依据。</p>
          </section>
          <section>
            <h4 className="font-semibold text-blue-700 mb-1">6. 如何查看路径规划</h4>
            <p>进入「AI 决策规划」页，可查看清洁单元网格、污染优先级与 AI 动态规划路径。</p>
          </section>
          <section>
            <h4 className="font-semibold text-blue-700 mb-1">7. 如何查看子母机协同</h4>
            <p>进入「子母协同」页，可查看母机升降、子机投放/清洁/回收的状态与 AI 调度关系。</p>
          </section>
          <section>
            <h4 className="font-semibold text-blue-700 mb-1">8. 如何查看 AI 质检</h4>
            <p>进入「AI 质检」页，查看清洁后复检、残留识别、二次定点清洁与最终质检结果。</p>
          </section>
          <section>
            <h4 className="font-semibold text-blue-700 mb-1">9. 系统数据说明</h4>
            <p>系统实时呈现桌面检测目标、机器人运行状态、动态清洁路径与质检结果，所有状态随清洁过程同步更新。</p>
          </section>
        </div>
      </div>
    </div>
  );
}
