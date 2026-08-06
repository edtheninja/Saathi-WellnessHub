import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { formatTime } from "./utils/formatTime";
import MessageBubble, { BubbleMessage } from "./MessageBubble";
import { ChatMessage } from "./types";

interface Props {
  messages: ChatMessage[];

  onReply?: (message: BubbleMessage) => void;

  onReact?: (message: BubbleMessage) => void;
}

export default function MessageList({
  messages,
  onReply,
  onReact,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 px-4 py-6">
      <AnimatePresence initial={false}>
        {messages.map((message) => {
          const bubble: BubbleMessage = {
            id: message.id,

            text: message.content,

            senderName: message.sender.name,

            avatar: message.sender.avatar,

            timestamp: formatTime(message.createdAt),

            isMine: message.isMine,

            type: message.type as
              | "text"
              | "reply"
              | "support"
              | undefined,

            replyTo: message.replyTo
              ? {
                  id: message.replyTo.id,
                  sender: message.replyTo.sender,
                  text: message.replyTo.text,
                }
              : undefined,

            support: message.support,

            reactions:
              message.reactions?.map((r) => ({
                emoji: r.emoji,
                count: r.users.length,
              })) ?? [],

            supportReactions: [],
          };

          return (
            <div
              key={bubble.id}
              onMouseEnter={() => setHoveredId(bubble.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <MessageBubble
                message={bubble}
                isMine={bubble.isMine}
                showActions={hoveredId === bubble.id}
                onReply={() => onReply?.(bubble)}
                onSupport={() => onReact?.(bubble)}
                onEmoji={() => onReact?.(bubble)}
              />
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}