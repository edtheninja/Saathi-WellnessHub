import { useMemo } from "react";

import { useHealthMetrics } from "./useHealthMetrics";
import RecommendationEngine from "../services/RecommendationEngine";

export function useRecommendations() {
  const metrics = useHealthMetrics();

  return useMemo(() => {
    return RecommendationEngine.generate(metrics);
  }, [metrics]);
}