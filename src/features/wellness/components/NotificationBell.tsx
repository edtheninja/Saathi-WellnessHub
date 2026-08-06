import { Bell } from "lucide-react";

interface Props {
  count: number;
  onClick: () => void;
}

export default function NotificationBell({ count, onClick }: Props) {
  return (
    <button onClick={onClick} className="relative rounded-xl border border-border p-3">

      <Bell size={20} />

      {count > 0 && (

        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">

          {count}

        </span>

      )}

    </button>

  );

}