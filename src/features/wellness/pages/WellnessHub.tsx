import { useWellness } from "../hooks/useWellness";

import WellnessHeader from "../components/WellnessHeader";
import WellnessScore from "../components/WellnessScore";
import WellnessBreakdown from "../components/WellnessBreakdown";
import WeeklyTrend from "../components/WeeklyTrend";
import MentalHealthSection from "../components/MentalHealthSection";
import PhysicalHealthSection from "../components/PhysicalHealthSection";
import RecommendationSection from "../components/RecommendationSection";
import ActivityFeed from "../components/ActivityFeed";
import ActivityTimeline from "../components/ActivityTimeline";
import DeviceCard from "../components/DeviceCard";
import ConnectedDeviceCard from "../components/ConnectedDeviceCard";
import InsightPanel from "../components/InsightPanel";
import MoodCard from "../components/MoodCard";
import WellnessStreakCard from "../components/WellnessStreakCard";

import { useDevice } from "../hooks/useDevice";
import { useHealthMetrics } from "../hooks/useHealthMetrics";
import { useActivityFeed } from "../hooks/useActivityFeed";
import { useRecommendations } from "../hooks/useRecommendations";
import { useInsights } from "../hooks/useInsights";

import DeviceManager from "../services/DeviceManager";
import HealthSyncService from "../services/HealthSyncService";

export default function WellnessHub() {
  const { loading, data } = useWellness();

  const deviceStatus = useDevice();
  const metrics = useHealthMetrics();
  const activities = useActivityFeed();
  const recommendations = useRecommendations();
  const insights = useInsights();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading Wellness...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 pt-6 pb-44">

      <WellnessHeader />

      {/* Top Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <WellnessScore score={data?.score.score ?? 0} />
        {data?.mood && <MoodCard mood={data.mood} />}
        {data?.streak && <WellnessStreakCard streak={data.streak} />}
      </div>

      {/* Connected Device */}
      {deviceStatus.connected ? (
        <ConnectedDeviceCard
          deviceName={deviceStatus.deviceName ?? "Connected Device"}
          provider={deviceStatus.platform ?? ""}
          lastSync={
            deviceStatus.lastSync
              ? new Date(deviceStatus.lastSync).toLocaleString()
              : "--"
          }
          metrics={metrics}
          onSync={async () => { await HealthSyncService.sync(); }}
          onDisconnect={async () => { await DeviceManager.disconnect(); }}
        />
      ) : (
        <DeviceCard />
      )}

      {/* Breakdown */}
      <WellnessBreakdown breakdown={data?.score.breakdown} />

      {/* Weekly Trend */}
      <WeeklyTrend />

      {/* Mental + Physical */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MentalHealthSection
          journalEntries={data?.journal.totalEntries ?? 0}
          meditationMinutes={data?.meditation.minutes ?? 0}
        />
        <PhysicalHealthSection connected={deviceStatus.connected} />
      </div>

      {/* AI Insights */}
      <InsightPanel insights={insights} />

      {/* Recommendations */}
      <RecommendationSection recommendations={recommendations} />

      {/* Activity Feed */}
      <ActivityFeed activities={activities} />

      {/* Activity Timeline */}
      <ActivityTimeline />

    </div>
  );
}
