export interface WellnessInsight {
  id: string;
  title: string;
  message: string;
  category:
    | "positive"
    | "warning"
    | "improvement"
    | "achievement";

  score: number;
}