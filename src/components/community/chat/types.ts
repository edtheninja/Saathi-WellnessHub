export type RoomType =
  | "discussion"
  | "circle"
  | "support"
  | "event"
  | "announcement";

export type MessageType =
  | "text"
  | "reply"
  | "support"
  | "mood"
  | "journal"
  | "achievement"
  | "voice"
  | "image";

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: RoomType;
  topic?: string;
  memberCount?: number;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface QuotedMessage {
  id: string;
  sender: string;
  text: string;
}

export interface SupportInfo {
  emoji: string;
  title: string;
}

export interface SupportReaction {
  emoji: string;
  label: string;
  count: number;

  users: {
    id: string;
    name: string;
    note?: string;
  }[];
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface ChatMessage {
  id: string;
  roomId: string;

  sender: ChatUser;

  type: MessageType;

  content: string;

  createdAt: string;

  isMine: boolean;

  quoted?: QuotedMessage;

  support?: SupportInfo;

  replyTo?: QuotedMessage;

  supportReactions?: SupportReaction[];

  reactions?: MessageReaction[];
}