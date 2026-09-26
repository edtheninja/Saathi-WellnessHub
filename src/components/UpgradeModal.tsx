import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  featureName: string;
}

export default function UpgradeModal({ open, onClose, featureName }: Props) {
  const { subscribe } = useSubscription();
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-[28px] w-full max-w-sm p-6 space-y-4 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-purple-900/40">
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-lg font-bold text-center text-purple-950">
          Upgrade to unlock {featureName}
        </h3>
        <p className="text-sm text-purple-900/60 text-center">
          {featureName} is a premium feature. Subscribe to Saathi Plus to unlock it, along with
          weekly reports, community creation, and 1:1 psychiatrist sessions.
        </p>

        <Button
          className="w-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
          onClick={async () => {
            await subscribe();
            onClose();
          }}
        >
          Subscribe Now
        </Button>
        <Button variant="outline" className="w-full rounded-full" onClick={onClose}>
          Maybe Later
        </Button>
      </div>
    </div>
  );
}