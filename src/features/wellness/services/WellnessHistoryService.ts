import type { Activity } from "../types/Activity";
import WellnessEvents from "./WellnessEvents";

const STORAGE_KEY = "saathi_activity_history";

class WellnessHistoryService {

  private history: Activity[] = [];

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        this.history = JSON.parse(saved);
      } catch {
        this.history = [];
      }
    }
  }

  private save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.history)
    );
  }

  getActivities() {
    return [...this.history].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    );
  }

  add(activity: Activity) {
    this.history.unshift(activity);

    this.save();
    WellnessEvents.emit();
  }

  clear() {
    this.history = [];

    this.save();
    WellnessEvents.emit();
  }

}

export default new WellnessHistoryService();