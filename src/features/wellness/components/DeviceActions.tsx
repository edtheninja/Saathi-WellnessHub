import { RefreshCcw, Unplug } from "lucide-react";

interface DeviceActionsProps {
  onSync: () => void;
  onDisconnect: () => void;
}

export default function DeviceActions({
  onSync,
  onDisconnect,
}: DeviceActionsProps) {
  return (
    <div className="mt-6 flex gap-3">

      <button
        onClick={onSync}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-primary-foreground transition hover:opacity-90"
      >
        <RefreshCcw size={18} />
        Sync Now
      </button>

      <button
        onClick={onDisconnect}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 transition hover:bg-muted"
      >
        <Unplug size={18} />
        Disconnect
      </button>

    </div>
  );
}