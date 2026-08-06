import {
  IHealthProvider,
  HealthMetric,
} from "./HealthProvider";

export default class AppleHealthProvider
  implements IHealthProvider {

  async isAvailable() {
    // Real implementation later
    return false;
  }

  async connect() {}

  async requestPermissions() {
    return false;
  }

  async getHealthMetrics(): Promise<HealthMetric> {
    return {};
  }
}