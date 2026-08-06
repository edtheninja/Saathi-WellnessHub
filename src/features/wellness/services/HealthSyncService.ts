import ProviderRegistry from "../providers/ProviderRegistry";
import DeviceManager from "./DeviceManager";
import HealthDataStore from "./HealthDataStore";
import WellnessHistoryService from "./WellnessHistoryService";
class HealthSyncService {

  async sync() {

    const status = DeviceManager.getStatus();

    if (!status.connected || !status.platform) {
      return null;
    }

    const provider =
      ProviderRegistry.getProvider(status.platform);

    const metrics =
      await provider.getHealthData();

    if (metrics) {
      HealthDataStore.saveMetrics(metrics);

      WellnessHistoryService.add({
        id: crypto.randomUUID(),
        type: "sync",
        title: "Health Data Synced",
        subtitle: "Latest wellness metrics updated",
        timestamp: new Date().toISOString(),
      });
    }

    return metrics;
  }

}

export default new HealthSyncService();