import type { HealthMetrics } from "../types/HealthMetrics";
import HealthDataStore from "./HealthDataStore";
import DeviceStorage from "./DeviceStorage";
import WellnessHistoryService from "./WellnessHistoryService";

export const DEMO_MODE_KEY = "saathi_demo_mode";
const DEMO_JOURNALS_KEY = "saathi_demo_journals";
const DEMO_MEDITATION_KEY = "saathi_demo_meditation";
const DEMO_GOAL_KEY = "saathi_demo_goal";

export type DemoJournal = {
  id: string;
  mood: number;
  label: string;
  createdAt: string;
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export function isDemoMode() {
  return localStorage.getItem(DEMO_MODE_KEY) === "true";
}

export function getDemoJournals(): DemoJournal[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_JOURNALS_KEY) || "[]") as DemoJournal[];
  } catch {
    return [];
  }
}

export function getDemoMeditation() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_MEDITATION_KEY) || "{}");
  } catch {
    return { completed: 0, minutes: 0 };
  }
}

export function getDemoGoal() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_GOAL_KEY) || "{}");
  } catch {
    return {};
  }
}

export function enableDemoMode() {
  const journals: DemoJournal[] = [
    { id: "demo-journal-1", mood: 5, label: "Happy", createdAt: daysAgo(0) },
    { id: "demo-journal-2", mood: 4, label: "Calm", createdAt: daysAgo(1) },
    { id: "demo-journal-3", mood: 4, label: "Calm", createdAt: daysAgo(2) },
    { id: "demo-journal-4", mood: 5, label: "Grateful", createdAt: daysAgo(3) },
    { id: "demo-journal-5", mood: 3, label: "Neutral", createdAt: daysAgo(4) },
    { id: "demo-journal-6", mood: 4, label: "Calm", createdAt: daysAgo(5) },
    { id: "demo-journal-7", mood: 4, label: "Hopeful", createdAt: daysAgo(6) },
  ];
  const health: HealthMetrics = {
    heartRate: 72,
    restingHeartRate: 64,
    steps: 8246,
    calories: 1980,
    activeCalories: 430,
    distance: 5.8,
    exerciseMinutes: 38,
    sleepHours: 7.4,
    deepSleep: 2.1,
    bloodOxygen: 98,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem(DEMO_MODE_KEY, "true");
  localStorage.setItem(DEMO_JOURNALS_KEY, JSON.stringify(journals));
  localStorage.setItem(DEMO_MEDITATION_KEY, JSON.stringify({ completed: 12, minutes: 145 }));
  localStorage.setItem(DEMO_GOAL_KEY, JSON.stringify({ id: "demo-goal", category: "Meditation", duration: 180, progress: 145, completed: false }));
  HealthDataStore.saveMetrics(health);
  DeviceStorage.save({ connected: true, platform: "fitbit", deviceName: "Demo Fitbit", lastSync: new Date().toISOString() });
  WellnessHistoryService.add({ id: "demo-sync", type: "sync", title: "Health Data Synced", subtitle: "Demo Fitbit metrics", timestamp: new Date().toISOString() });
  window.dispatchEvent(new Event("saathi-demo-mode-changed"));
}

export function disableDemoMode() {
  localStorage.removeItem(DEMO_MODE_KEY);
  localStorage.removeItem(DEMO_JOURNALS_KEY);
  localStorage.removeItem(DEMO_MEDITATION_KEY);
  localStorage.removeItem(DEMO_GOAL_KEY);
  HealthDataStore.clear();
  DeviceStorage.clear();
  window.dispatchEvent(new Event("saathi-demo-mode-changed"));
}
