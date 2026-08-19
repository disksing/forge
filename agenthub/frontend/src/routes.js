export const BEEPER_PATH = "/agenthub/beeper";

export function isBeeperPath(pathname) {
  return String(pathname || "").replace(/\/+$/, "") === BEEPER_PATH;
}
