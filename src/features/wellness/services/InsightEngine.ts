import type { WellnessInsight } from "../types/WellnessInsight";
import type { HealthMetrics } from "../types/HealthMetrics";

class InsightEngine {
  generate(metrics: HealthMetrics | null): WellnessInsight[] {

    if (!metrics) return [];

    const insights: WellnessInsight[] = [];

    if (metrics.steps >= 10000) {
      insights.push({
        id: crypto.randomUUID(),
        title: "Excellent Activity",
        message: "You've reached your daily step goal. Great job staying active!",
        category: "achievement",
        score: 95,
      });
    }

    if (metrics.sleepHours < 7) {
      insights.push({
        id: crypto.randomUUID(),
        title: "Sleep Recovery",
        message: "Getting another hour of sleep tonight may improve your recovery.",
        category: "warning",
        score: 65,
      });
    }

    if (metrics.heartRate > 100) {
      insights.push({
        id: crypto.randomUUID(),
        title: "Elevated Heart Rate",
        message: "Your resting heart rate appears elevated. Monitor trends over the next few days.",
        category: "improvement",
        score: 55,
      });
    }

    return insights;
  }
}

export default new InsightEngine();