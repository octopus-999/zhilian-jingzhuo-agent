import { useAgentStore, buildReport } from "./store";
import { MODE_PARAMS, MOCK_DETECTED_OBJECTS, generateCleanCells } from "../data/mockData";
import type { WorkMode } from "../types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 运行完整的 Agent 工作流
export async function runAgentWorkflow(taskText: string, mode: WorkMode) {
  const store = useAgentStore.getState();
  if (store.isRunning) return;
  store.setMode(mode);
  store.reset();
  store.startDemo();
  store.setTask(taskText);

  const s = useAgentStore;
  const addEvt = (type: any, msg: string, data?: any) => s.getState().addEvent(type, msg, data);
  const setState = (st: any) => s.getState().setState(st);

  try {
    // 1. 接收请求
    setState("RECEIVING");
    addEvt("REQUEST_RECEIVED", `收到用户任务：${taskText}`);
    await sleep(1000);

    // 2. 任务理解（放慢，体现思考）
    setState("UNDERSTANDING");
    addEvt("TASK_ANALYZED", "正在理解任务意图……");
    await sleep(1000);
    const modeLabel =
      mode === "fast" ? "日常快速清洁" : mode === "deep" ? "深度清洁" : mode === "child" ? "儿童房专项清洁" : "标准清洁";
    addEvt("TASK_ANALYZED", `识别任务类型：${modeLabel}。参数：喷水量${MODE_PARAMS[mode].waterRate}x，滚刷${MODE_PARAMS[mode].rollSpeed}x`);
    s.getState().addMessage({
      role: "ai",
      content: `已理解您的需求，将采用【${modeLabel}】执行清洁。${MODE_PARAMS[mode].description}`,
      time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    });
    await sleep(1100);

    // 3. 环境感知（YOLOv8n）
    setState("PERCEPTION");
    addEvt("SCENE_DETECTED", "调用视觉感知模块，扫描桌面环境……");
    await sleep(1500);
    const objs = s.getState().detectedObjects;
    const solid = objs.filter((o) => o.cls === "固体垃圾").length;
    const oil = objs.filter((o) => o.cls === "液态油污").length;
    const water = objs.filter((o) => o.cls === "汤汁水渍").length;
    const obstacle = objs.filter((o) => o.cls === "遗留物品" || o.cls === "桌面障碍物").length;
    addEvt(
      "OBJECT_IDENTIFIED",
      `识别到：固体垃圾 ${solid} 个、油污 ${oil} 处、水渍 ${water} 处、障碍物 ${obstacle} 个。模型 mAP@0.5=98.35%`,
      { solid, oil, water, obstacle }
    );
    await sleep(1000);

    // 4. 任务分解与策略规划（放慢，体现思考）
    setState("PLANNING");
    addEvt("TASK_DECOMPOSED", "任务分解：①固体垃圾推扫收纳 → ②油污重点清洁 → ③水渍吸附 → ④桌沿盘刷 → ⑤AI质检");
    await sleep(1000);
    addEvt("PLAN_GENERATED", "正在思考清洁策略……");
    await sleep(1200);
    const reason = `检测到 ${oil} 处重油污，提高该区域清洁优先级；检测到 ${obstacle} 个障碍物，规划避障路径；调用子机桌面清洁 + 母机支撑协同。`;
    addEvt("PLAN_GENERATED", `清洁策略生成：${reason}`);
    s.getState().addMessage({
      role: "ai",
      content: `【决策依据】观察到油污 ${oil} 处、障碍物 ${obstacle} 个；约束：避免碰撞遗留物品；决策：优先清洁油污区，绕行障碍物，完成后执行AI质检。`,
      time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    });
    // 生成路径
    const path = generatePath(objs);
    s.getState().setPath(path);
    await sleep(1100);

    // 5. 模块调度
    setState("DISPATCHING");
    addEvt("MODULE_DISPATCHED", "调度子机器人控制模块、母机器人支撑模块、路径规划模块、清洁执行模块");
    s.getState().setMotherRobot("升降");
    await sleep(800);
    s.getState().setSubRobot("投放");
    s.getState().setSubRobotPos({ x: 0.1, y: 0.1 });
    addEvt("MODULE_DISPATCHED", "母机启动剪叉升降，投放子机器人到桌面，持续供电");
    await sleep(1000);
    s.getState().setMotherRobot("支撑");
    s.getState().setSubRobot("清洁");

    // 6. 清洁执行
    setState("EXECUTING");
    addEvt("ROBOT_EXECUTING", "子机器人启动：移动、喷水、滚刷、桌沿盘刷");
    await sleep(700);

    // ===== 阶段A：固体垃圾聚集 → 推入收纳槽 =====
    const solidObjs = objs.filter((o) => o.cls === "固体垃圾");
    if (solidObjs.length > 0) {
      addEvt("ROBOT_EXECUTING", `检测到 ${solidObjs.length} 个固体垃圾，开始聚集清扫……`);
      s.getState().setSubRobot("清洁");
      await sleep(600);

      // 逐个移动到垃圾位置并聚集
      for (const solid of solidObjs) {
        s.getState().setSubRobotPos({ x: solid.x, y: solid.y });
        s.getState().addGatherItem(solid.id);
        await sleep(500);
      }

      // 聚集完成，推向收纳槽（桌面右下角边缘）
      const gatherX = 0.85;
      const gatherY = 0.85;
      addEvt("ROBOT_EXECUTING", "固体垃圾聚集完成，推向桌沿收纳槽……");
      s.getState().setSubRobotPos({ x: gatherX, y: gatherY });
      await sleep(800);

      // 推入收纳槽动画
      for (let p = 0; p <= 100; p += 20) {
        s.getState().setPushProgress(p);
        await sleep(120);
      }
      // 固体垃圾推入收纳槽后，标记为已清理（从桌面消失）
      solidObjs.forEach((o) => s.getState().addCleanedObject(o.id));
      s.getState().incStoredSolids(solidObjs.length);
      s.getState().clearGatherItems();
      s.getState().setPushProgress(0);
      addEvt("ROBOT_EXECUTING", `${solidObjs.length} 个固体垃圾已推入收纳槽`);
      await sleep(500);
    }

    // ===== 阶段B：按路径逐格清洁（油污/水渍等） =====
    // 按路径移动子机，逐格清洁
    const cells = s.getState().cells;
    const dirtyCells = cells.filter((c) => c.level !== "clean" && c.level !== "obstacle" && c.level !== "done");
    const sorted = [...dirtyCells].sort((a, b) => a.priority - b.priority);
    for (let i = 0; i < sorted.length; i++) {
      const cell = sorted[i];
      const cx = (cell.col + 0.5) / 10;
      const cy = (cell.row + 0.5) / 8;
      s.getState().setSubRobotPos({ x: cx, y: cy });
      s.getState().setCurrentCell(cell.id);
      s.getState().markCellDone(cell.id);
      const pct = Math.round(((i + 1) / sorted.length) * 100);
      s.getState().setProgress(pct);

      // 该目标对应的单元全部清洁完成 → 污渍消失
      if (cell.objectId) {
        const linked = s
          .getState()
          .cells.filter((c) => c.objectId === cell.objectId);
        if (linked.length > 0 && linked.every((c) => c.level === "done")) {
          s.getState().addCleanedObject(cell.objectId);
        }
      }

      await sleep(350);

      // 在中途触发障碍物事件
      if (i === Math.floor(sorted.length / 2) && !s.getState().obstacleActive) {
        s.getState().setObstacleActive(true);
        s.getState().setSubRobot("避障");
        addEvt("OBSTACLE_DETECTED", "检测到障碍物，当前任务暂停，正在重新规划路径……");
        s.getState().addMessage({
          role: "ai",
          content: "检测到桌面出现障碍物，为避免碰撞我已暂停当前路径，正在重新规划避障路线。",
          time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
        });
        await sleep(1400);
        addEvt("PATH_REPLANNED", "路径重规划完成：绕过障碍物，继续执行清洁");
        s.getState().setSubRobot("清洁");
        s.getState().setObstacleActive(false);
        // 障碍物持续保留
        s.getState().setPathObstacle(true);
        await sleep(700);
      }
    }
    s.getState().setCurrentCell(null);
    addEvt("ROBOT_EXECUTING", "桌面清洁动作执行完毕，回传执行完成信号");

    // 7. AI 质检
    setState("INSPECTING");
    addEvt("TASK_INSPECTED", "AI闭环质检模块启动，重新扫描桌面……");
    await sleep(1500);
    // 质检发现残留
    s.getState().setObstacleResidue(true);
    addEvt("RESIDUE_DETECTED", "检测到 1 处局部油污残留，质检不通过");
    s.getState().addMessage({
      role: "ai",
      content: "AI质检发现一处油污残留，将自动执行二次定点清洁，确保清洁标准统一。",
      time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    });
    await sleep(1000);

    // 8. 二次清洁
    setState("CORRECTING");
    s.getState().setSecondaryCleaning(true);
    s.getState().setSubRobot("清洁");
    addEvt("SECONDARY_CLEANING", "重新定位残留区域，生成局部清洁路径，执行二次定点清洁");
    s.getState().setSubRobotPos({ x: 0.3, y: 0.5 });
    await sleep(1300);
    s.getState().setObstacleResidue(false);
    addEvt("SECONDARY_CLEANING", "二次清洁完成");

    // 9. 再次质检
    setState("INSPECTING");
    addEvt("TASK_INSPECTED", "再次质检：未检测污渍残留，质检通过！油污清洁率97.8%，桌沿覆盖率100%");
    await sleep(1000);

    // 10. 完成
    setState("COMPLETED");
    const duration = 52;
    const report = buildReport(duration, mode);
    s.getState().setReport(report);
    // 任务完成，清空路径
    s.getState().setPath([]);
    addEvt("TASK_COMPLETED", `任务完成！耗时 ${duration}s，AI质检通过，二次清洁 ${report.secondaryCleaning} 次`);
    s.getState().addMessage({
      role: "ai",
      content: `清洁任务已完成。本次共识别固体垃圾${solid}个、油污${oil}处、水渍${water}处，避障${obstacle}次，AI质检通过并执行1次二次补净。`,
      time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    });
  } catch (e) {
    console.error(e);
  } finally {
    s.getState().stopDemo();
  }
}

// 生成一条简单的蛇形清洁路径
function generatePath(objs: any[]) {
  const path: { x: number; y: number }[] = [];
  const rows = 8;
  const cols = 10;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cc = r % 2 === 0 ? c : cols - 1 - c;
      path.push({ x: (cc + 0.5) / cols, y: (r + 0.5) / rows });
    }
  }
  return path;
}
