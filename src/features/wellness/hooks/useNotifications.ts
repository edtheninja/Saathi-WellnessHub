import { useEffect, useState } from "react";
import NotificationStore from "../services/NotificationStore";
import WellnessEvents from "../services/WellnessEvents";

export function useNotifications() {

  const [notifications, setNotifications] =
    useState(
      NotificationStore.getAll()
    );

useEffect(() => {
    const unsubscribe = WellnessEvents.subscribe(() => {
      setNotifications([...NotificationStore.getAll()]);
    });
    return () => { unsubscribe(); };
  }, []);

  return notifications;
}