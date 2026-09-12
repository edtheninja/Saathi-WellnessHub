import { useState } from "react";
import { motion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import { useNotifications } from "../hooks/useNotifications";
import NotificationStore from "../services/NotificationStore";

export default function WellnessHeader() {
  const hour = new Date().getHours();
  const notifications = useNotifications();
  const [panelOpen, setPanelOpen] = useState(false);

  const unread = notifications.filter(n => !n.read).length;

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

          <p className="text-muted-foreground">
            {greeting}
          </p>

          <h1 className="mt-2 text-5xl font-bold">
            Wellness Hub
          </h1>

          <NotificationBell
            count={unread}
            onClick={() => setPanelOpen(true)}
          />

          <p className="mt-4 text-muted-foreground max-w-xl leading-7">
            Your complete mind and body companion.
          </p>

        </div>

        <HeartHandshake
          className="absolute right-8 bottom-8 w-20 h-20 text-primary/10"
        />
      </motion.div>

      <NotificationPanel
        open={panelOpen}
        notifications={notifications}
        onClose={() => setPanelOpen(false)}
        onRead={(id) => NotificationStore.markAsRead(id)}
        onClear={() => NotificationStore.clear()}
      />
    </>
  );
}
