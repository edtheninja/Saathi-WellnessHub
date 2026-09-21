import {
  Brain,
  Music,
  Users,
  Sparkles,
  Heart,
} from "lucide-react";
import AnimatedProgress from "./AnimatedProgress";

interface Props {
  breakdown?: {
    music: number;
    mood: number;
    meditation: number;
    journal: number;
    community: number;
  };
}

export default function WellnessBreakdown({ breakdown }: Props) {
  const sections = [
    {
      title: "Music",
      icon: Music,
      value: breakdown?.music,
    },
    {
      title: "Mood",
      icon: Heart,
      value: breakdown?.mood,
    },
    {
      title: "Meditation",
      icon: Sparkles,
      value: breakdown?.meditation,
    },
    {
      title: "Journal",
      icon: Brain,
      value: breakdown?.journal,
    },
    {
      title: "Community",
      icon: Users,
      value: breakdown?.community,
    },
  ];

  return (
    <div className="rounded-[30px] border bg-card p-6">

      <h2 className="text-2xl font-semibold">
        Wellness Breakdown
      </h2>

      <div className="mt-8 space-y-8">

        {sections.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title}>

              <div className="mb-3 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <span className="font-medium">
                    {item.title}
                  </span>

                </div>

                <span className="text-muted-foreground">
                  {item.value ?? 0}
                </span>

              </div>

              <AnimatedProgress value={item.value ?? 0} />

            </div>
          );
        })}

      </div>
    </div>
  );
}