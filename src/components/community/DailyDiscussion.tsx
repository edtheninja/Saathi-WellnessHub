import { ArrowRight, Sun } from "lucide-react";
import { motion } from "framer-motion";

interface DailyDiscussionProps {
  question: string;
  replies: number;
  onOpen?: () => void;
}

export default function DailyDiscussion({
  question,
  replies,
  onOpen,
}: DailyDiscussionProps) {
  return (
    <motion.button
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      onClick={onOpen}
      className="
        group
        w-full
        rounded-[32px]
        border
        border-border/60
        bg-card/70
        p-8
        text-left
        shadow-lg
        backdrop-blur-2xl
        transition-all
        duration-300

        hover:shadow-2xl

        dark:border-white/[0.12]
        dark:bg-white/[0.06]
        dark:hover:bg-white/[0.09]
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-400 shadow-lg">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 shadow-md" />

              <Sun
                className="relative h-8 w-8 text-amber-700"
                strokeWidth={2}
              />
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              Daily Discussion
            </h2>
          </div>

          <p className="text-lg font-medium text-foreground">
            {question}
          </p>

          <p className="mt-3 text-muted-foreground">
            {replies} replies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Join
          </span>

          <ArrowRight className="h-5 w-5 text-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.button>
  );
}