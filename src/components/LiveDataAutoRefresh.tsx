import { useLiveScores } from "../hooks/useLiveScores";

export function LiveDataAutoRefresh() {
  useLiveScores({ autoRefresh: true, intervalMs: 5 * 60 * 1000 });
  return null;
}
