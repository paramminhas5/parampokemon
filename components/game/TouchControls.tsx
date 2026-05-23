type Dir = "up" | "down" | "left" | "right";

export function TouchControls({
  onDir, onAction, onMenu,
}: {
  onDir: (dir: Dir, down: boolean) => void;
  onAction: () => void;
  onMenu: () => void;
}) {
  // Touch controls are intentionally a no-op: on mobile the canvas is
  // controlled purely by tap-to-walk and swipe/scroll gestures handled
  // inside the engine. HUD provides MENU / NOTES / BAG / EXIT.
  void onDir; void onAction; void onMenu;
  return null;
}
