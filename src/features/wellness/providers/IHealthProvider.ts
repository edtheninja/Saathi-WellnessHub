import type { HealthMetrics } from "../types/HealthMetrics";

export interface IHealthProvider {
  isAvailable(): Promise<boolean>;

  connect(): Promise<boolean>;

  requestPermissions(): Promise<boolean>;

  getHealthData(): Promise<HealthMetrics | null>;

  disconnect(): Promise<void>;
}