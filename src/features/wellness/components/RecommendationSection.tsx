import type { Recommendation } from "../types/Recommendation";

interface Props {
  recommendations: Recommendation[];
}

export default function RecommendationSection({
  recommendations,
}: Props) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <h3 className="font-semibold">
          No Recommendations Yet
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Sync your device and continue using Saathi to receive personalized recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {recommendations.map((recommendation) => (
        <div
          key={recommendation.id}
          className="rounded-2xl border border-border/50 bg-card p-5"
        >
          <h3 className="font-semibold">
            {recommendation.title}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {recommendation.description}
          </p>
        </div>
      ))}
    </div>
  );
}