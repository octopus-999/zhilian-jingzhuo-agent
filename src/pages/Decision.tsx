import { useAgentStore } from "../agent/store";
import { LEVEL_COLORS, MODE_LABELS } from "../data/mockData";

export default function Decision() {
  const cells = useAgentStore((s) => s.cells);
  const path = useAgentStore((s) => s.path);
  const mode = useAgentStore((s) => s.mode);
  const currentCellId = useAgentStore((s) => s.currentCellId);
  const subPos = useAgentStore((s) => s.subRobotPos);

  const rows = 8;
  const cols = 10;
  const cellW = 44;
  const cellH = 36;
  const padX = 20;
  const padY = 20;

  const pathD =
    path.length > 1
      ? path
        .map((p, i) => {
          const x = padX + p.x * cols * cellW;
          const y = padY + p.y * rows * cellH;
          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ")
      : "";

  const high = cells.filter((c) => c.level === "high").length;
  const med = cells.filter((c) => c.level === "medium").length;
  const low = cells.filter((c) => c.level === "low").length;
  const obstacle = cells.filter((c) => c.level === "obstacle").length;
  const done = cells.filter((c) => c.level === "done").length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-800">AI 智能决策与路径规划</h2>
        <p className="text-sm text-slate-500 mt-1">
          桌面被划分为 {rows}×{cols} 个清洁单元，AI 根据污染程度生成差异化优先级路径，替代传统固定路线。
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 左：清洁单元网格 */}
        <div className="col-span-8 bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">清洁单元网格（污染热力图）</h3>
          <svg
            viewBox={`0 0 ${padX * 2 + cols * cellW} ${padY * 2 + rows * cellH}`}
            className="w-full h-auto bg-slate-50 rounded"
          >
            {cells.map((c) => (
              <rect
                key={c.id}
                x={padX + c.col * cellW}
                y={padY + c.row * cellH}
                width={cellW}
                height={cellH}
                fill={LEVEL_COLORS[c.level]}
                stroke="#cbd5e1"
                strokeWidth={0.5}
                opacity={currentCellId === c.id ? 1 : 0.85}
              />
            ))}
            {/* AI 动态路径 */}
            {pathD && (
              <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={2} className="flow-path" opacity={0.7} />
            )}
            {/* 子机位置 */}
            <circle
              cx={padX + subPos.x * cols * cellW}
              cy={padY + subPos.y * rows * cellH}
              r={8}
              fill="#2563eb"
              stroke="white"
              strokeWidth={2}
            />
          </svg>
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            <Legend color={LEVEL_COLORS.clean} label="干净" />
            <Legend color={LEVEL_COLORS.low} label="低污染" />
            <Legend color={LEVEL_COLORS.medium} label="中污染" />
            <Legend color={LEVEL_COLORS.high} label="高污染" />
            <Legend color={LEVEL_COLORS.obstacle} label="障碍区" />
            <Legend color={LEVEL_COLORS.done} label="已完成" />
          </div>
        </div>

        {/* 右：路径与参数 */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">区域统计</h3>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="高污染" value={high} color="text-red-600" />
              <Stat label="中污染" value={med} color="text-orange-600" />
              <Stat label="低污染" value={low} color="text-yellow-600" />
              <Stat label="障碍区" value={obstacle} color="text-blue-600" />
              <Stat label="已完成" value={done} color="text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">路径规划对比</h3>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 rounded p-2">
                <div className="text-slate-400">传统固定路径</div>
                <div className="text-slate-600">蛇形遍历，不区分污染，重复清洁率约 30%</div>
              </div>
              <div className="bg-blue-50 rounded p-2">
                <div className="text-blue-600 font-semibold">AI 动态路径</div>
                <div className="text-slate-600">优先级：重油污 → 液体 → 固体 → 普通，绕行障碍</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">预计参数（{MODE_LABELS[mode]}）</h3>
            <ul className="text-xs space-y-1 text-slate-600">
              <li>预计清洁时间：42s</li>
              <li>预计路径长度：约 6.2m</li>
              <li>预计喷水量：12ml</li>
              <li>预计避障次数：2 次</li>
              <li>路径优化率：35%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-3 h-3 rounded" style={{ background: color }} />
      <span className="text-slate-500">{label}</span>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-50 rounded p-2 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}
