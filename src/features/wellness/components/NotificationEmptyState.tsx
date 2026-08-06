import { BellOff } from "lucide-react";

export default function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">

      <BellOff
        size={44}
        className="text-muted-foreground"
      />

      <h3 className="mt-4 font-semibold">
        You're all caught up
      </h3>

      <p className="mt-2 text-center text-sm text-muted-foreground">
        New wellness notifications will appear here.
      </p>

    </div>
  );
}