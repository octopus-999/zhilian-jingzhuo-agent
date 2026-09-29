import { useAgentStore } from "../agent/store";
import { PROJECT_METRICS } from "../data/mockData";

export default function Report() {
  const report = useAgentStore((s) => s.report);
  const events = useAgentStore((s) => s.events);

  if (!report) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-800">任务结果报告</h2>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-400">
          暂无报告，请先在「AI 总控中心」点击「一键体验 AI 全流程」完成一次清洁任务。
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-800">任务结果报告</h2>
        <p className="text-sm text-slate-500 mt-1">本次任务由 AI Agent 自主完成任务理解、环境分析、策略决策、执行调度和结果质检。</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 左：任务概要 */}
        <div className="col-span-8 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">任务概要</h3>
            <div className="grid grid-cols-2 gap-3">
              <Info label="任务名称" value={report.taskName} />
              <Info label="任务耗时" value={`${report.duration} 秒`} />
              <Info label="清洁完成" value={`${report.cleanCompletion}%`} />
              <Info label="AI 质检" value={report.inspectionPassed ? "通过" : "不通过"} />
              <Info label="二次清洁" value={`${report.secondaryCleaning} 次`} />
              <Info label="路径优化" value={`${report.pathOptimization}%`} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">识别污染与避障</h3>
            <div className="grid grid-cols-4 gap-2">
              <Stat label="固体垃圾" value={report.detected.solid} color="text-amber-600" />
              <Stat label="油污" value={report.detected.oil} color="text-orange-600" />
              <Stat label="水渍" value={report.detected.water} color="text-cyan-600" />
              <Stat label="避障次数" value={report.obstacleAvoided} color="text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">AI 为什么这样做？（决策依据）</h3>
            <ul className="text-sm space-y-2 text-slate-600">
              {report.reasons.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">项目价值（项目设计/实验指标）</h3>
            <div className="grid grid-cols-3 gap-2">
              <ValueItem label="油污清洁率" value={PROJECT_METRICS.oilCleanRate} />
              <ValueItem label="桌沿覆盖率" value={PROJECT_METRICS.edgeCoverage} />
              <ValueItem label="避障成功率" value={PROJECT_METRICS.avoidSuccessRate} />
              <ValueItem label="单桌清洁" value={PROJECT_METRICS.singleTableTime} />
              <ValueItem label="设备续航" value={PROJECT_METRICS.battery} />
              <ValueItem label="通信延迟" value={PROJECT_METRICS.commLatency} />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">* 项目设计/实验指标</p>
          </div>
        </div>

        {/* 右：质检指标 */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">本次质检指标</h3>
            <div className="space-y-3">
              <Bar label="油污清洁率" value={report.metrics.oilCleanRate} color="bg-green-500" />
              <Bar label="桌沿覆盖率" value={report.metrics.edgeCoverage} color="bg-blue-500" />
              <Bar label="清洁完成度" value={report.cleanCompletion} color="bg-teal-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">任务状态</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-green-600 font-semibold">已完成</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              本次任务由 AI Agent 自主完成任务理解、环境分析、策略决策、执行调度和结果质检。
            </p>
          </div>
        </div>
      </div>

      {/* 事件时间线 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">任务事件时间线</h3>
        <div className="space-y-2 max-h-64 overflow-auto">
          {events.map((e) => (
            <div key={e.id} className="flex gap-3 text-xs">
              <span className="text-slate-400 w-20">
                {new Date(e.timestamp).toLocaleTimeString("zh-CN", { hour12: false })}
              </span>
              <span className="text-blue-600 w-24 font-medium">{e.type}</span>
              <span className="text-slate-600 flex-1">{e.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-700">{value}</div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-50 rounded p-3 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}

function ValueItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-blue-50 rounded p-2 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-bold text-blue-700">{value}</div>
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700">{value}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
