import {
  MessageCircle,
  Smile,
  HeartHandshake,
  Trophy,
  Sparkles,
} from "lucide-react";

import { CommunityCardData } from "@/types/community";

export const communitySections: CommunityCardData[] = [
  {
    id: "discussion",
    title: "Daily Discussion",
    description: "Join today's wellness conversation.",
    icon: MessageCircle,
    gradient: "from-orange-500 to-amber-500",
    route: "/community/discussion",
  },
  {
    id: "moods",
    title: "Mood Circles",
    description: "Connect with people feeling like you.",
    icon: Smile,
    gradient: "from-sky-500 to-cyan-500",
    route: "/community/moods",
  },
  {
    id: "groups",
    title: "Support Groups",
    description: "Find your safe wellness community.",
    icon: HeartHandshake,
    gradient: "from-emerald-500 to-green-500",
    route: "/community/groups",
  },
  {
    id: "challenge",
    title: "Weekly Challenge",
    description: "Grow together through wellness goals.",
    icon: Trophy,
    gradient: "from-yellow-500 to-orange-500",
    route: "/community/challenges",
  },
  {
    id: "stories",
    title: "Success Stories",
    description: "Celebrate inspiring wellness journeys.",
    icon: Sparkles,
    gradient: "from-violet-500 to-fuchsia-500",
    route: "/community/stories",
  },
];