import { useEffect, useState } from "react";
import WellnessEngine from "../services/WellnessEngine";
import type { WellnessSnapshot } from "../services/WellnessEngine";

export function useWellness() {

  const [loading, setLoading] = useState(true);

  const [data, setData] =
    useState<WellnessSnapshot | null>(null);

  useEffect(() => {

    async function load() {

      const snapshot =
        await WellnessEngine.load();

      setData(snapshot);

      setLoading(false);
    }

    load();

  }, []);

  return {
    loading,
    data,
  };
}