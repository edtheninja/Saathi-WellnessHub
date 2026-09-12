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

    if (distance === 0) return 1.22;
    if (distance === 1) return 1.1;
    if (distance === 2) return 1.04;

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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-2 pb-2 sm:px-4 sm:pb-4"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-3xl">
        <div className="rounded-[26px] border border-border/60 bg-card/90 p-1.5 shadow-[0_8px_35px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:rounded-[30px] sm:p-2">
          <div
            className="flex w-full items-end justify-between gap-0.5 sm:gap-1"
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
                    y: hoveredIndex === index ? -5 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 20,
                    mass: 0.7,
                  }}
                  className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-[20px] px-0.5 py-2 outline-none transition-colors sm:rounded-[23px] sm:px-2 sm:py-2.5 ${
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
                      className="absolute inset-0 rounded-[20px] bg-primary/10 sm:rounded-[23px]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                      }}
                    />
                  )}

                  {/* Icon container */}
                  <motion.div
                    animate={{
                      y: isActive ? -1 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 18,
                    }}
                    className={`relative z-10 mb-1 flex h-9 w-9 items-center justify-center rounded-[14px] transition-all duration-200 sm:h-10 sm:w-10 sm:rounded-[15px] ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "group-hover:bg-accent"
                    }`}
                  >
                    <IconComponent className="h-[18px] w-[18px] sm:h-[19px] sm:w-[19px]" />
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    animate={{
                      opacity: hoveredIndex === index || isActive ? 1 : 0.78,
                      y: hoveredIndex === index ? -1 : 0,
                    }}
                    className="relative z-10 whitespace-nowrap text-[9px] font-semibold tracking-tight sm:text-[11px]"
                  >
                    {item.label}
                  </motion.span>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-dot"
                      className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary sm:bottom-1"
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
      </div>
    </motion.div>
  );
};

export default BottomNav;