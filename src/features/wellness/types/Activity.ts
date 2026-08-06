export type ActivityType =
  | "heart"
  | "steps"
  | "sleep"
  | "journal"
  | "meditation"
  | "goal"
  | "device"
  | "sync";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timestamp: string;
}