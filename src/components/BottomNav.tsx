import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Music,
  MessageCircle,
  User,
  HeartPulse,
  Newspaper,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/dashboard",
    },
    {
      icon: Calendar,
      label: "Mood",
      path: "/mood",
    },
    {
      icon: Music,
      label: "Music",
      path: "/music",
    },
    {
      icon: Newspaper,
      label: "Feed",
      path: "/feed",
    },
    {
      icon: MessageCircle,
      label: "Chat",
      path: "/chat",
    },
    {
      icon: HeartPulse,
      label: "Wellness",
      path: "/wellness",
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
    },
  ];

  const isHiddenRoute =
    location.pathname === "/" ||
    location.pathname === "/onboarding" ||
    location.pathname === "/auth";

  if (isHiddenRoute) {
    return null;
  }

  const getDockScale = (index: number) => {
    if (hoveredIndex === null) {
      return 1;
    }

    const distance = Math.abs(index - hoveredIndex);

    if (distance === 0) return 1.45;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.08;

    return 1;
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 25,
      }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="mx-auto w-full max-w-5xl border-t border-border/50 bg-card/95 px-1 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:px-4 sm:py-3">
        <div
          className="flex w-full items-end justify-center gap-1 sm:gap-2"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {navItems.map((item, index) => {
            const IconComponent = item.icon;

            const isActive =
              location.pathname === item.path ||
              (item.path === "/community" &&
                location.pathname.startsWith("/community"));

            const scale = getDockScale(index);

            return (
              <motion.button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredIndex(index)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                animate={{
                  scale,
                  y: hoveredIndex === index ? -8 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 18,
                  mass: 0.7,
                }}
                className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2 outline-none sm:max-w-[125px] sm:px-3 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 28,
                    }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  animate={{
                    y: isActive ? -2 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 18,
                  }}
                  className={`relative z-10 mb-1 flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "group-hover:bg-accent"
                  }`}
                >
                  <IconComponent className="h-[19px] w-[19px]" />
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{
                    opacity: hoveredIndex === index || isActive ? 1 : 0.8,
                    y: hoveredIndex === index ? -1 : 0,
                  }}
                  className="relative z-10 whitespace-nowrap text-[10px] font-semibold tracking-tight sm:text-xs"
                >
                  {item.label}
                </motion.span>

                {/* Active dot */}
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-dot"
                    className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 28,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default BottomNav;