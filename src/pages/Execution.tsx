import { useAgentStore } from "../agent/store";
import { STATE_LABELS, MODE_LABELS } from "../data/mockData";
import DesktopCanvas from "../components/DesktopCanvas";

export default function Execution() {
  const progress = useAgentStore((s) => s.progress);
  const state = useAgentStore((s) => s.state);
  const subRobot = useAgentStore((s) => s.subRobot);
  const motherRobot = useAgentStore((s) => s.motherRobot);
  const currentCellId = useAgentStore((s) => s.currentCellId);
  const obstacleActive = useAgentStore((s) => s.obstacleActive);
  const isRunning = useAgentStore((s) => s.isRunning);
  const mode = useAgentStore((s) => s.mode);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-800">智能清洁执行监控</h2>
        <p className="text-sm text-slate-500 mt-1">实时展示子机清洁过程、路径执行与障碍物动态处理。</p>
      </div>

      {/* 进度条 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-700">任务进度</h3>
          <span className="text-sm font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>模式：{MODE_LABELS[mode]}</span>
          <span>当前区域：{currentCellId || "-"}</span>
          <span>状态：{STATE_LABELS[state]}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 左：桌面执行 */}
        <div className="col-span-8 bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">执行画面</h3>
          <DesktopCanvas showGrid showPath showDetections={false} height={340} />
        </div>

        {/* 右：执行状态 */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">子机状态</h3>
            <div className="grid grid-cols-2 gap-2">
              {["待机", "投放", "清洁", "避障", "桌沿清洁", "返回"].map((s) => (
                <div
                  key={s}
                  className={`text-center py-2 rounded text-xs ${subRobot === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">当前操作</h3>
            <ul className="text-xs space-y-1.5 text-slate-600">
              <li>喷水：<span className="text-green-600">正常</span></li>
              <li>吸污：<span className="text-green-600">正常</span></li>
              <li>滚刷：<span className="text-green-600">运行中</span></li>
              <li>盘刷：<span className="text-green-600">桌沿清洁</span></li>
            </ul>
          </div>

          {obstacleActive && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
              <div className="text-amber-700 font-semibold text-sm">⚠ 障碍物事件</div>
              <div className="text-xs text-amber-600 mt-1">
                AI 检测到新障碍物，当前路径已暂停，正在重新规划避障路径。
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">系统状态</h3>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Agent：{isRunning ? "运行中" : "空闲"}</div>
              <div>母机：{motherRobot}</div>
              <div>子机：{subRobot}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
