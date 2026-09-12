import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeviceManager, {
  type DevicePlatform,
} from "../services/DeviceManager";

interface DeviceProviderCardProps {
  platform: DevicePlatform;
  title: string;
  description: string;
  status: "Available" | "Coming Soon";
}

export default function DeviceProviderCard({
  platform,
  title,
  description,
  status,
}: DeviceProviderCardProps) {
  const navigate = useNavigate();

  const available = status === "Available";

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const currentStatus = DeviceManager.getStatus();

    if (
      currentStatus.connected &&
      currentStatus.platform === platform
    ) {
      setConnected(true);
    }
  }, [platform]);

  async function handleConnect() {
    if (!available || connecting || connected) return;

    try {
      setConnecting(true);

      const success = await DeviceManager.connect(platform);

      if (success) {
        setConnected(true);

        // Navigate back to Wellness Hub
        setTimeout(() => {
          navigate("/wellness");
          // If your route is "/health", replace with:
          // navigate("/health");
        }, 800);
      } else {
        alert(`Unable to connect to ${title}`);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while connecting.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-3xl border bg-card p-6 shadow-sm transition hover:shadow-md">

      <div className="space-y-1">
        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        <p className="text-sm text-muted-foreground">
          {description}
        </p>

        {connected && (
          <p className="text-sm text-green-600 font-medium">
            ✓ Connected
          </p>
        )}
      </div>

      <button
        onClick={handleConnect}
        disabled={!available || connected || connecting}
        className="rounded-xl bg-primary px-5 py-2 text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {connecting
          ? "Connecting..."
          : connected
          ? "Connected ✓"
          : available
          ? "Connect"
          : "Coming Soon"}
      </button>

    </div>
  );
}