import type { HealthMetrics } from "../types/HealthMetrics";
import type { IHealthProvider } from "./IHealthProvider";

class SamsungHealthProvider implements IHealthProvider {

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async connect(): Promise<boolean> {
    console.log("Connecting Samsung Health...");
    return false;
  }

  async requestPermissions(): Promise<boolean> {
    return false;
  }

  async getHealthData(): Promise<HealthMetrics | null> {
    return null;
  }

  async disconnect(): Promise<void> {}
}

export default new SamsungHealthProvider();