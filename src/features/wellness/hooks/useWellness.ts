import { useEffect, useState } from "react";
import WellnessEngine from "../services/WellnessEngine";
import type { WellnessSnapshot } from "../services/WellnessEngine";

export function useWellness() {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] =
    useState<WellnessSnapshot | null>(null);

  useEffect(() => {

    async function load() {
      try {
        const snapshot = await WellnessEngine.load();
        setData(snapshot);
      } catch (err) {
        console.error("Failed to load wellness data:", err);
        setError("Failed to load wellness data");
      } finally {
        setLoading(false);
      }
    }

    load();

  }, []);

  return {
    loading,
    error,
    data,
  };
}