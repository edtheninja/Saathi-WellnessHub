import { motion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import BubbleFooter from "./BubbleFooter";
import QuotedBlock from "./QuotedBlock";

interface SupportBubbleProps {
  emoji: string;
  title: string;
  message: string;

  quoted?: {
    sender: string;
    text: string;
  };

  timestamp: string;

  isMine?: boolean;
}

export default function SupportBubble({
  emoji,
  title,
  message,
  quoted,
  timestamp,
  isMine = true,
}: SupportBubbleProps) {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 14,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 28,
      }}
      className={`
        relative
        overflow-hidden

        max-w-[78%]

        rounded-[30px]

        border
        border-emerald-200/70

        bg-gradient-to-br
        from-emerald-50
        via-white
        to-cyan-50

        shadow-[0_14px_35px_rgba(16,185,129,.12)]
      `}
    >
      {/* Decorative glow */}
      <div
        className="
          absolute
          -right-12
          -top-12

          h-32
          w-32

          rounded-full

          bg-emerald-200/20

          blur-3xl
        "
      />

      {/* Header */}
      <div
        className="
          relative

          flex
          items-center
          gap-3

          border-b
          border-emerald-100

          px-5
          py-4
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center

            rounded-full

            bg-white

            shadow-sm

            text-2xl
          "
        >
          {emoji}
        </div>

        <div className="flex-1">
          <div className="font-semibold text-slate-800">
            {title}
          </div>

          <div
            className="
              mt-0.5

              flex
              items-center
              gap-1

              text-xs
              text-emerald-700
            "
          >
            <HeartHandshake size={13} />
            Support Message
          </div>
        </div>
      </div>

      {/* Reply Preview */}
      {quoted && (
        <div className="px-5 pt-5">
          <QuotedBlock
            sender={quoted.sender}
            text={quoted.text}
          />
        </div>
      )}

      {/* Message */}
      <div className="px-5 py-5">
        <p
          className="
            whitespace-pre-wrap
            break-words

            text-[16px]
            leading-7

            text-slate-700
            dark:text-slate-200
          "
        >
          {message}
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <BubbleFooter
          timestamp={timestamp}
          isMine={isMine}
          status="sent"
        />
      </div>
    </motion.div>
  );
}