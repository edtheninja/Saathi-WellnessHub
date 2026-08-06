import type { IHealthProvider } from "./IHealthProvider";

import HealthConnectProvider from "./HealthConnectProvider";
import AppleHealthProvider from "./AppleHealthProvider";
import SamsungHealthProvider from "./SamsungHealthProvider";
import FitbitProvider from "./FitbitProvider";
import GarminProvider from "./GarminProvider";

export type ProviderId =
  | "health-connect"
  | "apple-health"
  | "samsung-health"
  | "fitbit"
  | "garmin";

class ProviderRegistry {
  private providers: Record<ProviderId, IHealthProvider> = {
    "health-connect": HealthConnectProvider,
    "apple-health": AppleHealthProvider,
    "samsung-health": SamsungHealthProvider,
    fitbit: FitbitProvider,
    garmin: GarminProvider,
  };

  getProvider(id: ProviderId): IHealthProvider {
    return this.providers[id];
  }

  getProviders() {
    return this.providers;
  }

  async getAvailableProviders(): Promise<ProviderId[]> {
    const available: ProviderId[] = [];

    for (const [id, provider] of Object.entries(this.providers)) {
      if (await provider.isAvailable()) {
        available.push(id as ProviderId);
      }
    }

    return available;
  }
}

export default new ProviderRegistry();