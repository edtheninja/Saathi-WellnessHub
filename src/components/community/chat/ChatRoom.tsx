import { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatComposer from "./ChatComposer";
import EmptyState from "./EmptyState";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";
import { ChatMessage, ChatRoom as Room } from "./types";
import SuperReactSheet from "./SuperReactSheet";
import { BubbleMessage } from "./MessageBubble";
import { supabase } from "@/supabaseClient";
import { getCommunitySocket } from "@/lib/communitySocket";
interface Props {
    room: Room;
}

interface SocketMessagePayload {
    id: string;
    room_id: string;
    sender_id: string;
    sender_name?: string;
    type?: ChatMessage["type"];
    content: string;
    created_at: string;
    reply_to?: ChatMessage["replyTo"];
    support?: ChatMessage["support"];
    reactions?: ChatMessage["reactions"];
}

export default function ChatRoom({ room }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [reply, setReply] = useState<{
        id: string;
        sender: string;
        text: string;
    } | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineCount, setOnlineCount] = useState(room.memberCount ?? 0);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserName, setCurrentUserName] = useState("You");
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

    useEffect(() => {
        let cancelled = false;

        async function loadMessages() {
            const [{ data: user }, { data }] = await Promise.all([
                supabase.auth.getUser(),
                supabase
                    .from("chat_messages")
                    .select("*")
                    .eq("room_id", room.id)
                    .order("created_at", { ascending: true }),
            ]);

            if (cancelled) return;

            setCurrentUserId(user?.user?.id ?? null);
            setCurrentUserName(user?.user?.user_metadata?.name ?? "You");

            setMessages((data ?? []).map((item) => ({
                id: item.id,
                roomId: item.room_id,
                sender: {
                    id: item.sender_id,
                    name: item.sender_name ?? "Saathi member",
                    avatar: item.sender_avatar,
                },
                type: item.type ?? "text",
                content: item.content,
                createdAt: item.created_at,
                isMine: item.sender_id === user?.user?.id,
                replyTo: item.reply_to,
                support: item.support,
                reactions: item.reactions ?? [],
                supportReactions: item.support_reactions ?? [],
            })));
        }

        void loadMessages();
        return () => { cancelled = true; };
    }, [room.id]);

    useEffect(() => {
        const socket = getCommunitySocket();
        socket.emit("room:join", room.id);

        const onMessage = (item: SocketMessagePayload) => {
            const incoming: ChatMessage = {
                id: item.id,
                roomId: item.room_id,
                sender: { id: item.sender_id, name: item.sender_name ?? "Saathi member" },
                type: item.type ?? "text",
                content: item.content,
                createdAt: item.created_at,
                isMine: item.sender_id === currentUserId,
                replyTo: item.reply_to,
                support: item.support,
                reactions: item.reactions ?? [],
            };
            setMessages((previous) => previous.some((message) => message.id === incoming.id) ? previous : [...previous, incoming]);
        };
        const onReaction = ({ messageId, reactions }: { messageId: string; reactions: ChatMessage["reactions"] }) => {
            setMessages((previous) => previous.map((message) => message.id === messageId ? { ...message, reactions } : message));
        };
        const onTyping = ({ userId, typing }: { userId: string; typing: boolean }) => {
            if (userId !== currentUserId) setIsTyping(typing);
        };

        socket.on("message:new", onMessage);
        socket.on("message:reaction", onReaction);
        socket.on("typing:update", onTyping);
        socket.on("room:presence", ({ count }: { count: number }) => setOnlineCount(count));
        return () => {
            socket.emit("room:leave", room.id);
            socket.off("message:new", onMessage);
            socket.off("message:reaction", onReaction);
            socket.off("typing:update", onTyping);
        };
    }, [room.id, currentUserId]);

    const handleReact = (message: BubbleMessage) => {
        setSupportTarget(message);
        setShowSupport(true);
    };
    // Demo typing animation


    const saveMessage = async (message: ChatMessage) => {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        await supabase.from("chat_messages").insert({
            id: message.id,
            room_id: message.roomId,
            sender_id: user.user.id,
            sender_name: message.sender.name,
            type: message.type,
            content: message.content,
            reply_to: message.replyTo,
            support: message.support,
            reactions: message.reactions ?? [],
            support_reactions: message.supportReactions ?? [],
        });
    };

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
        const socket = getCommunitySocket();
        if (socket.connected) {
            socket.emit("message:send", {
                id: newMessage.id,
                roomId: room.id,
                senderName: currentUserName,
                type: newMessage.type,
                content: newMessage.content,
                replyTo: newMessage.replyTo,
            });
        } else void saveMessage(newMessage);

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

            // IMPORTANT: preserve the selected support
            support: {
                emoji: support.emoji,
                title: support.title,
            },
        };

        setMessages((prev) => [...prev, supportMessage]);
        const socket = getCommunitySocket();
        if (socket.connected) {
            socket.emit("message:send", {
                id: supportMessage.id,
                roomId: room.id,
                senderName: currentUserName,
                type: supportMessage.type,
                content: supportMessage.content,
                replyTo: supportMessage.replyTo,
                support: supportMessage.support,
            });
        } else void saveMessage(supportMessage);

        setSupportTarget(null);
        setShowSupport(false);
    };
    const handleEmoji = (
        message: BubbleMessage,
        emoji: string
    ) => {
        setMessages((prev) =>
            prev.map((item) => {
                if (item.id !== message.id) {
                    return item;
                }

                const reactions = [...(item.reactions ?? [])];

                const existingIndex = reactions.findIndex(
                    (reaction) => reaction.emoji === emoji
                );

                if (existingIndex === -1) {
                    reactions.push({
                        emoji,
                        users: ["me"],
                    });
                } else {
                    const existingReaction = reactions[existingIndex];

                    const alreadyReacted = existingReaction.users.includes("me");

                    if (alreadyReacted) {
                        existingReaction.users =
                            existingReaction.users.filter(
                                (userId) => userId !== "me"
                            );

                        if (existingReaction.users.length === 0) {
                            reactions.splice(existingIndex, 1);
                        }
                    } else {
                        existingReaction.users = [
                            ...existingReaction.users,
                            "me",
                        ];
                    }
                }

                const updated = {
                    ...item,
                    reactions,
                };

                void supabase
                    .from("chat_messages")
                    .update({ reactions })
                    .eq("id", item.id);
                getCommunitySocket().emit("message:react", { roomId: room.id, messageId: item.id, reactions });

                return updated;
            })
        );
    };
    return (
        <div className="flex h-[calc(100vh-72px)] flex-col bg-background">

            {/* Header */}
            <ChatHeader room={{ ...room, memberCount: onlineCount }} />

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
                            onSupport={(message) => handleReact(message)}
                            onEmoji={(message, emoji) =>
                                handleEmoji(message, emoji)
                            }
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
                            onTyping={(typing) => getCommunitySocket().emit(typing ? "typing:start" : "typing:stop", room.id)}
                    reply={reply}
                    onCancelReply={() => setReply(null)}
                />
            </div>

        </div>
    );
}