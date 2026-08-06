interface Props {
  score: number;
}

export default function InsightCard({
  score,
}: Props) {

  let insight =
    "Keep tracking your wellness.";

  if (score >= 80) {

    insight =
      "Excellent consistency. Keep maintaining your healthy habits.";

  } else if (score >= 60) {

    insight =
      "You're doing well. Completing a meditation session today could improve your wellness score.";

  } else {

    insight =
      "Your activity has been low recently. Consider journaling or meditating today.";

  }

  return (

    <div className="rounded-3xl border bg-card p-6">

      <h2 className="font-semibold mb-4">

        AI Insight

      </h2>

      <p className="text-muted-foreground">

        {insight}

      </p>

    </div>

  );

}