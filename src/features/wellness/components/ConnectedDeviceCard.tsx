import { Watch } from "lucide-react";

import HealthMetricsGrid from "./HealthMetricsGrid";
import DeviceActions from "./DeviceActions";

import type { HealthMetrics } from "../types/HealthMetrics";

interface ConnectedDeviceCardProps {
    deviceName: string;
    provider: string;
    lastSync: string;
    metrics: HealthMetrics | null;

    onSync: () => void;
    onDisconnect: () => void;
}

export default function ConnectedDeviceCard({
    deviceName,
    provider,
    lastSync,
    metrics,
    onSync,
    onDisconnect,
}: ConnectedDeviceCardProps) {
    return (
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">

            {/* Header */}

            <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                    <div className="rounded-2xl bg-primary/10 p-4">
                        <Watch
                            size={28}
                            className="text-primary"
                        />
                    </div>

                    <div>

                        <h2 className="text-2xl font-semibold">
                            {deviceName}
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            {provider}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                            Last synced • {lastSync}
                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1">

                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Connected
                    </span>

                </div>

            </div>
            <p className="mt-5 text-sm text-muted-foreground">
                Last synced: {lastSync}
            </p>

            <div className="mt-8">
                <HealthMetricsGrid metrics={metrics} />
            </div>



            <DeviceActions
                onSync={onSync}
                onDisconnect={onDisconnect}
            />

        </div>
    );
}