import { useState } from "react";
import { Send } from "lucide-react";
import { useAgentStore } from "../agent/store";
import { STATE_LABELS, MODE_LABELS } from "../data/mockData";

// 智能 AI 对话窗口（与系统状态、场景数据联动）
export default function ChatPanel() {
  const messages = useAgentStore((s) => s.messages);
  const addMessage = useAgentStore((s) => s.addMessage);
  const state = useAgentStore((s) => s.state);
  const mode = useAgentStore((s) => s.mode);
  const detectedObjects = useAgentStore((s) => s.detectedObjects);
  const progress = useAgentStore((s) => s.progress);
  const obstacleActive = useAgentStore((s) => s.obstacleActive);
  const residue = useAgentStore((s) => s.obstacleResidue);
  const secondaryCleaning = useAgentStore((s) => s.secondaryCleaning);
  const storedSolids = useAgentStore((s) => s.storedSolids);
  const report = useAgentStore((s) => s.report);
  const [input, setInput] = useState("");

  const solid = detectedObjects.filter((o) => o.cls === "固体垃圾").length;
  const oil = detectedObjects.filter((o) => o.cls === "液态油污").length;
  const water = detectedObjects.filter((o) => o.cls === "汤汁水渍").length;
  const obstacle = detectedObjects.filter((o) => o.cls === "遗留物品" || o.cls === "桌面障碍物").length;

  const generateReply = (txt: string): string => {
    const lower = txt.toLowerCase();

    // 问候/打招呼
    if (/(你好|您好|hi|hello|嗨)/i.test(lower)) {
      return `您好！我是智联净桌 AI 清洁智能体。当前处于【${MODE_LABELS[mode]}】模式，桌面检测到 ${solid} 个固体垃圾、${oil} 处油污、${water} 处水渍、${obstacle} 个障碍物。有什么可以帮您的？`;
    }

    // 问油污
    if (/(油污|油渍|油腻)/i.test(lower)) {
      if (oil === 0) return "当前桌面未检测到液态油污，很干净。";
      if (state === "COMPLETED") return `本次任务共处理了 ${oil} 处油污，已全部清洁完毕，质检通过。`;
      if (state === "EXECUTING") return `正在处理 ${oil} 处油污，采用加大喷水量和滚刷转速的策略，请稍候。`;
      return `当前桌面检测到 ${oil} 处液态油污，AI 已将其设为最高优先级，喷水量和滚刷转速已自动上调。`;
    }

    // 问固体垃圾
    if (/(垃圾|固体|残渣|碎屑)/i.test(lower)) {
      if (solid === 0) return "当前桌面未检测到固体垃圾。";
      if (state === "COMPLETED") return `本次共收纳 ${storedSolids} 个固体垃圾，已全部推入桌沿收纳槽。`;
      if (storedSolids > 0) return `已收纳 ${storedSolids} 个固体垃圾，正在继续清洁其他区域。`;
      return `检测到 ${solid} 个固体垃圾，子机将先聚集推扫至桌沿收纳槽，再进行深度清洁。`;
    }

    // 问水渍
    if (/(水渍|汤汁|水迹|液体)/i.test(lower)) {
      if (water === 0) return "当前桌面未检测到汤汁水渍。";
      if (state === "COMPLETED") return "水渍已全部吸附清洁完毕。";
      return `检测到 ${water} 处汤汁水渍，将使用吸水模块重点处理。`;
    }

    // 问障碍物/避让
    if (/(障碍|避让|水杯|不要碰|避开|绕过)/i.test(lower)) {
      if (obstacle === 0) return "当前桌面无障碍物，子机可自由通行。";
      if (obstacleActive) return "检测到新障碍物，已暂停当前路径，正在重新规划避障路线。";
      return `检测到 ${obstacle} 个障碍物（遗留物品），已设为避让区域，子机将自动绕行，不会触碰。`;
    }

    // 问质检/残留/二次清洁
    if (/(质检|残留|二次|重新|又清洁|补净)/i.test(lower)) {
      if (secondaryCleaning) return "AI 质检发现局部残留，已自动执行二次定点清洁，确保清洁标准统一。";
      if (residue) return "质检中发现一处残留，即将启动二次清洁。";
      if (state === "COMPLETED") return "AI 质检已通过，未检测到残留，清洁效果达标。";
      return "清洁完成后 AI 将自动执行闭环质检，如有残留会触发二次定点清洁。";
    }

    // 问进度
    if (/(进度|多久|还要|完成|什么时候)/i.test(lower)) {
      if (state === "COMPLETED") return "任务已完成！清洁进度 100%，质检通过。";
      if (state === "IDLE") return "尚未开始任务，点击「一键体验 AI 全流程」即可启动。";
      return `当前清洁进度 ${progress}%，状态：${STATE_LABELS[state]}。`;
    }

    // 问模式
    if (/(模式|快速|深度|儿童|标准)/i.test(lower)) {
      const modeDesc: Record<string, string> = {
        fast: "日常快速模式：效率优先，缩短清洁时间，适合轻度污染。",
        standard: "标准清洁模式：均衡效果与能耗，适合日常餐桌清洁。",
        deep: "深度清洁模式：加大水量和转速，AI 复检，适合重油污场景。",
        child: "儿童房专项模式：低转速软耗材，保护家具，噪音更低。",
      };
      return `当前为【${MODE_LABELS[mode]}】。${modeDesc[mode]}点击左侧快捷按钮可切换模式。`;
    }

    // 问报告/结果
    if (/(报告|结果|总结|数据)/i.test(lower)) {
      if (report) {
        return `任务报告已生成：耗时 ${report.duration}s，清洁完成度 ${report.cleanCompletion}%，油污清洁率 ${report.metrics.oilCleanRate}%，避障 ${report.obstacleAvoided} 次。可在「任务报告」页查看详情。`;
      }
      return "任务完成后会自动生成详细报告，包含清洁数据、质检结果和 AI 决策依据。";
    }

    // 停止/暂停
    if (/(停|停止|暂停|取消)/i.test(lower)) {
      if (state === "IDLE") return "当前没有正在执行的任务。";
      return "已收到停止指令，当前作业将终止，母机开始回收子机。（演示环境暂不支持中途停止）";
    }

    // 问子机/母机
    if (/(子机|母机|机器人|协同)/i.test(lower)) {
      return "子机负责桌面移动清洁，母机提供升降支撑和持续供电，通过 RS485 通信协同作业。可在「子母协同」页查看详细调度关系。";
    }

    // 默认：根据状态回复
    if (state === "IDLE") {
      return `收到您的请求。当前为【${MODE_LABELS[mode]}】模式，检测到 ${solid} 个固体垃圾、${oil} 处油污、${water} 处水渍、${obstacle} 个障碍物。点击「一键体验 AI 全流程」开始清洁。`;
    }
    if (state === "COMPLETED") {
      return `本次清洁任务已完成！共处理 ${solid} 个固体垃圾、${oil} 处油污、${water} 处水渍，避障 ${obstacle} 次，AI 质检通过。还有什么需要帮您的？`;
    }
    return `当前 Agent 状态：${STATE_LABELS[state]}，清洁进度 ${progress}%。我会根据感知结果与您的需求动态调整清洁策略。`;
  };

  const handleSend = () => {
    const txt = input.trim();
    if (!txt) return;
    addMessage({
      role: "user",
      content: txt,
      time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    });
    setInput("");
    // 模拟 AI 思考延迟
    setTimeout(() => {
      const reply = generateReply(txt);
      addMessage({
        role: "ai",
        content: reply,
        time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
      });
    }, 400);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 flex flex-col h-full">
      <div className="px-4 py-2 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">AI 对话（联动系统状态）</h3>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg ${m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
            >
              <div>{m.content}</div>
              <div className={`text-[10px] mt-1 ${m.role === "user" ? "text-blue-200" : "text-slate-400"}`}>
                {m.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 p-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="输入问题，如：为什么又清洁了一次？"
          className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
