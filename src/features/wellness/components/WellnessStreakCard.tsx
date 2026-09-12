import type { WellnessStreak }
from "../services/WellnessStreakService";

interface Props {
  streak: WellnessStreak;
}

export default function WellnessStreakCard({
  streak,
}: Props) {

  return (

    <div className="rounded-3xl border border-border bg-card p-6">

      <h2 className="text-lg font-semibold">

        🔥 Wellness Streak

      </h2>

      <div className="mt-5">

        <div className="text-4xl font-bold">

          {streak.overall} Days

        </div>

        <p className="text-muted-foreground mt-2">

          {streak.status}

        </p>

      </div>

      <div className="mt-8 space-y-3">

        <div className="flex justify-between">

          <span>Journal</span>

          <span>{streak.journal} 🔥</span>

        </div>

        <div className="flex justify-between">

          <span>Meditation</span>

          <span>{streak.meditation} 🔥</span>

        </div>

        <div className="flex justify-between">

          <span>Goals</span>

          <span>{streak.goals} 🔥</span>

        </div>

      </div>

    </div>

  );

}