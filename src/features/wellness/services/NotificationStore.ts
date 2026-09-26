import type { WellnessNotification } from "../types/Notification";
import WellnessEvents from "./WellnessEvents";

const STORAGE_KEY = "saathi_notifications";

function getAccessToken(): string | null {
  try {
    const possibleKeys = [
      "saathi_access_token",
      "saathi_session",
      "saathi_auth",
      "auth_session",
      "session",
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (!value) continue;

      try {
        const parsed = JSON.parse(value);
        if (typeof parsed?.access_token === "string") {
          return parsed.access_token;
        }
        if (typeof parsed?.session?.access_token === "string") {
          return parsed.session.access_token;
        }
      } catch {
        if (value.trim()) {
          return value;
        }
      }
    }
  } catch {}

  return null;
}

function buildApiUrl(endpoint: string): string {
  const raw = (import.meta.env.VITE_API_URL || "/api").trim().replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (raw.endsWith("/api")) {
    if (cleanEndpoint.startsWith("/api/")) {
      return `${raw}${cleanEndpoint.slice(4)}`;
    }
    return `${raw}${cleanEndpoint}`;
  }

  if (!cleanEndpoint.startsWith("/api/")) {
    return `${raw}/api${cleanEndpoint}`;
  }

  return `${raw}${cleanEndpoint}`;
}

class NotificationStore {
  private notifications: WellnessNotification[] = [];
  private isSyncing = false;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.notifications = JSON.parse(saved);
      } catch {
        this.notifications = [];
      }
    }
  }

  private save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.notifications.slice(0, 50))
      );
    } catch (e) {
      console.debug("Failed to persist notifications:", e);
    }
  }

  getAll(): WellnessNotification[] {
    return this.notifications;
  }

  add(notification: WellnessNotification) {
    // Avoid duplicate notifications (same ID or same title within 1 hour)
    const nowTime = new Date(notification.createdAt).getTime();
    const existingIndex = this.notifications.findIndex(
      (n) =>
        n.id === notification.id ||
        (n.title === notification.title &&
          Math.abs(new Date(n.createdAt).getTime() - nowTime) < 3600000)
    );

    if (existingIndex >= 0) {
      this.notifications[existingIndex] = {
        ...this.notifications[existingIndex],
        ...notification,
      };
    } else {
      this.notifications.unshift(notification);
    }

    this.save();
    WellnessEvents.emit();
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );

    this.save();
    WellnessEvents.emit();

    // Sync to backend if authenticated
    const token = getAccessToken();
    if (token) {
      fetch(buildApiUrl(`/api/data/notifications/${id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          read_at: new Date().toISOString(),
        }),
      }).catch((err) => {
        console.debug("Failed to patch notification read_at on server:", err);
      });
    }
  }

  clear() {
    this.notifications = [];
    this.save();
    WellnessEvents.emit();

    // Delete on backend if authenticated
    const token = getAccessToken();
    if (token) {
      fetch(buildApiUrl("/api/data/notifications"), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch((err) => {
        console.debug("Failed to clear notifications on server:", err);
      });
    }
  }

  async syncFromBackend(): Promise<WellnessNotification[]> {
    if (this.isSyncing) return this.notifications;

    const token = getAccessToken();
    if (!token) return this.notifications;

    this.isSyncing = true;
    try {
      const response = await fetch(buildApiUrl("/api/notifications/latest"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return this.notifications;

      const data = await response.json();
      const rows = Array.isArray(data?.data) ? data.data : [];

      if (!rows.length) return this.notifications;

      const remoteItems: WellnessNotification[] = rows.map((row: any) => {
        let type: WellnessNotification["type"] = "mindfulness";
        const nt = String(row.notification_type || "").toLowerCase();

        if (nt.includes("sleep")) type = "sleep";
        else if (nt.includes("hydrat")) type = "hydration";
        else if (nt.includes("exercise") || nt.includes("workout")) type = "exercise";
        else if (nt.includes("goal")) type = "goal";
        else if (nt.includes("device")) type = "device";
        else if (nt.includes("mind") || nt.includes("insight")) type = "mindfulness";

        return {
          id: String(row.id),
          title: row.title || "Wellness Insight",
          description: row.body || "",
          type,
          createdAt: row.created_at || new Date().toISOString(),
          read: Boolean(row.read_at),
        };
      });

      // Merge: remote items + preserve any local un-synced items
      const map = new Map<string, WellnessNotification>();

      for (const local of this.notifications) {
        map.set(local.id, local);
      }

      for (const remote of remoteItems) {
        map.set(remote.id, remote);
      }

      this.notifications = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      this.save();
      WellnessEvents.emit();
      return this.notifications;
    } catch (err) {
      console.debug("NotificationStore sync error:", err);
      return this.notifications;
    } finally {
      this.isSyncing = false;
    }
  }
}

export default new NotificationStore();