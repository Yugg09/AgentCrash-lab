import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/Dashboard";
import { AgentsPage } from "./pages/Agents";
import { AgentDetailPage } from "./pages/AgentDetail";
import { GeneratePage } from "./pages/Generate";
import { TestRunPage } from "./pages/TestRun";
import { ExecutionPage } from "./pages/Execution";
import { FailureDnaPage } from "./pages/FailureDna";
import { FailuresPage } from "./pages/Failures";
import { AnalyticsPage } from "./pages/Analytics";
import { RegressionPage } from "./pages/Regression";
import { TestsPage } from "./pages/Tests";
import { RunsPage } from "./pages/Runs";
import { SettingsPage } from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/agents/:id" element={<AgentDetailPage />} />
        <Route path="/agents/:id/generate" element={<GeneratePage />} />
        <Route path="/agents/:id/analytics" element={<AnalyticsPage />} />
        <Route path="/agents/:id/regressions" element={<RegressionPage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/runs" element={<RunsPage />} />
        <Route path="/test-runs/:id" element={<TestRunPage />} />
        <Route path="/executions/:id" element={<ExecutionPage />} />
        <Route path="/failures" element={<FailuresPage />} />
        <Route path="/failures/:id" element={<FailureDnaPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
