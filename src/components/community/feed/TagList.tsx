import {
  BookOpen,
  Brain,
  Heart,
  Moon,
  Target,
  Flame,
  Smile,
} from "lucide-react";

interface Props {
  tags: string[];
}

const tagConfig: Record<
  string,
  {
    icon: any;
    color: string;
  }
> = {
  Meditation: {
    icon: Brain,
    color: "bg-cyan-500/10 text-cyan-600",
  },
  Journal: {
    icon: BookOpen,
    color: "bg-violet-500/10 text-violet-600",
  },
  Mindfulness: {
    icon: Heart,
    color: "bg-pink-500/10 text-pink-600",
  },
  Calm: {
    icon: Moon,
    color: "bg-blue-500/10 text-blue-600",
  },
  Goal: {
    icon: Target,
    color: "bg-green-500/10 text-green-600",
  },
  Streak: {
    icon: Flame,
    color: "bg-orange-500/10 text-orange-600",
  },
  Mood: {
    icon: Smile,
    color: "bg-yellow-500/10 text-yellow-600",
  },
};

export default function TagList({ tags }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {tags.map((tag) => {
        const cfg = tagConfig[tag];

        if (!cfg) return null;

        const Icon = cfg.icon;

        return (
          <div
            key={tag}
            className={`
              flex items-center gap-2
              px-4 py-2
              rounded-full
              ${cfg.color}
              font-medium
              text-sm
            `}
          >
            <Icon className="w-4 h-4" />
            {tag}
          </div>
        );
      })}
    </div>
  );
}