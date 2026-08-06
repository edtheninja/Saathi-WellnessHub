import { motion } from "framer-motion";

const reactions = ["❤️", "👍", "😂", "🙏", "😮", "😢"];

interface Props {
  onSelect: (emoji: string) => void;
}

export default function ReactionPicker({ onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: .9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: .9 }}
      className="
        absolute
        -top-14
        left-1/2
        -translate-x-1/2
        flex
        gap-2
        rounded-full
        border
        border-white/40
        bg-background/90
        backdrop-blur-xl
        px-3
        py-2
        shadow-xl
        z-50
      "
    >
      {reactions.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="
            text-xl
            transition
            hover:scale-125
          "
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
}