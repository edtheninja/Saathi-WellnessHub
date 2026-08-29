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

export function NotificationIcon({
  type,
  size = 18,
}: {
  type: WellnessNotification["type"];
  size?: number;
}) {
  switch (type) {
    case "sleep":
      return <Moon size={size} />;

    case "hydration":
      return <Droplets size={size} />;

    case "exercise":
      return <Dumbbell size={size} />;

    case "mindfulness":
      return <Brain size={size} />;

    case "goal":
      return <CheckCircle2 size={size} />;

    case "device":
      return <Bell size={size} />;

    default:
      return <Heart size={size} />;
  }
}

export default function NotificationCard({
  notification,
  onRead,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => onRead(notification.id)}
      className="
        w-full
        rounded-2xl
        border
        border-border/40
        bg-card
        p-4
        text-left
        transition
        duration-200
        hover:bg-muted/70
        active:scale-[0.99]
      "
    >
      <div className="flex gap-4">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            text-primary
          "
        >
          <NotificationIcon
            type={notification.type}
            size={18}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold">
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
          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
        )}
      </div>
    </button>
  );
}