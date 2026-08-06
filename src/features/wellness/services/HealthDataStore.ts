import type { HealthMetrics } from "../types/HealthMetrics";
import WellnessEvents from "./WellnessEvents";

const STORAGE_KEY = "saathi_health_metrics";

class HealthDataStore {
  private metrics: HealthMetrics | null = null;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        this.metrics = JSON.parse(saved);
      } catch {
        this.metrics = null;
      }
    }
  }

  getMetrics(): HealthMetrics | null {
    return this.metrics;
  }

  saveMetrics(metrics: HealthMetrics) {
    this.metrics = metrics;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(metrics)
    );
    WellnessEvents.emit();
  }

  clear() {
    this.metrics = null;
    localStorage.removeItem(STORAGE_KEY);
    WellnessEvents.emit();
  }
}

export default new HealthDataStore();