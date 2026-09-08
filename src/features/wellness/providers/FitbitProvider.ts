import type { HealthMetrics } from "../types/HealthMetrics";
import type { IHealthProvider } from "./IHealthProvider";

class FitbitProvider implements IHealthProvider {

  private apiBase = import.meta.env.VITE_API_URL || "/api";

  private headers() {
    const token = localStorage.getItem("saathi_access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async connect(): Promise<boolean> {
    const response = await fetch(`${this.apiBase}/integrations/fitbit/start`, {
      headers: this.headers(),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Fitbit is not configured");
    window.location.assign(payload.url);
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    return false;
  }

  async getHealthData(): Promise<HealthMetrics | null> {
    const response = await fetch(`${this.apiBase}/integrations/fitbit/metrics`, {
      headers: this.headers(),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to sync Fitbit data");
    return payload.data as HealthMetrics;
  }

  async disconnect(): Promise<void> {
    await fetch(`${this.apiBase}/integrations/fitbit`, {
      method: "DELETE",
      headers: this.headers(),
    });
  }
}

export default new FitbitProvider();