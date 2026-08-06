import { motion } from "framer-motion";
import {
  Reply,
  HeartHandshake,
  SmilePlus,
  MoreHorizontal,
} from "lucide-react";

interface MessageActionsProps {
  onReply(): void;
  onSupport(): void;
  onEmoji(): void;
  onMore?(): void;
}

const spring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 28,
};

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick(): void;
}) {
  return (
    <motion.button
      whileHover={{
        scale: 1.08,
        y: -2,
      }}
      whileTap={{
        scale: 0.94,
      }}
      transition={spring}
      onClick={onClick}
      title={label}
      className="
        flex
        h-10
        w-10
        items-center
        justify-center

        rounded-full

        text-slate-600
        dark:text-slate-300

        hover:bg-slate-100
        dark:hover:bg-slate-800

        transition-colors
      "
    >
      {icon}
    </motion.button>
  );
}

export default function MessageActions({
  onReply,
  onSupport,
  onEmoji,
  onMore,
}: MessageActionsProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -8,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -6,
      }}
      transition={spring}
      className="
        mt-2

        inline-flex
        items-center
        gap-1

        rounded-full

        border
        border-white/60
        dark:border-slate-700

        bg-white/90
        dark:bg-slate-900/90

        backdrop-blur-xl

        px-2
        py-1

        shadow-[0_12px_30px_rgba(0,0,0,.12)]
      "
    >
      <ActionButton
        icon={<Reply size={18} />}
        label="Reply"
        onClick={onReply}
      />

      <ActionButton
        icon={<HeartHandshake size={18} />}
        label="Support"
        onClick={onSupport}
      />

      <ActionButton
        icon={<SmilePlus size={18} />}
        label="Emoji"
        onClick={onEmoji}
      />

      <ActionButton
        icon={<MoreHorizontal size={18} />}
        label="More"
        onClick={() => onMore?.()}
      />
    </motion.div>
  );
}