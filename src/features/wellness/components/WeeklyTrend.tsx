import { BarChart3 } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyTrend() {
  return (
    <div className="rounded-[30px] border bg-card p-6">

      <div className="flex items-center gap-3">

        <BarChart3 className="w-6 h-6 text-primary" />

        <h2 className="text-xl font-semibold">
          Weekly Wellness
        </h2>

      </div>

      <div className="flex justify-between items-end h-52 mt-8">

        {days.map((day) => (
          <div
            key={day}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-6 h-28 rounded-full bg-muted" />

            <span className="text-xs text-muted-foreground">
              {day}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}