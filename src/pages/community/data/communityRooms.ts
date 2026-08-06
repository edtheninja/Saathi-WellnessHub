import { ChatRoom } from "@/components/community/chat/types";

export const communityRooms: Record<string, ChatRoom> = {
  // ==========================================
  // DAILY DISCUSSION
  // ==========================================
  daily: {
    id: "daily",
    name: "🌞 Daily Discussion",
    type: "discussion",
    topic: "What made you smile today?",
    description:
      "Share your day, celebrate small wins and encourage others.",
    memberCount: 128,
  },

  // ==========================================
  // MOOD CIRCLES
  // ==========================================
  meditation: {
    id: "meditation",
    name: "🧘 Meditation Circle",
    type: "circle",
    topic: "How was today's meditation session?",
    description:
      "Reflect on your meditation journey together.",
    memberCount: 84,
  },

  sleep: {
    id: "sleep",
    name: "😴 Sleep Circle",
    type: "circle",
    topic: "Did you sleep well last night?",
    description:
      "Discuss healthy sleep habits and routines.",
    memberCount: 56,
  },

  gratitude: {
    id: "gratitude",
    name: "🙏 Gratitude Circle",
    type: "circle",
    topic: "Share one thing you're grateful for.",
    description:
      "Small moments of gratitude create big changes.",
    memberCount: 72,
  },

  // ==========================================
  // SUPPORT GROUPS
  // ==========================================
  anxiety: {
    id: "anxiety",
    name: "💙 Anxiety Support",
    type: "support",
    topic: "You're not alone.",
    description:
      "A safe place to share and support one another.",
    memberCount: 342,
  },

  mindfulness: {
    id: "mindfulness",
    name: "🌿 Mindfulness Circle",
    type: "support",
    topic: "Living in the present.",
    description:
      "Daily mindfulness discussions and exercises.",
    memberCount: 218,
  },

  grief: {
    id: "grief",
    name: "🤍 Grief & Loss",
    type: "support",
    topic: "Healing together.",
    description:
      "Support from people who understand your journey.",
    memberCount: 156,
  },

  // ==========================================
  // EVENTS
  // ==========================================
  weekendMeditation: {
    id: "weekendMeditation",
    name: "🌅 Weekend Meditation",
    type: "event",
    topic: "Live guided meditation",
    description:
      "Join the community every weekend for a live session.",
    memberCount: 46,
  },

  gratitudeChallenge: {
    id: "gratitudeChallenge",
    name: "✨ 7-Day Gratitude Challenge",
    type: "event",
    topic: "One gratitude post every day.",
    description:
      "Build a gratitude habit together.",
    memberCount: 63,
  },

  // ==========================================
  // FUTURE
  // ==========================================
  announcements: {
    id: "announcements",
    name: "📢 Community Updates",
    type: "announcement",
    topic: "Latest news from Saathi",
    description:
      "New features, wellness programs and updates.",
    memberCount: 0,
  },
};