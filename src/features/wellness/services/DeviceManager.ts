import HealthSyncService from "./HealthSyncService";
import HealthConnectProvider from "../providers/HealthConnectProvider";
import type { HealthMetrics } from "../types/HealthMetrics";
import ProviderRegistry from "../providers/ProviderRegistry";
import DeviceStorage from "./DeviceStorage";
import WellnessHistoryService from "./WellnessHistoryService";
import WellnessEvents from "./WellnessEvents";
export type DevicePlatform =
  | "health-connect"
  | "apple-health"
  | "fitbit"
  | "garmin"
  | "samsung-health";

export interface DeviceStatus {
  connected: boolean;
  platform?: DevicePlatform;
  deviceName?: string;
  lastSync?: string;
}

class DeviceManager {
  private status: DeviceStatus = {
    connected: false,
  };

  constructor() {
    const savedDevice = DeviceStorage.load();

    if (savedDevice) {
      this.status = savedDevice;
    }
  }
  /**
   * Connect to a health provider
   */
  async connect(platform: DevicePlatform): Promise<boolean> {

    const provider =
      ProviderRegistry.getProvider(platform);

    const connected =
      await provider.connect();

    if (!connected) {
      return false;
    }

    this.status = {
      connected: true,
      platform,
      deviceName: this.getDeviceName(platform),
      lastSync: new Date().toISOString(),
    };

    DeviceStorage.save(this.status);
    WellnessEvents.emit();

    WellnessHistoryService.add({
      id: crypto.randomUUID(),
      type: "device",
      title: "Device Connected",
      subtitle: this.status.deviceName ?? "Health Device",
      timestamp: new Date().toISOString(),
    });
    return true;
  }
  /**
   * Disconnect current provider
   */
  async disconnect() {

    if (this.status.platform) {

      const provider =
        ProviderRegistry.getProvider(this.status.platform);

      await provider.disconnect();
    }

    this.status = {
      connected: false,
    };

    DeviceStorage.clear();
    WellnessEvents.emit();
  }
  /**
   * Synchronize health data
   */
  async sync(): Promise<HealthMetrics | null> {

    if (!this.status.connected || !this.status.platform) {
      return null;
    }

    const provider =
      ProviderRegistry.getProvider(this.status.platform);

    const data = await provider.getHealthData();

    if (data) {

      this.status.lastSync = new Date().toISOString();

      DeviceStorage.save(this.status);

      WellnessEvents.emit();
    }

    return data;
  }
  /**
   * Current connection status
   */
  getStatus() {
    this.refreshStatus();
    return this.status;
  }

  /**
   * Check if device is connected
   */
  isConnected(): boolean {
    return this.status.connected;
  }

  /**
   * Current platform
   */
  getPlatform(): DevicePlatform | undefined {
    return this.status.platform;
  }

  /** Refresh Status from storage */
  refreshStatus() {

    const saved =
      DeviceStorage.load();

    if (saved) {
      this.status = saved;
    }

    return this.status;
  }

  /**
   * Friendly device name
   */
  private getDeviceName(platform: DevicePlatform): string {
    switch (platform) {
      case "health-connect":
        return "Health Connect";

      case "apple-health":
        return "Apple Health";

      case "fitbit":
        return "Fitbit";

      case "garmin":
        return "Garmin";

      case "samsung-health":
        return "Samsung Health";

      default:
        return "Unknown Device";
    }
  }
}

export default new DeviceManager();