export function deleteLocalUserData() {
  // Remove only app-related keys (safe)
  const keysToRemove = [
    "user",
    "guest_id",
    "mood_data",
    "journal_entries",
    "goals",
    "saathi_mode_chosen",
    "theme",
    "progress_stats",
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Optional: clear session storage too
  sessionStorage.clear();
}