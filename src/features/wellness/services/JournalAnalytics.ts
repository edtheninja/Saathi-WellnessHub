import JournalService, { type JournalEntry } from "./JournalService";

export interface JournalAnalytics {
  totalEntries: number;
  streak: number;
  averageMood: number;
  lastEntry?: string;
  mostFrequentMood?: string;
}

class JournalAnalyticsService {

  async getAnalytics(): Promise<JournalAnalytics> {

    const entries = await JournalService.getEntries();

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        streak: 0,
        averageMood: 0,
      };
    }

    const moodMap = new Map<string, number>();

    let moodTotal = 0;

    entries.forEach(entry => {

      moodTotal += entry.mood;

      moodMap.set(
        entry.label,
        (moodMap.get(entry.label) ?? 0) + 1
      );

    });

    const mostFrequentMood =
      [...moodMap.entries()]
        .sort((a, b) => b[1] - a[1])[0][0];

    return {

      totalEntries: entries.length,

      streak: calculateJournalStreak(entries),

      averageMood:
        Number((moodTotal / entries.length).toFixed(1)),

      lastEntry:
        entries[0]?.createdAt,

      mostFrequentMood,

    };

  }

}

function calculateJournalStreak(entries: JournalEntry[]) {

  if (entries.length === 0)
    return 0;

  let streak = 1;

  for (let i = 1; i < entries.length; i++) {

    const previous =
      new Date(entries[i - 1].createdAt);

    const current =
      new Date(entries[i].createdAt);

    const diff =
      (previous.getTime() - current.getTime()) /
      (1000 * 60 * 60 * 24);

    if (Math.round(diff) === 1)
      streak++;
    else
      break;

  }

  return streak;

}

export default new JournalAnalyticsService();