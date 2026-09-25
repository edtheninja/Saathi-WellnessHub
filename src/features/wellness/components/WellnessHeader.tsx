import { useState } from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Share2 } from "lucide-react";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import ShareMomentModal from "@/components/ShareMomentModal";
import { useNotifications } from "../hooks/useNotifications";
import NotificationStore from "../services/NotificationStore";

export default function WellnessHeader() {
  const hour = new Date().getHours();
  const notifications = useNotifications();
  const [panelOpen, setPanelOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
        ? "Good Afternoon"
        : "Good Evening";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] border bg-card p-8 shadow-sm"
      >
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground">{greeting}</p>
              <h1 className="mt-2 text-5xl font-bold">Wellness Hub</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="relative rounded-xl border border-border p-3 transition duration-200 hover:bg-muted/60 active:scale-95 text-foreground"
                aria-label="Share your wellness journey"
                title="Share your wellness journey"
              >
                <Share2 size={20} />
              </button>

              <NotificationBell
                count={unread}
                onClick={() => setPanelOpen(true)}
              />
            </div>
          </div>

          <p className="mt-4 text-muted-foreground max-w-xl leading-7">
            Your complete mind and body companion.
          </p>
        </div>

        <HeartHandshake
          className="absolute right-8 bottom-8 w-20 h-20 text-primary/10 pointer-events-none"
        />
      </motion.div>

      <NotificationPanel
        open={panelOpen}
        notifications={notifications}
        onClose={() => setPanelOpen(false)}
        onRead={(id) => NotificationStore.markAsRead(id)}
        onClear={() => NotificationStore.clear()}
      />

      <ShareMomentModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
