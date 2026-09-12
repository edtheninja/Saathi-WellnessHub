import { motion } from "framer-motion";

const emojis = [
  "😀", "😄", "😊", "🥹", "😂", "🤣", "😍", "😎", "🤗",
  "❤️", "💙", "💚", "💜", "🩵", "💛", "🧡",
  "🌞", "🌙", "⭐", "🌿", "🌸", "🌈", "☁️",
  "🙏", "💪", "👏", "👍", "👎", "✨",
  "🍎", "☕", "📚", "🎵", "🎮", "🚀"
];

interface Props {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      className="
        absolute
        bottom-full
        left-0
        mb-3
        w-[340px]
        max-w-[calc(100vw-32px)]
        rounded-3xl
        z-[999]
        border
        border-white/40
        bg-background/90
        backdrop-blur-2xl
        shadow-2xl
        p-4
        z-50
      "
    >
      <div className="grid grid-cols-8 gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="
              text-2xl
              rounded-xl
              p-2
              hover:bg-muted
              transition
            "
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
}