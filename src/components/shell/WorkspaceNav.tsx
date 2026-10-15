import React from "react";
import { DataIcon, HomeIcon, PaperIcon, PeopleIcon } from "../icons/GameCoveIcons";
import { NavItem } from "./NavItem";
import { SettingsNavItem } from "./SettingsNavItem";

// Workspace nav (Figma frame): top Studio group labels are primary, bottom Workspace group uses the component default (secondary).
export function WorkspaceNav() {
  return (
    <>
      <div className="flex w-full shrink-0 flex-col gap-1">
        <NavItem icon={<PeopleIcon />} label="Studio members" labelTone="primary" />
        <NavItem icon={<PaperIcon />} label="Reports" labelTone="primary" />
        <NavItem icon={<DataIcon />} label="Data Sources" labelTone="primary" />
      </div>
      <div className="min-h-px flex-1" />
      <div className="flex w-full shrink-0 flex-col gap-1">
        <NavItem icon={<HomeIcon />} label="Workspace" selected />
        <SettingsNavItem />
      </div>
    </>
  );
}
