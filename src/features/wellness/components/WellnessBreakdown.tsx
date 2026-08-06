import { Brain, HeartPulse, Sparkles } from "lucide-react";
import AnimatedProgress from "./AnimatedProgress";

interface Props {
  breakdown?: {
    journal: number;
    meditation: number;
    goals: number;
    health: number;
  };
}

export default function WellnessBreakdown({ breakdown }: Props) {
  const sections = [
    { title: "Mind", icon: Brain, value: breakdown?.journal },
    { title: "Body", icon: HeartPulse, value: breakdown?.health },
    { title: "Balance", icon: Sparkles, value: breakdown?.meditation },
  ];
  return (
    <div className="rounded-[30px] border bg-card p-6">

      <h2 className="text-2xl font-semibold">
        Wellness Breakdown
      </h2>

      <div className="space-y-8 mt-8">

        {sections.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title}>

              <div className="flex items-center justify-between mb-3">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-primary/10 p-2">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  <span className="font-medium">
                    {item.title}
                  </span>

                </div>

                <span className="text-muted-foreground">
                  {item.value ?? "--"}
                </span>

              </div>

              <AnimatedProgress value={item.value} />

            </div>
          );
        })}
      </div>
    </div>
  );
}