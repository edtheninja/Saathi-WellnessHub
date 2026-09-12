import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DeviceProviderCard from "../components/DeviceProviderCard";

export default function ConnectDevicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">

      <div className="mx-auto max-w-5xl p-6">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="mt-6 text-4xl font-bold">
          Connect Device
        </h1>

        <p className="mt-2 text-muted-foreground">
          Connect a supported health platform to sync your wellness data.
        </p>

        <div className="mt-10 grid gap-5">

          <DeviceProviderCard
            platform="health-connect"
            title="Health Connect"
            description="Android Health Connect"
            status="Coming Soon"
          />

          <DeviceProviderCard
            platform="apple-health"
            title="Apple Health"
            description="Apple HealthKit"
            status="Coming Soon"
          />
          <DeviceProviderCard
            platform="samsung-health"
            title="Samsung Health"
            description="Samsung wearable ecosystem"
            status="Coming Soon"
          />

          <DeviceProviderCard
            platform="fitbit"
            title="Fitbit"
            description="Google Fitbit devices"
            status="Available"
          />

          <DeviceProviderCard
            platform="garmin"
            title="Garmin"
            description="Garmin fitness ecosystem"
            status="Coming Soon"
          />

        </div>

      </div>

    </div>
  );
}