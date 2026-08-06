import { MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Sun } from "lucide-react";

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
        border-white/40
        bg-white/60
        backdrop-blur-2xl
        p-8
        text-left
        shadow-lg
        hover:-translate-y-1
        hover:shadow-2xl
        transition-all
        duration-300
        "
    >
      <div className="flex justify-between items-start">

        <div>

          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-400 shadow-lg">

              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 shadow-md" />

              <Sun
                className="relative w-8 h-8 text-amber-700"
                strokeWidth={2}
              />

            </div>
            <h2 className="text-2xl font-bold">
              Daily Discussion
            </h2>
          </div>

          <p className="text-lg font-medium">
            {question}
          </p>

          <p className="mt-3 text-muted-foreground">
            {replies} replies
          </p>

        </div>

        <div className="flex items-center gap-2">

          <span className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition">
            Join
          </span>

          <ArrowRight
            className="group-hover:translate-x-1 transition"
          />

        </div>
      </div>
    </motion.button>
  );
}