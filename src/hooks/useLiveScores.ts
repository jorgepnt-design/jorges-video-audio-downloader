import { useState } from "react";
import { footballApi, type LiveDataResponse } from "../services/footballApi";

export const useLiveScores = () => {
  const [lastUpdate, setLastUpdate] = useState<LiveDataResponse | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const refreshLiveData = async () => {
    setIsUpdating(true);
    try {
      setLastUpdate(await footballApi.fetchLiveData());
    } finally {
      setIsUpdating(false);
    }
  };

  return { lastUpdate, isUpdating, refreshLiveData };
};
