import { useAgentStore } from "../agent/store";
import { CLASS_COLORS, MODE_LABELS } from "../data/mockData";

const LEVEL_LABEL: Record<string, string> = {
  clean: "干净",
  low: "低",
  medium: "中",
  high: "高",
  obstacle: "障碍",
  done: "已完成",
};

export default function Perception() {
  const detectedObjects = useAgentStore((s) => s.detectedObjects);
  const state = useAgentStore((s) => s.state);
  const mode = useAgentStore((s) => s.mode);

  const counts: Record<string, number> = {};
  detectedObjects.forEach((o) => {
    counts[o.cls] = (counts[o.cls] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-800">AI 环境感知</h2>
        <p className="text-sm text-slate-500 mt-1">
          基于 YOLOv8n 轻量级目标检测模型，对桌面进行语义理解。mAP@0.5 = 98.35%
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 左：摄像头/桌面图 */}
        <div className="col-span-8 bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-700">桌面检测画面（3D 视角）</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {MODE_LABELS[mode]}
            </span>
          </div>
          <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ height: 380 }}>
            {/* 3D 桌面 */}
            <svg viewBox="0 0 600 380" className="w-full h-full">
              <defs>
                <linearGradient id="tableGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>
              <rect width="600" height="380" fill="url(#floorGrad)" />
              {/* 透视桌面 */}
              <polygon points="150,120 450,120 520,300 80,300" fill="url(#tableGrad)" stroke="#64748b" strokeWidth="2" />
              {/* 桌沿 */}
              <polygon points="80,300 520,300 540,320 60,320" fill="#334155" />
              {/* 检测目标 */}
              {detectedObjects.map((o) => {
                const x = 150 + o.x * 300;
                const y = 120 + o.y * 150;
                const w = o.w * 300;
                const h = o.h * 150;
                const fs = 8;
                const label = `${o.cls} ${(o.confidence * 100).toFixed(0)}%`;
                const labelW =
                  [...label].reduce(
                    (sum, ch) => sum + (ch.charCodeAt(0) > 255 ? fs : fs * 0.62),
                    0
                  ) + 6;
                return (
                  <g key={o.id}>
                    <rect
                      x={x - w / 2}
                      y={y - h / 2}
                      width={w}
                      height={h}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                    />
                    <rect x={x - w / 2} y={y - h / 2 - 11} width={labelW} height={11} fill="#22c55e" opacity={0.85} rx={1} />
                    <text x={x - w / 2 + 3} y={y - h / 2 - 3} fontSize={fs} fill="white" fontWeight="bold">
                      {label}
                    </text>
                    <ellipse cx={x} cy={y + h / 2} rx={w / 2} ry={h / 4} fill={CLASS_COLORS[o.cls]} opacity={0.5} />
                  </g>
                );
              })}
              {/* 扫描线 */}
              <line x1="0" y1="190" x2="600" y2="190" stroke="#22c55e" strokeWidth="1" opacity="0.4" className="breathing" />
            </svg>
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
              ● REC YOLOv8n
            </div>
          </div>
        </div>

        {/* 右：检测结果 */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">检测目标统计</h3>
            <div className="space-y-2">
              {Object.entries(counts).map(([cls, cnt]) => (
                <div key={cls} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded" style={{ background: CLASS_COLORS[cls] }} />
                    <span className="text-sm text-slate-600">{cls}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{cnt} 个</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">检测目标明细</h3>
            <div className="space-y-2 max-h-64 overflow-auto">
              {detectedObjects.map((o) => (
                <div key={o.id} className="border border-slate-100 rounded p-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: CLASS_COLORS[o.cls] }}>
                      {o.cls}
                    </span>
                    <span className="text-slate-400">置信度 {(o.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    位置 ({(o.x * 100).toFixed(0)}%, {(o.y * 100).toFixed(0)}%) · 污染等级：{LEVEL_LABEL[o.level]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-xs text-slate-600">
            <div className="font-semibold text-blue-700 mb-1">说明</div>
            视觉感知模块输出桌面检测目标、位置与置信度信息。
          </div>
        </div>
      </div>
    </div>
  );
}
