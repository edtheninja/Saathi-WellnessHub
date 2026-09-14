import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  HeartHandshake,
  Loader2,
  LogIn,
  LogOut,
  MessageCircleHeart,
  Users,
} from "lucide-react";

import CommunityHero from "@/components/community/CommunityHero";

import CommunityTabs, {
  type CommunityTab,
} from "@/components/community/CommunityTabs";

import CommunityLayout from "@/components/community/CommunityLayout";

import Feed from "@/components/community/feed/Feed";
import Groups from "@/components/community/Groups/Groups";
import Discover from "@/components/community/Discover/Discover";
import Events from "@/components/community/Events/Events";

import DailyDiscussion from "@/components/community/DailyDiscussion";
import SupportGroups from "@/components/community/SupportGroups";

import { communityRoutes } from "@/components/community/utils/routes";
import CreateCommunityDialog from "@/components/community/CreateCommunityDialog";

import {
  checkCommunityMembership,
  getCommunities,
  joinCommunity,
  leaveCommunity,
  type CreatedCommunity,
} from "@/lib/communityApi";

type MembershipState = Record<string, boolean>;

const DEFAULT_COMMUNITY_IDS = [
  "daily",
  "meditation",
  "sleep",
  "anxiety",
  "mindfulness",
  "grief",
];

function getCommunityIcon(roomType: CreatedCommunity["room_type"]) {
  switch (roomType) {
    case "circle":
      return <HeartHandshake className="h-5 w-5" />;
    case "support":
      return <MessageCircleHeart className="h-5 w-5" />;
    case "discussion":
      return <MessageCircleHeart className="h-5 w-5" />;
    default:
      return <Users className="h-5 w-5" />;
  }
}

function getCommunityColor(roomType: CreatedCommunity["room_type"]) {
  switch (roomType) {
    case "circle":
      return "from-violet-500/15 via-purple-500/10 to-transparent";
    case "support":
      return "from-blue-500/15 via-cyan-500/10 to-transparent";
    case "discussion":
      return "from-emerald-500/15 via-teal-500/10 to-transparent";
    case "event":
      return "from-orange-500/15 via-amber-500/10 to-transparent";
    default:
      return "from-primary/15 via-primary/5 to-transparent";
  }
}

export default function Community() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<CommunityTab>("feed");

  const [communities, setCommunities] =
    useState<CreatedCommunity[]>([]);

  const [createdCommunities, setCreatedCommunities] =
    useState<CreatedCommunity[]>([]);

  const [membership, setMembership] =
    useState<MembershipState>({});

  const [membershipLoading, setMembershipLoading] =
    useState<Record<string, boolean>>({});

  useEffect(() => {
    void loadCommunities();
  }, []);

  async function loadCommunities() {
    try {
      const { data } = await getCommunities();

      setCommunities(data);

      setCreatedCommunities(
        data.filter(
          (community) =>
            !DEFAULT_COMMUNITY_IDS.includes(community.id),
        ),
      );

      const membershipEntries = await Promise.all(
        data.map(async (community) => {
          try {
            const result = await checkCommunityMembership(
              community.id,
            );

            return [
              community.id,
              Boolean(result.isMember),
            ] as const;
          } catch {
            return [community.id, false] as const;
          }
        }),
      );

      setMembership(Object.fromEntries(membershipEntries));
    } catch (error) {
      console.error("Failed to load communities:", error);
    }
  }

  function handleCommunityCreated(
    community: CreatedCommunity,
  ) {
    setCreatedCommunities((current) => [
      community,
      ...current,
    ]);

    setCommunities((current) => [
      community,
      ...current,
    ]);

    setMembership((current) => ({
      ...current,
      [community.id]: true,
    }));
  }

  async function handleMembershipToggle(
    community: CreatedCommunity,
  ) {
    const communityId = community.id;
    const isMember = membership[communityId];

    setMembershipLoading((current) => ({
      ...current,
      [communityId]: true,
    }));

    try {
      if (isMember) {
        await leaveCommunity(communityId);

        setMembership((current) => ({
          ...current,
          [communityId]: false,
        }));

        setCommunities((current) =>
          current.map((item) =>
            item.id === communityId
              ? {
                  ...item,
                  member_count: Math.max(
                    0,
                    item.member_count - 1,
                  ),
                }
              : item,
          ),
        );
      } else {
        await joinCommunity(communityId);

        setMembership((current) => ({
          ...current,
          [communityId]: true,
        }));

        setCommunities((current) =>
          current.map((item) =>
            item.id === communityId
              ? {
                  ...item,
                  member_count: item.member_count + 1,
                }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error(
        "Failed to update community membership:",
        error,
      );
    } finally {
      setMembershipLoading((current) => ({
        ...current,
        [communityId]: false,
      }));
    }
  }

  function openCommunity(community: CreatedCommunity) {
    navigate(`/community/custom/${community.id}`);
  }

  const supportCommunities = useMemo(
    () =>
      communities.filter(
        (community) =>
          community.room_type === "support",
      ),
    [communities],
  );

  return (
    <main className="relative mx-auto max-w-7xl space-y-12 overflow-hidden px-4 py-6 pb-32 sm:px-6 sm:py-8">
      {/* Soft Saathi background accents */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute right-0 top-12 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <CommunityHero />

        <CreateCommunityDialog
          onCreated={handleCommunityCreated}
        />
      </div>

      {/* Tabs */}
      <section className="rounded-[28px] border border-border/60 bg-card/70 p-2 shadow-sm backdrop-blur-xl">
        <CommunityTabs
          active={activeTab}
          onChange={setActiveTab}
        />
      </section>

      {/* Main community content */}
      <CommunityLayout>
        {activeTab === "feed" && <Feed />}
        {activeTab === "groups" && <Groups />}
        {activeTab === "discover" && <Discover />}
        {activeTab === "events" && <Events />}
      </CommunityLayout>

      {/* Created communities */}
      {createdCommunities.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-primary">
                Your safe space
              </p>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your Communities
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Connect, share, and grow together.
              </p>
            </div>

            <div className="rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm text-muted-foreground">
              {createdCommunities.length} communities
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {createdCommunities.map((community) => {
              const isMember = Boolean(
                membership[community.id],
              );

              const isLoading = Boolean(
                membershipLoading[community.id],
              );

              return (
                <article
                  key={community.id}
                  className={`group relative overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-br ${getCommunityColor(
                    community.room_type,
                  )} bg-card/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl`}
                >
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-background/20 blur-2xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-primary shadow-sm">
                        {getCommunityIcon(
                          community.room_type,
                        )}
                      </div>

                      <div>
                        <h3 className="line-clamp-1 font-semibold">
                          {community.name}
                        </h3>

                        <p className="mt-1 text-xs capitalize text-muted-foreground">
                          {community.room_type} community
                        </p>
                      </div>
                    </div>

                    {isMember && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        Joined
                      </span>
                    )}
                  </div>

                  <p className="relative mt-5 min-h-10 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {community.topic ||
                      community.description ||
                      "A calm space to connect and support one another."}
                  </p>

                  <div className="relative mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {community.member_count} members
                    </span>
                  </div>

                  <div className="relative mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleMembershipToggle(community)
                      }
                      disabled={isLoading}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isMember
                          ? "border border-border/70 bg-background/70 text-foreground hover:bg-background"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isMember ? (
                        <LogOut className="h-4 w-4" />
                      ) : (
                        <LogIn className="h-4 w-4" />
                      )}

                      {isMember ? "Leave" : "Join"}
                    </button>

                    <button
                      type="button"
                      onClick={() => openCommunity(community)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/50 px-4 py-2.5 text-sm font-semibold transition hover:bg-background"
                    >
                      Open
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Daily Discussion */}
      <section className="space-y-5">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            A little reflection
          </p>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Daily Discussion
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Small thoughts can create meaningful connections.
          </p>
        </div>

        <DailyDiscussion
          question="What made you smile today?"
          onOpen={() =>
            navigate(communityRoutes.discussion("daily"))
          }
        />
      </section>

      {/* Support Groups */}
      <section className="space-y-5">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            You are not alone
          </p>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Support Groups
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Find people who understand and care.
          </p>
        </div>

        <SupportGroups
          groups={supportCommunities}
          onOpen={(id) =>
            navigate(communityRoutes.support(id))
          }
        />
      </section>
    </main>
  );
}