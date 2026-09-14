import { ArrowRight, Check, LogIn, LogOut, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { CreatedCommunity } from "@/lib/communityApi";
import {
  checkCommunityMembership,
  joinCommunity,
  leaveCommunity,
} from "@/lib/communityApi";

interface Props {
  groups: CreatedCommunity[];
  onOpen?: (id: string) => void;
}

type MembershipState = Record<string, boolean>;
type LoadingState = Record<string, boolean>;

export default function SupportGroups({ groups, onOpen }: Props) {
  const [membership, setMembership] = useState<MembershipState>({});
  const [loading, setLoading] = useState<LoadingState>({});

  const supportGroups = groups.filter(
    (community) => community.room_type === "support",
  );

  useEffect(() => {
    let cancelled = false;

    async function loadMemberships() {
      if (supportGroups.length === 0) {
        return;
      }

      const results = await Promise.allSettled(
        supportGroups.map(async (community) => {
          const result = await checkCommunityMembership(community.id);

          return {
            id: community.id,
            isMember: result.isMember,
          };
        }),
      );

      if (cancelled) {
        return;
      }

      const nextMembership: MembershipState = {};

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          nextMembership[result.value.id] = result.value.isMember;
        }
      });

      setMembership(nextMembership);
    }

    void loadMemberships();

    return () => {
      cancelled = true;
    };
  }, [groups]);

  async function handleMembershipChange(
    community: CreatedCommunity,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();

    if (loading[community.id]) {
      return;
    }

    const isMember = membership[community.id] ?? false;

    setLoading((current) => ({
      ...current,
      [community.id]: true,
    }));

    try {
      if (isMember) {
        await leaveCommunity(community.id);

        setMembership((current) => ({
          ...current,
          [community.id]: false,
        }));
      } else {
        await joinCommunity(community.id);

        setMembership((current) => ({
          ...current,
          [community.id]: true,
        }));
      }
    } catch (error) {
      console.error("Failed to update community membership:", error);
    } finally {
      setLoading((current) => ({
        ...current,
        [community.id]: false,
      }));
    }
  }

  return (
    <section className="rounded-[32px] border bg-card p-8">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Support Groups
      </h2>

      {supportGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No support groups are available yet.
        </p>
      ) : (
        <div className="space-y-4">
          {supportGroups.map((community) => {
            const isMember = membership[community.id] ?? false;
            const isLoading = loading[community.id] ?? false;

            return (
              <div
                key={community.id}
                className="rounded-3xl border bg-background/60 p-5 transition-colors hover:bg-accent/30"
              >
                <button
                  type="button"
                  onClick={() => onOpen?.(community.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
                        💙
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-foreground">
                          {community.name}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {community.topic ||
                            community.description ||
                            "Safe conversations in a supportive community."}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {community.member_count} members
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                </button>

                <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
                  <span className="text-sm text-muted-foreground">
                    {isMember
                      ? "You are part of this community"
                      : "Join this supportive community"}
                  </span>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={(event) =>
                      void handleMembershipChange(community, event)
                    }
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      isMember
                        ? "border border-border bg-background text-foreground hover:bg-accent"
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

                    {isLoading ? "Please wait..." : isMember ? "Leave" : "Join"}
                  </button>
                </div>

                {isMember && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                    <Check className="h-4 w-4" />
                    Member
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
