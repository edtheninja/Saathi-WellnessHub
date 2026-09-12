import { Clock3 } from "lucide-react";

interface JourneyHeaderProps {
  user: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function JourneyHeader({
  user,
  createdAt,
}: JourneyHeaderProps) {
  return (
    <div className="flex items-center justify-between">

      {/* Left */}
      <div className="flex items-center gap-4">

        {/* Avatar */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="
              w-14
              h-14
              rounded-full
              object-cover
              border-2
              border-primary/20
            "
          />
        ) : (
          <div
            className="
              w-14
              h-14
              rounded-full
              bg-gradient-to-br
              from-violet-500
              to-cyan-500
              flex
              items-center
              justify-center
              text-white
              text-xl
              font-bold
              shadow-lg
            "
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Name */}
        <div>

          <h3 className="font-semibold text-lg tracking-tight">
            {user.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <Clock3 className="w-4 h-4" />

            {createdAt}

          </div>

        </div>

      </div>

      {/* Status */}
      <div
        className="
          px-4
          py-2
          rounded-full
          bg-green-500/10
          text-green-600
          text-xs
          font-medium
          border
          border-green-500/20
        "
      >
        🌿 Wellness Journey
      </div>

    </div>
  );
}