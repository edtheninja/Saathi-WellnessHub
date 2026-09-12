import ActivityItem from "./ActivityItem";
import type { Activity } from "../types/Activity";

interface Props {
  activities: Activity[];
}

export default function ActivityFeed({
  activities,
}: Props) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <h3 className="font-semibold">
          No Recent Activity
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Your wellness activities will appear here after syncing your device.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          type={activity.type}
          title={activity.title}
          subtitle={activity.subtitle}
          timestamp={activity.timestamp}
        />
      ))}
    </div>
  );
}