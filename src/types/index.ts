// 智联净桌 - 核心类型定义

// Agent 状态机状态
export type AgentState =
  | "IDLE"
  | "RECEIVING"
  | "UNDERSTANDING"
  | "PERCEPTION"
  | "PLANNING"
  | "DISPATCHING"
  | "EXECUTING"
  | "MONITORING"
  | "INSPECTING"
  | "CORRECTING"
  | "COMPLETED";

// Agent 事件类型
export type AgentEventType =
  | "REQUEST_RECEIVED"
  | "TASK_ANALYZED"
  | "SCENE_DETECTED"
  | "OBJECT_IDENTIFIED"
  | "TASK_DECOMPOSED"
  | "PLAN_GENERATED"
  | "MODULE_DISPATCHED"
  | "ROBOT_EXECUTING"
  | "OBSTACLE_DETECTED"
  | "PATH_REPLANNED"
  | "TASK_INSPECTED"
  | "RESIDUE_DETECTED"
  | "SECONDARY_CLEANING"
  | "TASK_COMPLETED";

// 检测目标类别
export type DirtClass =
  | "空台面"
  | "桌面障碍物"
  | "遗留物品"
  | "固体垃圾"
  | "液态油污"
  | "汤汁水渍";

// 污染等级
export type PollutionLevel = "clean" | "low" | "medium" | "high" | "obstacle" | "done";

// 工作模式
export type WorkMode = "fast" | "standard" | "deep" | "child";

// 子机状态
export type SubRobotState =
  | "待机"
  | "投放"
  | "清洁"
  | "避障"
  | "桌沿清洁"
  | "返回";

// 母机状态
export type MotherRobotState =
  | "待机"
  | "支撑"
  | "升降"
  | "供电"
  | "回收";

// 检测目标
export interface DetectedObject {
  id: string;
  cls: DirtClass;
  confidence: number;
  x: number; // 相对坐标 0-1
  y: number;
  w: number;
  h: number;
  level: PollutionLevel;
}

// 清洁单元（10cm x 10cm）
export interface CleanCell {
  id: string;
  row: number;
  col: number;
  level: PollutionLevel;
  objectId?: string;
  priority: number;
}

// 路径点
export interface PathPoint {
  x: number;
  y: number;
}

// Agent 事件
export interface AgentEvent {
  id: string;
  type: AgentEventType;
  message: string;
  timestamp: number;
  state: AgentState;
  confidence?: number;
  data?: any;
}

// 任务结果报告
export interface TaskReport {
  taskName: string;
  duration: number;
  detected: { solid: number; oil: number; water: number; obstacle: number };
  obstacleAvoided: number;
  pathOptimization: number;
  cleanCompletion: number;
  inspectionPassed: boolean;
  secondaryCleaning: number;
  reasons: string[];
  metrics: {
    oilCleanRate: number;
    edgeCoverage: number;
    avoidSuccessRate: number;
    singleTableTime: string;
    battery: string;
    commLatency: string;
  };
}

// 工作模式参数
export interface ModeParams {
  waterRate: number;
  rollSpeed: number;
  moveSpeed: number;
  noise: string;
  description: string;
}

// 对话消息
export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  time: string;
}
