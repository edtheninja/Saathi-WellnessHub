// src/components/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import type { HSL } from "@/context/ThemeContext";
import ShareModal from "./ShareMomentModal";
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
import TileColorPicker from "./Tile/TileColorPicker";
import ModeSelectorV2 from "@/components/ModeSelectorV2";

/* small helper */
function hslToCss(hsl: HSL) {
  return `hsl(${hsl.h}deg ${hsl.s}% ${hsl.l}%)`;
}

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
      id: "breathing",
      title: "Breathing Exercises",
      description: "Calm your mind with breathwork",
      icon: Wind,
      route: "/breathing",
      gradient: "from-teal-400 to-emerald-500",
    },
    {
      id: "mood",
      title: "Mood Tracker",
      description: "Track your emotional journey",
      icon: Calendar,
      route: "/mood",
      gradient: "from-indigo-400 to-indigo-600",
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
    { title: "AI Companion", icon: MessageCircle, route: "/chat" },
    { title: "Profile", icon: User, route: "/profile" },
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

              <motion.section variants={cardAnim} initial="initial" animate="animate" transition={{ delay: 0.05 }}>
          <div className="glass rounded-3xl border border-white/8 shadow-elevated p-6">
            <h3 className="font-semibold text-lg text-foreground text-center mb-4">How are you feeling today?</h3>
            <div className="flex justify-center gap-6">
              {["😄", "🙂", "😐", "😟", "😣"].map((m, idx) => (
                <button
                  key={idx}
                  className="text-3xl rounded-full w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={() => navigate("/mood")}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

      <main className="mx-auto max-w-6xl px-6 mt-8 space-y-8">
        {/* Feature grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
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
                  className="rounded-2xl bg-card p-5 border text-left"
                >
                  <div className="flex gap-4 items-center">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${f.gradient}`}
                      style={custom ? { backgroundColor: hslToCss(custom) } : undefined}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Button
                  key={a.title}
                  variant="outline"
                  className="h-14"
                  onClick={() => navigate(a.route)}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {a.title}
                </Button>
              );
            })}

            <Button onClick={() => setOpenShare(true)}>📤 Share Moment</Button>
          </div>
        </section>

        {/* Custom tiles */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <Tile id="mood" title="Mood" description="Quick mood check" />
            <TileColorPicker id="mood" />
          </div>
          <div>
            <Tile id="journal" title="Journal" description="Write thoughts" />
            <TileColorPicker id="journal" />
          </div>
          <div>
            <Tile id="relax" title="Relax" description="Play music" />
            <TileColorPicker id="relax" />
          </div>
        </section>
      </main>

      {/* Share modal */}
      <ShareModal
        open={openShare}
        onClose={() => setOpenShare(false)}
        stats={stats}
      />
    </div>
  );
}