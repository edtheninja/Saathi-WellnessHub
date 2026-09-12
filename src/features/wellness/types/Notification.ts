export interface WellnessNotification {
  id: string;
  title: string;
  description: string;
  type:
    | "sleep"
    | "hydration"
    | "exercise"
    | "mindfulness"
    | "nutrition"
    | "goal"
    | "device"
    | "success";

  createdAt: string;
  read: boolean;
}