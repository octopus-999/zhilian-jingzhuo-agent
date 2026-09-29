import { useState } from "react";
import { useAgentStore } from "./agent/store";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Perception from "./pages/Perception";
import Decision from "./pages/Decision";
import Collaboration from "./pages/Collaboration";
import Execution from "./pages/Execution";
import Inspection from "./pages/Inspection";
import Report from "./pages/Report";

export type PageKey =
  | "dashboard"
  | "perception"
  | "decision"
  | "collaboration"
  | "execution"
  | "inspection"
  | "report";

export default function App() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const state = useAgentStore((s) => s.state);

  return (
    <Layout page={page} setPage={setPage}>
      {page === "dashboard" && <Dashboard setPage={setPage} />}
      {page === "perception" && <Perception />}
      {page === "decision" && <Decision />}
      {page === "collaboration" && <Collaboration />}
      {page === "execution" && <Execution />}
      {page === "inspection" && <Inspection />}
      {page === "report" && <Report />}
    </Layout>
  );
}
