import NotificationCard from "./NotificationCard";
import NotificationEmptyState from "./NotificationEmptyState";

import type { WellnessNotification } from "../types/Notification";

interface Props {
  open: boolean;
  notifications: WellnessNotification[];
  onClose: () => void;
  onRead: (id: string) => void;
  onClear: () => void;
}

export default function NotificationPanel({
  open,
  notifications,
  onClose,
  onRead,
  onClear,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">

      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl">

        <div className="flex items-center justify-between border-b p-6">

          <h2 className="text-xl font-semibold">
            Notifications
          </h2>

          <button
            onClick={onClear}
            className="text-sm text-primary"
          >
            Clear All
          </button>

        </div>

        <div className="space-y-3 overflow-y-auto p-5">

          {notifications.length === 0 ? (
            <NotificationEmptyState />
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={onRead}
              />
            ))
          )}

        </div>

      </div>

    </div>
  );
}