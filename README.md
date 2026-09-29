# 智联净桌 AI 智能清洁中枢

> AIGC 视觉感知 · 物联网子母协同桌面清洁机器人 — AI 智能体演示系统

一个基于 React + TypeScript + Vite + Tailwind CSS 构建的 AI Agent 驱动桌面清洁智能体演示系统，完整模拟「感知 → 决策 → 执行 → 质检」闭环流程。

## 在线访问

部署在 Gitee Pages，直接点击链接即可使用（无需下载安装任何东西）：

**https://<你的Gitee用户名>.gitee.io/zhilian-jingzhuo-agent/**

## 更新线上网页

修改代码后，双击运行 `deploy.bat` 即可自动构建并发布最新版本。

## 技术栈

- **React 18** + **TypeScript**
- **Vite** 构建工具
- **Tailwind CSS** 样式
- **Zustand** 状态管理
- **Lucide React** 图标
- **Framer Motion** / Recharts（已预留）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后浏览器访问：`http://localhost:5173`

## 项目结构

```
src/
├── agent/          # Agent 状态机、工作流引擎、全局 store
│   ├── store.ts        # Zustand 全局状态
│   └── workflow.ts     # Agent 工作流编排
├── components/     # 通用 UI 组件
│   ├── Layout.tsx      # 布局 + 导航 + 使用说明
│   ├── AgentWorkflow.tsx   # 状态机时间轴
│   ├── DesktopCanvas.tsx   # 桌面可视化 SVG
│   ├── WorkflowLog.tsx     # Agent 工作流日志
│   └── ChatPanel.tsx       # AI 对话面板
├── pages/          # 7 个核心页面
│   ├── Dashboard.tsx     # AI 总控中心（首页）
│   ├── Perception.tsx    # AI 视觉感知
│   ├── Decision.tsx      # AI 决策与路径规划
│   ├── Collaboration.tsx # 子母机器人协同
│   ├── Execution.tsx     # 实时执行监控
│   ├── Inspection.tsx    # AI 清洁质检
│   └── Report.tsx        # 任务结果报告
├── data/
│   └── mockData.ts   # Mock 数据 + 模式参数 + 指标
├── types/
│   └── index.ts      # TypeScript 类型定义
├── App.tsx
├── main.tsx
└── index.css
```

## 功能说明

### 1. 一键体验 AI 全流程（核心演示）

在「AI 总控中心」点击「一键体验 AI 全流程」，系统自动跑完：

1. 接收用户请求 → 2. 任务理解 → 3. YOLOv8n 视觉感知 → 4. 任务分解与策略决策
5. 模块调度（子母机协同）→ 6. 清洁执行（含障碍物动态避障）→ 7. AI 质检
8. 残留识别 → 9. 二次定点清洁 → 10. 再次质检 → 11. 输出报告

### 2. AI Agent 工作流

- 完整状态机：IDLE → RECEIVING → UNDERSTANDING → PERCEPTION → PLANNING → DISPATCHING → EXECUTING → MONITORING → INSPECTING → CORRECTING → COMPLETED
- 结构化事件日志（非思维链）
- AI 决策依据面板（观察 / 约束 / 决策）

### 3. 四大工作模式

日常快速 / 标准清洁 / 深度清洁 / 儿童房专项，对应不同喷水量、滚刷转速、噪音参数。

### 4. 使用说明

点击右上角「?」按钮查看完整使用说明，包括模拟数据声明与真实硬件接入方式。

## 环境变量

复制 `.env.example` 为 `.env`，留空则使用 Mock 演示模式：

```bash
VITE_DEMO_MODE=true          # true=模拟数据
VITE_YOLO_API_URL=           # YOLOv8n 接口
VITE_ROBOT_API_URL=          # STM32 机器人控制接口
VITE_RS485_API_URL=          # RS485 通讯接口
VITE_LLM_API_KEY=            # 大模型 API Key
```

## 接入真实硬件/模型

代码已预留接口位置：
- 视觉感知：`/api/perception`（YOLOv8n）
- 机器人控制：`VITE_ROBOT_API_URL`（STM32）
- 通信：`VITE_RS485_API_URL`
- 大模型：`VITE_LLM_API_KEY`

