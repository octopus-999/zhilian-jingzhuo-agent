import { useAgentStore } from "../agent/store";
import DesktopCanvas from "../components/DesktopCanvas";
import { ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";

export default function Inspection() {
  const state = useAgentStore((s) => s.state);
  const residue = useAgentStore((s) => s.obstacleResidue);
  const secondaryCleaning = useAgentStore((s) => s.secondaryCleaning);
  const report = useAgentStore((s) => s.report);

  const passed = !residue && state !== "INSPECTING";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-800">AI 清洁质检</h2>
        <p className="text-sm text-slate-500 mt-1">
          清洁完成后 AI 重新扫描桌面，检测残留并自动决策是否执行二次定点清洁，形成「执行 → 检查 → 纠错 → 再检查」闭环。
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">质检桌面扫描</h3>
          <DesktopCanvas showDetections={false} showPath={false} height={300} />
        </div>

        <div className="col-span-5 space-y-4">
          {/* 质检结果 */}
          <div
            className={`rounded-lg border p-4 ${
              passed ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {passed ? (
                <ShieldCheck className="text-green-600" size={20} />
              ) : (
                <AlertTriangle className="text-amber-600" size={20} />
              )}
              <span className={`font-bold ${passed ? "text-green-700" : "text-amber-700"}`}>
                {passed ? "AI 质检通过" : "检测到残留"}
              </span>
            </div>
            <div className="text-xs mt-2 text-slate-600">
              {passed
                ? "未检测污渍残留，油污清洁率 97.8%，桌沿覆盖率 100%。"
                : "检测到 1 处局部油污残留，AI 自动启动二次定点清洁。"}
            </div>
          </div>

          {/* 闭环流程 */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">质检闭环流程</h3>
            <div className="space-y-2 text-xs">
              <FlowStep label="首次清洁执行" done={true} />
              <FlowStep label="AI 重新扫描桌面" done={state === "INSPECTING" || passed || secondaryCleaning} active={state === "INSPECTING"} />
              <FlowStep label="残留识别" done={residue || secondaryCleaning || passed} warning={residue} />
              <FlowStep label="二次定点清洁" done={secondaryCleaning || passed} />
              <FlowStep label="再次质检" done={passed} active={state === "CORRECTING"} />
              <FlowStep label="质检通过" done={passed} success />
            </div>
          </div>

          {report && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">质检指标</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Metric label="油污清洁率" value={`${report.metrics.oilCleanRate}%`} />
                <Metric label="桌沿覆盖率" value={`${report.metrics.edgeCoverage}%`} />
                <Metric label="二次清洁" value={`${report.secondaryCleaning} 次`} />
                <Metric label="质检结果" value={report.inspectionPassed ? "通过" : "不通过"} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 亮点说明 */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
          <RefreshCw size={16} /> AI 质检是本系统核心亮点
        </div>
        <div className="text-sm text-slate-600 grid grid-cols-2 gap-4">
          <div>
            <div className="font-medium text-slate-400 mb-1">传统机器人</div>
            <div>执行 → 结束（无法保证清洁效果）</div>
          </div>
          <div>
            <div className="font-medium text-blue-600 mb-1">本系统</div>
            <div>执行 → 检查 → 判断 → 纠错 → 再执行 → 再检查（完整闭环）</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({
  label,
  done,
  active,
  warning,
  success,
}: {
  label: string;
  done?: boolean;
  active?: boolean;
  warning?: boolean;
  success?: boolean;
}) {
  const color = success ? "bg-green-500" : warning ? "bg-amber-500" : done ? "bg-blue-500" : active ? "bg-blue-400 breathing" : "bg-slate-300";
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className={done ? "text-slate-700" : "text-slate-400"}>{label}</span>
      {active && <span className="text-blue-500 text-[10px]">进行中</span>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded p-2 text-center">
      <div className="text-slate-400">{label}</div>
      <div className="font-semibold text-slate-700">{value}</div>
    </div>
  );
}
