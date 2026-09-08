import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import HighlightCard from "./HighlightCard";
import JourneyCard from "./JourneyCard";

import { shareToSocial } from "@/utils/shareToSocial";
import { supabase } from "@/supabaseClient";

type WellnessStats = {
  moodAverage: number;
  happiestDay: string;
  streak: number;
  bestStreak?: number;
  summary?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  stats: WellnessStats;
};

function ShareCard({ stats }: { stats: WellnessStats }) {
  if (!stats) return null;

  return (
    <div className="rounded-3xl border bg-card p-5">
      <h2 className="text-xl font-bold">
        Your Wellness Journey
      </h2>

      <p className="mt-2 text-muted-foreground">
        {stats?.summary ?? "Keep tracking your wellness."}
      </p>
    </div>
  );
}

const moods = [
  "😊",
  "😌",
  "😁",
  "🥰",
  "😔",
  "😴",
  "😤",
];

export default function ShareMomentModal({
  open,
  onClose,
  stats,
}: Props) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [selectedMood, setSelectedMood] = useState("😊");
  const [visibility, setVisibility] = useState<
    "community" | "private"
  >("community");

  if (!open || !stats) return null;

  const handleExternalShare = async () => {
    try {
      await shareToSocial({
        title: "My Wellness Journey 🌱",
        text: `Mood Avg: ${stats?.moodAverage ?? "-"}
Streak: ${stats?.streak ?? 0} days
Happiest Day: ${stats?.happiestDay ?? "-"}`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommunityShare = async () => {
    const post = {
      title,
      reflection,
      mood: selectedMood,
      visibility,
      stats,
    };

    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      await supabase.from("community_posts").insert({
        title,
        body: reflection,
        mood: selectedMood,
        visibility,
        type: "reflection",
        stats,
      });
    }

    onClose();

    navigate("/community");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

      <div className="bg-background rounded-[32px] shadow-2xl border w-[95%] max-w-3xl max-h-[92vh] overflow-y-auto">

        {/* Header */}

        <div className="border-b px-8 py-6">

          <h1 className="text-3xl font-bold">
            🌱 Share Your Journey
          </h1>

          <p className="text-muted-foreground mt-2">
            Inspire others with your wellness progress.
          </p>

        </div>

        <div className="p-8 space-y-8">

          <ShareCard stats={stats} />

          {/* Highlights */}

          <div className="space-y-3">

            <h3 className="text-lg font-semibold">
              Highlights
            </h3>

            <HighlightCard
              title="Happiest Day"
              value={stats?.happiestDay}
              icon="🥰"
            />

            <HighlightCard
              title="Longest Streak"
              value={`${stats?.bestStreak ?? 0} Days`}
              icon="🔥"
            />

          </div>

          {/* Journey */}

          <div className="space-y-3">

            <h3 className="text-lg font-semibold">
              Journey Cards
            </h3>

            <div className="flex gap-4 overflow-x-auto pb-2">

              <JourneyCard
                title="My Mood Journey"
                subtitle="Tracking wellness every day 💙"
                emoji="📊"
              />

              <JourneyCard
                title="Small Wins Matter"
                subtitle="Progress over perfection ✨"
                emoji="🏆"
              />

              <JourneyCard
                title="Healing in Progress"
                subtitle="One day at a time 🌱"
                emoji="🌈"
              />

            </div>

          </div>

          {/* Mood */}

          <div>

            <h3 className="font-semibold mb-4">
              How are you feeling?
            </h3>

            <div className="flex flex-wrap gap-3">

              {moods.map((mood) => (

                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`
                    w-14
                    h-14
                    rounded-full
                    text-2xl
                    transition-all
                    duration-300
                    ${
                      selectedMood === mood
                        ? "bg-primary text-white scale-110 shadow-lg"
                        : "bg-muted hover:scale-105"
                    }
                  `}
                >
                  {mood}
                </button>

              ))}

            </div>

          </div>

          {/* Title */}

          <div className="space-y-3">

            <label className="font-semibold">
              Title
            </label>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give today's journey a title..."
            />

          </div>

          {/* Reflection */}

          <div className="space-y-3">

            <label className="font-semibold">
              Reflection
            </label>

            <Textarea
              rows={5}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write about today's experience..."
            />

          </div>

            {/* Visibility */}

          <div className="space-y-3">

            <label className="font-semibold">
              Who can see this?
            </label>

            <div className="grid grid-cols-2 gap-4">

              <button
                onClick={() => setVisibility("community")}
                className={`
                  rounded-2xl
                  border
                  p-5
                  text-left
                  transition-all
                  duration-300
                  ${
                    visibility === "community"
                      ? "border-green-500 bg-green-500/10"
                      : "hover:border-primary"
                  }
                `}
              >
                <div className="text-3xl mb-2">🌍</div>

                <h4 className="font-semibold">
                  Community
                </h4>

                <p className="text-sm text-muted-foreground">
                  Inspire and encourage others.
                </p>

              </button>

              <button
                onClick={() => setVisibility("private")}
                className={`
                  rounded-2xl
                  border
                  p-5
                  text-left
                  transition-all
                  duration-300
                  ${
                    visibility === "private"
                      ? "border-blue-500 bg-blue-500/10"
                      : "hover:border-primary"
                  }
                `}
              >
                <div className="text-3xl mb-2">🔒</div>

                <h4 className="font-semibold">
                  Private
                </h4>

                <p className="text-sm text-muted-foreground">
                  Save this only for yourself.
                </p>

              </button>

            </div>

          </div>

          {/* Preview */}

          <div className="rounded-3xl border bg-muted/30 p-6">

            <h3 className="font-semibold mb-4">
              Preview
            </h3>

            <div className="rounded-2xl bg-card border p-5">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xl">

                  {selectedMood}

                </div>

                <div>

                  <h4 className="font-semibold">

                    {title || "Your Journey"}

                  </h4>

                  <p className="text-sm text-muted-foreground">

                    Just now

                  </p>

                </div>

              </div>

              <p className="mt-5 text-sm leading-7">

                {reflection ||
                  "Your reflection will appear here..."}

              </p>

            </div>

          </div>

          {/* Action Buttons */}

          <div className="grid md:grid-cols-3 gap-4 pt-2">

            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-2xl h-12"
            >
              Cancel
            </Button>

            <Button
              variant="outline"
              onClick={handleExternalShare}
              className="rounded-2xl h-12"
            >
              📤 Share Externally
            </Button>

            <Button
              onClick={handleCommunityShare}
              className="rounded-2xl h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              🌱 Share to Community
            </Button>

          </div>

        </div>

      </div>

    </div>
  );
}