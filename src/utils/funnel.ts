export type FunnelRow = {
  users: number;
  reachRate: number;
  previousReach: number;
  dropOff: number | null;
  isMaxDrop: boolean;
};

/** Reach / drop-off per step; the biggest drop-off step is flagged. */
export function funnelRows(users: number[]): FunnelRow[] {
  const first = users[0] || 1;
  const rows = users.map((u, i) => ({
    users: u,
    reachRate: (u / first) * 100,
    previousReach: i === 0 ? 100 : (users[i - 1] / first) * 100,
    dropOff: i === 0 ? null : ((users[i - 1] - u) / users[i - 1]) * 100,
    isMaxDrop: false,
  }));
  let max = -1;
  let maxI = -1;
  rows.forEach((r, i) => {
    if (r.dropOff !== null && r.dropOff > max) {
      max = r.dropOff;
      maxI = i;
    }
  });
  if (maxI >= 0) rows[maxI].isMaxDrop = true;
  return rows;
}

export const pct = (v: number) => `${v.toFixed(1)}%`;
