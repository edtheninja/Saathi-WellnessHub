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
  replyTo?: { id: string; sender: string; text: string };
  support?: { emoji: string; title: string };
  reactions?: { emoji: string; count: number }[];
  supportReactions?: { emoji: string; label: string; count: number }[];
}

interface Props {
    message: BubbleMessage;

    isMine: boolean;

    showActions: boolean;

    onReply(): void;

    onSupport(): void;

    onEmoji(): void;
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
            }}

            animate={{
                opacity: 1,
                y: 0,
            }}

            transition={{
                type: "spring",
                stiffness: 320,
                damping: 28,
            }}

            className={`

                flex

                flex-col

                ${isMine ? "items-end" : "items-start"}

            `}

        >

            <div

                className={`

                    relative

                    max-w-[76%]

                    rounded-[28px]

                    px-5

                    py-4

                    shadow-sm

                    ${

                        isMine

                        ? "bg-[#D6EEFF]"

                        : "bg-white"

                    }

                `}

            >

                {message.replyTo && (

                    <QuotedBlock

                        sender={message.replyTo.sender}

                        text={message.replyTo.text}

                    />

                )}

                <p

                    className="

                        whitespace-pre-wrap

                        break-words

                        text-[16px]

                        leading-7

                    "

                >

                    {message.text}

                </p>

                <BubbleFooter

                    timestamp={message.timestamp}

                    isMine={isMine}

                />

            </div>

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