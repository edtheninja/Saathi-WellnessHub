import {
  HeartPulse,
  Footprints,
  Moon,
  Flame,
  Activity,
  Droplets,
} from "lucide-react";

import MetricCard from "./MetricCard";
import type { HealthMetrics } from "../types/HealthMetrics";

interface Props {
  metrics: HealthMetrics | null;
}

export default function HealthMetricsGrid({
  metrics,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

      <MetricCard
        title="Heart Rate"
        value={metrics?.heartRate?.toString() ?? "--"}
        unit="bpm"
        icon={<HeartPulse size={20} />}
      />

      <MetricCard
        title="Steps"
        value={metrics?.steps?.toLocaleString() ?? "--"}
        icon={<Footprints size={20} />}
      />

      <MetricCard
        title="Sleep"
        value={metrics?.sleepHours?.toString() ?? "--"}
        unit="hrs"
        icon={<Moon size={20} />}
      />

      <MetricCard
        title="Calories"
        value={metrics?.calories?.toString() ?? "--"}
        unit="kcal"
        icon={<Flame size={20} />}
      />

      <MetricCard
        title="Distance"
        value={metrics?.distance?.toString() ?? "--"}
        unit="km"
        icon={<Activity size={20} />}
      />

      <MetricCard
        title="Hydration"
        value={metrics?.waterIntake?.toString() ?? "--"}
        unit="L"
        icon={<Droplets size={20} />}
      />

    </div>
  );
}