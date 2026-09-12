import React, { useMemo, useEffect, useState } from "react";
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
    {
      title: "AI Companion",
      icon: MessageCircle,
      route: "/chat",
      gradient: "from-violet-400 to-purple-600",
    },
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

  const [moodValue, setMoodValue] = useState(73);

  const moodCheckpoints = [
    { value: 0, emoji: "😞", label: "Very Low" },
    { value: 11, emoji: "😔", label: "Low" },
    { value: 22, emoji: "😟", label: "Worried" },
    { value: 33, emoji: "😕", label: "Uneasy" },
    { value: 44, emoji: "😐", label: "Slightly Low" },
    { value: 55, emoji: "😌", label: "Neutral" },
    { value: 66, emoji: "🙂", label: "Okay" },
    { value: 77, emoji: "😊", label: "Good" },
    { value: 88, emoji: "😄", label: "Very Good" },
    { value: 100, emoji: "🤩", label: "Excellent" },
  ];

  const currentMood = useMemo(() => {
    let closest = moodCheckpoints[0];

    for (const checkpoint of moodCheckpoints) {
      if (
        Math.abs(checkpoint.value - moodValue) <
        Math.abs(closest.value - moodValue)
      ) {
        closest = checkpoint;
      }
    }

    return closest;
  }, [moodValue]);

  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 bg-background text-foreground">
      {/* Decorative wellness doodles */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft pastel background washes */}
        <div className="absolute -left-40 top-16 h-96 w-96 rounded-full bg-violet-300/10 blur-3xl" />
        <div className="absolute -right-40 top-[30%] h-[30rem] w-[30rem] rounded-full bg-pink-300/10 blur-3xl" />
        <div className="absolute left-[28%] bottom-0 h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />

        {/* Top-left fine botanical line art */}
        <motion.svg
          viewBox="0 0 240 300"
          className="absolute -left-10 top-8 h-64 w-52 text-violet-400/35 sm:left-0 sm:h-72 sm:w-60"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          <path
            d="M22 300 C34 224 72 151 151 77"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M58 211 C23 201 8 171 19 137 C52 146 70 175 58 211Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <path
            d="M91 157 C75 119 91 82 125 67 C143 103 128 140 91 157Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <path
            d="M126 116 C145 79 180 65 211 82 C195 116 160 133 126 116Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <path
            d="M39 255 C73 244 104 258 119 290"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <circle cx="165" cy="37" r="4" fill="currentColor" />

          <path
            d="M184 30 Q201 12 218 30 Q201 48 184 30Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </motion.svg>

        {/* Top-center lotus flower */}
        <motion.svg
          viewBox="0 0 300 190"
          className="absolute left-1/2 top-0 h-36 w-56 -translate-x-1/2 text-fuchsia-400/20 sm:h-44 sm:w-72"
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.1 }}
        >
          <path
            d="M150 154 C105 139 81 103 91 55 C124 67 146 99 150 154Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
          />

          <path
            d="M150 154 C195 139 219 103 209 55 C176 67 154 99 150 154Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
          />

          <path
            d="M150 154 C111 111 119 55 150 18 C181 55 189 111 150 154Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
          />

          <path
            d="M150 154 C73 151 40 122 31 91 C80 88 125 111 150 154Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M150 154 C227 151 260 122 269 91 C220 88 175 111 150 154Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M80 166 Q150 180 220 166"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M52 174 Q150 194 248 174"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* Top-right handwritten-style wellness note */}
        <motion.svg
          viewBox="0 0 250 230"
          className="absolute -right-5 top-0 h-48 w-52 text-violet-400/45 sm:right-2 sm:h-56 sm:w-60"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2 }}
        >
          <text
            x="35"
            y="58"
            fill="currentColor"
            fontSize="25"
            fontFamily="cursive"
            fontStyle="italic"
          >
            Your
          </text>

          <text
            x="48"
            y="91"
            fill="currentColor"
            fontSize="25"
            fontFamily="cursive"
            fontStyle="italic"
          >
            Wellness
          </text>

          <text
            x="38"
            y="124"
            fill="currentColor"
            fontSize="25"
            fontFamily="cursive"
            fontStyle="italic"
          >
            Matters
          </text>

          <path
            d="M128 153 C118 139 94 145 99 162 C104 177 128 188 128 188 C128 188 152 177 157 162 C162 145 138 139 128 153Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </motion.svg>

        {/* Right-side mint botanical branch */}
        <motion.svg
          viewBox="0 0 230 390"
          className="absolute -right-14 top-[36%] h-80 w-52 text-emerald-400/25 sm:right-0 sm:h-[26rem] sm:w-60"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.3, delay: 0.25 }}
        >
          <path
            d="M181 390 C160 293 126 211 67 137"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M145 279 C181 268 202 239 193 207 C161 213 140 242 145 279Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <path
            d="M119 223 C83 218 58 192 60 158 C94 164 121 189 119 223Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <path
            d="M91 182 C121 150 121 114 98 88 C71 115 70 151 91 182Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <path
            d="M65 151 C36 139 22 112 30 84 C57 94 73 121 65 151Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <circle cx="45" cy="48" r="4" fill="currentColor" />
          <circle cx="83" cy="27" r="3" fill="currentColor" />
        </motion.svg>

        {/* Bottom-left lotus, waves and leaves */}
        <motion.svg
          viewBox="0 0 420 240"
          className="absolute -bottom-8 -left-12 h-48 w-[22rem] text-sky-400/25 sm:left-0 sm:h-56 sm:w-[26rem]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <path
            d="M104 206 C94 162 101 117 133 82 C164 117 171 162 160 206Z"
            fill="currentColor"
            opacity="0.35"
          />

          <path
            d="M104 206 C67 181 49 148 60 119 C92 130 111 165 104 206Z"
            fill="currentColor"
            opacity="0.25"
          />

          <path
            d="M160 206 C197 181 215 148 204 119 C172 130 153 165 160 206Z"
            fill="currentColor"
            opacity="0.25"
          />

          <path
            d="M42 222 Q112 242 182 222"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M-8 184 C55 145 111 145 174 184 S300 223 363 184 S420 145 448 164"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M-12 211 C51 172 107 172 170 211 S296 250 359 211 S416 172 444 191"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <path
            d="M268 60 Q286 42 304 60 Q286 78 268 60Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M328 38 L333 51 L346 56 L333 61 L328 74 L323 61 L310 56 L323 51Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </motion.svg>

        {/* Small floating heart and sparkle */}
        <motion.svg
          viewBox="0 0 180 180"
          className="absolute bottom-24 right-[7%] h-20 w-20 text-pink-400/35 sm:h-24 sm:w-24"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <path
            d="M90 135 C77 120 43 99 43 72 C43 47 75 42 90 66 C105 42 137 47 137 72 C137 99 103 120 90 135Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          <path
            d="M20 35 L24 46 L35 50 L24 54 L20 65 L16 54 L5 50 L16 46Z"
            fill="currentColor"
            opacity="0.7"
          />

          <circle cx="145" cy="25" r="4" fill="currentColor" />
        </motion.svg>

        {/* Mid-left leaf sprig, near the feature grid */}
        <motion.svg
          viewBox="0 0 160 220"
          className="absolute left-2 top-[48%] h-40 w-28 text-blue-400/25 sm:left-4 sm:h-48 sm:w-32"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.35 }}
        >
          <path
            d="M20 210 C28 160 46 118 88 78"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          <path
            d="M46 168 C22 160 12 138 20 114 C43 121 55 143 46 168Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          <path
            d="M68 128 C56 100 68 74 92 63 C104 90 92 116 68 128Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          <circle cx="94" cy="52" r="3" fill="currentColor" />
        </motion.svg>

        {/* Mid-right flower sprig, near the feature grid */}
        <motion.svg
          viewBox="0 0 170 190"
          className="absolute -right-4 top-[52%] h-36 w-28 text-purple-400/25 sm:right-0 sm:h-44 sm:w-32"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <path
            d="M150 180 C136 132 112 95 68 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          <path
            d="M108 140 C132 132 146 110 140 86 C112 92 96 116 108 140Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          <path
            d="M78 96 C90 68 78 42 54 31 C42 58 54 84 78 96Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          <path
            d="M40 26 Q56 10 72 26 Q56 42 40 26Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </motion.svg>

        {/* Handwritten note near the community section */}
        <motion.svg
          viewBox="0 0 220 140"
          className="absolute left-[6%] top-[74%] h-28 w-40 text-violet-400/40 sm:h-32 sm:w-44"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45 }}
        >
          <text
            x="18"
            y="45"
            fill="currentColor"
            fontSize="24"
            fontFamily="cursive"
            fontStyle="italic"
          >
            You are
          </text>

          <text
            x="10"
            y="78"
            fill="currentColor"
            fontSize="24"
            fontFamily="cursive"
            fontStyle="italic"
          >
            not alone
          </text>

          <path
            d="M20 95 Q70 108 120 95"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M120 92 C112 82 96 86 99 98 C102 109 120 117 120 117 C120 117 138 109 141 98 C144 86 128 82 120 92Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </motion.svg>

        {/* Small lotus above the footer nav */}
        <motion.svg
          viewBox="0 0 200 130"
          className="absolute right-[10%] bottom-2 h-24 w-36 text-fuchsia-400/20 sm:h-28 sm:w-40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <path
            d="M100 106 C70 96 54 71 61 38 C84 46 99 68 100 106Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
          />

          <path
            d="M100 106 C130 96 146 71 139 38 C116 46 101 68 100 106Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
          />

          <path
            d="M100 106 C74 76 79 38 100 13 C121 38 126 76 100 106Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
          />

          <path
            d="M55 114 Q100 124 145 114"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </motion.svg>
      </div>

      {/* Mode selector */}
      {showModePopup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-xl">
            <ModeSelectorV2 />
          </div>
        </div>
      )}

      {/* Header */}
      <motion.header
        className="relative z-10"
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="mx-auto max-w-6xl px-6 py-8 rounded-b-3xl bg-card border">
          <h1 className="text-4xl font-extrabold text-center">
            {getGreeting()}, {getUserName()} 🌤️
          </h1>
        </div>
      </motion.header>

      {isDemoMode() && (
        <div className="relative z-10 mx-auto mt-4 max-w-6xl px-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
            Demo Mode is active. Wellness data is seeded for presentation.
          </div>
        </div>
      )}

      <motion.section
        className="relative z-10"
        variants={cardAnim}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.05 }}
      >
        <div className="glass rounded-3xl border border-white/8 shadow-elevated p-6 md:p-8">
          <h3 className="font-semibold text-lg md:text-xl text-foreground text-center">
            How are you feeling today?
          </h3>

          <p className="text-sm text-muted-foreground text-center mt-2">
            Slide to select your current mood
          </p>

          {/* Current mood */}
          <div className="flex flex-col items-center mt-6">
            <motion.div
              key={currentMood.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <span className="text-4xl">{currentMood.emoji}</span>

              <div>
                <p className="font-semibold text-lg">
                  {currentMood.label}
                </p>

                <p className="text-sm text-muted-foreground">
                  Mood score: {moodValue}/100
                </p>
              </div>
            </motion.div>
          </div>

          {/* Slider */}
          <div className="relative mt-10 px-2">
            {/* Gradient track */}
            <div
              className="absolute left-2 right-2 top-1/2 h-3 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #ef6b73 0%, #f39b62 25%, #f5d76e 50%, #a8cf70 75%, #45b982 100%)",
              }}
            />

            {/* Floating value bubble at thumb */}
            <div
              className="absolute top-1/2 flex flex-col items-center pointer-events-none transition-[left] duration-100 ease-out z-20"
              style={{
                left: `${moodValue}%`,
                transform: "translate(-50%, 18px)",
              }}
            >
              <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-b-[8px] border-l-transparent border-r-transparent border-b-primary" />

              <div className="mt-[-1px] rounded-full bg-primary text-primary-foreground text-sm font-bold px-3.5 py-1.5 shadow-md leading-none flex items-center gap-1.5">
                <span
                  className="text-base leading-none transition-transform duration-150 ease-out"
                  style={{
                    transform: isDragging ? "scale(1.6)" : "scale(1)",
                  }}
                >
                  {currentMood.emoji}
                </span>

                <span>{moodValue}</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={moodValue}
              onChange={(e) => setMoodValue(Number(e.target.value))}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              onBlur={() => setIsDragging(false)}
              className="relative z-10 w-full h-3 appearance-none bg-transparent cursor-pointer mood-slider"
              aria-label="Current mood"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={moodValue}
            />

            {/* Checkpoints */}
            <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {moodCheckpoints.map((checkpoint) => (
                <div
                  key={checkpoint.value}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${checkpoint.value}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="h-5 w-0.5 bg-foreground/30 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Save / continue */}
          <div className="flex justify-center mt-7">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                navigate("/mood", {
                  state: {
                    moodValue,
                  },
                })
              }
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              Continue with {moodValue}
            </motion.button>
          </div>
        </div>
      </motion.section>

      <main className="relative z-10 mx-auto max-w-6xl px-6 mt-8 space-y-8 pb-32">
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
                    min-h-[300px]
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
                        backgroundColor: custom
                          ? hslToCss(custom)
                          : undefined,
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
                      style={
                        custom
                          ? { backgroundColor: hslToCss(custom) }
                          : undefined
                      }
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
                    <h3 className="text-2xl font-bold tracking-tight">
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
    </div>
  );
}