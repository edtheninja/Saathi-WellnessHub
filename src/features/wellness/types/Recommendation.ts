export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  category:
    | "sleep"
    | "exercise"
    | "mindfulness"
    | "nutrition"
    | "hydration";
}