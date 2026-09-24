import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Crown, Users, Stethoscope, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/context/SubscriptionContext";

export default function SubscriptionCard() {
  const [expanded, setExpanded] = useState(false);
  const { isSubscribed, subscribe } = useSubscription();

  const perks = [
    { icon: FileText, label: "Weekly Report Generation" },
    { icon: Users, label: "Create Your Own Community" },
    { icon: Stethoscope, label: "1:1 Psychiatrist Meetings" },
  ];

  return (
    <div className="rounded-[28px] border border-white/50 bg-gradient-to-r from-purple-100/80 to-fuchsia-100/80 backdrop-blur-xl overflow-hidden shadow-[0_10px_30px_rgba(120,80,180,0.10)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-md">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-purple-950">Saathi Plus</h3>
            <p className="text-sm text-purple-900/60">
              {isSubscribed ? "You're subscribed — enjoy the full experience" : "Unlock the full wellness experience"}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-purple-900/50 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-3">

              {!isSubscribed && (
                <div className="flex items-end justify-center gap-1 py-2">
                  <span className="text-4xl font-extrabold text-purple-950">₹99</span>
                  <span className="mb-1 text-sm font-medium text-purple-900/50">/ month</span>
                </div>
              )}

              {perks.map((perk) => (
                <div key={perk.label} className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                  <perk.icon className="w-5 h-5 text-fuchsia-500" />
                  <span className="text-sm text-purple-950 flex-1">{perk.label}</span>
                  {isSubscribed && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
              ))}

              {!isSubscribed && (
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 mt-2"
                  onClick={subscribe}
                >
                  Subscribe Now — ₹99/month
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}