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

      <h2 className="text-2xl font-bold mb-6">
        Mood Circles
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {moods.map((mood) => (

          <button
            key={mood.id}
            onClick={() => onOpen(mood.id)}
            className="
              group
              rounded-[28px]
              border
              border-white/40
              bg-white/60
              backdrop-blur-xl
              p-6
              hover:-translate-y-1
              hover:shadow-xl
              transition-all
              duration-300
              text-left
              "
          >

            <div
              className={`
                w-14
                h-14
                rounded-2xl
                bg-gradient-to-br
                ${mood.color}
                shadow-md
                flex
                items-center
                justify-center
                text-white
                text-xl
                `}
            >
              🧘
            </div>

            <h3 className="mt-4 font-semibold">
              {mood.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Connect with people following the same wellness journey.
            </p>
            <ArrowRight className="mt-5 w-5 h-5 group-hover:translate-x-1 transition" />

          </button>

        ))}

      </div>
      <div className="flex justify-end mt-5">

        <ArrowRight
          className="group-hover:translate-x-1 transition"
        />

      </div>
    </section>
  );
}