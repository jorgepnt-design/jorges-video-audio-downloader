import { useCallback, useEffect, useState } from "react";
import { footballApi, type LiveDataResponse } from "../services/footballApi";
import { liveDataService } from "../services/liveDataService";

interface Options {
  autoRefresh?: boolean;
  intervalMs?: number;
}

export const useLiveScores = ({ autoRefresh = false, intervalMs = 5 * 60 * 1000 }: Options = {}) => {
  const [lastUpdate, setLastUpdate] = useState<LiveDataResponse | null>(() => liveDataService.getCachedLiveData());
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLiveData = useCallback(async () => {
    setIsUpdating(true);
    setError(null);
    try {
      setLastUpdate(await footballApi.fetchLiveData());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Live-Daten konnten nicht geladen werden.");
    } finally {
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    refreshLiveData();
    const timer = window.setInterval(refreshLiveData, intervalMs);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshLiveData();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [autoRefresh, intervalMs, refreshLiveData]);

  return { lastUpdate, isUpdating, error, refreshLiveData };
};
