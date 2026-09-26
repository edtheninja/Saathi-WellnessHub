// src/components/Dashboard.tsx

import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import type { HSL } from "@/context/ThemeContext";
import ShareModal from "./ShareMomentModal";
import { motion } from "motion/react";

import {
  ArrowRight,
  Share2,
  Users,
  Bell,
  Brain,
  Wind,
  PenTool,
  Music,
  MessageCircle,
  Target,
  Heart,
  Sparkles,
  HeartPulse,
  Activity,
  Zap,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import ModeSelectorV2 from "@/components/ModeSelectorV2";
import { isDemoMode } from "@/features/wellness/services/DemoMode";

/* ============================================================
   HELPERS
============================================================ */

function hslToCss(hsl: HSL) {
  return `hsl(${hsl.h}deg ${hsl.s}% ${hsl.l}%)`;
}

/* ============================================================
   TYPES
============================================================ */

type WellnessPrediction = {
  id?: string;
  predicted_energy_level: number;
  recommendation_title: string;
  recommendation_activity: string;
  recommendation_body: string;
  created_at?: string;
};

type WellnessNotification = {
  id?: string;
  notification_type?: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at?: string;
};

/* ============================================================
   ANIMATION
============================================================ */

const cardAnim = {
  initial: {
    opacity: 0,
    y: 10,
  },

  animate: {
    opacity: 1,
    y: 0,
  },
};

/* ============================================================
   DASHBOARD
============================================================ */

export default function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const { getTileColor } = useTheme();

  /* ==========================================================
     EXISTING STATE
  ========================================================== */

  const [openShare, setOpenShare] = useState(false);

  const [stats] = useState({
    moodAverage: 4,
    happiestDay: "Thursday",
    streak: 5,
  });

  const [showModePopup, setShowModePopup] =
    useState<boolean>(() => {
      try {
        return !localStorage.getItem(
          "saathi_mode_chosen",
        );
      } catch {
        return true;
      }
    });

  /* ==========================================================
     NEW WELLNESS PREDICTION STATE
  ========================================================== */

  const [prediction, setPrediction] =
    useState<WellnessPrediction | null>(null);

  const [notification, setNotification] =
    useState<WellnessNotification | null>(null);

  const [predictionLoading, setPredictionLoading] =
    useState(false);

  const [predictionError, setPredictionError] =
    useState<string | null>(null);

  const [showNotification, setShowNotification] =
    useState(false);

  /* ==========================================================
     API CONFIG
  ========================================================== */

  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:4000";

  /* ==========================================================
     AUTH TOKEN
  ========================================================== */

  const getAccessToken = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return (
          localStorage.getItem(
            "access_token",
          ) || null
        );
      }

      const parsed = JSON.parse(
        storedUser,
      );

      return (
        parsed?.session?.access_token ||
        parsed?.access_token ||
        localStorage.getItem(
          "access_token",
        ) ||
        null
      );
    } catch {
      return (
        localStorage.getItem(
          "access_token",
        ) || null
      );
    }
  };

  /* ==========================================================
     GENERATE WELLNESS PREDICTION
  ========================================================== */

  const generatePrediction =
    async () => {
      try {
        setPredictionLoading(true);
        setPredictionError(null);

        const token =
          getAccessToken();

        if (!token) {
          setPredictionError(
            "Please log in again.",
          );

          return;
        }

        const response =
          await fetch(
            `${API_BASE}/api/wellness-prediction/generate`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to generate wellness insight",
          );
        }

        setPrediction(
          data.prediction,
        );

        setNotification(
          data.notification,
        );

        setShowNotification(true);
      } catch (error) {
        console.error(
          "Prediction generation failed:",
          error,
        );

        setPredictionError(
          error instanceof Error
            ? error.message
            : "Something went wrong",
        );
      } finally {
        setPredictionLoading(
          false,
        );
      }
    };

  /* ==========================================================
     LOAD LATEST PREDICTION
  ========================================================== */

  useEffect(() => {
    const loadLatestPrediction =
      async () => {
        try {
          const token =
            getAccessToken();

          if (!token) {
            return;
          }

          const response =
            await fetch(
              `${API_BASE}/api/wellness-prediction/latest`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              },
            );

          if (!response.ok) {
            return;
          }

          const data =
            await response.json();

          if (data?.data) {
            setPrediction(
              data.data,
            );
          }
        } catch (error) {
          console.error(
            "Failed to load prediction:",
            error,
          );
        }
      };

    loadLatestPrediction();
  }, []);

  /* ==========================================================
     LOAD LATEST NOTIFICATION
  ========================================================== */

  useEffect(() => {
    const loadLatestNotification =
      async () => {
        try {
          const token =
            getAccessToken();

          if (!token) {
            return;
          }

          const response =
            await fetch(
              `${API_BASE}/api/notifications/latest`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              },
            );

          if (!response.ok) {
            return;
          }

          const data =
            await response.json();

          if (
            data?.data &&
            data.data.length > 0
          ) {
            setNotification(
              data.data[0],
            );
          }
        } catch (error) {
          console.error(
            "Failed to load notification:",
            error,
          );
        }
      };

    loadLatestNotification();
  }, []);

  /* ==========================================================
     MODE POPUP
  ========================================================== */

  useEffect(() => {
    const onStorage =
      (e: StorageEvent) => {
        if (
          e.key ===
            "saathi_mode_chosen" &&
          e.newValue
        ) {
          setShowModePopup(
            false,
          );
        }
      };

    window.addEventListener(
      "storage",
      onStorage,
    );

    return () =>
      window.removeEventListener(
        "storage",
        onStorage,
      );
  }, []);

  /* ==========================================================
     GREETING
  ========================================================== */

  const getGreeting = () => {
    const hour =
      new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 17) {
      return "Good Afternoon";
    }

    return "Good Evening";
  };

  /* ==========================================================
     USER NAME
  ========================================================== */

  const getUserName = () => {
    const storedUser =
      localStorage.getItem(
        "user",
      );

    if (!storedUser) {
      return "Friend";
    }

    try {
      const parsed =
        JSON.parse(
          storedUser,
        );

      const name =
        parsed?.user
          ?.user_metadata
          ?.name ||
        parsed?.user
          ?.user_metadata
          ?.full_name ||
        parsed?.user?.email?.split(
          "@",
        )[0];

      return name || "Friend";
    } catch {
      return "Friend";
    }
  };

  /* ==========================================================
     FEATURES
  ========================================================== */

  const features = [
    {
      id: "meditation",
      title: "Guided Meditation",
      description:
        "Find peace with guided sessions",
      icon: Brain,
      route: "/meditation",
      gradient:
        "from-blue-400 to-blue-600",
      accent:
        "bg-blue-100 text-blue-600",
      doodle: "blue",
    },

    {
      id: "Mindful Chanting",
      title: "Mindful Chanting",
      description:
        "Prayer • Mantras • Affirmations",
      icon: Wind,
      route: "/naam-jaap",
      gradient:
        "from-teal-400 to-emerald-500",
      accent:
        "bg-emerald-100 text-emerald-600",
      doodle: "green",
    },

    {
      id: "journal",
      title: "Journaling",
      description:
        "Express your thoughts freely",
      icon: PenTool,
      route: "/journal",
      gradient:
        "from-purple-400 to-fuchsia-500",
      accent:
        "bg-purple-100 text-purple-600",
      doodle: "purple",
    },

    {
      id: "wellness",
      title: "Wellness Hub",
      description:
        "Mind + Body in one place",
      icon: HeartPulse,
      route: "/wellness",
      gradient:
        "from-emerald-500 to-teal-500",
      accent:
        "bg-emerald-100 text-emerald-600",
      doodle: "green",
    },

    {
      id: "music",
      title: "Relaxing Music",
      description:
        "Soothing sounds for relaxation",
      icon: Music,
      route: "/music",
      gradient:
        "from-pink-400 to-rose-500",
      accent:
        "bg-pink-100 text-pink-600",
      doodle: "pink",
    },

    {
      id: "goal",
      title: "Your Goal",
      description:
        "View or update your goal",
      icon: Target,
      route: "/set-goal",
      gradient:
        "from-purple-400 to-purple-600",
      accent:
        "bg-violet-100 text-violet-600",
      doodle: "purple",
    },
  ] as const;

  /* ==========================================================
     QUICK ACTIONS
  ========================================================== */

  const quickActions = [
    {
      title: "AI Companion",
      icon: MessageCircle,
      route: "/chat",
      gradient:
        "from-violet-400 to-purple-600",
    },

    {
      title: "Community",
      icon: Users,
      route: "/community",
      gradient:
        "from-indigo-500 to-violet-600",
    },
  ];

  /* ==========================================================
     TILE ANIMATION
  ========================================================== */

  const tileVariants = {
    hidden: {
      opacity: 0,
      y: 18,
    },

    show: (i: number) => ({
      opacity: 1,
      y: 0,

      transition: {
        delay: i * 0.06,
        duration: 0.45,
        ease: "easeOut" as const,
      },
    }),
  };

  /* ==========================================================
     MOOD
  ========================================================== */

  const [moodValue, setMoodValue] =
    useState(50);

  const moodCheckpoints = [
    {
      value: 0,
      emoji: "😞",
      label: "Very Low",
    },

    {
      value: 11,
      emoji: "😔",
      label: "Low",
    },

    {
      value: 22,
      emoji: "😟",
      label: "Worried",
    },

    {
      value: 33,
      emoji: "😕",
      label: "Uneasy",
    },

    {
      value: 44,
      emoji: "😐",
      label: "Slightly Low",
    },

    {
      value: 55,
      emoji: "😌",
      label: "Neutral",
    },

    {
      value: 66,
      emoji: "🙂",
      label: "Okay",
    },

    {
      value: 77,
      emoji: "😊",
      label: "Good",
    },

    {
      value: 88,
      emoji: "😄",
      label: "Very Good",
    },

    {
      value: 100,
      emoji: "🤩",
      label: "Excellent",
    },
  ];

  const currentMood =
    useMemo(() => {
      let closest =
        moodCheckpoints[0];

      for (const checkpoint of moodCheckpoints) {
        if (
          Math.abs(
            checkpoint.value -
              moodValue,
          ) <
          Math.abs(
            closest.value -
              moodValue,
          )
        ) {
          closest =
            checkpoint;
        }
      }

      return closest;
    }, [moodValue]);

  const [isDragging, setIsDragging] =
    useState(false);

  /* ==========================================================
     PREDICTION VISUAL STATE
  ========================================================== */

  const getPredictionLevel = (
    score: number,
  ) => {
    if (score <= 30) {
      return {
        label:
          "Gentle reset recommended",
        icon: Wind,
      };
    }

    if (score <= 55) {
      return {
        label:
          "A little support could help",
        icon: Activity,
      };
    }

    if (score <= 75) {
      return {
        label:
          "Your pattern looks balanced",
        icon: HeartPulse,
      };
    }

    return {
      label:
        "Keep your positive routine going",
      icon: Sparkles,
    };
  };

  const predictionLevel =
    prediction
      ? getPredictionLevel(
          prediction.predicted_energy_level,
        )
      : null;

  /* ==========================================================
     START RECOMMENDED ACTIVITY
  ========================================================== */

  const startRecommendedActivity =
    () => {
      if (!prediction) {
        return;
      }

      const activity =
        prediction.recommendation_activity.toLowerCase();

      if (
        activity.includes(
          "movement",
        )
      ) {
        navigate("/wellness");
        return;
      }

      if (
        activity.includes(
          "mindful",
        )
      ) {
        navigate("/meditation");
        return;
      }

      if (
        activity.includes(
          "reset",
        )
      ) {
        navigate("/meditation");
        return;
      }

      navigate("/wellness");
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pb-28 text-foreground">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-violet-300/10 blur-3xl" />

        <div className="absolute -right-40 top-[35%] h-[460px] w-[460px] rounded-full bg-pink-300/10 blur-3xl" />

        <div className="absolute bottom-0 left-[25%] h-[360px] w-[360px] rounded-full bg-blue-300/10 blur-3xl" />

        {/* Top-left leaf */}
        <motion.svg
          viewBox="0 0 220 260"
          className="absolute -left-10 top-8 h-56 w-48 text-violet-400/30 sm:left-0 sm:h-64 sm:w-56"
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 1,
          }}
        >
          <path
            d="M28 258 C48 190 92 126 164 74"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M59 188 C28 174 15 145 25 116 C57 126 73 153 59 188Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <path
            d="M91 143 C77 110 91 76 122 61 C139 94 127 126 91 143Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <path
            d="M126 104 C147 73 180 65 204 83 C187 113 158 123 126 104Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <path
            d="M40 223 C73 216 102 232 111 259"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* Top-center lotus */}
        <motion.svg
          viewBox="0 0 260 180"
          className="absolute left-1/2 top-4 h-32 w-44 -translate-x-1/2 text-fuchsia-400/25 sm:h-40 sm:w-56"
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1.1,
            delay: 0.1,
          }}
        >
          <path
            d="M130 150 C91 132 75 102 83 70 C111 78 130 111 130 150Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M130 150 C169 132 185 102 177 70 C149 78 130 111 130 150Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M130 150 C102 119 101 72 130 30 C159 72 158 119 130 150Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M130 150 C74 147 43 119 40 87 C81 85 113 110 130 150Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M130 150 C186 147 217 119 220 87 C179 85 147 110 130 150Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M68 156 Q130 174 192 156"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* Top-right */}
        <motion.svg
          viewBox="0 0 220 210"
          className="absolute -right-5 top-3 h-48 w-48 text-purple-400/35 sm:right-4 sm:h-56 sm:w-56"
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 1.1,
            delay: 0.2,
          }}
        >
          <path
            d="M32 45 C56 25 74 27 94 43"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M42 66 C63 49 84 51 101 67"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M48 89 C71 74 88 76 106 89"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M126 38 C145 25 164 29 177 44 C163 59 144 61 126 38Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M145 86 C156 69 174 70 186 83 C176 98 159 101 145 86Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M118 130 C109 111 83 116 83 135 C83 151 102 160 118 173 C134 160 153 151 153 135 C153 116 127 111 118 130Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </motion.svg>

        {/* Right branch */}
        <motion.svg
          viewBox="0 0 220 360"
          className="absolute -right-12 top-[43%] h-80 w-52 text-emerald-400/25 sm:right-0 sm:h-96 sm:w-60"
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 1.2,
            delay: 0.25,
          }}
        >
          <path
            d="M178 355 C154 270 124 204 65 140"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M142 263 C175 251 193 225 186 196 C157 202 137 231 142 263Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M116 211 C83 207 59 183 62 151 C94 157 119 179 116 211Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M89 177 C117 147 117 113 96 91 C72 115 69 147 89 177Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M62 144 C34 134 20 111 28 87 C53 94 69 117 62 144Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </motion.svg>

        {/* Bottom lotus */}
        <motion.svg
          viewBox="0 0 280 190"
          className="absolute -bottom-8 -left-8 h-44 w-64 text-blue-400/25 sm:left-4 sm:h-52 sm:w-80"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1.2,
            delay: 0.3,
          }}
        >
          <path
            d="M140 145 C109 120 102 82 140 36 C178 82 171 120 140 145Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M140 145 C91 142 56 113 53 79 C93 80 123 103 140 145Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M140 145 C189 142 224 113 227 79 C187 80 157 103 140 145Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />

          <path
            d="M40 154 Q140 180 240 154"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M24 166 Q140 194 256 166"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.svg>

        <Heart className="absolute left-[17%] top-[27%] h-7 w-7 rotate-[-18deg] text-pink-300/30" />

        <Heart className="absolute right-[18%] top-[63%] h-8 w-8 rotate-[16deg] text-purple-300/30" />

        <Sparkles className="absolute left-[46%] top-[36%] h-5 w-5 text-violet-300/30" />

        <Sparkles className="absolute bottom-[20%] right-[32%] h-6 w-6 text-pink-300/30" />
      </div>

      {/* ======================================================
          MODE POPUP
      ====================================================== */}

      {showModePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
          <div className="w-full max-w-xl">
            <ModeSelectorV2 />
          </div>
        </div>
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}

      <motion.header
        className="relative z-10"
        initial={{
          y: -18,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.55,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 pb-5 pt-8 sm:px-8">

          <div className="relative overflow-hidden rounded-b-[42px] border border-white/60 bg-card/75 px-5 py-7 shadow-[0_18px_55px_rgba(116,91,180,0.08)] backdrop-blur-xl sm:px-10 sm:py-9">

            <div className="absolute inset-0 bg-gradient-to-r from-violet-100/30 via-transparent to-pink-100/30" />

            <div className="relative flex flex-col items-center justify-center text-center">

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-300 to-purple-500 text-2xl shadow-lg shadow-purple-200/50">
                  🪷
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                  {getGreeting()},{" "}
                  {getUserName()}
                </h1>

                <span className="text-3xl">
                  🌤️
                </span>

              </div>

              <p className="text-sm font-medium text-muted-foreground sm:text-base">
                Small steps towards a healthier,
                happier you
                <span className="ml-2 text-pink-400">
                  ♡
                </span>
              </p>

            </div>
          </div>
        </div>
      </motion.header>

      {/* ======================================================
          DEMO MODE
      ====================================================== */}

      {isDemoMode() && (
        <div className="relative z-10 mx-auto mt-1 max-w-7xl px-6 sm:px-8">
          <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-primary shadow-sm">
            Demo Mode is active. Wellness data is seeded for presentation.
          </div>
        </div>
      )}

      {/* ======================================================
          MOOD
      ====================================================== */}

      <motion.section
        className="relative z-10 mx-auto mt-1 max-w-7xl px-6 sm:px-8"
        variants={cardAnim}
        initial="initial"
        animate="animate"
        transition={{
          delay: 0.05,
          duration: 0.5,
        }}
      >
        <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-gradient-to-br from-violet-100/60 via-card/80 to-purple-100/50 p-6 shadow-[0_16px_45px_rgba(126,96,190,0.08)] backdrop-blur-xl md:p-8">

          <div className="pointer-events-none absolute -bottom-[45px] -left-8 text-[150px] opacity-20">
            🪷
          </div>

          <Sparkles className="pointer-events-none absolute left-[16%] top-7 h-5 w-5 text-white/90" />

          <Sparkles className="pointer-events-none absolute left-[21%] top-16 h-4 w-4 text-violet-300/70" />

          <Sparkles className="pointer-events-none absolute right-[24%] top-12 h-4 w-4 text-white/80" />

          <div className="relative">

            <h3 className="text-center text-lg font-bold text-primary md:text-xl">
              How are you feeling today?
            </h3>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Slide to select your current mood
            </p>

            <div className="mt-5 flex flex-col items-center">

              <motion.div
                key={currentMood.label}
                initial={{
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                className="flex items-center gap-3"
              >

                <span className="text-4xl drop-shadow-sm">
                  {currentMood.emoji}
                </span>

                <div>

                  <p className="text-lg font-bold text-primary">
                    {currentMood.label}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Mood score:{" "}
                    {moodValue}/100
                  </p>

                </div>

              </motion.div>

            </div>

            {/* Slider */}
            <div className="relative mt-10 px-2">

              <div
                className="absolute left-2 right-2 top-1/2 h-3 -translate-y-1/2 rounded-full shadow-inner"
                style={{
                  background:
                    "linear-gradient(to right, #ef7890 0%, #f3a16f 25%, #f6d875 50%, #abd27d 75%, #55c4b1 100%)",
                }}
              />

              <div
                className="pointer-events-none absolute top-1/2 z-20 transition-[left] duration-75 ease-out"
                style={{
                  left: `${moodValue}%`,
                  transform:
                    "translate(-50%, -50%)",
                }}
              >

                <motion.div
                  animate={{
                    scale: isDragging
                      ? 1.08
                      : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  }}
                  className="relative"
                >

                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-[4px] border-primary bg-background/90 shadow-[0_6px_18px_rgba(80,60,130,0.22)] backdrop-blur-xl sm:h-16 sm:w-16">

                    <motion.span
                      key={currentMood.emoji}
                      initial={{
                        scale: 0.75,
                        opacity: 0,
                      }}
                      animate={{
                        scale: isDragging
                          ? 1.12
                          : 1,
                        opacity: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      }}
                      className="select-none text-3xl leading-none sm:text-4xl"
                    >
                      {currentMood.emoji}
                    </motion.span>

                  </div>

                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 rounded-xl bg-primary px-3 py-1 text-sm font-bold text-primary-foreground shadow-md">
                    {moodValue}
                  </div>

                </motion.div>

              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={moodValue}
                onChange={(event) =>
                  setMoodValue(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                onMouseDown={() =>
                  setIsDragging(true)
                }
                onMouseUp={() =>
                  setIsDragging(false)
                }
                onTouchStart={() =>
                  setIsDragging(true)
                }
                onTouchEnd={() =>
                  setIsDragging(false)
                }
                onBlur={() =>
                  setIsDragging(false)
                }
                className="mood-slider relative z-30 h-3 w-full cursor-grab appearance-none bg-transparent"
                aria-label="Current mood"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  moodValue
                }
              />

              <div className="pointer-events-none absolute left-2 right-2 top-1/2 -translate-y-1/2">

                {moodCheckpoints.map(
                  (checkpoint) => (
                    <div
                      key={
                        checkpoint.value
                      }
                      className="absolute flex flex-col items-center"
                      style={{
                        left: `${checkpoint.value}%`,
                        transform:
                          "translateX(-50%)",
                      }}
                    >
                      <div className="h-5 w-0.5 rounded-full bg-primary/20" />
                    </div>
                  ),
                )}

              </div>

            </div>

            <div className="mt-8 flex justify-center">

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={() =>
                  navigate(
                    "/mood",
                    {
                      state: {
                        moodValue,
                      },
                    },
                  )
                }
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-shadow hover:shadow-lg"
              >
                Continue with{" "}
                {moodValue}
              </motion.button>

            </div>

          </div>
        </div>
      </motion.section>

      {/* ======================================================
          SAATHI INSIGHT
      ====================================================== */}

      <motion.section
        className="relative z-10 mx-auto mt-6 max-w-7xl px-6 sm:px-8"
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.12,
          duration: 0.55,
        }}
      >

        <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-card/85 shadow-[0_18px_55px_rgba(100,85,160,0.10)] backdrop-blur-xl">

          {/* Glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />

          <Sparkles className="pointer-events-none absolute right-8 top-8 h-5 w-5 text-violet-300/50" />

          <div className="relative p-6 md:p-8">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-200/40">
                  <Brain
                    className="h-7 w-7 text-white"
                    strokeWidth={2}
                  />
                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-xl font-bold tracking-tight text-primary">
                      Saathi Insight
                    </h2>

                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-600">
                      Early Support
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    A wellness-level insight from your activity pattern
                  </p>

                </div>

              </div>

              {/* Notification */}
              {notification && (
                <button
                  type="button"
                  onClick={() =>
                    setShowNotification(
                      (value) =>
                        !value,
                    )
                  }
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-primary/10 bg-primary/5 text-primary transition hover:bg-primary/10"
                  aria-label="View wellness notification"
                >

                  <Bell className="h-5 w-5" />

                  {!notification.read_at && (
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-background" />
                  )}

                </button>
              )}

            </div>

            {/* Notification */}
            {showNotification &&
              notification && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  className="mt-5 rounded-2xl border border-violet-200/70 bg-violet-50/70 p-4"
                >

                  <div className="flex gap-3">

                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white">
                      <Bell className="h-4 w-4" />
                    </div>

                    <div>

                      <p className="text-sm font-bold text-primary">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {notification.body}
                      </p>

                    </div>

                  </div>

                </motion.div>
              )}

            {/* No prediction */}
            {!prediction ? (
              <div className="mt-7 rounded-[26px] border border-dashed border-primary/15 bg-primary/[0.025] p-7 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100">
                  <Sparkles className="h-7 w-7 text-violet-500" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-primary">
                  Discover your wellness pattern
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Saathi can turn your recent wellness activity into a simple supportive insight.
                </p>

                {predictionError && (
                  <p className="mt-3 text-sm font-medium text-rose-500">
                    {predictionError}
                  </p>
                )}

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  disabled={
                    predictionLoading
                  }
                  onClick={
                    generatePrediction
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {predictionLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />

                      Generating insight...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />

                      Generate my insight
                    </>
                  )}

                </motion.button>

              </div>
            ) : (
              /* Prediction exists */
              <div className="mt-7 grid gap-6 lg:grid-cols-[220px_1fr]">

                {/* SCORE */}
                <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 text-center">

                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-300/20 blur-2xl" />

                  <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Predicted wellness
                  </p>

                  <div className="relative mt-4">

                    <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-violet-100 bg-white/80 shadow-inner">

                      <div>

                        <p className="text-4xl font-extrabold tracking-tight text-primary">
                          {
                            prediction.predicted_energy_level
                          }
                        </p>

                        <p className="text-xs font-medium text-muted-foreground">
                          / 100
                        </p>

                      </div>

                    </div>

                  </div>

                  {predictionLevel && (
                    <div className="relative mt-4 flex items-center justify-center gap-2">

                      {(() => {
                        const PredictionIcon =
                          predictionLevel.icon;

                        return (
                          <PredictionIcon
                            className="h-4 w-4 text-violet-500"
                          />
                        );
                      })()}

                      <span className="text-xs font-semibold text-primary">
                        {
                          predictionLevel.label
                        }
                      </span>

                    </div>
                  )}

                </div>

                {/* RECOMMENDATION */}
                <div className="flex flex-col justify-center">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200/30">

                      <Zap
                        className="h-6 w-6 text-white"
                        fill="currentColor"
                      />

                    </div>

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                        Today's small step
                      </p>

                      <h3 className="mt-1 text-2xl font-bold tracking-tight text-primary">
                        {
                          prediction.recommendation_title
                        }
                      </h3>

                    </div>

                  </div>

                  <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
                    {
                      prediction.recommendation_body
                    }
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">

                    <button
                      type="button"
                      onClick={
                        startRecommendedActivity
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    >

                      <CheckCircle2 className="h-4 w-4" />

                      {
                        prediction.recommendation_activity
                      }

                      <ArrowRight className="h-4 w-4" />

                    </button>

                    <button
                      type="button"
                      onClick={
                        generatePrediction
                      }
                      disabled={
                        predictionLoading
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
                    >

                      <Clock3 className="h-4 w-4" />

                      {predictionLoading
                        ? "Refreshing..."
                        : "Refresh insight"}

                    </button>

                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">

                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />

                    <span>
                      Supportive wellness insight — not a medical diagnosis.
                    </span>

                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      </motion.section>

      {/* ======================================================
          MAIN DASHBOARD
      ====================================================== */}

      <main className="relative z-10 mx-auto mt-8 max-w-7xl space-y-8 px-6 pb-32 sm:px-8">

        {/* Feature grid */}
        <section>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {features.map(
              (f, i) => {
                const Icon =
                  f.icon;

                const custom =
                  getTileColor(
                    f.id,
                  );

                return (
                  <motion.button
                    key={f.id}
                    onClick={() =>
                      navigate(
                        f.route,
                      )
                    }
                    custom={i}
                    initial="hidden"
                    animate="show"
                    variants={
                      tileVariants
                    }
                    className="group relative min-h-[285px] overflow-hidden rounded-[30px] border border-white/70 bg-card/85 p-7 text-left shadow-[0_12px_35px_rgba(100,85,160,0.07)] backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_24px_55px_rgba(100,85,160,0.14)]"
                  >

                    {/* Wash */}
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-[0.045] transition-opacity duration-500 group-hover:opacity-[0.09]`}
                    />

                    {/* Glow */}
                    <div
                      className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:scale-125 group-hover:opacity-30"
                      style={{
                        background:
                          custom
                            ? hslToCss(
                                custom,
                              )
                            : "rgba(168, 130, 255, 0.3)",
                      }}
                    />

                    {/* Leaf */}
                    <svg
                      viewBox="0 0 130 150"
                      className={`pointer-events-none absolute -bottom-5 -right-4 h-36 w-32 opacity-30 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 ${
                        f.doodle ===
                        "blue"
                          ? "text-blue-400"
                          : f.doodle ===
                              "green"
                            ? "text-emerald-400"
                            : f.doodle ===
                                "pink"
                              ? "text-rose-400"
                              : "text-purple-400"
                      }`}
                      aria-hidden="true"
                    >

                      <path
                        d="M105 150 C91 104 65 65 23 32"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      <path
                        d="M79 105 C106 96 120 76 114 54 C88 59 75 79 79 105Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      />

                      <path
                        d="M60 82 C36 78 19 60 22 38 C45 42 63 59 60 82Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      />

                      <path
                        d="M39 58 C59 36 59 15 44 3 C25 20 24 41 39 58Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      />

                      <path
                        d="M21 37 C8 31 1 19 5 7 C17 11 25 22 21 37Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      />

                    </svg>

                    {/* Icon */}
                    <div className="relative flex items-center">

                      <div
                        className={`flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br ${f.gradient} shadow-lg transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-2 group-hover:scale-105`}
                        style={
                          custom
                            ? {
                                backgroundColor:
                                  hslToCss(
                                    custom,
                                  ),
                              }
                            : undefined
                        }
                      >

                        <Icon
                          className="h-11 w-11 text-white drop-shadow-md"
                          strokeWidth={
                            2.1
                          }
                        />

                      </div>

                    </div>

                    {/* Text */}
                    <div className="relative mt-7 max-w-[240px]">

                      <h3 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
                        {f.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {
                          f.description
                        }
                      </p>

                    </div>

                    {/* Arrow */}
                    <div className="relative mt-6 flex justify-start">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/10 bg-primary/5 text-primary transition-all duration-300 group-hover:translate-x-2 group-hover:bg-primary/10">

                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />

                      </div>

                    </div>

                  </motion.button>
                );
              },
            )}

          </div>

        </section>

        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <section>

          <div className="space-y-4">

            {quickActions.map(
              (a) => {
                const Icon =
                  a.icon;

                return (
                  <motion.button
                    key={a.title}
                    onClick={() =>
                      navigate(
                        a.route,
                      )
                    }
                    whileHover={{
                      y: -3,
                      scale: 1.005,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="group flex w-full items-center justify-between rounded-[28px] border border-white/70 bg-card/85 px-5 py-5 text-left shadow-[0_12px_35px_rgba(100,85,160,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-primary/10 hover:shadow-[0_20px_45px_rgba(100,85,160,0.12)] sm:px-7"
                  >

                    <div className="flex items-center gap-4 sm:gap-5">

                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br ${a.gradient} shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105`}
                      >

                        <Icon
                          className="h-8 w-8 text-white"
                          strokeWidth={
                            2.2
                          }
                        />

                      </div>

                      <div>

                        <h4 className="text-lg font-bold tracking-tight text-primary">
                          {a.title}
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Tap to continue
                        </p>

                      </div>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/10 bg-primary/5 text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary/10">

                      <ArrowRight className="h-5 w-5" />

                    </div>

                  </motion.button>
                );
              },
            )}

            {/* Share Moment */}
            <motion.button
              whileHover={{
                y: -3,
                scale: 1.005,
              }}
              transition={{
                duration: 0.25,
              }}
              onClick={() =>
                setOpenShare(
                  true,
                )
              }
              className="group flex w-full items-center justify-between rounded-[28px] border border-white/70 bg-card/85 px-5 py-5 text-left shadow-[0_12px_35px_rgba(100,85,160,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-primary/10 hover:shadow-[0_20px_45px_rgba(100,85,160,0.12)] sm:px-7"
            >

              <div className="flex items-center gap-4 sm:gap-5">

                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105">

                  <Share2 className="h-8 w-8 text-white" />

                </div>

                <div className="text-left">

                  <h4 className="text-lg font-bold text-primary">
                    Share Moment
                  </h4>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Inspire your friends
                  </p>

                </div>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/10 bg-primary/5 text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary/10">

                <ArrowRight className="h-5 w-5" />

              </div>

            </motion.button>

          </div>

        </section>

      </main>

      {/* ======================================================
          SHARE MODAL
      ====================================================== */}

      <ShareModal
        open={openShare}
        onClose={() =>
          setOpenShare(false)
        }
        stats={stats}
      />

    </div>
  );
}