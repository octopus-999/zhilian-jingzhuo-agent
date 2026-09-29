import { useAgentStore } from "../agent/store";
import { CLASS_COLORS, LEVEL_COLORS } from "../data/mockData";

interface Props {
  showDetections?: boolean;
  showPath?: boolean;
  showGrid?: boolean;
  height?: number;
}

// 桌面可视化画布（SVG）
export default function DesktopCanvas({
  showDetections = true,
  showPath = true,
  showGrid = false,
  height = 360,
}: Props) {
  const objs = useAgentStore((s) => s.detectedObjects);
  const cells = useAgentStore((s) => s.cells);
  const subPos = useAgentStore((s) => s.subRobotPos);
  const motherPos = useAgentStore((s) => s.motherRobotPos);
  const path = useAgentStore((s) => s.path);
  const currentCellId = useAgentStore((s) => s.currentCellId);
  const obstacleActive = useAgentStore((s) => s.obstacleActive);
  const pathObstacle = useAgentStore((s) => s.pathObstacle);
  const residue = useAgentStore((s) => s.obstacleResidue);
  const cleanedObjectIds = useAgentStore((s) => s.cleanedObjectIds);
  const gatherItems = useAgentStore((s) => s.gatherItems);
  const pushProgress = useAgentStore((s) => s.pushProgress);
  const storedSolids = useAgentStore((s) => s.storedSolids);
  const agentState = useAgentStore((s) => s.state);

  // 任务完成后隐藏路径
  const shouldShowPath = showPath && path.length > 0 && agentState !== "COMPLETED";

  // 聚集点（桌面右下角）
  const gatherX = 0.85;
  const gatherY = 0.85;

  const isObstacleCls = (cls: string) => cls === "遗留物品" || cls === "桌面障碍物";

  const W = 520;
  const H = height;
  const padX = 30;
  const padY = 20;
  const tableW = W - padX * 2;
  const tableH = H - padY * 2;

  const toX = (rx: number) => padX + rx * tableW;
  const toY = (ry: number) => padY + ry * tableH;

  const pathD =
    path.length > 1
      ? path.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x)} ${toY(p.y)}`).join(" ")
      : "";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-slate-50 rounded-lg border border-slate-200">
      {/* 桌面 */}
      <rect x={padX} y={padY} width={tableW} height={tableH} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} rx={6} />

      {/* 栅格单元 */}
      {showGrid &&
        cells.map((c) => {
          const cw = tableW / 10;
          const ch = tableH / 8;
          return (
            <rect
              key={c.id}
              x={padX + c.col * cw}
              y={padY + c.row * ch}
              width={cw}
              height={ch}
              fill={LEVEL_COLORS[c.level]}
              stroke="#cbd5e1"
              strokeWidth={0.5}
              opacity={currentCellId === c.id ? 1 : 0.8}
            />
          );
        })}

      {/* 清洁路径：任务完成后隐藏 */}
      {shouldShowPath && pathD && (
        <path d={pathD} fill="none" stroke="#22c55e" strokeWidth={2} className="flow-path" opacity={0.7} />
      )}

      {/* 检测目标：污渍清洁后消失；障碍物始终保留并用虚线表示 */}
      {showDetections &&
        objs
          .filter((o) => isObstacleCls(o.cls) || (!cleanedObjectIds.includes(o.id) && !gatherItems.includes(o.id)))
          .map((o) => {
            const isOb = isObstacleCls(o.cls);
            return (
              <g key={o.id}>
                <rect
                  x={toX(o.x - o.w / 2)}
                  y={toY(o.y - o.h / 2)}
                  width={o.w * tableW}
                  height={o.h * tableH}
                  fill={isOb ? "rgba(96,165,250,0.18)" : CLASS_COLORS[o.cls]}
                  opacity={isOb ? 1 : 0.6}
                  stroke={CLASS_COLORS[o.cls]}
                  strokeWidth={2}
                  strokeDasharray={isOb ? "6 3" : undefined}
                  rx={3}
                />
                <text
                  x={toX(o.x - o.w / 2)}
                  y={toY(o.y - o.h / 2) - 3}
                  fontSize={9}
                  fill="#334155"
                >
                  {o.cls} {(o.confidence * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

      {/* 聚集中的固体垃圾：移动到聚集点 */}
      {showDetections &&
        gatherItems.map((id, idx) => {
          const o = objs.find((obj) => obj.id === id);
          if (!o) return null;
          // 垃圾位置 = 原位置 → 聚集点插值（按索引依次排列在聚集点周围）
          const angle = (idx / Math.max(gatherItems.length, 1)) * Math.PI * 2;
          const gx = gatherX + Math.cos(angle) * 0.04;
          const gy = gatherY + Math.sin(angle) * 0.04;
          return (
            <g key={id}>
              <rect
                x={toX(gx - o.w / 2)}
                y={toY(gy - o.h / 2)}
                width={o.w * tableW}
                height={o.h * tableH}
                fill={CLASS_COLORS[o.cls]}
                opacity={0.8}
                stroke="#92400e"
                strokeWidth={2}
                rx={3}
              />
              <text
                x={toX(gx - o.w / 2)}
                y={toY(gy - o.h / 2) - 3}
                fontSize={9}
                fill="#92400e"
                fontWeight="bold"
              >
                聚集中
              </text>
            </g>
          );
        })}

      {/* 收纳槽：桌面右下角边缘 */}
      {showDetections && (
        <g>
          {/* 收纳槽外框 */}
          <rect
            x={toX(0.82)}
            y={toY(0.92)}
            width={toX(0.98) - toX(0.82)}
            height={toY(0.99) - toY(0.92)}
            fill="#334155"
            stroke="#1e293b"
            strokeWidth={2}
            rx={4}
          />
          <text
            x={toX(0.90)}
            y={toY(0.96)}
            textAnchor="middle"
            fontSize={10}
            fill="#94a3b8"
            fontWeight="bold"
          >
            收纳槽
          </text>
          {/* 已收纳的垃圾数量 */}
          {storedSolids > 0 && (
            <text
              x={toX(0.90)}
              y={toY(0.985)}
              textAnchor="middle"
              fontSize={9}
              fill="#fbbf24"
              fontWeight="bold"
            >
              已收纳 {storedSolids} 个
            </text>
          )}
          {/* 推入进度条 */}
          {pushProgress > 0 && (
            <g>
              <rect
                x={toX(0.80)}
                y={toY(0.89)}
                width={toX(0.98) - toX(0.80)}
                height={6}
                fill="#e2e8f0"
                rx={3}
              />
              <rect
                x={toX(0.80)}
                y={toY(0.89)}
                width={((toX(0.98) - toX(0.80)) * pushProgress) / 100}
                height={6}
                fill="#f59e0b"
                rx={3}
              />
              <text
                x={toX(0.89)}
                y={toY(0.885)}
                textAnchor="middle"
                fontSize={9}
                fill="#d97706"
                fontWeight="bold"
              >
                推入收纳槽 {pushProgress}%
              </text>
            </g>
          )}
        </g>
      )}

      {/* 残留标记 */}
      {residue && (
        <g>
          <circle cx={toX(0.3)} cy={toY(0.5)} r={18} fill="none" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 3" />
          <text x={toX(0.3) - 20} y={toY(0.5) - 22} fontSize={10} fill="#ef4444" fontWeight="bold">
            ⚠ 残留油污
          </text>
        </g>
      )}

      {/* 障碍物事件：虚线方框，障碍物不消失 */}
      {obstacleActive && (
        <g>
          <rect
            x={toX(0.55) - 24}
            y={toY(0.5) - 22}
            width={48}
            height={44}
            fill="rgba(245,158,11,0.15)"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6 3"
            rx={3}
          />
          <text
            x={toX(0.55)}
            y={toY(0.5) + 4}
            textAnchor="middle"
            fontSize={10}
            fill="#f59e0b"
            fontWeight="bold"
          >
            障碍物
          </text>
        </g>
      )}

      {/* 路径障碍物：遇到后持续保留，虚线表示 */}
      {pathObstacle && !obstacleActive && (
        <g>
          <rect
            x={toX(0.55) - 24}
            y={toY(0.5) - 22}
            width={48}
            height={44}
            fill="rgba(96,165,250,0.18)"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="6 3"
            rx={3}
          />
          <text
            x={toX(0.55)}
            y={toY(0.5) + 4}
            textAnchor="middle"
            fontSize={10}
            fill="#2563eb"
            fontWeight="bold"
          >
            障碍物
          </text>
        </g>
      )}

      {/* 子机器人 */}
      <g>
        <rect
          x={toX(subPos.x) - 14}
          y={toY(subPos.y) - 14}
          width={28}
          height={28}
          fill="#2563eb"
          rx={4}
        />
        <text
          x={toX(subPos.x)}
          y={toY(subPos.y)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fill="white"
          fontWeight="bold"
        >
          子机
        </text>
      </g>

      {/* 母机器人（桌旁） */}
      <g>
        <rect
          x={toX(motherPos.x) - 20}
          y={toY(motherPos.y) - 14}
          width={40}
          height={28}
          fill="#475569"
          rx={4}
        />
        <text
          x={toX(motherPos.x)}
          y={toY(motherPos.y)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fill="white"
          fontWeight="bold"
        >
          母机
        </text>
      </g>
    </svg>
  );
}
