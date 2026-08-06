import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";

interface Props {
  score?: number;
}

export default function WellnessScore({ score }: Props) {
  const size = 240;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;

  const progress =
    score === undefined ? 0 : Math.max(0, Math.min(score, 100));

  const dashOffset =
    circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-[32px] border bg-card p-8"
    >
      <div className="flex flex-col items-center">

        <h2 className="text-2xl font-semibold">
          Overall Wellness
        </h2>

        <div className="relative mt-10">

          <svg width={size} height={size}>

            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              className="text-muted"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              className="text-primary"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{
                strokeDashoffset: circumference,
              }}
              animate={{
                strokeDashoffset: dashOffset,
              }}
              transition={{
                duration: 1.2,
              }}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />

          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">

            <div className="rounded-full bg-primary/10 p-4">

              <HeartPulse className="w-8 h-8 text-primary"/>

            </div>

            <h1 className="mt-5 text-6xl font-black">

              {score ?? "--"}

            </h1>

            <p className="mt-2 text-muted-foreground">

              {score === undefined
                ? "Waiting for wellness data"
                : "Wellness Score"}

            </p>

          </div>

        </div>

      </div>

    </motion.div>
  );
}