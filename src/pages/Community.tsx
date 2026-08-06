import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CommunityHero from "@/components/community/CommunityHero";
import CommunitySection from "@/components/community/CommunitySection";
import CommunityCard from "@/components/community/CommunityCard";
import CommunityTabs, {
  type CommunityTab,
} from "@/components/community/CommunityTabs";
import CommunityLayout from "@/components/community/CommunityLayout";

import Feed from "@/components/community/feed/Feed";
import Groups from "@/components/community/Groups/Groups";
import Discover from "@/components/community/Discover/Discover";
import Events from "@/components/community/Events/Events";

import DailyDiscussion from "@/components/community/DailyDiscussion";
import MoodCircles from "@/components/community/MoodCircles";
import SupportGroups from "@/components/community/SupportGroups";

import { communitySections } from "@/data/community";
import { communityRoutes } from "@/components/community/utils/routes";

export default function Community() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<CommunityTab>("feed");

  // IDs MUST match communityRooms.ts
  const moods = [
    {
      id: "meditation",
      name: "Meditation",
      color: "from-indigo-500 to-cyan-500",
    },
    {
      id: "sleep",
      name: "Sleep",
      color: "from-blue-500 to-purple-500",
    },
  ];

  const groups = [
    {
      id: "anxiety",
      title: "Anxiety Support",
      members: 342,
    },
    {
      id: "mindfulness",
      title: "Mindfulness Circle",
      members: 218,
    },
    {
      id: "grief",
      title: "Grief & Loss",
      members: 156,
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 pb-32 space-y-12">

      <CommunityHero />

      <CommunityTabs
        active={activeTab}
        onChange={setActiveTab}
      />

      <CommunityLayout>
        {activeTab === "feed" && <Feed />}
        {activeTab === "groups" && <Groups />}
        {activeTab === "discover" && <Discover />}
        {activeTab === "events" && <Events />}
      </CommunityLayout>

      {/* Daily Discussion */}
      <DailyDiscussion
        question="What made you smile today?"
        replies={128}
        onOpen={() =>
          navigate(communityRoutes.discussion("daily"))
        }
      />

      {/* Mood Circles */}
      <MoodCircles
        moods={moods}
        onOpen={(id) =>
          navigate(communityRoutes.circle(id))
        }
      />

      {/* Support Groups */}
      <SupportGroups
        groups={groups}
        onOpen={(id) =>
          navigate(communityRoutes.support(id))
        }
      />

    </main>
  );
}