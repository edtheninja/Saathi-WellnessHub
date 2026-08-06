import { Quote } from "lucide-react";

interface JourneyReflectionProps {
  reflection: string;
}

export default function JourneyReflection({
  reflection,
}: JourneyReflectionProps) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-white/10
        bg-card/80
        backdrop-blur-xl
        p-6
      "
    >
      {/* Background Glow */}
      <div
        className="
          absolute
          -left-10
          -bottom-10
          w-36
          h-36
          rounded-full
          bg-primary/10
          blur-3xl
        "
      />

      <div className="relative">

        <div className="flex items-center gap-3 mb-4">

          <div
            className="
              w-10
              h-10
              rounded-full
              bg-primary/10
              flex
              items-center
              justify-center
            "
          >
            <Quote
              className="w-5 h-5 text-primary"
              strokeWidth={2.2}
            />
          </div>

          <h3 className="font-semibold text-lg">
            Reflection
          </h3>

        </div>

        <p
          className="
            text-[16px]
            leading-8
            text-muted-foreground
          "
        >
          {reflection}
        </p>

      </div>

    </div>
  );
}