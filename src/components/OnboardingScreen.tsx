import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Flower2,
  Heart,
  Leaf,
  LineChart,
  MessageCircleHeart,
  Music2,
  Sparkles,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type SlideType = "mind" | "community" | "wellness";

type OnboardingSlide = {
  type: SlideType;
  title: string;
  description: string;
  background: string;
  accent: string;
};

const slides: OnboardingSlide[] = [
  {
    type: "mind",
    title: "Your Mind Matters",
    description:
      "Track your mood, understand your emotions, and discover meaningful patterns in your wellness journey.",
    background:
      "bg-gradient-to-br from-[#f4efff] via-[#f5f6ff] to-[#e9f8f4]",
    accent: "#6358be",
  },
  {
    type: "community",
    title: "You're Not Alone",
    description:
      "Understand how you're feeling, connect with supportive people, and take your wellness journey one step at a time.",
    background:
      "bg-gradient-to-br from-[#edf9f6] via-[#f4efff] to-[#fceef7]",
    accent: "#4a9995",
  },
  {
    type: "wellness",
    title: "A Healthier You Is Possible",
    description:
      "Meditate, journal, listen, connect, and build small habits that support a healthier, calmer you.",
    background:
      "bg-gradient-to-br from-[#fff2e9] via-[#f8f0ff] to-[#eaf8f4]",
    accent: "#df776d",
  },
];

/* -------------------------------------------------------------------------- */
/*                              Shared elements                               */
/* -------------------------------------------------------------------------- */

const FloatingSparkle = ({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className={`pointer-events-none absolute ${className}`}
      animate={{
        y: [0, -7, 0],
        rotate: [0, 8, 0],
        opacity: [0.35, 0.8, 0.35],
      }}
      transition={{
        duration: 3.5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Sparkles className="h-4 w-4 text-purple-400/60 sm:h-5 sm:w-5" />
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/*                         Animoji-style Character                            */
/* -------------------------------------------------------------------------- */

type ChibiProps = {
  skin?: string;
  hair?: string;
  shirt?: string;
  expression?: "happy" | "calm" | "smile";
  scale?: string;
};

const ChibiCharacter = ({
  skin = "#F0B18F",
  hair = "#493033",
  shirt = "#9B82D6",
  expression = "smile",
  scale = "scale-100",
}: ChibiProps) => {
  return (
    <div className={`relative h-36 w-28 ${scale}`}>
      {/* Soft shadow */}
      <div className="absolute bottom-0 left-1/2 h-3 w-20 -translate-x-1/2 rounded-full bg-slate-500/15 blur-sm" />

      {/* Body */}
      <div
        className="absolute bottom-2 left-1/2 h-[76px] w-[70px] -translate-x-1/2 rounded-[48%_48%_30%_30%]"
        style={{
          background: shirt,
        }}
      >
        {/* Neck */}
        <div
          className="absolute -top-3 left-1/2 h-7 w-6 -translate-x-1/2 rounded-b-xl"
          style={{
            backgroundColor: skin,
          }}
        />

        {/* Left arm */}
        <motion.div
          className="absolute -left-5 top-7 h-4 w-9 origin-right rounded-full"
          style={{
            backgroundColor: skin,
          }}
          animate={{
            rotate: [18, 14, 18],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Right arm */}
        <motion.div
          className="absolute -right-5 top-7 h-4 w-9 origin-left rounded-full"
          style={{
            backgroundColor: skin,
          }}
          animate={{
            rotate: [-18, -14, -18],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main face */}
      <div
        className="absolute left-1/2 top-1 z-20 h-[91px] w-[88px] -translate-x-1/2 rounded-[48%_48%_45%_45%] border border-black/5 shadow-[0_5px_12px_rgba(60,40,40,0.12)]"
        style={{
          backgroundColor: skin,
        }}
      >
        {/* Soft face highlight */}
        <div className="absolute left-[14px] top-[12px] h-5 w-8 rounded-full bg-white/20 blur-[3px]" />

        {/* Main hair cap */}
        <div
          className="absolute -top-[17px] left-1/2 h-[57px] w-[82px] -translate-x-1/2 rounded-[48%_48%_38%_38%]"
          style={{
            backgroundColor: hair,
          }}
        />

        {/* Rounded hair sections */}
        <div
          className="absolute -left-[3px] -top-[8px] h-8 w-8 rounded-full"
          style={{
            backgroundColor: hair,
          }}
        />

        <div
          className="absolute left-[12px] -top-[17px] h-9 w-9 rounded-full"
          style={{
            backgroundColor: hair,
          }}
        />

        <div
          className="absolute left-[32px] -top-[20px] h-10 w-10 rounded-full"
          style={{
            backgroundColor: hair,
          }}
        />

        <div
          className="absolute right-[10px] -top-[16px] h-9 w-9 rounded-full"
          style={{
            backgroundColor: hair,
          }}
        />

        <div
          className="absolute -right-[3px] -top-[8px] h-8 w-8 rounded-full"
          style={{
            backgroundColor: hair,
          }}
        />

        {/* Side hair */}
        <div
          className="absolute -left-[2px] top-[25px] h-11 w-5 rounded-full"
          style={{
            backgroundColor: hair,
          }}
        />

        <div
          className="absolute -right-[2px] top-[25px] h-11 w-5 rounded-full"
          style={{
            backgroundColor: hair,
          }}
        />

        {/* Eyebrows */}
        <div
          className="absolute left-[20px] top-[38px] h-[5px] w-[18px] rounded-full"
          style={{
            backgroundColor: hair,
            transform: "rotate(-6deg)",
          }}
        />

        <div
          className="absolute right-[20px] top-[38px] h-[5px] w-[18px] rounded-full"
          style={{
            backgroundColor: hair,
            transform: "rotate(6deg)",
          }}
        />

        {/* Left eye */}
        <motion.div
          className="absolute left-[20px] top-[49px] h-[15px] w-[15px] rounded-full bg-[#3B3030] shadow-inner"
          animate={{
            scaleY: [1, 1, 0.12, 1, 1],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            times: [0, 0.88, 0.92, 0.96, 1],
          }}
        >
          <div className="absolute left-[3px] top-[2px] h-[4px] w-[4px] rounded-full bg-white/90" />
        </motion.div>

        {/* Right eye */}
        <motion.div
          className="absolute right-[20px] top-[49px] h-[15px] w-[15px] rounded-full bg-[#3B3030] shadow-inner"
          animate={{
            scaleY: [1, 1, 0.12, 1, 1],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            delay: 0.05,
            times: [0, 0.88, 0.92, 0.96, 1],
          }}
        >
          <div className="absolute left-[3px] top-[2px] h-[4px] w-[4px] rounded-full bg-white/90" />
        </motion.div>

        {/* Blush */}
        <div className="absolute left-[10px] top-[63px] h-2 w-5 rounded-full bg-[#E98E8E]/25" />

        <div className="absolute right-[10px] top-[63px] h-2 w-5 rounded-full bg-[#E98E8E]/25" />

        {/* Nose */}
        <div
          className="absolute left-1/2 top-[63px] h-2.5 w-4 -translate-x-1/2 rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${skin} 72%, #9A5D48)`,
          }}
        />

        {/* Expression */}
        {expression === "calm" ? (
          <div className="absolute left-1/2 top-[72px] h-2 w-5 -translate-x-1/2 rounded-full border-b-2 border-[#70453D]" />
        ) : (
          <div className="absolute left-1/2 top-[71px] h-[12px] w-[25px] -translate-x-1/2 rounded-b-[50%] border-b-[3px] border-[#70453D]" />
        )}

        {/* Ears */}
        <div
          className="absolute -left-[5px] top-[43px] h-5 w-3 rounded-full"
          style={{
            backgroundColor: skin,
          }}
        />

        <div
          className="absolute -right-[5px] top-[43px] h-5 w-3 rounded-full"
          style={{
            backgroundColor: skin,
          }}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Page 1                                        */
/* -------------------------------------------------------------------------- */

const MindIllustration = () => {
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[560px] sm:h-[350px] md:h-[390px]">
      {/* Central glow */}
      <motion.div
        className="absolute left-1/2 top-[47%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/45 blur-2xl sm:h-60 sm:w-60"
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Leaves */}
      <motion.div
        className="absolute left-[2%] top-[32%] rotate-[-25deg]"
        animate={{
          y: [0, -7, 0],
          rotate: [-25, -19, -25],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      >
        <Leaf className="h-14 w-14 text-teal-400/45 sm:h-20 sm:w-20" />
      </motion.div>

      <motion.div
        className="absolute right-[2%] top-[30%] rotate-[25deg]"
        animate={{
          y: [0, 7, 0],
          rotate: [25, 31, 25],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
        }}
      >
        <Leaf className="h-14 w-14 text-blue-400/40 sm:h-20 sm:w-20" />
      </motion.div>

      <FloatingSparkle className="left-[14%] top-[14%]" />
      <FloatingSparkle className="right-[15%] top-[12%]" delay={1} />

      {/* Progress card */}
      <motion.div
        className="absolute right-[1%] top-[3%] z-30 w-[145px] rounded-2xl border border-white/80 bg-white/80 p-3 shadow-lg backdrop-blur-md sm:right-[5%] sm:w-[180px] sm:p-4"
        initial={{
          opacity: 0,
          x: 20,
        }}
        animate={{
          opacity: 1,
          x: [0, 3, 0],
          y: [0, -4, 0],
        }}
        transition={{
          opacity: {
            duration: 0.6,
          },
          x: {
            duration: 4,
            repeat: Infinity,
          },
          y: {
            duration: 4,
            repeat: Infinity,
          },
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#183568] sm:text-xs">
            Your Progress
          </span>

          <LineChart className="h-3.5 w-3.5 text-blue-500 sm:h-4 sm:w-4" />
        </div>

        <div className="mt-2 flex items-center gap-2 sm:mt-3 sm:gap-3">
          <div className="relative h-10 w-10 shrink-0 sm:h-12 sm:w-12">
            <svg
              viewBox="0 0 40 40"
              className="h-full w-full -rotate-90"
            >
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-blue-100"
              />

              <motion.circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-blue-500"
                strokeDasharray="100"
                initial={{
                  strokeDashoffset: 100,
                }}
                animate={{
                  strokeDashoffset: 22,
                }}
                transition={{
                  duration: 1.4,
                }}
              />
            </svg>

            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-[#183568] sm:text-[9px]">
              78%
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-[8px] text-slate-500 sm:text-[9px]">
              <span>Mood</span>
              <span className="text-blue-500">Better</span>
            </div>

            <div className="mt-1 h-1 rounded-full bg-blue-100">
              <motion.div
                className="h-full rounded-full bg-blue-400"
                initial={{
                  width: 0,
                }}
                animate={{
                  width: "78%",
                }}
                transition={{
                  duration: 1.2,
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Animoji */}
      <motion.div
        className="absolute left-1/2 top-[38%] z-20 -translate-x-1/2 -translate-y-1/2"
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -5, 0],
        }}
        transition={{
          opacity: {
            duration: 0.6,
          },
          scale: {
            duration: 0.6,
          },
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <ChibiCharacter
          skin="#E8A27D"
          hair="#493033"
          shirt="#9B82D6"
          expression="calm"
          scale="scale-[1.05] sm:scale-[1.25]"
        />
      </motion.div>

      {/* Meditation mat */}
      <motion.div
        className="absolute bottom-[12%] left-1/2 h-5 w-52 -translate-x-1/2 rounded-[50%] bg-purple-300/25 blur-[1px] sm:w-64"
        animate={{
          scaleX: [1, 1.04, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />

      {/* Insight badge */}
      <motion.div
        className="absolute bottom-[4%] left-[2%] z-30 flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-2 shadow-md backdrop-blur-md sm:left-[7%]"
        initial={{
          opacity: 0,
          x: -15,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          delay: 0.5,
        }}
      >
        <Brain className="h-3.5 w-3.5 text-purple-500 sm:h-4 sm:w-4" />

        <span className="text-[9px] font-semibold text-[#183568] sm:text-[10px]">
          Understand yourself
        </span>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Page 2                                        */
/* -------------------------------------------------------------------------- */

const CommunityIllustration = () => {
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[560px] sm:h-[350px] md:h-[390px]">
      {/* Background glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-200/50 blur-2xl sm:h-60 sm:w-60"
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />

      {/* Connection circle */}
      <motion.div
        className="absolute left-1/2 top-[47%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-purple-300/60 sm:h-56 sm:w-56"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Connection lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 560 390"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M280 185 L130 125"
          stroke="rgba(130,110,190,0.28)"
          strokeWidth="2"
          strokeDasharray="5 6"
        />

        <path
          d="M280 185 L280 60"
          stroke="rgba(130,110,190,0.28)"
          strokeWidth="2"
          strokeDasharray="5 6"
        />

        <path
          d="M280 185 L430 125"
          stroke="rgba(130,110,190,0.28)"
          strokeWidth="2"
          strokeDasharray="5 6"
        />

        <path
          d="M280 185 L190 315"
          stroke="rgba(130,110,190,0.28)"
          strokeWidth="2"
          strokeDasharray="5 6"
        />

        <path
          d="M280 185 L370 315"
          stroke="rgba(130,110,190,0.28)"
          strokeWidth="2"
          strokeDasharray="5 6"
        />
      </svg>

      {/* Top character */}
      <motion.div
        className="absolute left-1/2 top-[-1%] z-20 -translate-x-1/2"
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: [0, -4, 0],
        }}
        transition={{
          opacity: {
            duration: 0.5,
          },
          y: {
            duration: 3.5,
            repeat: Infinity,
          },
        }}
      >
        <ChibiCharacter
          skin="#E3A078"
          hair="#4A3030"
          shirt="#F2A35B"
          expression="smile"
          scale="scale-[0.68] sm:scale-[0.78]"
        />
      </motion.div>

      {/* Left character */}
      <motion.div
        className="absolute left-[2%] top-[28%] z-20"
        initial={{
          opacity: 0,
          x: -15,
        }}
        animate={{
          opacity: 1,
          x: [0, -3, 0],
          y: [0, -4, 0],
        }}
        transition={{
          opacity: {
            duration: 0.5,
            delay: 0.2,
          },
          x: {
            duration: 3.5,
            repeat: Infinity,
          },
          y: {
            duration: 3.5,
            repeat: Infinity,
          },
        }}
      >
        <ChibiCharacter
          skin="#8F604D"
          hair="#2E2528"
          shirt="#8064C8"
          expression="smile"
          scale="scale-[0.65] sm:scale-[0.76]"
        />
      </motion.div>

      {/* Right character */}
      <motion.div
        className="absolute right-[2%] top-[28%] z-20"
        initial={{
          opacity: 0,
          x: 15,
        }}
        animate={{
          opacity: 1,
          x: [0, 3, 0],
          y: [0, -4, 0],
        }}
        transition={{
          opacity: {
            duration: 0.5,
            delay: 0.4,
          },
          x: {
            duration: 3.7,
            repeat: Infinity,
          },
          y: {
            duration: 3.7,
            repeat: Infinity,
          },
        }}
      >
        <ChibiCharacter
          skin="#A96850"
          hair="#35282B"
          shirt="#5D9F9C"
          expression="smile"
          scale="scale-[0.65] sm:scale-[0.76]"
        />
      </motion.div>

      {/* Bottom-left */}
      <motion.div
        className="absolute bottom-[-1%] left-[20%] z-20"
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: [0, -4, 0],
        }}
        transition={{
          opacity: {
            duration: 0.5,
            delay: 0.6,
          },
          y: {
            duration: 3.8,
            repeat: Infinity,
          },
        }}
      >
        <ChibiCharacter
          skin="#B8755D"
          hair="#332529"
          shirt="#D97883"
          expression="smile"
          scale="scale-[0.62] sm:scale-[0.72]"
        />
      </motion.div>

      {/* Bottom-right */}
      <motion.div
        className="absolute bottom-[-1%] right-[20%] z-20"
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: [0, -4, 0],
        }}
        transition={{
          opacity: {
            duration: 0.5,
            delay: 0.8,
          },
          y: {
            duration: 4,
            repeat: Infinity,
          },
        }}
      >
        <ChibiCharacter
          skin="#D0926F"
          hair="#463033"
          shirt="#6F8BCB"
          expression="smile"
          scale="scale-[0.62] sm:scale-[0.72]"
        />
      </motion.div>

      {/* Central heart */}
      <motion.div
        className="absolute left-1/2 top-[47%] z-40 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-400 shadow-xl sm:h-20 sm:w-20"
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <Heart
          className="h-7 w-7 fill-white text-white sm:h-9 sm:w-9"
        />
      </motion.div>

      {/* Floating hearts */}
      <motion.div
        className="absolute left-[18%] top-[18%]"
        animate={{
          y: [0, -8, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        <Heart className="h-4 w-4 fill-pink-300/40 text-pink-400 sm:h-5 sm:w-5" />
      </motion.div>

      <motion.div
        className="absolute right-[18%] top-[18%]"
        animate={{
          y: [0, -8, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          delay: 0.5,
        }}
      >
        <Heart className="h-4 w-4 fill-pink-300/40 text-pink-400 sm:h-5 sm:w-5" />
      </motion.div>

      {/* Support badge */}
      <motion.div
        className="absolute bottom-[1%] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-2 shadow-md backdrop-blur-md sm:px-4"
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 1,
        }}
      >
        <MessageCircleHeart className="h-3.5 w-3.5 text-purple-500 sm:h-4 sm:w-4" />

        <span className="whitespace-nowrap text-[9px] font-semibold text-purple-700 sm:text-[10px]">
          You're never alone
        </span>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Page 3                                        */
/* -------------------------------------------------------------------------- */

const WellnessIllustration = () => {
  const tools = [
    {
      icon: Wind,
      label: "Meditation",
      position: "left-[2%] top-[9%]",
      bg: "bg-purple-100",
      text: "text-purple-500",
      delay: 0,
    },
    {
      icon: Wind,
      label: "Breathing",
      position: "right-[2%] top-[9%]",
      bg: "bg-blue-100",
      text: "text-blue-500",
      delay: 0.3,
    },
    {
      icon: BookOpen,
      label: "Journaling",
      position: "left-[8%] bottom-[6%]",
      bg: "bg-rose-100",
      text: "text-rose-500",
      delay: 0.6,
    },
    {
      icon: Music2,
      label: "Music",
      position: "right-[8%] bottom-[6%]",
      bg: "bg-emerald-100",
      text: "text-emerald-500",
      delay: 0.9,
    },
  ];

  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[560px] sm:h-[350px] md:h-[390px]">
      {/* Sun */}
      <motion.div
        className="absolute left-1/2 top-[4%] h-24 w-24 -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-200 to-yellow-100 shadow-[0_0_45px_rgba(255,210,140,0.35)] sm:h-32 sm:w-32"
        animate={{
          scale: [1, 1.04, 1],
          y: [0, -3, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />

      {/* Mountains */}
      <div className="absolute bottom-[19%] left-1/2 h-28 w-[82%] -translate-x-1/2 overflow-hidden">
        <div className="absolute bottom-0 left-[5%] h-24 w-44 -skew-x-[25deg] rounded-t-[50%] bg-teal-200/75" />

        <div className="absolute bottom-0 left-[28%] h-32 w-48 -skew-x-[20deg] rounded-t-[50%] bg-teal-300/65" />

        <div className="absolute bottom-0 right-[5%] h-24 w-44 skew-x-[25deg] rounded-t-[50%] bg-teal-200/75" />
      </div>

      {/* Ground */}
      <motion.div
        className="absolute bottom-[14%] left-1/2 h-9 w-[68%] -translate-x-1/2 rounded-[50%] bg-blue-100/70"
        animate={{
          scaleX: [1, 1.04, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />

      {/* Central Animoji */}
      <motion.div
        className="absolute bottom-[15%] left-1/2 z-20 -translate-x-1/2"
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: [0, -4, 0],
        }}
        transition={{
          opacity: {
            duration: 0.6,
          },
          y: {
            duration: 4,
            repeat: Infinity,
          },
        }}
      >
        <ChibiCharacter
          skin="#C98568"
          hair="#293B43"
          shirt="#708F91"
          expression="calm"
          scale="scale-[1.05] sm:scale-[1.25]"
        />
      </motion.div>

      {/* Wellness tool cards */}
      {tools.map((tool) => {
        const Icon = tool.icon;

        return (
          <motion.div
            key={tool.label}
            className={`absolute ${tool.position} z-40 flex h-[62px] w-[72px] flex-col items-center justify-center rounded-2xl border border-white/80 bg-white/80 shadow-lg backdrop-blur-md sm:h-[78px] sm:w-[88px]`}
            initial={{
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              scale: [1, 1.04, 1],
              y: [0, -4, 0],
            }}
            transition={{
              opacity: {
                duration: 0.5,
                delay: tool.delay,
              },
              scale: {
                duration: 3.5,
                repeat: Infinity,
                delay: tool.delay,
              },
              y: {
                duration: 3.5,
                repeat: Infinity,
                delay: tool.delay,
              },
            }}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-xl ${tool.bg} ${tool.text} sm:h-9 sm:w-9`}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <span className="mt-1 text-[8px] font-medium text-slate-600 sm:text-[9px]">
              {tool.label}
            </span>
          </motion.div>
        );
      })}

      {/* Leaves */}
      <motion.div
        className="absolute bottom-[13%] left-[1%]"
        animate={{
          rotate: [-5, 3, -5],
          y: [0, -4, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      >
        <Leaf className="h-14 w-14 text-teal-500/50 sm:h-[72px] sm:w-[72px]" />
      </motion.div>

      <motion.div
        className="absolute bottom-[13%] right-[1%] rotate-[-15deg]"
        animate={{
          rotate: [-15, -8, -15],
          y: [0, -4, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
        }}
      >
        <Leaf className="h-14 w-14 text-teal-400/50 sm:h-[72px] sm:w-[72px]" />
      </motion.div>

      {/* Badge */}
      <motion.div
        className="absolute bottom-[1%] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-2 shadow-md backdrop-blur-md sm:px-4"
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 1,
        }}
      >
        <Leaf className="h-3.5 w-3.5 text-teal-600 sm:h-4 sm:w-4" />

        <span className="whitespace-nowrap text-[9px] font-semibold text-teal-700 sm:text-[10px]">
          Small steps matter
        </span>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Main screen                                   */
/* -------------------------------------------------------------------------- */

const OnboardingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slide = slides[currentSlide];

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  const nextSlide = () => {
    if (!isLastSlide) {
      setCurrentSlide((current) => current + 1);
    } else {
      navigate("/auth");
    }
  };

  const prevSlide = () => {
    if (!isFirstSlide) {
      setCurrentSlide((current) => current - 1);
    }
  };

  const skipToAuth = () => {
    navigate("/auth");
  };

/* -------------------------------------------------------------------------- */
/*                              Lotus Icon                                    */
/* -------------------------------------------------------------------------- */

const LotusIcon = () => {
  return (
    <svg
      viewBox="0 0 120 90"
      className="h-7 w-8 sm:h-8 sm:w-9"
      aria-hidden="true"
    >
      {/* Back left petal */}
      <path
        d="M43 38C34 30 27 24 18 20C17 29 19 38 27 44C32 47 38 47 43 45Z"
        fill="currentColor"
      />

      {/* Back right petal */}
      <path
        d="M77 38C86 30 93 24 102 20C103 29 101 38 93 44C88 47 82 47 77 45Z"
        fill="currentColor"
      />

      {/* Upper left petal */}
      <path
        d="M47 34C42 24 38 17 30 11C29 21 32 30 42 37Z"
        fill="currentColor"
      />

      {/* Upper right petal */}
      <path
        d="M73 34C78 24 82 17 90 11C91 21 88 30 78 37Z"
        fill="currentColor"
      />

      {/* Center petal */}
      <path
        d="M60 7C48 18 42 29 42 41C42 58 51 70 60 79C69 70 78 58 78 41C78 29 72 18 60 7Z"
        fill="currentColor"
      />

      {/* Left front petal */}
      <path
        d="M42 43C30 37 17 37 5 42C10 58 19 70 34 73C45 75 54 71 60 78C52 67 45 56 42 43Z"
        fill="currentColor"
      />

      {/* Right front petal */}
      <path
        d="M78 43C90 37 103 37 115 42C110 58 101 70 86 73C75 75 66 71 60 78C68 67 75 56 78 43Z"
        fill="currentColor"
      />
    </svg>
  );
};  

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-700 ${slide.background}`}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-white/40 blur-3xl"
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />

        <motion.div
          className="absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-white/40 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 flex h-[70px] items-center justify-between px-5 sm:h-[80px] sm:px-8">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              y: [0, -2, 0],
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-[#C75BDB]"
          >
            <LotusIcon />
          </motion.div>

          <span className="text-sm font-semibold tracking-wide text-[#183568]">
            SAATHI
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={skipToAuth}
          className="rounded-full px-4 text-sm text-slate-600 hover:bg-white/40 hover:text-slate-900"
        >
          Skip
        </Button>
      </header>

      {/* Main */}
      <section className="relative z-10 flex min-h-[calc(100vh-70px)] flex-col px-4 pb-5 sm:min-h-[calc(100vh-80px)] sm:px-8 sm:pb-7">
        {/* Illustration area */}
        <div className="flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="w-full"
              initial={{
                opacity: 0,
                x: 30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -30,
              }}
              transition={{
                duration: 0.45,
              }}
            >
              {slide.type === "mind" && <MindIllustration />}

              {slide.type === "community" && <CommunityIllustration />}

              {slide.type === "wellness" && <WellnessIllustration />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="mx-auto w-full max-w-2xl text-center"
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.4,
              delay: 0.08,
            }}
          >
            <h1 className="text-3xl font-bold tracking-tight text-[#183568] sm:text-4xl md:text-[42px]">
              {slide.title}
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7 md:text-lg">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Bottom */}
        <div className="mx-auto mt-5 w-full max-w-2xl sm:mt-6">
          {/* Dots */}
          <div className="mb-5 flex justify-center gap-1.5 sm:mb-6 sm:gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to onboarding page ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className="flex h-5 items-center"
              >
                <motion.span
                  className="block rounded-full"
                  animate={{
                    width: index === currentSlide ? 26 : 7,
                    height: 7,
                    backgroundColor:
                      index === currentSlide
                        ? slide.accent
                        : "rgba(148,163,184,0.4)",
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                />
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={prevSlide}
              disabled={isFirstSlide}
              className="h-10 gap-1 rounded-full px-3 text-slate-600 hover:bg-white/40 disabled:opacity-30 sm:h-11 sm:px-5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              type="button"
              onClick={nextSlide}
              className="h-10 gap-2 rounded-full px-5 text-white shadow-lg transition-transform hover:scale-[1.03] sm:h-11 sm:px-7"
              style={{
                backgroundColor: slide.accent,
              }}
            >
              {isLastSlide ? "Get Started" : "Next"}

              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OnboardingScreen;