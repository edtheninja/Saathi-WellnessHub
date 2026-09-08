import { motion } from "framer-motion";

import SupportBubble from "./SupportBubble";
import BubbleFooter from "./BubbleFooter";
import MessageActions from "./MessageActions";
import QuotedBlock from "./QuotedBlock";

export interface BubbleMessage {
    id: string;
    text: string;
    senderName: string;
    avatar?: string;
    timestamp: string;
    isMine: boolean;
    type?: "text" | "reply" | "support";
    replyTo?: {
        id: string;
        sender: string;
        text: string;
    };
    support?: {
        emoji: string;
        title: string;
    };
    reactions?: {
        emoji: string;
        count: number;
    }[];
    supportReactions?: {
        emoji: string;
        label: string;
        count: number;
    }[];
}

interface Props {
    message: BubbleMessage;
    isMine: boolean;
    showActions: boolean;
    onReply(): void;
    onSupport(): void;
    onEmoji(emoji: string): void;
}

export default function MessageBubble({
    message,
    isMine,
    showActions,
    onReply,
    onSupport,
    onEmoji,
}: Props) {
    // Dedicated support bubble
    if (message.type === "support") {
        return (
            <SupportBubble
                emoji={message.support?.emoji ?? "🌿"}
                title={message.support?.title ?? "Support"}
                message={message.text}
                quoted={message.replyTo}
                timestamp={message.timestamp}
                isMine={isMine}
            />
        );
    }

    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                y: 12,
                scale: 0.98,
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
            className={`flex flex-col ${isMine ? "items-end" : "items-start"
                }`}
        >
            <motion.div
                whileHover={{
                    y: -1,
                }}
                transition={{
                    duration: 0.15,
                }}
                className={`
          relative
          w-fit
          max-w-[82%]
          rounded-[24px]
          px-4
          py-3
          shadow-sm
          transition-all
          duration-200

          sm:max-w-[76%]
          sm:px-5
          sm:py-3.5

          ${isMine
                        ? `
                bg-primary
                text-primary-foreground
                shadow-primary/10
                dark:shadow-primary/20
              `
                        : `
                border
                border-border/60
                bg-card/90
                text-foreground
                backdrop-blur-xl

                dark:border-white/[0.10]
                dark:bg-white/[0.055]
              `
                    }
        `}
            >
                {/* Reply / quoted message */}
                {message.replyTo && (
                    <QuotedBlock
                        sender={message.replyTo.sender}
                        text={message.replyTo.text}
                    />
                )}

                {/* Message */}
                <p
                    className="
            whitespace-pre-wrap
            break-words
            text-[15px]
            leading-6
            sm:text-[16px]
            sm:leading-7
          "
                >
                    {message.text}
                </p>

                {/* Timestamp / status */}
                <BubbleFooter
                    timestamp={message.timestamp}
                    isMine={isMine}
                />

                {/* Emoji reactions */}
                {message.reactions && message.reactions.length > 0 && (
                    <div
                        className={`
      mt-1 flex flex-wrap gap-1
      ${isMine ? "justify-end" : "justify-start"}
    `}
                    >
                        {message.reactions.map((reaction) => (
                            <motion.div
                                key={reaction.emoji}
                                initial={{
                                    opacity: 0,
                                    scale: 0.7,
                                    y: 4,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 22,
                                }}
                                className="
                                 inline-flex items-center gap-1
                                 rounded-full
                                 border border-slate-200/80
                                 bg-white/95
                                 px-2 py-1
                                 text-sm
                                 shadow-sm

                                 dark:border-white/[0.12]
                                dark:bg-slate-900/95
                                "
                            >
                                <span>{reaction.emoji}</span>

                                {reaction.count > 1 && (
                                    <span
                                        className="
              text-[11px] font-medium
              text-slate-500
              dark:text-slate-400
            "
                                    >
                                        {reaction.count}
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Message actions */}
            {showActions && (
                <MessageActions
                    onReply={onReply}
                    onSupport={onSupport}
                    onEmoji={onEmoji}
                />
            )}
        </motion.div>
    );
}