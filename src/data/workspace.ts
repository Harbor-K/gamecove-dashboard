import type { Project } from "../types/setup";

const ASSET_BASE = "https://game-cove.vercel.app";

export const assets = {
  logo: `${ASSET_BASE}/images/gamecove-logo-20260929.svg`,
  logoMark: `${ASSET_BASE}/favicon-20260929.svg`,
  avatar: `${ASSET_BASE}/images/avatar-jacob.webp`,
  studio: `${ASSET_BASE}/images/studio-h2.png`,
  project: `${ASSET_BASE}/images/project-bouncebounce.png`,
};

export const currentUser = { name: "Jacob Parker", role: "Owner" };
export const currentStudio = { name: "H2 Studio" };

export const projects: Project[] = [
  { id: "bouncebounce", name: "Bounce Bounce", platform: "roblox", memberCount: 1, role: "owner", activity: "Just created", needsSetup: true },
  { id: "tower-escape", name: "Tower Escape", platform: "unity", memberCount: 3, role: "editor", activity: "Updated yesterday", needsSetup: false },
  { id: "lantern-harbor", name: "Lantern Harbor", platform: "roblox", memberCount: 2, role: "editor", activity: "Updated 3 days ago", needsSetup: false },
];

/** Project members (Figma `Popover / Project members`, repo data/workspace.ts projectMembers). Names are data, not translated. */
export const projectMembers: { id: string; name: string; avatar: string; role: "owner" | "editor" | "viewer"; isYou: boolean }[] = [
  { id: "jacob", name: "Jacob Parker", avatar: `${ASSET_BASE}/images/member-jacob.png`, role: "owner", isYou: true },
  { id: "jihyun", name: "Jihyun Kim", avatar: `${ASSET_BASE}/images/member-jihyun.png`, role: "editor", isYou: false },
  { id: "minseo", name: "Minseo Park", avatar: `${ASSET_BASE}/images/member-minseo.png`, role: "viewer", isYou: false },
];

export const platformLabels = { all: "All", roblox: "Roblox", unity: "Unity", others: "Others" } as const;
export const roleLabels = { all: "All", owner: "Owner", editor: "Editor", viewer: "Viewer" } as const;
