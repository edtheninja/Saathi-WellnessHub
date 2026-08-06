import { useState } from "react";
import { motion } from "framer-motion";

const reactions = [
  { emoji: "❤️", label: "Support" },
  { emoji: "🌱", label: "Inspired" },
  { emoji: "👏", label: "Proud" },
  { emoji: "🤗", label: "Care" },
];

export default function ReactionBar() {
  const [selected, setSelected] = useState("");

  return (
    <div className="flex flex-wrap gap-3">
      {reactions.map((reaction) => (
        <motion.button
          key={reaction.label}
          whileHover={{ y: -3, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelected(reaction.label)}
          className={`
            flex items-center gap-2
            rounded-full
            px-5
            py-3
            border
            transition-all
            ${
              selected === reaction.label
                ? "bg-primary text-white border-primary"
                : "bg-card hover:bg-muted"
            }
          `}
        >
          <span className="text-lg">
            {reaction.emoji}
          </span>

          <span className="text-sm font-medium">
            {reaction.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}