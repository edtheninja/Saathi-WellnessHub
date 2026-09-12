export interface HealthMetric {
  heartRate?: number;
  steps?: number;
  sleepHours?: number;
  calories?: number;
  distance?: number;
}

export interface IHealthProvider {
  isAvailable(): Promise<boolean>;

  connect(): Promise<void>;

  requestPermissions(): Promise<boolean>;

  getHealthMetrics(): Promise<HealthMetric>;
}