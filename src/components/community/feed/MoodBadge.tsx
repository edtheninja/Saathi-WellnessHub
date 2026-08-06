interface MoodBadgeProps {
  mood: string;
}

const moodMap: Record<
  string,
  {
    label: string;
    gradient: string;
  }
> = {
  "😊": {
    label: "Feeling Happy",
    gradient: "from-yellow-400 to-orange-500",
  },

  "😁": {
    label: "Feeling Excited",
    gradient: "from-amber-400 to-yellow-500",
  },

  "🥰": {
    label: "Feeling Loved",
    gradient: "from-pink-500 to-rose-500",
  },

  "😌": {
    label: "Feeling Calm",
    gradient: "from-cyan-500 to-blue-500",
  },

  "😴": {
    label: "Feeling Tired",
    gradient: "from-indigo-500 to-slate-600",
  },

  "😔": {
    label: "Feeling Low",
    gradient: "from-violet-500 to-indigo-600",
  },

  "😤": {
    label: "Feeling Motivated",
    gradient: "from-red-500 to-orange-500",
  },
};

export default function MoodBadge({
  mood,
}: MoodBadgeProps) {
  const config =
    moodMap[mood] ??
    {
      label: "Feeling Good",
      gradient: "from-primary to-primary/70",
    };

  return (
    <div
      className={`
        inline-flex
        items-center
        gap-3
        rounded-full
        bg-gradient-to-r
        ${config.gradient}
        px-5
        py-3
        text-white
        shadow-lg
      `}
    >
      <span className="text-2xl">
        {mood}
      </span>

      <span className="font-semibold">
        {config.label}
      </span>
    </div>
  );
}