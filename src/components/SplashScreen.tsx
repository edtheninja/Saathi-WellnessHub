<<<<<<< HEAD
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import saathiLogo from '@/assets/saathi-logo.png';
=======
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
<<<<<<< HEAD
      navigate('/onboarding');
=======
      navigate("/onboarding");
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-calm flex flex-col items-center justify-center px-8 animate-fade-in">
      <div className="text-center space-y-8">
        <div className="animate-float">
          <img 
            src={saathiLogo} 
            alt="SAATHI Logo" 
            className="w-32 h-32 mx-auto drop-shadow-soft"
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary-foreground tracking-wide">
            SAATHI
          </h1>
          
          <p className="text-lg text-primary-foreground/90 max-w-sm mx-auto leading-relaxed">
            Your Companion in Mental Wellness
          </p>
        </div>

        <div className="animate-breathe">
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
=======
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#8177e8] via-[#8799ed] to-[#69b9e9]">
      {/* ------------------------------------------------------------------ */}
      {/* Soft texture                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="pointer-events-none absolute inset-0">
        {/* Soft light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.18),transparent_32%)]" />

        {/* Very subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Gentle floating glow */}
        <motion.div
          className="absolute left-1/2 top-[34%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.4, 0.65, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8">
        <div className="flex -translate-y-4 flex-col items-center text-center sm:-translate-y-6">

          {/* -------------------------------------------------------------- */}
          {/* Lotus                                                          */}
          {/* -------------------------------------------------------------- */}

          <motion.div
            className="relative flex h-[150px] w-[190px] items-end justify-center sm:h-[170px] sm:w-[220px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <svg
              viewBox="0 0 240 170"
              className="h-full w-full overflow-visible"
              aria-label="Saathi lotus"
              role="img"
            >
              {/* Soft shadow */}
              <motion.ellipse
                cx="120"
                cy="139"
                rx="70"
                ry="11"
                fill="rgba(255,255,255,0.12)"
                animate={{
                  opacity: [0.15, 0.3, 0.15],
                  scale: [0.95, 1.04, 0.95],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* ================================================================ */}
              {/* LEFT OUTER PETAL                                                 */}
              {/* ================================================================ */}

              <motion.path
                d="
      M116 128
      C92 130 67 124 50 108
      C41 99 35 87 32 74
      C55 70 78 74 96 86
      C109 95 115 111 116 128
      Z
    "
                fill="#C75EDC"
                stroke="#8D8AE8"
                strokeWidth="2"
                strokeLinejoin="round"
                initial={{
                  opacity: 0,
                  x: -18,
                  scale: 0.75,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                transition={{
                  delay: 0.25,
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: "116px 128px",
                }}
              />

              {/* ================================================================ */}
              {/* RIGHT OUTER PETAL                                                */}
              {/* ================================================================ */}

              <motion.path
                d="
      M124 128
      C148 130 173 124 190 108
      C199 99 205 87 208 74
      C185 70 162 74 144 86
      C131 95 125 111 124 128
      Z
    "
                fill="#C75EDC"
                stroke="#8D8AE8"
                strokeWidth="2"
                strokeLinejoin="round"
                initial={{
                  opacity: 0,
                  x: 18,
                  scale: 0.75,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                transition={{
                  delay: 0.35,
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: "124px 128px",
                }}
              />

              {/* ================================================================ */}
              {/* LEFT MIDDLE PETAL                                                */}
              {/* ================================================================ */}

              <motion.path
                d="
      M119 128
      C101 118 85 104 79 86
      C74 69 78 51 89 37
      C105 49 115 66 119 85
      C122 101 121 116 119 128
      Z
    "
                fill="#C45BDB"
                stroke="#8D8AE8"
                strokeWidth="2"
                strokeLinejoin="round"
                initial={{
                  opacity: 0,
                  x: -12,
                  y: 10,
                  rotate: -8,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  rotate: 0,
                  scale: 1,
                }}
                transition={{
                  delay: 0.45,
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: "119px 128px",
                }}
              />

              {/* ================================================================ */}
              {/* RIGHT MIDDLE PETAL                                               */}
              {/* ================================================================ */}

              <motion.path
                d="
      M121 128
      C139 118 155 104 161 86
      C166 69 162 51 151 37
      C135 49 125 66 121 85
      C118 101 119 116 121 128
      Z
    "
                fill="#C45BDB"
                stroke="#8D8AE8"
                strokeWidth="2"
                strokeLinejoin="round"
                initial={{
                  opacity: 0,
                  x: 12,
                  y: 10,
                  rotate: 8,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  rotate: 0,
                  scale: 1,
                }}
                transition={{
                  delay: 0.55,
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: "121px 128px",
                }}
              />

              {/* ================================================================ */}
              {/* LEFT INNER PETAL                                                 */}
              {/* ================================================================ */}

              <motion.path
                d="
      M116 91
      C105 82 99 70 100 57
      C101 47 106 37 112 29
      C119 40 122 52 121 65
      C120 75 118 84 116 91
      Z
    "
                fill="#C960DD"
                stroke="#8D8AE8"
                strokeWidth="2"
                strokeLinejoin="round"
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  x: -5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.7,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: "116px 91px",
                }}
              />

              {/* ================================================================ */}
              {/* RIGHT INNER PETAL                                                */}
              {/* ================================================================ */}

              <motion.path
                d="
      M124 91
      C135 82 141 70 140 57
      C139 47 134 37 128 29
      C121 40 118 52 119 65
      C120 75 122 84 124 91
      Z
    "
                fill="#C960DD"
                stroke="#8D8AE8"
                strokeWidth="2"
                strokeLinejoin="round"
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  x: 5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: "124px 91px",
                }}
              />

              {/* ================================================================ */}
              {/* CENTER PETAL                                                     */}
              {/* ================================================================ */}

              <motion.path
                d="
      M120 134
      C101 116 94 97 94 79
      C94 57 105 36 120 20
      C135 36 146 57 146 79
      C146 97 139 116 120 134
      Z
    "
                fill="#C65DDB"
                stroke="#8D8AE8"
                strokeWidth="2"
                strokeLinejoin="round"
                initial={{
                  opacity: 0,
                  scaleY: 0.15,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  scaleY: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.9,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformOrigin: "120px 134px",
                }}
              />
            </svg>
          </motion.div>

          {/* -------------------------------------------------------------- */}
          {/* SAATHI                                                         */}
          {/* -------------------------------------------------------------- */}

          <motion.div
            className="-mt-1"
            initial={{
              opacity: 0,
              y: 15,
              letterSpacing: "0.18em",
            }}
            animate={{
              opacity: 1,
              y: 0,
              letterSpacing: "0.08em",
            }}
            transition={{
              delay: 1.15,
              duration: 0.7,
              ease: "easeOut",
            }}
          >
            <h1 className="font-sans text-4xl font-semibold text-white drop-shadow-sm sm:text-5xl">
              SAATHI
            </h1>
          </motion.div>

          {/* -------------------------------------------------------------- */}
          {/* Tagline                                                        */}
          {/* -------------------------------------------------------------- */}

          <motion.p
            className="mt-4 max-w-sm text-base font-light tracking-wide text-white/90 sm:text-lg"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.45,
              duration: 0.65,
              ease: "easeOut",
            }}
          >
            Your Companion in Mental Wellness
          </motion.p>

          {/* -------------------------------------------------------------- */}
          {/* Breathing indicator                                            */}
          {/* -------------------------------------------------------------- */}

          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 1.7,
              duration: 0.5,
            }}
          >
            <motion.div
              className="h-2 w-2 rounded-full bg-white/70"
              animate={{
                scale: [1, 1.7, 1],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </div>
    </main>
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
  );
};

export default SplashScreen;