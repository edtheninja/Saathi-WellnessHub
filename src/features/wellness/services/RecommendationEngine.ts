import type { Recommendation } from "../types/Recommendation";
import type { HealthMetrics } from "../types/HealthMetrics";

class RecommendationEngine {
  generate(metrics: HealthMetrics | null): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!metrics) {
      return recommendations;
    }

    if (metrics.sleepHours !== undefined && metrics.sleepHours < 7) {
      recommendations.push({
        id: crypto.randomUUID(),
        title: "Improve Sleep",
        description:
          "Aim for at least 7–8 hours of sleep tonight.",
        priority: "high",
        category: "sleep",
      });
    }

    if (metrics.steps !== undefined && metrics.steps < 8000) {
      recommendations.push({
        id: crypto.randomUUID(),
        title: "Increase Daily Activity",
        description:
          "A short walk can help you reach today's activity goal.",
        priority: "medium",
        category: "exercise",
      });
    }

    if (
      metrics.waterIntake !== undefined &&
      metrics.waterIntake < 2
    ) {
      recommendations.push({
        id: crypto.randomUUID(),
        title: "Stay Hydrated",
        description:
          "Consider drinking more water throughout the day.",
        priority: "medium",
        category: "hydration",
      });
    }

    return recommendations;
  }
}

export default new RecommendationEngine();