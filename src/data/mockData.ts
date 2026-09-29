import type {
  DetectedObject,
  CleanCell,
  ModeParams,
  WorkMode,
  TaskReport,
  AgentState,
  AgentEventType,
} from "../types";

// 六种检测目标的颜色映射
export const CLASS_COLORS: Record<string, string> = {
  空台面: "#94a3b8",
  桌面障碍物: "#60a5fa",
  遗留物品: "#3b82f6",
  固体垃圾: "#78350f",
  液态油污: "#b45309",
  汤汁水渍: "#06b6d4",
};

// 污染等级颜色
export const LEVEL_COLORS: Record<string, string> = {
  clean: "#dcfce7",
  low: "#fef9c3",
  medium: "#fed7aa",
  high: "#fecaca",
  obstacle: "#bfdbfe",
  done: "#86efac",
};

// 四种工作模式参数
export const MODE_PARAMS: Record<WorkMode, ModeParams> = {
  fast: {
    waterRate: 0.8,
    rollSpeed: 1.2,
    moveSpeed: 1.3,
    noise: "≤52dB",
    description: "日常快速模式：效率优先，缩短清洁时间",
  },
  standard: {
    waterRate: 1.0,
    rollSpeed: 1.0,
    moveSpeed: 1.0,
    noise: "≤48dB",
    description: "标准清洁模式：均衡效果与能耗",
  },
  deep: {
    waterRate: 1.5,
    rollSpeed: 1.5,
    moveSpeed: 0.7,
    noise: "≤50dB",
    description: "深度清洁模式：加大水量，AI复检",
  },
  child: {
    waterRate: 0.7,
    rollSpeed: 0.7,
    moveSpeed: 0.8,
    noise: "≤45dB",
    description: "儿童房专项模式：低转速软耗材，保护家具",
  },
};

// 四种工作模式中文标签
export const MODE_LABELS: Record<WorkMode, string> = {
  fast: "日常快速",
  standard: "标准清洁",
  deep: "深度清洁",
  child: "儿童房专项",
};

// 默认场景：重油污餐桌（标准模式）
export const MOCK_DETECTED_OBJECTS: DetectedObject[] = [
  { id: "o1", cls: "固体垃圾", confidence: 0.92, x: 0.15, y: 0.25, w: 0.08, h: 0.08, level: "medium" },
  { id: "o2", cls: "固体垃圾", confidence: 0.88, x: 0.55, y: 0.6, w: 0.07, h: 0.07, level: "medium" },
  { id: "o3", cls: "固体垃圾", confidence: 0.9, x: 0.75, y: 0.3, w: 0.06, h: 0.06, level: "low" },
  { id: "o4", cls: "固体垃圾", confidence: 0.85, x: 0.3, y: 0.7, w: 0.07, h: 0.07, level: "low" },
  { id: "o5", cls: "固体垃圾", confidence: 0.87, x: 0.6, y: 0.15, w: 0.06, h: 0.06, level: "low" },
  { id: "o6", cls: "液态油污", confidence: 0.94, x: 0.25, y: 0.45, w: 0.12, h: 0.1, level: "high" },
  { id: "o7", cls: "液态油污", confidence: 0.91, x: 0.65, y: 0.75, w: 0.1, h: 0.09, level: "high" },
  { id: "o8", cls: "汤汁水渍", confidence: 0.83, x: 0.45, y: 0.35, w: 0.09, h: 0.08, level: "medium" },
  { id: "o9", cls: "遗留物品", confidence: 0.96, x: 0.4, y: 0.2, w: 0.08, h: 0.1, level: "obstacle" },
  { id: "o10", cls: "桌面障碍物", confidence: 0.95, x: 0.8, y: 0.55, w: 0.07, h: 0.09, level: "obstacle" },
];

// 快速模式：轻微污染，少量垃圾
export const MOCK_FAST_OBJECTS: DetectedObject[] = [
  { id: "f1", cls: "固体垃圾", confidence: 0.91, x: 0.2, y: 0.3, w: 0.07, h: 0.07, level: "low" },
  { id: "f2", cls: "固体垃圾", confidence: 0.88, x: 0.6, y: 0.5, w: 0.06, h: 0.06, level: "low" },
  { id: "f3", cls: "汤汁水渍", confidence: 0.85, x: 0.45, y: 0.6, w: 0.1, h: 0.08, level: "medium" },
  { id: "f4", cls: "遗留物品", confidence: 0.95, x: 0.5, y: 0.2, w: 0.08, h: 0.1, level: "obstacle" },
];

// 深度模式：重度油污，多垃圾
export const MOCK_DEEP_OBJECTS: DetectedObject[] = [
  { id: "d1", cls: "固体垃圾", confidence: 0.93, x: 0.1, y: 0.2, w: 0.08, h: 0.08, level: "medium" },
  { id: "d2", cls: "固体垃圾", confidence: 0.89, x: 0.5, y: 0.4, w: 0.07, h: 0.07, level: "medium" },
  { id: "d3", cls: "固体垃圾", confidence: 0.91, x: 0.8, y: 0.25, w: 0.06, h: 0.06, level: "low" },
  { id: "d4", cls: "固体垃圾", confidence: 0.86, x: 0.25, y: 0.65, w: 0.07, h: 0.07, level: "low" },
  { id: "d5", cls: "固体垃圾", confidence: 0.88, x: 0.55, y: 0.75, w: 0.06, h: 0.06, level: "low" },
  { id: "d6", cls: "固体垃圾", confidence: 0.84, x: 0.7, y: 0.55, w: 0.05, h: 0.05, level: "low" },
  { id: "d7", cls: "液态油污", confidence: 0.95, x: 0.2, y: 0.4, w: 0.14, h: 0.12, level: "high" },
  { id: "d8", cls: "液态油污", confidence: 0.92, x: 0.6, y: 0.3, w: 0.12, h: 0.1, level: "high" },
  { id: "d9", cls: "液态油污", confidence: 0.90, x: 0.45, y: 0.7, w: 0.1, h: 0.09, level: "high" },
  { id: "d10", cls: "汤汁水渍", confidence: 0.87, x: 0.35, y: 0.55, w: 0.08, h: 0.07, level: "medium" },
  { id: "d11", cls: "遗留物品", confidence: 0.96, x: 0.4, y: 0.15, w: 0.08, h: 0.1, level: "obstacle" },
  { id: "d12", cls: "桌面障碍物", confidence: 0.94, x: 0.85, y: 0.6, w: 0.07, h: 0.09, level: "obstacle" },
];

// 儿童房模式：轻污染，多障碍物（玩具）
export const MOCK_CHILD_OBJECTS: DetectedObject[] = [
  { id: "c1", cls: "固体垃圾", confidence: 0.90, x: 0.15, y: 0.35, w: 0.06, h: 0.06, level: "low" },
  { id: "c2", cls: "固体垃圾", confidence: 0.87, x: 0.65, y: 0.55, w: 0.05, h: 0.05, level: "low" },
  { id: "c3", cls: "汤汁水渍", confidence: 0.84, x: 0.45, y: 0.5, w: 0.12, h: 0.12, level: "medium" },
  { id: "c4", cls: "遗留物品", confidence: 0.96, x: 0.3, y: 0.2, w: 0.09, h: 0.11, level: "obstacle" },
  { id: "c5", cls: "遗留物品", confidence: 0.93, x: 0.7, y: 0.35, w: 0.08, h: 0.1, level: "obstacle" },
  { id: "c6", cls: "桌面障碍物", confidence: 0.95, x: 0.55, y: 0.75, w: 0.07, h: 0.09, level: "obstacle" },
];

// 根据模式获取场景对象
export function getObjectsByMode(mode: WorkMode): DetectedObject[] {
  switch (mode) {
    case "fast": return MOCK_FAST_OBJECTS;
    case "deep": return MOCK_DEEP_OBJECTS;
    case "child": return MOCK_CHILD_OBJECTS;
    default: return MOCK_DETECTED_OBJECTS;
  }
}

// 生成清洁单元网格
export function generateCleanCells(objects: DetectedObject[]): CleanCell[] {
  const cells: CleanCell[] = [];
  const rows = 8;
  const cols = 10;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (c + 0.5) / cols;
      const cy = (r + 0.5) / rows;
      let level: CleanCell["level"] = "clean";
      let objId: string | undefined;
      for (const o of objects) {
        if (
          cx >= o.x - o.w / 2 - 0.02 &&
          cx <= o.x + o.w / 2 + 0.02 &&
          cy >= o.y - o.h / 2 - 0.02 &&
          cy <= o.y + o.h / 2 + 0.02
        ) {
          level = o.level;
          objId = o.id;
          break;
        }
      }
      const priority =
        level === "high" ? 1 : level === "medium" ? 2 : level === "low" ? 3 : level === "obstacle" ? 99 : 9;
      cells.push({
        id: `c${r}-${c}`,
        row: r,
        col: c,
        level,
        objectId: objId,
        priority,
      });
    }
  }
  return cells;
}

// Agent 状态中文名
export const STATE_LABELS: Record<AgentState, string> = {
  IDLE: "空闲待命",
  RECEIVING: "接收请求",
  UNDERSTANDING: "任务理解",
  PERCEPTION: "环境感知",
  PLANNING: "策略规划",
  DISPATCHING: "模块调度",
  EXECUTING: "清洁执行",
  MONITORING: "实时监控",
  INSPECTING: "AI 质检",
  CORRECTING: "二次清洁",
  COMPLETED: "任务完成",
};

// Agent 状态顺序（用于工作流时间轴）
export const STATE_ORDER: AgentState[] = [
  "IDLE",
  "RECEIVING",
  "UNDERSTANDING",
  "PERCEPTION",
  "PLANNING",
  "DISPATCHING",
  "EXECUTING",
  "MONITORING",
  "INSPECTING",
  "CORRECTING",
  "COMPLETED",
];

// Agent 事件标签
export const EVENT_LABELS: Record<AgentEventType, string> = {
  REQUEST_RECEIVED: "[INPUT] 收到用户任务",
  TASK_ANALYZED: "[UNDERSTAND] 识别任务类型",
  SCENE_DETECTED: "[PERCEPTION] 场景检测完成",
  OBJECT_IDENTIFIED: "[PERCEPTION] 目标识别结果",
  TASK_DECOMPOSED: "[PLANNING] 任务分解",
  PLAN_GENERATED: "[PLANNING] 清洁策略生成",
  MODULE_DISPATCHED: "[DISPATCH] 模块调度",
  ROBOT_EXECUTING: "[CONTROL] 机器人执行",
  OBSTACLE_DETECTED: "[EVENT] 障碍物事件",
  PATH_REPLANNED: "[REPLAN] 路径重规划",
  TASK_INSPECTED: "[INSPECTION] 质量检测",
  RESIDUE_DETECTED: "[DETECTION] 残留识别",
  SECONDARY_CLEANING: "[CORRECTION] 二次定点清洁",
  TASK_COMPLETED: "[FINAL] 任务完成",
};

// 项目设计/实验指标
export const PROJECT_METRICS = {
  oilCleanRate: "95%-98%",
  edgeCoverage: "100%",
  avoidSuccessRate: "98%",
  singleTableTime: "30-60s",
  battery: "1-1.5h",
  commLatency: "≤10ms",
};

// 示例任务报告
export const SAMPLE_REPORT: TaskReport = {
  taskName: "家庭餐桌标准清洁",
  duration: 45,
  detected: { solid: 5, oil: 2, water: 1, obstacle: 2 },
  obstacleAvoided: 2,
  pathOptimization: 35,
  cleanCompletion: 100,
  inspectionPassed: true,
  secondaryCleaning: 1,
  reasons: [
    "检测到重油污区域，提高喷水量与滚刷转速，优先处理",
    "检测到水杯等遗留物品，设置为避让区域并动态绕行",
    "AI质检发现1处油污残留，自动执行二次定点清洁",
  ],
  metrics: {
    oilCleanRate: 97.8,
    edgeCoverage: 100,
    avoidSuccessRate: 98,
    singleTableTime: "45s",
    battery: "1.2h",
    commLatency: "8ms",
  },
};

// 场景列表
export const DEMO_SCENARIOS = [
  {
    id: "A",
    name: "案例A：普通餐桌",
    desc: "固体垃圾 + 水渍 → AI 快速清洁",
    mode: "fast" as WorkMode,
  },
  {
    id: "B",
    name: "案例B：重油污餐桌",
    desc: "油污 + 餐余 + 障碍物 → 差异化清洁 + 避障 + 路径重规划",
    mode: "deep" as WorkMode,
  },
  {
    id: "C",
    name: "案例C：质检残留",
    desc: "执行 → 质检 → 残留识别 → 二次清洁 → 再质检（重点展示）",
    mode: "standard" as WorkMode,
  },
];
