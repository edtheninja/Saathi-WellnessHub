import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/supabaseClient";

interface SubscriptionContextValue {
  isSubscribed: boolean;
  loading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("is_subscribed").single();
      setIsSubscribed(Boolean(data?.is_subscribed));
      setLoading(false);
    })();
  }, []);

  const subscribe = async () => {
    // DEMO: no real payment gateway yet — instantly marks the account as subscribed.
    // Swap this for a real Razorpay success callback later without touching any
    // component that reads `isSubscribed`.
    setIsSubscribed(true);
    await supabase
      .from("profiles")
      .update({ is_subscribed: true, subscribed_at: new Date().toISOString() })
      .eq("id", "");
  };

  const unsubscribe = async () => {
    setIsSubscribed(false);
    await supabase.from("profiles").update({ is_subscribed: false }).eq("id", "");
  };

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, loading, subscribe, unsubscribe }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}