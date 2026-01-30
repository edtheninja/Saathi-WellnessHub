import { Button } from "@/components/ui/button";
import { shareProgress } from "../utils/share";
import HighlightCard from "./HighlightCard";
import JourneyCard from "./JourneyCard";
import { shareToSocial } from "@/utils/shareToSocial";


function ShareCard({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium">Your Progress</h3>
      <p className="text-sm text-gray-600">{stats?.summary ?? "No data"}</p>
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  stats: any;
};

export default function ShareMomentModal({ open, onClose, stats }: Props) {
  if (!open || !stats) return null;

  const handleShare = async () => {
    try {
      await shareToSocial({
        title: "My Wellness Journey 🌱",
        text: `Mood Avg: ${stats?.moodAverage ?? "-"}
Streak: ${stats?.streak ?? 0} days
Happiest Day: ${stats?.happiestDay ?? "-"}`,
      });
    } catch (err) {
      console.error("Share failed or cancelled", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-background p-6 rounded-2xl w-[90%] max-w-sm">
        <ShareCard stats={stats} />

        <div className="space-y-2 mt-4">
          <HighlightCard
            title="Happiest Day"
            value={stats?.happiestDay}
            icon="🥰"
          />
          <HighlightCard
            title="Longest Streak"
            value={`${stats?.bestStreak ?? 0} days`}
            icon="🔥"
          />

          <div className="flex gap-4 overflow-x-auto mt-4 pb-2">
            <JourneyCard
              title="My Mood Journey"
              subtitle="Tracking my mental wellness daily 💙"
              emoji="📊"
            />
            <JourneyCard
              title="Small Wins Matter"
              subtitle="Consistency is my superpower ✨"
              emoji="🏆"
            />
            <JourneyCard
              title="Healing in Progress"
              subtitle="One day at a time 🌱"
              emoji="🌈"
            />
          </div>
        </div>

        <Button onClick={handleShare}>
          Share Now
        </Button>

        <button
          onClick={onClose}
          className="mt-2 w-full text-sm text-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}