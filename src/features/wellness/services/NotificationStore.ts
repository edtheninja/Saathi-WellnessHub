import type { WellnessNotification } from "../types/Notification";
import WellnessEvents from "./WellnessEvents";
const STORAGE_KEY = "saathi_notifications";

class NotificationStore {

  private notifications: WellnessNotification[] = [];

  constructor() {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {
      this.notifications = JSON.parse(saved);
    }

  }

  private save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.notifications)
    );
  }

  getAll() {
    return this.notifications;
  }

  add(notification: WellnessNotification) {

    this.notifications.unshift(notification);

    this.save();
  WellnessEvents.emit();
  }

  markAsRead(id: string) {

    this.notifications =
      this.notifications.map(n =>
        n.id === id
          ? { ...n, read: true }
          : n
      );

    this.save();
  WellnessEvents.emit();
  }

  clear() {
  this.notifications = [];
  this.save();
  WellnessEvents.emit();
}
}

export default new NotificationStore();