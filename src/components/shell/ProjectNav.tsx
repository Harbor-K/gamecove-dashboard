import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBoards } from "../../state/store";
import {
  AddPlusIcon,
  AnalysisBoardIcon,
  ChevronDownSmIcon,
  ChevronRightSmIcon,
  CompassIcon,
  HomeIcon,
  LineChartIcon,
  MonetisationIcon,
  PeopleIcon,
  QualityIcon,
  RepeatIcon,
  TrackingIcon,
} from "../icons/GameCoveIcons";
import { assets } from "../../data/workspace";
import { useScreenInit } from "../../useScreenInit.js";
import { ProjectMembersPopover } from "./ProjectMembersPopover";
import { NavItem } from "./NavItem";
import { RailButton } from "./RailButton";
import { SettingsNavItem } from "./SettingsNavItem";

export type ProjectRoute = "overview" | "retention" | "analysis-board" | "explore" | "tracking";

/** Project members → "Who has access" popover (canvas screen can open it: state membersOpen). */
function useMembersPopover() {
  const screenInit = useScreenInit() as { membersOpen?: boolean };
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(Boolean(screenInit.membersOpen));
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  useEffect(() => setAnchor(ref.current), []);
  const popover = open && anchor ? <ProjectMembersPopover anchor={anchor} onClose={() => setOpen(false)} /> : null;
  return { ref, open, toggle: () => setOpen((o) => !o), popover };
}

// Project navigation: members → (32) Overview…Quality → (32) Tracking → Workspace / Setting.
// Before any board: "+ New board" (question screen with COVY, no modal). Once COVY has built a board:
// "Analysis Board" (expanded) with its boards; new boards come from the + next to the chevron (Notion-style).
export function ProjectNav({ projectId, selected }: { projectId: string; selected: ProjectRoute | null }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const boards = useBoards();
  // A board joins the nav once COVY has built it.
  const readyBoards = boards.filter((b) => b.ready);
  const onBoardPage = selected === "analysis-board";
  const boardParam = params.get("board");
  // Board on screen: ?board=…, or the canvas-screen board when the page opens straight on it.
  const shown = onBoardPage ? boardParam ?? (params.get("new") === null && boards.length === 1 && boards[0].id === "seed" ? "seed" : null) : null;
  const currentBoard = readyBoards.some((b) => b.id === shown) ? shown : null;
  // Opens (and stays open) when a board is added.
  const [boardOpen, setBoardOpen] = useState(true);
  useEffect(() => {
    if (readyBoards.length) setBoardOpen(true);
  }, [readyBoards.length]);
  const go = (route: ProjectRoute) => navigate(`/projects/${projectId}/${route}`);
  const newBoard = () => navigate(`/projects/${projectId}/analysis-board?new=1`);
  const members = useMembersPopover();

  return (
    <>
      <div ref={members.ref} className="w-full shrink-0">
        <NavItem icon={<PeopleIcon />} label="Project members" selected={members.open} onClick={members.toggle} />
      </div>
      {members.popover}

      <div className="scrollbar-none -mx-4 flex min-h-0 w-[calc(100%+32px)] flex-1 flex-col gap-8 overflow-y-auto px-4 pt-4">
        <div className="flex w-full flex-col gap-1">
          <NavItem icon={<LineChartIcon />} label="Overview" selected={selected === "overview"} onClick={() => go("overview")} />
          <NavItem icon={<RepeatIcon />} label="Retention" selected={selected === "retention"} onClick={() => go("retention")} />
          {readyBoards.length === 0 ? (
            // No board yet: one "+ New board" item (start a board with COVY).
            <NavItem icon={<AddPlusIcon />} label="New board" selected={onBoardPage} onClick={newBoard} />
          ) : (
            <>
              <AnalysisBoardRow open={boardOpen} onToggle={() => setBoardOpen(!boardOpen)} onAdd={newBoard} />
              {boardOpen &&
                // Boards under "Analysis Board": label left-aligned with the "Analysis Board" label (no guide line)
                readyBoards.map((b) => (
                  <NavItem
                    key={b.id}
                    label={b.name}
                    level="nested"
                    selected={currentBoard === b.id}
                    onClick={() => navigate(`/projects/${projectId}/analysis-board?board=${b.id}`)}
                  />
                ))}
            </>
          )}
          <NavItem icon={<CompassIcon />} label="Explore" selected={selected === "explore"} onClick={() => go("explore")} />
          <NavItem icon={<MonetisationIcon />} hoverIcon={<ChevronRightSmIcon />} label="Monetisation" />
          <NavItem icon={<QualityIcon />} hoverIcon={<ChevronRightSmIcon />} label="Quality" />
        </div>
        <NavItem icon={<TrackingIcon />} label="Tracking" selected={selected === "tracking"} onClick={() => go("tracking")} />
      </div>

      <div className="flex w-full shrink-0 flex-col gap-1">
        <NavItem icon={<HomeIcon />} label="Workspace" onClick={() => navigate("/")} />
        <SettingsNavItem />
      </div>
    </>
  );
}

/** Screen px → CSS px (the whole app is scaled by --gc-zoom). */
const toCssPx = (px: number) => px / (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gc-zoom")) || 1);
const BUBBLE_FILL = "linear-gradient(var(--gc-bg-accent-strong), var(--gc-bg-accent-strong)), var(--gc-bg-surface)";

/**
 * "Analysis Board" row, Notion-style: at rest = board icon + label only.
 * Hover = the icon turns into the chevron (› collapsed / ⌄ expanded) and the + shows on the right.
 */
function AnalysisBoardRow({ open, onToggle, onAdd }: { open: boolean; onToggle: () => void; onAdd: () => void }) {
  return (
    <div className="group/row flex h-control-48 w-full shrink-0 items-center rounded-sm pr-2 hover:rounded-md hover:bg-bg-hover">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex h-full min-w-0 flex-1 items-center gap-3 pl-2 text-left cursor-pointer">
        <span className="flex size-icon-sm shrink-0 items-center justify-center text-icon-secondary group-hover/row:text-icon-primary">
          <span className="flex group-hover/row:hidden">
            <AnalysisBoardIcon />
          </span>
          <span className="hidden group-hover/row:flex">{open ? <ChevronDownSmIcon /> : <ChevronRightSmIcon />}</span>
        </span>
        <span className="min-w-0 flex-1 truncate text-body-default text-text-secondary group-hover/row:text-text-primary">Analysis Board</span>
      </button>
      <AddBoardButton onAdd={onAdd} />
    </div>
  );
}

/** + with an "Add a board" box below it (bubble style of "Just 3 steps!" — accent fill on surface, accent border — no tail). */
function AddBoardButton({ onAdd }: { onAdd: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTip({ x: toCssPx(r.left + r.width / 2), y: toCssPx(r.bottom) });
  };
  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label="Add a board"
        onClick={() => {
          setTip(null);
          onAdd();
        }}
        onMouseEnter={show}
        onMouseLeave={() => setTip(null)}
        onFocus={show}
        onBlur={() => setTip(null)}
        className="ml-4 flex size-icon-sm shrink-0 items-center justify-center text-icon-secondary opacity-0 icon-hit hover:text-icon-primary group-hover/row:opacity-100 focus-visible:opacity-100"
      >
        <AddPlusIcon />
      </button>
      {tip &&
        createPortal(
          // Centred under the + with a zero-width box + flex (no translate), so borders stay on whole pixels.
          <div
            role="tooltip"
            className="pointer-events-none fixed z-50 flex w-0 flex-col items-center"
            style={{ left: tip.x, top: tip.y + 12.8, animation: "gc-hint-in 280ms cubic-bezier(0.2,0.8,0.2,1) both", transformOrigin: "50% 0" }}
          >
            {/* Same box as the "Just 3 steps!" bubble, without the tail */}
            <span
              className="block shrink-0 whitespace-nowrap rounded-md border border-border-accent px-[11px] py-[7px] text-label-default text-text-on-accent"
              style={{ background: BUBBLE_FILL }}
            >
              Add a board
            </span>
          </div>,
          document.body,
        )}
    </>
  );
}

/**
 * Minimal rail (Game Setup only): the same items as the nav, icons only, names on hover.
 * Groups: members · Overview…Quality · Tracking … Workspace · Setting · avatar (reference: Railway sidebar).
 */
export function ProjectRail({ projectId, selected }: { projectId: string; selected: ProjectRoute | null }) {
  const navigate = useNavigate();
  const boards = useBoards().filter((b) => b.ready);
  const go = (route: ProjectRoute) => navigate(`/projects/${projectId}/${route}`);
  const lastBoard = boards[boards.length - 1];
  const members = useMembersPopover();
  return (
    <>
      <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-6 overflow-y-auto scrollbar-none">
        <div ref={members.ref} className="flex">
          <RailButton icon={<PeopleIcon />} label="Project members" selected={members.open} onClick={members.toggle} />
        </div>
        {members.popover}
        <div className="flex flex-col items-center gap-2">
          <RailButton icon={<LineChartIcon />} label="Overview" selected={selected === "overview"} onClick={() => go("overview")} />
          <RailButton icon={<RepeatIcon />} label="Retention" selected={selected === "retention"} onClick={() => go("retention")} />
          {lastBoard ? (
            <RailButton
              icon={<AnalysisBoardIcon />}
              label="Analysis Board"
              selected={selected === "analysis-board"}
              onClick={() => navigate(`/projects/${projectId}/analysis-board?board=${lastBoard.id}`)}
            />
          ) : (
            <RailButton
              icon={<AddPlusIcon />}
              label="New board"
              selected={selected === "analysis-board"}
              onClick={() => navigate(`/projects/${projectId}/analysis-board?new=1`)}
            />
          )}
          <RailButton icon={<CompassIcon />} label="Explore" selected={selected === "explore"} onClick={() => go("explore")} />
          <RailButton icon={<MonetisationIcon />} label="Monetisation" />
          <RailButton icon={<QualityIcon />} label="Quality" />
        </div>
        <RailButton icon={<TrackingIcon />} label="Tracking" selected={selected === "tracking"} onClick={() => go("tracking")} />
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2 pt-4">
        <RailButton icon={<HomeIcon />} label="Workspace" onClick={() => navigate("/")} />
        <SettingsNavItem compact />
        <button type="button" aria-label="Account menu" className="mt-2 flex size-10 items-center justify-center rounded-md cursor-pointer hover:bg-bg-hover">
          <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-avatar-violet">
            <img src={assets.avatar} alt="" className="size-full object-cover" />
          </span>
        </button>
      </div>
    </>
  );
}
