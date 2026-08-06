import type { WellnessInsight } from "../types/WellnessInsight";

interface Props {
  insights: WellnessInsight[];
}

export default function InsightPanel({ insights }: Props) {
  return (
    <div className="rounded-3xl border border-border/50 bg-card p-6">

      <h2 className="mb-6 text-xl font-semibold">
        AI Wellness Insights
      </h2>

      {insights.length === 0 ? (
        <p className="text-muted-foreground">
          Connect a device or continue using Saathi to generate personalized insights.
        </p>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-2xl border border-border/40 p-4"
            >
              <h3 className="font-semibold">
                {insight.title}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {insight.message}
              </p>

              <div className="mt-3 text-xs text-primary">
                Confidence Score: {insight.score}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}