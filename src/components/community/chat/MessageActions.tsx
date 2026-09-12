import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Reply,
  HeartHandshake,
  SmilePlus,
  MoreHorizontal,
} from "lucide-react";

interface MessageActionsProps {
  onReply(): void;
  onSupport(): void;
  onEmoji(emoji: string): void;
  onMore?(): void;
}

const EMOJIS = [
  "❤️",
  "😂",
  "😮",
  "😢",
  "😡",
  "👍",
  "👎",
  "👏",
  "🔥",
  "✨",
  "🤝",
  "🫂",
];

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
      type="button"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.94 }}
      transition={spring}
      onClick={onClick}
      title={label}
      className="
        flex h-10 w-10 items-center justify-center rounded-full
        text-slate-600 dark:text-slate-300
        hover:bg-slate-100 dark:hover:bg-slate-800
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const closeEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    onEmoji(emoji);
    closeEmojiPicker();
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6 }}
        transition={spring}
        className="
          inline-flex items-center gap-1 rounded-full
          border border-white/60 dark:border-slate-700
          bg-white/90 dark:bg-slate-900/90
          backdrop-blur-xl px-2 py-1
          shadow-[0_12px_30px_rgba(0,0,0,.12)]
        "
      >
        <ActionButton
          icon={<Reply size={18} />}
          label="Reply"
          onClick={() => {
            closeEmojiPicker();
            onReply();
          }}
        />

        <ActionButton
          icon={<HeartHandshake size={18} />}
          label="Support"
          onClick={() => {
            closeEmojiPicker();
            onSupport();
          }}
        />

        <ActionButton
          icon={<SmilePlus size={18} />}
          label="Emoji"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        />

        <ActionButton
          icon={<MoreHorizontal size={18} />}
          label="More"
          onClick={() => {
            closeEmojiPicker();
            onMore?.();
          }}
        />
      </motion.div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.92,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 8,
              scale: 0.92,
            }}
            transition={spring}
            className="
              absolute bottom-full right-0 z-50 mb-2
              w-[260px]
              rounded-2xl
              border border-slate-200/70
              bg-white/95
              p-3
              shadow-[0_18px_45px_rgba(0,0,0,.18)]
              backdrop-blur-xl

              dark:border-white/[0.10]
              dark:bg-slate-900/95
              dark:shadow-[0_18px_45px_rgba(0,0,0,.45)]
            "
          >
            <div className="grid grid-cols-6 gap-1">
              {EMOJIS.map((emoji) => (
                <motion.button
                  key={emoji}
                  type="button"
                  whileHover={{
                    scale: 1.2,
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.9,
                  }}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-xl text-xl
                    hover:bg-slate-100
                    dark:hover:bg-white/[0.08]
                    transition-colors
                  "
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}