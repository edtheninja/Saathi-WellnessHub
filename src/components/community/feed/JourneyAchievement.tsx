import {
  Brain,
  BookOpen,
  Target,
  Flame,
  Trophy,
  Smile,
} from "lucide-react";

interface Achievement {
  icon: string;
  title: string;
  value: string;
}

interface Props {
  achievement: Achievement;
}

const iconMap = {
  meditation: Brain,
  journal: BookOpen,
  goal: Target,
  streak: Flame,
  challenge: Trophy,
  mood: Smile,
};

const gradientMap: Record<string, string> = {
  meditation: "from-cyan-500 to-blue-600",
  journal: "from-violet-500 to-purple-600",
  goal: "from-emerald-500 to-green-600",
  streak: "from-orange-500 to-red-500",
  challenge: "from-yellow-400 to-amber-500",
  mood: "from-pink-500 to-rose-500",
};

export default function JourneyAchievement({
  achievement,
}: Props) {
  const Icon =
    iconMap[
      achievement.icon as keyof typeof iconMap
    ] ?? Brain;

  const gradient =
    gradientMap[achievement.icon] ??
    "from-primary to-primary/70";

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-white/10
        bg-card
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      {/* Decorative Blur */}
      <div
        className={`
          absolute
          -top-10
          -right-10
          w-40
          h-40
          rounded-full
          bg-gradient-to-br
          ${gradient}
          opacity-10
          blur-3xl
        `}
      />

      <div className="relative flex items-center gap-5">

        <div
          className={`
            w-20
            h-20
            rounded-[24px]
            bg-gradient-to-br
            ${gradient}
            flex
            items-center
            justify-center
            shadow-lg
          `}
        >
          <Icon
            className="w-10 h-10 text-white"
            strokeWidth={2}
          />
        </div>

        <div className="flex-1">

          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Achievement
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {achievement.title}
          </h2>

          <p className="mt-2 text-lg text-muted-foreground">
            {achievement.value}
          </p>

        </div>

      </div>

    </div>
  );
}