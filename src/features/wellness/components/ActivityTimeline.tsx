import { Clock3 } from "lucide-react";

export default function ActivityTimeline() {
  return (
    <div className="rounded-[28px] border bg-card p-6">

      <div className="flex items-center gap-3">

        <Clock3 className="w-6 h-6 text-primary" />

        <h2 className="text-xl font-semibold">
          Activity Timeline
        </h2>

      </div>

      <div className="mt-8 flex justify-center py-10">

        <p className="text-muted-foreground">

          No activity available.

        </p>

      </div>

    </div>
  );
}