import { motion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import BubbleFooter from "./BubbleFooter";

interface QuotedMessage {
  id: string;
  sender: string;
  text: string;
}

interface SupportBubbleProps {
  emoji: string;
  title: string;
  message: string;
  quoted?: QuotedMessage;
  timestamp: string;
  isMine: boolean;
}

export default function SupportBubble({
  emoji,
  title,
  message,
  quoted,
  timestamp,
  isMine,
}: SupportBubbleProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      className="
        w-full max-w-[440px]
        overflow-hidden
        rounded-[30px]

        border
        border-slate-700/70
        bg-[#0B1220]

        dark:border-teal-400/20
        dark:bg-[#0B1220]
      "
    >
      {/* Header */}
      <div
        className="
          flex items-center gap-4
          border-b
          border-slate-700/60
          px-6 py-5

          dark:border-teal-400/10
        "
      >
        {/* Support Emoji */}
        <div
          className="
            flex h-16 w-16 shrink-0
            items-center justify-center
            rounded-full

            bg-slate-800/80
            text-4xl

            border
            border-slate-700/70
          "
        >
          {emoji}
        </div>

        {/* Title */}
        <div className="min-w-0">
          <h3
            className="
              text-[18px]
              font-semibold
              tracking-tight
              text-slate-100
            "
          >
            {title}
          </h3>

          <div
            className="
              mt-1.5
              flex items-center gap-2
              text-[14px]
              font-medium
              text-teal-300
            "
          >
            <HeartHandshake className="h-5 w-5" strokeWidth={2} />

            <span>Support Message</span>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="px-10 py-10">
        {/* Quoted message */}
        {quoted && (
          <div
            className="
              mb-4
              rounded-[28px]
              border-l-[7px]
              border-cyan-400

              bg-[#131D2C]

              px-7 py-6
            "
          >
            <div
              className="
                text-[16px]
                font-semibold
                text-cyan-400
              "
            >
              {quoted.sender}
            </div>

            <p
              className="
                mt-2
                text-[16px]
                leading-relaxed
                text-slate-100
                dark:text-slate-100
              "
            >
              {quoted.text}
            </p>
          </div>
        )}

        {/* Support note */}
        {message && (
          <div
            className="
              rounded-[28px]
              border
              border-slate-700/50

              bg-[#121C2B]

              px-7 py-6
            "
          >
            <p
              className="
              whitespace-pre-wrap
              break-words
              text-[16px]
              leading-relaxed
              text-slate-100
              dark:text-slate-500

              "
            >
              {message}
            </p>
          </div>
        )}

        {/* Footer */}
        <BubbleFooter timestamp={timestamp} isMine={isMine} />
      </div>
    </motion.div>
  );
}
