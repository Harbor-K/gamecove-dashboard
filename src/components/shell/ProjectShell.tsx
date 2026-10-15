import React from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useAgent } from "../../contexts/AgentContext";
import { assets, projects } from "../../data/workspace";
import { isMappingSaved } from "../../hooks/useMappingSetup";
import { useSetupRail } from "../../state/shell";
import { AgentPanel } from "../agent/AgentPanel";
import { AppShell } from "./AppShell";
import { ProjectNav, ProjectRail, type ProjectRoute } from "./ProjectNav";

const ROUTES: ProjectRoute[] = ["overview", "retention", "analysis-board", "explore", "tracking"];

export function ProjectShell() {
  const { projectId = "bouncebounce" } = useParams();
  const { pathname } = useLocation();
  const agent = useAgent();
  const project = projects.find((p) => p.id === projectId) ?? projects[0];
  const last = pathname.split("/").filter(Boolean).pop() as ProjectRoute;
  const selected = ROUTES.includes(last) ? last : null;
  // Game Setup (mapping on Tracking) shows only the minimal rail. Tracking reports its phase;
  // before it does (first paint), Tracking without a saved map = setup.
  const railState = useSetupRail();
  const compact = selected === "tracking" && (railState ?? !isMappingSaved());

  return (
    <AppShell
      select={{ name: project.name, thumbnail: assets.project, thumbnailBackdrop: false, ariaLabel: "Select project" }}
      nav={<ProjectNav key={projectId} projectId={projectId} selected={selected} />}
      rail={<ProjectRail projectId={projectId} selected={selected} />}
      compact={compact}
      onAiAgent={agent.toggle}
      agentOpen={agent.open}
      rightInset={agent.open && !agent.expanded && selected !== "tracking" ? agent.width + 32 : 0}
      overlay={<AgentPanel />}
    >
      <Outlet />
    </AppShell>
  );
}
