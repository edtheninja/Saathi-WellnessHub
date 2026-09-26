import { useEffect, useState } from "react";
import NotificationStore from "../services/NotificationStore";
import WellnessEvents from "../services/WellnessEvents";

export function useNotifications() {
  const [notifications, setNotifications] = useState(
    NotificationStore.getAll()
  );

  useEffect(() => {
    // Initial fetch from backend if online/authenticated
    NotificationStore.syncFromBackend().then((items) => {
      if (items && items.length > 0) {
        setNotifications([...items]);
      }
    });

    const unsubscribe = WellnessEvents.subscribe(() => {
      setNotifications([...NotificationStore.getAll()]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return notifications;
}