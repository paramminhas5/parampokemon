// BFS pathfinding on a solid-tile grid.

export function findPath(
  startX: number, startY: number,
  goalX: number, goalY: number,
  isSolid: (x: number, y: number) => boolean,
  maxNodes = 4000,
): { x: number; y: number }[] | null {
  if (startX === goalX && startY === goalY) return [];
  const key = (x: number, y: number) => x + "," + y;
  const came = new Map<string, string>();
  const visited = new Set<string>([key(startX, startY)]);
  const queue: [number, number][] = [[startX, startY]];
  let nodes = 0;
  while (queue.length) {
    const [x, y] = queue.shift()!;
    if (++nodes > maxNodes) return null;
    for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]] as const) {
      const nx = x + dx, ny = y + dy;
      const k = key(nx, ny);
      if (visited.has(k)) continue;
      // allow goal even if "solid" (e.g. door/NPC) — engine handles interact
      if ((nx !== goalX || ny !== goalY) && isSolid(nx, ny)) continue;
      visited.add(k);
      came.set(k, key(x, y));
      if (nx === goalX && ny === goalY) {
        const path: { x: number; y: number }[] = [];
        let cur = k;
        while (cur !== key(startX, startY)) {
          const [cx, cy] = cur.split(",").map(Number);
          path.unshift({ x: cx, y: cy });
          cur = came.get(cur)!;
        }
        return path;
      }
      queue.push([nx, ny]);
    }
  }
  return null;
}
