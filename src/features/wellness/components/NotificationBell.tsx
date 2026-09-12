import { Bell } from "lucide-react";

interface Props {
  count: number;
  onClick: () => void;
}

export default function NotificationBell({
  count,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        count > 0
          ? `${count} unread notifications`
          : "Open notifications"
      }
      className="
        relative
        rounded-xl
        border
        border-border
        p-3
        transition
        duration-200
        hover:bg-muted/60
        active:scale-95
      "
    >
      <Bell size={20} />

      {count > 0 && (
        <span
          aria-hidden="true"
          className="
            absolute
            -right-1
            -top-1
            flex
            h-5
            min-w-5
            items-center
            justify-center
            rounded-full
            bg-red-500
            px-1
            text-xs
            font-medium
            text-white
          "
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}