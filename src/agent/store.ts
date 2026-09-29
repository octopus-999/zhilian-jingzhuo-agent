import { create } from "zustand";
import type {
  AgentState,
  AgentEvent,
  AgentEventType,
  DetectedObject,
  CleanCell,
  WorkMode,
  SubRobotState,
  MotherRobotState,
  TaskReport,
  ChatMessage,
} from "../types";
import {
  MOCK_DETECTED_OBJECTS,
  generateCleanCells,
  MODE_PARAMS,
  SAMPLE_REPORT,
  getObjectsByMode,
} from "../data/mockData";

interface AgentStore {
  // Agent 核心状态
  state: AgentState;
  events: AgentEvent[];
  currentTask: string;
  mode: WorkMode;

  // 感知
  detectedObjects: DetectedObject[];
  cells: CleanCell[];

  // 机器人
  subRobot: SubRobotState;
  motherRobot: MotherRobotState;
  subRobotPos: { x: number; y: number };
  motherRobotPos: { x: number; y: number };
  currentCellId: string | null;
  path: { x: number; y: number }[];
  obstacleActive: boolean;
  pathObstacle: boolean;
  obstacleResidue: boolean;

  // 固体垃圾集中 → 推入收纳槽
  gatherItems: string[];
  pushProgress: number;
  storedSolids: number;

  // 执行进度
  progress: number;
  secondaryCleaning: boolean;

  // 报告
  report: TaskReport | null;

  // 对话
  messages: ChatMessage[];

  // 运行状态
  isRunning: boolean;
  demoTimer: number;

  // actions
  setState: (s: AgentState) => void;
  addEvent: (type: AgentEventType, message: string, data?: any) => void;
  setMode: (m: WorkMode) => void;
  setTask: (t: string) => void;
  startDemo: () => void;
  stopDemo: () => void;
  reset: () => void;
  setSubRobot: (s: SubRobotState) => void;
  setMotherRobot: (s: MotherRobotState) => void;
  setSubRobotPos: (p: { x: number; y: number }) => void;
  setProgress: (n: number) => void;
  setCells: (c: CleanCell[]) => void;
  setCurrentCell: (id: string | null) => void;
  setObstacleActive: (b: boolean) => void;
  setPathObstacle: (b: boolean) => void;
  setObstacleResidue: (b: boolean) => void;
  setSecondaryCleaning: (b: boolean) => void;
  setReport: (r: TaskReport | null) => void;
  addMessage: (m: ChatMessage) => void;
  setPath: (p: { x: number; y: number }[]) => void;
  markCellDone: (id: string) => void;
  cleanedObjectIds: string[];
  addCleanedObject: (id: string) => void;
  addGatherItem: (id: string) => void;
  setPushProgress: (n: number) => void;
  incStoredSolids: (n: number) => void;
  clearGatherItems: () => void;
}

let eventIdCounter = 0;

export const useAgentStore = create<AgentStore>((set, get) => ({
  state: "IDLE",
  events: [],
  currentTask: "家庭餐桌标准清洁",
  mode: "standard",

  detectedObjects: MOCK_DETECTED_OBJECTS,
  cells: generateCleanCells(MOCK_DETECTED_OBJECTS),

  subRobot: "待机",
  motherRobot: "待机",
  subRobotPos: { x: 0.1, y: 0.1 },
  motherRobotPos: { x: 0.9, y: 0.9 },
  currentCellId: null,
  path: [],
  obstacleActive: false,
  pathObstacle: false,
  obstacleResidue: false,

  gatherItems: [],
  pushProgress: 0,
  storedSolids: 0,

  progress: 0,
  secondaryCleaning: false,

  report: null,

  messages: [
    {
      role: "ai",
      content: "您好，我是智联净桌 AI 清洁智能体。请告诉我您的清洁需求，例如：“请帮我清洁餐桌，桌面上的水杯不要碰”。",
      time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    },
  ],

  isRunning: false,
  demoTimer: 0,

  setState: (s) => set({ state: s }),
  addEvent: (type, message, data) => {
    const evt: AgentEvent = {
      id: `evt-${eventIdCounter++}`,
      type,
      message,
      timestamp: Date.now(),
      state: get().state,
      data,
    };
    set((st) => ({ events: [...st.events, evt] }));
  },
  setMode: (m) => set({ mode: m }),
  setTask: (t) => set({ currentTask: t }),
  setSubRobot: (s) => set({ subRobot: s }),
  setMotherRobot: (s) => set({ motherRobot: s }),
  setSubRobotPos: (p) => set({ subRobotPos: p }),
  setProgress: (n) => set({ progress: n }),
  setCells: (c) => set({ cells: c }),
  setCurrentCell: (id) => set({ currentCellId: id }),
  setObstacleActive: (b) => set({ obstacleActive: b }),
  setPathObstacle: (b) => set({ pathObstacle: b }),
  setObstacleResidue: (b) => set({ obstacleResidue: b }),
  setSecondaryCleaning: (b) => set({ secondaryCleaning: b }),
  setReport: (r) => set({ report: r }),
  addMessage: (m) => set((st) => ({ messages: [...st.messages, m] })),
  setPath: (p) => set({ path: p }),
  markCellDone: (id) =>
    set((st) => ({
      cells: st.cells.map((c) => (c.id === id ? { ...c, level: "done" as const } : c)),
    })),
  cleanedObjectIds: [],
  addCleanedObject: (id) =>
    set((st) =>
      st.cleanedObjectIds.includes(id)
        ? st
        : { cleanedObjectIds: [...st.cleanedObjectIds, id] }
    ),
  addGatherItem: (id) =>
    set((st) =>
      st.gatherItems.includes(id)
        ? st
        : { gatherItems: [...st.gatherItems, id] }
    ),
  setPushProgress: (n) => set({ pushProgress: n }),
  incStoredSolids: (n) => set((st) => ({ storedSolids: st.storedSolids + n })),
  clearGatherItems: () => set({ gatherItems: [] }),

  startDemo: () => set({ isRunning: true }),
  stopDemo: () => set({ isRunning: false }),

  reset: () =>
    set((st) => {
      const objs = getObjectsByMode(st.mode);
      return {
        state: "IDLE",
        events: [],
        currentTask: "家庭餐桌标准清洁",
        detectedObjects: objs,
        cells: generateCleanCells(objs),
        subRobot: "待机",
        motherRobot: "待机",
        subRobotPos: { x: 0.1, y: 0.1 },
        motherRobotPos: { x: 0.9, y: 0.9 },
        currentCellId: null,
        path: [],
        obstacleActive: false,
        pathObstacle: false,
        obstacleResidue: false,
        progress: 0,
        secondaryCleaning: false,
        report: null,
        isRunning: false,
        cleanedObjectIds: [],
        gatherItems: [],
        pushProgress: 0,
        storedSolids: 0,
      };
    }),
}));

// 工具函数：获取当前模式参数
export function getModeParams(mode: WorkMode) {
  return MODE_PARAMS[mode];
}

// 工具函数：生成示例报告
export function buildReport(duration: number, mode: WorkMode): TaskReport {
  return {
    ...SAMPLE_REPORT,
    taskName:
      mode === "fast"
        ? "餐桌快速清洁"
        : mode === "deep"
          ? "餐桌深度清洁"
          : mode === "child"
            ? "儿童房专项清洁"
            : "家庭餐桌标准清洁",
    duration,
  };
}
