import type { DeviceStatus } from "./DeviceManager";

const STORAGE_KEY = "saathi_device";

class DeviceStorage {

  save(status: DeviceStatus) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(status)
    );
  }

  load(): DeviceStatus | null {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  isConnected() {
    return this.load()?.connected ?? false;
  }
}

export default new DeviceStorage();