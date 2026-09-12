import { motion } from "framer-motion";

interface Props {
  emoji: string;
  label: string;
  count: number;
  active?: boolean;
  onClick?: () => void;
}

export default function ReactionChip({
  emoji,
  label,
  count,
  active,
  onClick,
}: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: .96 }}
      onClick={onClick}
      className={`
        flex
        items-center
        gap-2

        rounded-full

        px-3
        py-1.5

        border

        transition-all

        ${
          active
            ? "bg-sky-100 border-sky-200"
            : "bg-background border-border hover:bg-muted"
        }
      `}
    >
      <span className="text-lg">
        {emoji}
      </span>

      <span className="text-xs font-medium">
        {label}
      </span>

      <span
        className="
          rounded-full
          bg-black/5
          px-2
          py-0.5
          text-xs
        "
      >
        {count}
      </span>
    </motion.button>
  );
}