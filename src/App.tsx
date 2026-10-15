import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProjectShell } from "./components/shell/ProjectShell";
import { AgentProvider } from "./contexts/AgentContext";
import { AnalysisBoardPage } from "./pages/AnalysisBoard";
import { ExplorePage } from "./pages/Explore";
import { OverviewPage } from "./pages/Overview";
import { RetentionPage } from "./pages/Retention";
import { TrackingPage } from "./pages/Tracking";
import { WorkspacePage } from "./pages/Workspace";

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AgentProvider>
        <Routes>
          <Route path="/" element={<WorkspacePage />} />
          <Route path="/projects/:projectId" element={<ProjectShell />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="tracking" element={<TrackingPage />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="retention" element={<RetentionPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="analysis-board" element={<AnalysisBoardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AgentProvider>
    </BrowserRouter>
  );
}
