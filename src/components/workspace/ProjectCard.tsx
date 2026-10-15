import React from "react";
import { platformLabels, roleLabels } from "../../data/workspace";
import type { Project } from "../../types/setup";
import { PeopleIcon } from "../icons/GameCoveIcons";
import { PlatformLogo } from "./PlatformLogo";

// Figma `Card / Project`: h228, p24, gap4, radius 16. Hover = bg/hover.
export function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex h-[228px] min-w-0 flex-col gap-1 rounded-lg bg-bg-surface p-6 ring-1 ring-inset ring-border-default cursor-pointer hover:bg-bg-hover"
    >
      <h2 className="h-[31px] truncate text-[24px] font-semibold leading-[1.3] tracking-[-0.24px] text-text-primary">{project.name}</h2>
      <div className="flex h-7 w-fit items-center gap-2 rounded-full pl-1 pr-3 text-text-primary">
        <PlatformLogo platform={project.platform} />
        <span className="whitespace-nowrap text-label-default">{platformLabels[project.platform]}</span>
      </div>
      <div className="min-h-px flex-1" />
      <div className="flex w-full items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-primary" aria-label={`${project.memberCount} members`}>
            <PeopleIcon className="shrink-0" />
            <span className="text-label-default">{project.memberCount}</span>
          </div>
          <span className="flex h-7 items-center whitespace-nowrap rounded-full px-2 text-label-default text-text-primary ring-1 ring-inset ring-icon-primary">
            {roleLabels[project.role]}
          </span>
        </div>
        <div className="h-px min-w-px flex-1" />
        <span className="whitespace-nowrap text-label-default text-text-secondary">{project.activity}</span>
      </div>
    </article>
  );
}
