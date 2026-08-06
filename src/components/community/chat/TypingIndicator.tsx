import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center">
        ☀️
      </div>

      <div className="rounded-3xl bg-card border px-5 py-4 shadow-sm">

        <div className="flex gap-2">

          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                opacity: [0.3, 1, 0.3],
                y: [0, -3, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-muted-foreground"
            />
          ))}

        </div>

      </div>

    </div>
  );
}