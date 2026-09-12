import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import NotificationCard, {
  NotificationIcon,
} from "./NotificationCard";
import NotificationEmptyState from "./NotificationEmptyState";

import type { WellnessNotification } from "../types/Notification";

interface Props {
  open: boolean;
  notifications: WellnessNotification[];
  onClose: () => void;
  onRead: (id: string) => void;
  onClear: () => void;
}

export default function NotificationPanel({
  open,
  notifications,
  onClose,
  onRead,
  onClear,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      setExpanded(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const visibleStack = notifications.slice(0, 3);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="
            absolute
            inset-0
            bg-black/20
            backdrop-blur-[2px]
          "
          onClick={onClose}
        />

        <AnimatePresence mode="wait">

          {/* =====================================================
              COMPACT STACK
              ===================================================== */}
          {!expanded && (
            <motion.div
              key="notification-stack"
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 12,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 8,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 28,
              }}
              className="
                absolute

                /* Mobile */
                bottom-5
                left-3
                right-3
                mx-auto
                w-auto

                /* Tablet */
                sm:left-1/2
                sm:right-auto
                sm:bottom-auto
                sm:top-24
                sm:w-[min(90vw,400px)]
                sm:-translate-x-1/2

                /* Desktop */
                lg:left-auto
                lg:right-6
                lg:top-24
                lg:w-[380px]
                lg:translate-x-0
              "
            >
              <button
                type="button"
                aria-label="Expand notifications"
                onClick={() => setExpanded(true)}
                className="
                  block
                  w-full
                  text-left
                  outline-none
                "
              >
                <div
                  className="
                    relative
                    h-[150px]
                    sm:h-[155px]
                  "
                >

                  {visibleStack.length > 0 ? (
                    visibleStack
                      .slice()
                      .reverse()
                      .map((notification, reversedIndex) => {
                        const index =
                          visibleStack.length -
                          1 -
                          reversedIndex;

                        return (
                          <motion.div
                            key={notification.id}
                            initial={false}
                            animate={{
                              y: index * 10,
                              scale: 1 - index * 0.035,
                              opacity: 1 - index * 0.12,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                            className="
                              absolute
                              inset-x-0
                              top-0
                            "
                            style={{
                              zIndex:
                                visibleStack.length -
                                index,
                            }}
                          >
                            <div
                              className="
                                overflow-hidden
                                rounded-2xl
                                border
                                border-border/50
                                bg-background/95
                                p-4
                                shadow-[0_18px_50px_rgba(0,0,0,0.14)]
                                backdrop-blur-2xl
                              "
                            >
                              <div className="flex items-center gap-3">

                                <div
                                  className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-primary/10
                                    text-primary
                                  "
                                >
                                  <NotificationIcon
                                    type={notification.type}
                                    size={18}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold">
                                    {notification.title}
                                  </p>

                                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {notification.description}
                                  </p>
                                </div>

                                {!notification.read && (
                                  <span
                                    className="
                                      h-2.5
                                      w-2.5
                                      shrink-0
                                      rounded-full
                                      bg-blue-500
                                    "
                                  />
                                )}

                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                  ) : (
                    <div
                      className="
                        rounded-2xl
                        border
                        border-border/50
                        bg-background/95
                        p-5
                        shadow-[0_18px_50px_rgba(0,0,0,0.14)]
                        backdrop-blur-2xl
                      "
                    >
                      <div className="text-sm font-semibold">
                        You're all caught up
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        New wellness notifications will appear here.
                      </div>
                    </div>
                  )}

                </div>

                {notifications.length > 3 && (
                  <div className="mt-3 text-center text-xs font-medium text-muted-foreground">
                    +{notifications.length - 3} more notifications
                  </div>
                )}
              </button>
            </motion.div>
          )}

          {/* =====================================================
              EXPANDED PANEL
              ===================================================== */}
          {expanded && (
            <motion.section
              key="notification-expanded"
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 12,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
                y: 8,
              }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 30,
              }}
              className="
                absolute

                /* =========================
                   MOBILE
                   ========================= */
                bottom-3
                left-3
                right-3
                max-h-[calc(100dvh-24px)]
                w-auto

                rounded-[26px]

                /* =========================
                   SMALL TABLET
                   ========================= */
                sm:left-1/2
                sm:right-auto
                sm:bottom-auto
                sm:top-16
                sm:w-[min(92vw,460px)]
                sm:-translate-x-1/2
                sm:max-h-[calc(100dvh-96px)]

                /* =========================
                   DESKTOP
                   ========================= */
                lg:left-auto
                lg:right-6
                lg:top-20
                lg:w-[min(420px,calc(100vw-48px))]
                lg:translate-x-0
                lg:max-h-[calc(100dvh-104px)]

                /* =========================
                   COMMON
                   ========================= */
                flex
                flex-col
                overflow-hidden
                border
                border-border/50
                bg-background/95
                shadow-[0_24px_80px_rgba(0,0,0,0.18)]
                backdrop-blur-2xl
              "
            >

              {/* Header */}
              <div
                className="
                  flex
                  shrink-0
                  items-center
                  justify-between
                  gap-3
                  border-b
                  border-border/50
                  px-4
                  py-4
                  sm:px-5
                "
              >
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">
                    Notifications
                  </h2>

                  {notifications.length > 0 && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {notifications.length} notification
                      {notifications.length === 1
                        ? ""
                        : "s"}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">

                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={onClear}
                      className="
                        rounded-lg
                        px-2.5
                        py-1.5
                        text-xs
                        font-medium
                        text-primary
                        transition
                        hover:bg-primary/10
                        active:scale-95
                      "
                    >
                      Clear All
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close notifications"
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      text-muted-foreground
                      transition
                      hover:bg-muted
                      hover:text-foreground
                      active:scale-95
                    "
                  >
                    <X size={17} />
                  </button>

                </div>
              </div>

              {/* Notification list */}
              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  overscroll-contain
                  p-3
                  sm:p-4
                "
              >
                {notifications.length === 0 ? (
                  <NotificationEmptyState />
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onRead={onRead}
                      />
                    ))}
                  </div>
                )}
              </div>

            </motion.section>
          )}

        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}