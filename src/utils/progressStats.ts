export function calculateStats(moods: any[]) {
  let happiest = moods[0];
  let streak = 1;
  let bestStreak = 1;

  moods.forEach((m, i) => {
    if (m.mood > happiest.mood) happiest = m;
    if (i > 0 && moods[i - 1].date === prevDay(m.date)) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 1;
    }
  });

  return {
    happiestDay: happiest.date,
    bestStreak,
  };
}

function prevDay(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}