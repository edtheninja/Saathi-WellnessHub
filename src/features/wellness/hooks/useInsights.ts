import { useMemo } from "react";

import { useHealthMetrics } from "./useHealthMetrics";
import InsightEngine from "../services/InsightEngine";

export function useInsights() {
  const metrics = useHealthMetrics();

  return useMemo(() => {
    return InsightEngine.generate(metrics);
  }, [metrics]);
}