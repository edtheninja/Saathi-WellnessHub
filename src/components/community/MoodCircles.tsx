import { ArrowRight } from "lucide-react";

interface MoodCircle {
  id: string;
  name: string;
  color: string;
}

interface Props {
  moods: MoodCircle[];
  onOpen: (id: string) => void;
}

export default function MoodCircles({
  moods,
  onOpen,
}: Props) {
  return (
    <section className="rounded-[32px] border bg-card p-8">
      <h2 className="mb-6 text-2xl font-bold">
        Mood Circles
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onOpen(mood.id)}
            className="
              group
              rounded-[28px]
              border
              border-border/60
              bg-card/70
              p-6
              text-left
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-xl

              dark:border-white/[0.12]
              dark:bg-white/[0.06]
              dark:hover:bg-white/[0.09]
            "
          >
            <div
              className={`
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                ${mood.color}
                text-xl
                text-white
                shadow-md
              `}
            >
              🧘
            </div>

            <h3 className="mt-4 font-semibold text-foreground">
              {mood.name}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Connect with people following the same wellness journey.
            </p>

            <ArrowRight
              className="
                mt-5
                h-5
                w-5
                text-foreground
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <ArrowRight className="h-5 w-5 text-foreground" />
      </div>
    </section>
  );
}