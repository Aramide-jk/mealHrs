export function isCutoffPassed(cutoffAt: string, now: string): boolean {
  return new Date(now).getTime() >= new Date(cutoffAt).getTime();
}
