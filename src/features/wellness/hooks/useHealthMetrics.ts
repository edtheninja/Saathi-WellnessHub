import { useEffect, useState } from "react";
import type { HealthMetrics } from "../types/HealthMetrics";
import HealthDataStore from "../services/HealthDataStore";

export function useHealthMetrics() {

  const [metrics, setMetrics] =
    useState<HealthMetrics | null>(
      HealthDataStore.getMetrics()
    );

  useEffect(() => {

    const interval = setInterval(() => {

      setMetrics(
        HealthDataStore.getMetrics()
      );

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  return metrics;
}