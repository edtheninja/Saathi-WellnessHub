// src/components/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import type { HSL } from "@/context/ThemeContext";
import ShareModal from "./ShareMomentModal";
import { ArrowRight, Share2 } from "lucide-react";
import { Users } from "lucide-react";
import { motion } from "motion/react";
import {
  Brain,
  Wind,
  PenTool,
  Music,
  MessageCircle,
  Calendar,
  User,
  Target,
} from "lucide-react";
import Tile from "./Tile/Tile";
import ModeSelectorV2 from "@/components/ModeSelectorV2";
import { HeartPulse } from "lucide-react";
import { isDemoMode } from "@/features/wellness/services/DemoMode";
/* small helper */
function hslToCss(hsl: HSL) {
  return `hsl(${hsl.h}deg ${hsl.s}% ${hsl.l}%)`;
}

const emojiContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const emojiItem = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 22,
    },
  },
};

export default function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const { getTileColor } = useTheme();

  /* ---------------- FIXED: hooks declared ONCE & inside component ---------------- */

  const [openShare, setOpenShare] = useState(false);
  const [stats] = useState({
    moodAverage: 4,
    happiestDay: "Thursday",
    streak: 5,
  });

  const [showModePopup, setShowModePopup] = useState<boolean>(() => {
    try {
      return !localStorage.getItem("saathi_mode_chosen");
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "saathi_mode_chosen" && e.newValue) {
        setShowModePopup(false);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getUserName = () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return "Friend";

    try {
      const parsed = JSON.parse(storedUser);

      // Priority: name → full_name → email
      const name =
        parsed?.user?.user_metadata?.name ||
        parsed?.user?.user_metadata?.full_name ||
        parsed?.user?.email?.split("@")[0];

      return name;
    } catch {
      return "";
    }
  };


  const features = [
    {
      id: "meditation",
      title: "Guided Meditation",
      description: "Find peace with guided sessions",
      icon: Brain,
      route: "/meditation",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      id: "Mindful Chanting",
      title: "Mindful Chanting",
      description: "Prayer • Mantras • Affirmations",
      icon: Wind,
      route: "/naam-jaap",
      gradient: "from-teal-400 to-emerald-500",
    },

    {
      id: "journal",
      title: "Journaling",
      description: "Express your thoughts freely",
      icon: PenTool,
      route: "/journal",
      gradient: "from-purple-400 to-fuchsia-500",
    },
    {
      id: "wellness",
      title: "Wellness Hub",
      description: "Mind + Body in one place",
      icon: HeartPulse,
      route: "/wellness",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "music",
      title: "Relaxing Music",
      description: "Soothing sounds for relaxation",
      icon: Music,
      route: "/music",
      gradient: "from-pink-400 to-rose-500",
    },
    {
      id: "goal",
      title: "Your Goal",
      description: "View or update your goal",
      icon: Target,
      route: "/set-goal",
      gradient: "from-purple-400 to-purple-600",
    },
  ] as const;

  const quickActions = [
    { title: "AI Companion", icon: MessageCircle, route: "/chat", gradient: "from-violet-400 to-purple-600" },
    {
      title: "Community",
      icon: Users,
      route: "/community",
      gradient: "from-indigo-500 to-violet-600",
    },
  ];

  const tileVariants = {
    hidden: { opacity: 0, y: 10 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06 },
    }),
  };

  const cardAnim = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pb-24 bg-background text-foreground">
      {/* Mode selector */}
      {showModePopup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-xl">
            <ModeSelectorV2 />
          </div>
        </div>
      )}

      {/* Header */}
      <motion.header initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="mx-auto max-w-6xl px-6 py-8 rounded-b-3xl bg-card border">
          <h1 className="text-4xl font-extrabold text-center">
            {getGreeting()}, {getUserName()} 🌤️
          </h1>
        </div>
      </motion.header>

      {isDemoMode() && (
        <div className="mx-auto mt-4 max-w-6xl px-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            Demo Mode is active. Wellness data is seeded for presentation.
          </div>
        </div>
      )}

      <motion.section variants={cardAnim} initial="initial" animate="animate" transition={{ delay: 0.05 }}>
        <div className="glass rounded-3xl border border-white/8 shadow-elevated p-6">
          <h3 className="font-semibold text-lg text-foreground text-center mb-4">How are you feeling today?</h3>
          <motion.div
            variants={emojiContainer}
            initial="initial"
            animate="animate"
            className="flex justify-center gap-6"
          >
            {["😄", "🙂", "😐", "😟", "😣"].map((m, idx) => (
              <motion.button
                key={idx}
                variants={emojiItem}
                whileHover={{
                  scale: 1.18,
                  rotate: [-3, 3, 0],
                  transition: {
                    type: "spring",
                    stiffness: 450,
                    damping: 12,
                  },
                }}
                whileTap={{
                  scale: 0.88,
                }}
                className="text-3xl rounded-full w-14 h-14 flex items-center justify-center"
                onClick={() => navigate("/mood")}
              >
                <motion.span
                  animate={{
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: idx * 0.3,
                  }}
                >
                  {m}
                </motion.span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.section >

      <main className="mx-auto max-w-6xl px-6 mt-8 space-y-8 pb-32">
        {/* Feature grid */}
        <section>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              const custom = getTileColor(f.id);

              return (
                <motion.button
                  key={f.id}
                  onClick={() => navigate(f.route)}
                  custom={i}
                  initial="hidden"
                  animate="show"
                  variants={tileVariants}
                  className="
                     group
                     relative
                     overflow-hidden
                     rounded-[34px]
                     border
                     border-white/10
                     bg-card/90
                     backdrop-blur-xl
                     p-8
                     min-h-[300                  px]
                     flex
                     flex-col
                     transition-all
                     duration-500
                     ease-out
                     hover:-translate-y-3
                     hover:scale-[1.02]
                     hover:border-white/20
                     shadow-[0_10px_35px_rgba(0,0,0,0.08)]
                     hover:shadow-[0_25px_60px_rgba(0,0,0,0.16)]
                   "
                >
                  {/* Ambient Glow */}
                  <div
                    className="
                      absolute
                      -top-10
                      left-1/2
                      -translate-x-1/2
                      w-44
                      h-44
                      rounded-full
                      blur-3xl
                      opacity-15
                      transition-all
                      duration-500
                      group-hover:opacity-30
                      group-hover:scale-110
                    "
                    style={{
                      background: custom
                        ? hslToCss(custom)
                        : "rgba(255,255,255,0.15)",
                    }}
                  />

                  {/* Icon */}
                  {/* Icon */}
                  <div className="relative flex justify-center mt-2">

                    {/* Ambient Glow */}
                    <div
                      className="
                        absolute
                        w-36
                        h-36
                        rounded-full
                        blur-3xl
                        opacity-30
                        transition-all
                        duration-500
                        group-hover:opacity-50
                        group-hover:scale-110
                      "
                      style={{
                        backgroundColor: custom ? hslToCss(custom) : undefined,
                      }}
                    />

                    {/* Icon Container */}
                    <div
                      className={`
                        relative
                        z-10
                        w-24
                        h-24
                        rounded-[30px]
                        flex
                        items-center
                        justify-center
                        bg-gradient-to-br
                        ${f.gradient}
                        shadow-xl
                        transition-all
                        duration-500
                        group-hover:-translate-y-2
                        group-hover:scale-110
                        group-hover:rotate-2
                      `}
                      style={custom ? { backgroundColor: hslToCss(custom) } : undefined}
                    >
                      <Icon
                        className="
                            w-12
                            h-12
                            text-white
                            drop-shadow-xl
                            transition-all
                            duration-500
                            group-hover:scale-110
                          "
                        strokeWidth={2.2}
                      />
                    </div>

                  </div>
                  {/* Title */}
                  <div className="mt-12">
                    <h3 className="text-2xl font-bold tracking-tight ">
                      {f.title}
                    </h3>

                    <p className="mt-3 text-sm text-muted-foreground leading-7">
                      {f.description}
                    </p>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Arrow */}
                  <div className="flex justify-end">

                    <div
                      className="
                        w-12
                        h-12
                        rounded-full
                        flex
                        items-center
                        justify-center
                        bg-white/5
                        border
                        border-white/10
                        transition-all
                        duration-300
                        group-hover:bg-white/10
                        group-hover:border-white/30
                        group-hover:translate-x-2
                        group-hover:scale-110
                      "
                    >
                      <ArrowRight
                        className="
                          w-6
                          h-6
                          transition-all
                          duration-300
                          group-hover:w-7
                          group-hover:h-7
                        "
                      />
                    </div>

                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="space-y-5">

            {quickActions.map((a) => {
              const Icon = a.icon;

              return (
                <motion.button
                  key={a.title}
                  onClick={() => navigate(a.route)}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.25 }}
                  className="
                    group
                    w-full
                    rounded-[28px]
                    border
                    border-white/10
                    bg-card/90
                    backdrop-blur-xl
                    px-6
                    py-5
                    flex
                    items-center
                    justify-between
                    transition-all
                    duration-300
                    hover:border-white/20
                    hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)]
                  "
                >
                  {/* Left Section */}
                  <div className="flex items-center gap-5">

                    {/* Icon */}
                    <div
                      className={`
                        relative
                        w-16
                        h-16
                        rounded-[22px]
                        flex
                        items-center
                        justify-center
                        bg-gradient-to-br
                        ${a.gradient ?? "from-blue-500 to-cyan-500"}
                        transition-all
                        duration-300
                        group-hover:scale-110
                        group-hover:-translate-y-1
                        shadow-lg
                      `}
                    >
                      <Icon
                        className="w-8 h-8 text-white"
                        strokeWidth={2.3}
                      />
                    </div>

                    {/* Text */}
                    <div className="text-left">
                      <h4 className="text-lg font-semibold tracking-tight">
                        {a.title}
                      </h4>

                      <p className="text-sm text-muted-foreground">
                        Tap to continue
                      </p>
                    </div>

                  </div>

                  {/* Arrow */}
                  <div
                    className="
                      w-12
                      h-12
                      rounded-full
                      flex
                      items-center
                      justify-center
                      border
                      border-white/10
                      bg-white/5
                      transition-all
                      duration-300
                      group-hover:translate-x-2
                      group-hover:scale-110
                      group-hover:border-white/30
                      group-hover:bg-white/10
                    "
                  >
                    <ArrowRight
                      className="
                        w-6
                        h-6
                        transition-all
                        duration-300
                        group-hover:w-7
                        group-hover:h-7
                      "
                    />
                  </div>

                </motion.button>
              );
            })}

            {/* Share Moment */}
            <motion.button
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpenShare(true)}
              className="
                 group
                 w-full
                 rounded-[28px]
                 border
                 border-white/10
                 bg-card/90
                 backdrop-blur-xl
                 px-6
                 py-5
                 flex
                 items-center
                 justify-between
                 transition-all
                 duration-300
                 hover:border-white/20
                 hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)]
               "
            >

              <div className="flex items-center gap-5">

                <div
                  className="
                    w-16
                    h-16
                    rounded-[22px]
                    bg-gradient-to-br
                    from-pink-500
                    to-rose-500
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-300
                    group-hover:scale-110
                    group-hover:-translate-y-1
                  "
                >
                  <Share2 className="w-8 h-8 text-white" />
                </div>

                <div className="text-left">
                  <h4 className="text-lg font-semibold">
                    Share Moment
                  </h4>

                  <p className="text-sm text-muted-foreground">
                    Inspire your friends
                  </p>
                </div>

              </div>

              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  group-hover:translate-x-2
                  group-hover:scale-110
                "
              >
                <ArrowRight className="w-6 h-6" />
              </div>

            </motion.button>

          </div>
        </section>
      </main>

      {/* Share modal */}
      <ShareModal
        open={openShare}
        onClose={() => setOpenShare(false)}
        stats={stats}
      />
    </div >
  );
}