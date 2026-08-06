import { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatComposer from "./ChatComposer";
import EmptyState from "./EmptyState";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";
import { ChatMessage, ChatRoom as Room } from "./types";
import SuperReactSheet from "./SuperReactSheet";
import { BubbleMessage } from "./MessageBubble";
interface Props {
    room: Room;
}

export default function ChatRoom({ room }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [reply, setReply] = useState<{
        id: string;
        sender: string;
        text: string;
    } | null>(null);
    const [isTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [supportTarget, setSupportTarget] =
        useState<BubbleMessage | null>(null);

    const [showSupport, setShowSupport] =
        useState(false);
    // Always scroll to latest message
    useEffect(() => {
        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
            });
        });
    }, [messages]);

    const [supportAnchor, setSupportAnchor] =
        useState<HTMLElement | null>(null);

    const handleReact = (message: BubbleMessage) => {
        setSupportTarget(message);
        setShowSupport(true);
    };
    // Demo typing animation


    const handleSend = (text: string) => {
        const newMessage: ChatMessage = {
            id: crypto.randomUUID(),

            roomId: room.id,

            sender: {
                id: "me",
                name: "You",
            },

            type: "text",

            content: text,

            createdAt: new Date().toISOString(),

            isMine: true,

            replyTo: reply
                ? {
                    id: reply.id,
                    sender: reply.sender,
                    text: reply.text,
                }
                : undefined,
        };

        setMessages((prev) => [...prev, newMessage]);

        setReply(null);
    };
    const handleSupport = (
        support: {
            emoji: string;
            title: string;
        },
        note: string
    ) => {
        if (!supportTarget) return;

        const supportMessage: ChatMessage = {
            id: crypto.randomUUID(),

            roomId: room.id,

            sender: {
                id: "me",
                name: "You",
            },

            type: "support",

            content: note,

            createdAt: new Date().toISOString(),

            isMine: true,

            replyTo: {
                id: supportTarget.id,
                sender: supportTarget.senderName,
                text: supportTarget.text,
            },
        };

        setMessages((prev) => [...prev, supportMessage]);

        setSupportTarget(null);

        setShowSupport(false);
    };
    return (
        <div className="flex h-[calc(100vh-72px)] flex-col bg-background">

            {/* Header */}
            <ChatHeader room={room} />

            {/* Messages */}
            <div
                className="
          flex-1
          overflow-y-auto
          px-5
          py-6
          scroll-smooth
        "
            >
                {messages.length === 0 ? (
                    <EmptyState room={room} />
                ) : (
                    <div className="space-y-5">
                        <MessageList
                            messages={messages}
                            onReply={(message) =>
                                setReply({
                                    id: message.id,
                                    sender: message.senderName,
                                    text: message.text,
                                })
                            }
                            onReact={(message) => handleReact(message)}
                        />

                        {isTyping && <TypingIndicator />}

                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Composer */}
            <div
                className="
          sticky
          bottom-0
          z-20
          border-t
          border-white/40
          bg-background/80
          backdrop-blur-xl
          supports-[backdrop-filter]:bg-background/70
        "
            >
                <SuperReactSheet
                    open={showSupport}
                    onClose={() => {
                        setShowSupport(false);
                        setSupportTarget(null);
                    }}
                    onSend={handleSupport}
                />
                <ChatComposer
                    onSend={handleSend}
                    reply={reply}
                    onCancelReply={() => setReply(null)}
                />
            </div>

        </div>
    );
}