import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, SearchIcon, ViewGridIcon, ViewListIcon } from "../components/icons/GameCoveIcons";
import { AppShell } from "../components/shell/AppShell";
import { WorkspaceNav } from "../components/shell/WorkspaceNav";
import { Button } from "../components/ui/Button";
import { FilterSelect } from "../components/ui/FilterSelect";
import { ProjectCard } from "../components/workspace/ProjectCard";
import { assets, currentStudio, platformLabels, projects, roleLabels } from "../data/workspace";
import type { Platform, ProjectRole } from "../types/setup";

type PlatformFilter = Platform | "all";
type RoleFilter = ProjectRole | "all";

const platformValues: PlatformFilter[] = ["all", "roblox", "unity", "others"];
const roleValues: RoleFilter[] = ["all", "owner", "editor", "viewer"];

// Figma "워크스페이스 (셋업 전)": pt200, gap40, width 1200.
export function WorkspacePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [openFilter, setOpenFilter] = useState<"platform" | "role" | null>(null);

  const visible = projects.filter(
    (p) =>
      (platform === "all" || p.platform === platform) &&
      (role === "all" || p.role === role) &&
      p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <AppShell
      select={{ name: currentStudio.name, thumbnail: assets.studio, thumbnailBackdrop: true, ariaLabel: "Select studio" }}
      nav={<WorkspaceNav />}
    >
      <div className="flex w-full flex-col items-center gap-10 px-12 pb-24 pt-[200px]">
        <div className="flex w-[1200px] max-w-full items-center gap-4">
          <div className="flex items-end gap-3 whitespace-nowrap">
            <h1 className="text-display-page text-text-primary">Your Projects</h1>
            <span className="text-body-default text-text-secondary">
              {visible.length} {visible.length === 1 ? "project" : "projects"}
            </span>
          </div>
          <div className="h-px min-w-px flex-1" />
          <Button variant="primary" icon={<PlusIcon />}>
            New Project
          </Button>
        </div>

        <div className="flex w-[1200px] max-w-full flex-col gap-6">
          <div className="flex w-full items-center gap-2">
            <label className="flex h-control-48 min-w-px flex-1 items-center gap-3 rounded-lg bg-bg-surface px-3 ring-1 ring-inset ring-border-default">
              <SearchIcon className="shrink-0 text-icon-primary" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects"
                aria-label="Search projects"
                className="min-w-0 flex-1 bg-transparent text-body-default text-text-primary outline-none placeholder:text-text-secondary"
              />
            </label>
            <FilterSelect
              label={platform === "all" ? "All platforms" : platformLabels[platform]}
              ariaLabel="Filter by platform"
              options={platformValues.map((v) => ({ value: v, label: platformLabels[v] }))}
              value={platform}
              onChange={setPlatform}
              open={openFilter === "platform"}
              onOpenChange={(o) => setOpenFilter(o ? "platform" : null)}
            />
            <FilterSelect
              label={role === "all" ? "All roles" : roleLabels[role]}
              ariaLabel="Filter by role"
              options={roleValues.map((v) => ({ value: v, label: roleLabels[v] }))}
              value={role}
              onChange={setRole}
              open={openFilter === "role"}
              onOpenChange={(o) => setOpenFilter(o ? "role" : null)}
            />
            <div className="flex items-start gap-2">
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed
                className="flex size-12 items-center justify-center rounded-lg bg-bg-selected text-icon-primary ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
              >
                <ViewGridIcon />
              </button>
              <button
                type="button"
                aria-label="List view"
                aria-pressed={false}
                className="flex size-12 items-center justify-center rounded-lg text-icon-primary ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
              >
                <ViewListIcon />
              </button>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => navigate(`/projects/${project.id}/${project.needsSetup ? "tracking" : "overview"}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
