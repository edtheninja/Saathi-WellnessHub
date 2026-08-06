import { useEffect, useState } from "react";
import DeviceManager, {
  type DeviceStatus,
} from "../services/DeviceManager";

export function useDevice() {
  const [device, setDevice] = useState<DeviceStatus>(
    DeviceManager.getStatus()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDevice(DeviceManager.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return device;
}