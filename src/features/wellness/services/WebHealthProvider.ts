import {
  IHealthProvider,
  HealthMetric,
} from "./HealthProvider";

export default class WebHealthProvider
  implements IHealthProvider {

  async isAvailable() {
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