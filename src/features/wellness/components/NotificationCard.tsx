import {
  Bell,
  Heart,
  Moon,
  Droplets,
  Dumbbell,
  Brain,
  CheckCircle2,
} from "lucide-react";

import type { WellnessNotification } from "../types/Notification";

interface Props {
  notification: WellnessNotification;
  onRead: (id: string) => void;
}

function NotificationIcon({ type }: { type: WellnessNotification["type"] }) {
  switch (type) {
    case "sleep":
      return <Moon size={18} />;

    case "hydration":
      return <Droplets size={18} />;

    case "exercise":
      return <Dumbbell size={18} />;

    case "mindfulness":
      return <Brain size={18} />;

    case "goal":
      return <CheckCircle2 size={18} />;

    case "device":
      return <Bell size={18} />;

    default:
      return <Heart size={18} />;
  }
}

export default function NotificationCard({
  notification,
  onRead,
}: Props) {
  return (
    <button
      onClick={() => onRead(notification.id)}
      className="w-full rounded-xl border border-border/40 bg-card p-4 text-left transition hover:bg-muted"
    >
      <div className="flex gap-4">

        <div className="rounded-lg bg-primary/10 p-2">
          <NotificationIcon type={notification.type} />
        </div>

        <div className="flex-1">

          <h4 className="font-semibold">
            {notification.title}
          </h4>

          <p className="mt-1 text-sm text-muted-foreground">
            {notification.description}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(notification.createdAt).toLocaleString()}
          </p>

        </div>

        {!notification.read && (
          <div className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
        )}

      </div>
    </button>
  );
}