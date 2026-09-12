export type MoodState = {
  min: number;
  max: number;
  label: string;
  expression: string;
  message: string;
  tip: string;
  music: string;
  meditation: string;
  journalPrompt: string;
};

export const moodStates: MoodState[] = [
  {
    min: 0,
    max: 20,
    label: "Very Low",
    expression: "😭",
    message: "It seems like things feel a little heavy right now.",
    tip: "Be gentle with yourself. You don't have to figure everything out at once.",
    music: "Agar Tum Saath Ho",
    meditation: "5-Minute Breathing",
    journalPrompt: "What is weighing on your mind right now?",
  },
  {
    min: 21,
    max: 40,
    label: "Low",
    expression: "😔",
    message: "You may be having a quieter or more difficult day.",
    tip: "A little pause, some music, or writing your thoughts down may help.",
    music: "Channa Mereya",
    meditation: "Gentle Relaxation",
    journalPrompt: "What would make today feel a little easier?",
  },
  {
    min: 41,
    max: 60,
    label: "Neutral",
    expression: "😐",
    message: "You're somewhere in the middle today.",
    tip: "Take a moment to notice what your mind and body need.",
    music: "Safarnama",
    meditation: "Mindful Pause",
    journalPrompt: "What is one thing you noticed about yourself today?",
  },
  {
    min: 61,
    max: 80,
    label: "Calm",
    expression: "😌",
    message: "You seem to be feeling calm and balanced.",
    tip: "You're doing well. Keep taking care of yourself.",
    music: "Sooraj Ki Baahon Mein",
    meditation: "5-Minute Relaxation",
    journalPrompt: "What helped you feel calm today?",
  },
  {
    min: 81,
    max: 100,
    label: "Happy",
    expression: "🥰",
    message: "You're carrying some positive energy today!",
    tip: "Enjoy this moment and notice what is making you feel good.",
    music: "Badtameez Dil",
    meditation: "Gratitude Moment",
    journalPrompt: "What is something you're grateful for today?",
  },
];

export const moodCheckpoints = [
  { value: 0, label: "Very Low", expression: "😭" },
  { value: 11, label: "Low", expression: "😔" },
  { value: 22, label: "Worried", expression: "😟" },
  { value: 33, label: "Uneasy", expression: "😕" },
  { value: 44, label: "Slightly Low", expression: "😐" },
  { value: 55, label: "Neutral", expression: "😌" },
  { value: 66, label: "Okay", expression: "🙂" },
  { value: 77, label: "Good", expression: "😊" },
  { value: 88, label: "Very Good", expression: "😄" },
  { value: 100, label: "Excellent", expression: "🤩" },
];

export function getMoodFromScore(score: number): MoodState {
  const safeScore = Math.max(0, Math.min(100, score));

  return (
    moodStates.find(
      (mood) =>
        safeScore >= mood.min &&
        safeScore <= mood.max
    ) ?? moodStates[2]
  );
}

export function getEnergyLevel(score: number): number {
  if (score <= 20) return 1;
  if (score <= 40) return 2;
  if (score <= 60) return 3;
  if (score <= 80) return 4;
  return 5;
}