import { useEffect, useState } from "react";

import type { Activity } from "../types/Activity";
import WellnessHistoryService from "../services/WellnessHistoryService";

export function useActivityFeed() {

  const [activities, setActivities] =
    useState<Activity[]>(
      WellnessHistoryService.getActivities()
    );

  useEffect(() => {

    const interval = setInterval(() => {

      setActivities(
        WellnessHistoryService.getActivities()
      );

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  return activities;

}