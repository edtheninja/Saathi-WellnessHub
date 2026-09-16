import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Check, MoreVertical } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const apiUrl = (path: string) => `${API_BASE}${path}`;

const getAccessToken = () => localStorage.getItem("saathi_access_token");

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(apiUrl(path), { ...options, headers });
  const raw = await response.text();
  let payload: any = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = raw;
  }

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        payload?.message ||
        (typeof payload === "string" ? payload : null) ||
        `Request failed with status ${response.status}`,
    );
  }

  return payload;
};

/* =========================================================
   TYPES
========================================================= */

/* =========================================================
   COMPONENT
========================================================= */

const MeditationScreen = () => {
  /* =========================================================
     TIMER
  ========================================================= */

  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isFinalizedRef = useRef(false);

  /*
    Total real elapsed meditation time in milliseconds.
    This survives pause/resume because each active segment
    is added when the session is paused or finalized.
  */
  const elapsedMsRef = useRef(0);

  /* Exact remaining time when the current active segment started. */
  const segmentStartRemainingMsRef = useRef(0);

  /* Exact remaining time captured when a session is paused. */
  const pausedRemainingMsRef = useRef<number | null>(null);

  const endTimeRef = useRef<number | null>(null);

  const timerFrameRef = useRef<number | null>(null);

  const lastDisplayedSecondRef = useRef(300);

  /* =========================================================
     DURATIONS
  ========================================================= */

  const durations = [
    {
      label: "3 min",
      value: 3,
      seconds: 180,
    },
    {
      label: "5 min",
      value: 5,
      seconds: 300,
    },
    {
      label: "10 min",
      value: 10,
      seconds: 600,
    },
    {
      label: "15 min",
      value: 15,
      seconds: 900,
    },
    {
      label: "20 min",
      value: 20,
      seconds: 1200,
    },
  ];

  /* =========================================================
     ENERGY CALCULATION
  ========================================================= */

  const calculateEnergyLevel = (
    actualElapsedMs: number,
    targetDurationMinutes: number,
  ) => {
    const targetMs = targetDurationMinutes * 60 * 1000;

    if (targetMs <= 0 || actualElapsedMs <= 0) {
      return 1;
    }

    if (actualElapsedMs >= targetMs) {
      return 100;
    }

    /*
      Linear energy based on the percentage of the selected
      meditation that was actually completed.

      15 / 15 = 100
      12 / 15 = 80
       7 / 15 = 46
       5 / 10 = 50
    */
    return Math.min(
      99,
      Math.max(1, Math.floor((actualElapsedMs / targetMs) * 100)),
    );
  };

  /* =========================================================
     SAVE MEDITATION
  ========================================================= */

  const saveInProgressRef = useRef(false);

  const saveMeditation = async (
    actualElapsedMs: number,
    targetDurationMinutes: number,
  ) => {
    if (saveInProgressRef.current || actualElapsedMs <= 0) {
      return;
    }

    saveInProgressRef.current = true;
    setIsSaving(true);
    setSaveMessage(null);

    const targetMs = targetDurationMinutes * 60 * 1000;
    const boundedElapsedMs = Math.min(Math.max(0, actualElapsedMs), targetMs);

    /* duration is stored in minutes because the current DB column is INTEGER. */
    const actualDurationMinutes = Math.max(
      1,
      Math.floor(boundedElapsedMs / 60000),
    );

    const completed = boundedElapsedMs >= targetMs;
    const energyLevel = calculateEnergyLevel(
      boundedElapsedMs,
      targetDurationMinutes,
    );

    try {
      /*
        One POST = one meditation session + one activity_history row
        through the dedicated backend meditation route.
      */
      await apiFetch("/api/data/meditation_sessions", {
        method: "POST",
        body: JSON.stringify({
          duration: actualDurationMinutes,
          completed,
          energy_level: energyLevel,
        }),
      });

      setSaveMessage(`Meditation saved · ${energyLevel}/100 energy`);

      console.log("[MEDITATION] saved", {
        selectedDuration: targetDurationMinutes,
        actualDurationMinutes,
        actualElapsedSeconds: Math.floor(boundedElapsedMs / 1000),
        completed,
        energyLevel,
      });
    } catch (error) {
      console.error("Failed to save meditation:", error);
      setSaveMessage(
        error instanceof Error
          ? `Could not save meditation: ${error.message}`
          : "Could not save meditation.",
      );
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  };

  /* =========================================================
     FINALIZE MEDITATION
  ========================================================= */

  const finalizeSession = async () => {
    if (isFinalizedRef.current || saveInProgressRef.current) {
      return;
    }

    isFinalizedRef.current = true;

    /* Capture the exact active segment before stopping the timer. */
    if (endTimeRef.current !== null) {
      const remainingMs = Math.max(0, endTimeRef.current - Date.now());

      const activeSegmentMs = Math.max(
        0,
        segmentStartRemainingMsRef.current - remainingMs,
      );

      elapsedMsRef.current += activeSegmentMs;
    }

    const durationMs = selectedDuration * 60 * 1000;
    const actualElapsedMs = Math.min(elapsedMsRef.current, durationMs);

    const completed = actualElapsedMs >= durationMs;
    const energyLevel = calculateEnergyLevel(actualElapsedMs, selectedDuration);

    console.log("[MEDITATION] finalizing", {
      selectedDuration,
      elapsedMs: actualElapsedMs,
      completed,
      energyLevel,
    });

    setTimeLeft(
      completed
        ? 0
        : Math.max(0, Math.ceil((durationMs - actualElapsedMs) / 1000)),
    );

    setIsActive(false);
    endTimeRef.current = null;
    segmentStartRemainingMsRef.current = 0;
    pausedRemainingMsRef.current = null;

    if (timerFrameRef.current) {
      cancelAnimationFrame(timerFrameRef.current);
      timerFrameRef.current = null;
    }

    if (actualElapsedMs <= 0) {
      setSaveMessage("Start the meditation before saving.");
      return;
    }

    await saveMeditation(actualElapsedMs, selectedDuration);

    if (completed) {
      setTimeLeft(0);
    }
  };

  /* =========================================================
     ACCURATE TIMER
  ========================================================= */

  useEffect(() => {
    if (!isActive) {
      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current);

        timerFrameRef.current = null;
      }

      return;
    }

    /*
      Use a real timestamp instead of
      subtracting 1 every second.
    */
    segmentStartRemainingMsRef.current =
      pausedRemainingMsRef.current ?? timeLeft * 1000;

    pausedRemainingMsRef.current = null;

    endTimeRef.current = Date.now() + segmentStartRemainingMsRef.current;

    const updateTimer = () => {
      if (endTimeRef.current === null) {
        return;
      }

      const remainingMs = endTimeRef.current - Date.now();

      if (remainingMs <= 0) {
        setTimeLeft(0);
        finalizeSession();
        return;
      }

      const remainingSeconds = Math.ceil(remainingMs / 1000);

      if (remainingSeconds !== lastDisplayedSecondRef.current) {
        lastDisplayedSecondRef.current = remainingSeconds;

        setTimeLeft(remainingSeconds);
      }

      timerFrameRef.current = requestAnimationFrame(updateTimer);
    };

    timerFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current);

        timerFrameRef.current = null;
      }
    };
  }, [isActive]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    const durationSeconds = selectedDuration * 60;

    if (!durationSeconds) {
      return 0;
    }

    return ((durationSeconds - timeLeft) / durationSeconds) * 100;
  };

  /* =========================================================
     DURATION
  ========================================================= */

  const handleDurationSelect = (duration: (typeof durations)[number]) => {
    if (isActive || isSaving) {
      return;
    }

    if (timerFrameRef.current) {
      cancelAnimationFrame(timerFrameRef.current);
      timerFrameRef.current = null;
    }

    setSelectedDuration(duration.value);
    setTimeLeft(duration.seconds);

    elapsedMsRef.current = 0;
    segmentStartRemainingMsRef.current = 0;
    pausedRemainingMsRef.current = null;
    endTimeRef.current = null;

    isFinalizedRef.current = false;
    lastDisplayedSecondRef.current = duration.seconds;
    setSaveMessage(null);
  };

  /* =========================================================
     TIMER TOGGLE
  ========================================================= */

  const toggleTimer = () => {
    /* ---------------- PAUSE ---------------- */

    if (isActive) {
      if (endTimeRef.current !== null) {
        const remainingMs = Math.max(0, endTimeRef.current - Date.now());

        const activeSegmentMs = Math.max(
          0,
          segmentStartRemainingMsRef.current - remainingMs,
        );

        elapsedMsRef.current += activeSegmentMs;
        pausedRemainingMsRef.current = remainingMs;

        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

        setTimeLeft(remainingSeconds);
        lastDisplayedSecondRef.current = remainingSeconds;
      }

      endTimeRef.current = null;
      segmentStartRemainingMsRef.current = 0;
      setIsActive(false);
      return;
    }

    /* ---------------- START / RESUME ---------------- */

    if (timeLeft <= 0 || isSaving) {
      return;
    }

    isFinalizedRef.current = false;
    setSaveMessage(null);

    if (pausedRemainingMsRef.current === null && elapsedMsRef.current === 0) {
      setTimeLeft(selectedDuration * 60);
      lastDisplayedSecondRef.current = selectedDuration * 60;
    }

    setIsActive(true);
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetTimer = () => {
    if (isSaving) {
      return;
    }

    setIsActive(false);

    if (timerFrameRef.current) {
      cancelAnimationFrame(timerFrameRef.current);
      timerFrameRef.current = null;
    }

    const duration = durations.find((item) => item.value === selectedDuration);

    const resetSeconds = duration?.seconds ?? 300;

    setTimeLeft(resetSeconds);

    elapsedMsRef.current = 0;
    segmentStartRemainingMsRef.current = 0;
    pausedRemainingMsRef.current = null;
    endTimeRef.current = null;

    isFinalizedRef.current = false;
    lastDisplayedSecondRef.current = resetSeconds;
    setSaveMessage(null);
  };

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current);
      }
    };
  }, []);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="
        min-h-screen
        relative
        overflow-hidden
        text-[hsl(var(--foreground))]
        transition-colors
        duration-500
      "
      style={{
        /*
          This respects the active preset's
          --background while still allowing
          custom primary colors to influence
          the meditation atmosphere.
        */
        background: `
          radial-gradient(
            circle at 10% 5%,
            color-mix(
              in srgb,
              hsl(var(--primary))
              16%,
              transparent
            ),
            transparent 30%
          ),
          radial-gradient(
            circle at 90% 90%,
            color-mix(
              in srgb,
              hsl(var(--accent))
              12%,
              transparent
            ),
            transparent 32%
          ),
          hsl(var(--background))
        `,
      }}
    >
      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ===================================================== */}

      <div
        className="
          absolute
          inset-0
          pointer-events-none
        "
      >
        <div
          className="
            absolute
            -top-40
            -left-40
            w-[500px]
            h-[500px]
            rounded-full
            blur-[120px]
          "
          style={{
            backgroundColor:
              "color-mix(in srgb, hsl(var(--primary)) 12%, transparent)",
          }}
        />

        <div
          className="
            absolute
            top-1/2
            -right-40
            w-[500px]
            h-[500px]
            rounded-full
            blur-[120px]
          "
          style={{
            backgroundColor:
              "color-mix(in srgb, hsl(var(--accent)) 10%, transparent)",
          }}
        />

        <div
          className="
            absolute
            -bottom-40
            left-1/3
            w-[450px]
            h-[450px]
            rounded-full
            blur-[120px]
          "
          style={{
            backgroundColor:
              "color-mix(in srgb, hsl(var(--primary)) 6%, transparent)",
          }}
        />
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        className="
          relative
          min-h-screen
          flex
          items-center
          justify-center
          p-4
          sm:p-6
        "
      >
        <div
          className="
            w-full
            max-w-[520px]
            min-h-[450px]
            relative
            overflow-hidden
            rounded-[32px]
            backdrop-blur-2xl
            transition-all
            duration-500
          "
          style={{
            backgroundColor:
              "color-mix(in srgb, hsl(var(--card)) 82%, transparent)",

            border:
              "1px solid color-mix(in srgb, hsl(var(--primary)) 28%, transparent)",

            boxShadow:
              "0 0 80px color-mix(in srgb, hsl(var(--primary)) 14%, transparent)",
          }}
        >
          {/* Card glow */}

          <div
            className="
              absolute
              inset-0
              pointer-events-none
            "
            style={{
              background: `
                linear-gradient(
                  135deg,
                  color-mix(
                    in srgb,
                    hsl(var(--primary))
                    7%,
                    transparent
                  ),
                  transparent 50%,
                  color-mix(
                    in srgb,
                    hsl(var(--accent))
                    6%,
                    transparent
                  )
                )
              `,
            }}
          />

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              relative
              z-20
              flex
              items-center
              justify-between
              px-5
              sm:px-6
              pt-5
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  w-9
                  h-9
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                "
                style={{
                  backgroundColor:
                    "color-mix(in srgb, hsl(var(--primary)) 10%, transparent)",

                  border:
                    "1px solid color-mix(in srgb, hsl(var(--primary)) 25%, transparent)",

                  boxShadow:
                    "0 0 25px color-mix(in srgb, hsl(var(--primary)) 18%, transparent)",
                }}
              >
                <div
                  className="text-xl"
                  style={{
                    color: "hsl(var(--primary))",
                  }}
                >
                  〰
                </div>
              </div>

              <div>
                <h1
                  className="
                    text-xl
                    sm:text-2xl
                    font-semibold
                    tracking-tight
                  "
                  style={{
                    color: "hsl(var(--foreground))",
                  }}
                >
                  Focus Timer
                </h1>

                <p
                  className="text-sm"
                  style={{
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  Flow. Focus. Finish.
                </p>
              </div>
            </div>

            <button
              className="
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                transition
              "
              style={{
                color: "hsl(var(--muted-foreground))",
              }}
            >
              <MoreVertical size={20} />
            </button>
          </div>

          {/* =================================================
              CONSISTENCY

              Kept behind the timer so it can
              never cover the timer content.
          ================================================= */}

          <div
            className="
              absolute
              top-[86px]
              right-5
              sm:right-8
              hidden
              lg:block
              pointer-events-none
              z-0
              text-right
              uppercase
              tracking-[0.18em]
              text-[9px]
              leading-5
            "
            style={{
              color: "color-mix(in srgb, hsl(var(--primary)) 45%, transparent)",
            }}
          >
            <p>Good</p>
            <p>Things</p>
            <p>Take</p>

            <p
              className="font-medium"
              style={{
                color:
                  "color-mix(in srgb, hsl(var(--accent)) 78%, transparent)",
              }}
            >
              Consistency.
            </p>

            <div
              className="
                w-9
                h-[2px]
                mt-2
                ml-auto
              "
              style={{
                backgroundColor: "hsl(var(--primary))",

                boxShadow: "0 0 10px hsl(var(--primary))",
              }}
            />
          </div>

          {/* =================================================
              TIMER
          ================================================= */}

          <div
            className="
              relative
              z-10
              flex
              flex-col
              items-center
              mt-16
              sm:mt-20
            "
          >
            <div className="relative">
              {/* Outer glow */}

              <div
                className="
                  absolute
                  inset-[-20px]
                  rounded-full
                  blur-3xl
                  transition-all
                  duration-700
                "
                style={{
                  backgroundColor:
                    "color-mix(in srgb, hsl(var(--primary)) 10%, transparent)",

                  opacity: isActive ? 1 : 0.6,

                  transform: isActive ? "scale(1.1)" : "scale(1)",
                }}
              />

              {/* Timer ring */}

              <div
                className="
                  relative
                  w-48
                  h-48
                  sm:w-52
                  sm:h-52
                  rounded-full
                  p-[3px]
                "
                style={{
                  background: `linear-gradient(
                      90deg,
                      hsl(var(--primary)),
                      hsl(var(--accent)),
                      hsl(var(--primary))
                    )`,

                  boxShadow:
                    "0 0 50px color-mix(in srgb, hsl(var(--primary)) 32%, transparent)",
                }}
              >
                {/* Inner circle */}

                <div
                  className="
                    absolute
                    inset-2
                    rounded-full
                  "
                  style={{
                    backgroundColor: "hsl(var(--background))",

                    border:
                      "1px solid color-mix(in srgb, hsl(var(--primary)) 18%, transparent)",
                  }}
                />

                {/* Progress ring */}

                <div
                  className="
                    absolute
                    inset-0
                    rounded-full
                    opacity-80
                  "
                  style={{
                    background: `conic-gradient(
                        from 0deg,
                        hsl(var(--primary))
                        ${getProgress()}%,
                        transparent
                        ${getProgress()}%
                      )`,

                    mask: "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 0)",

                    WebkitMask:
                      "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 0)",
                  }}
                />

                {/* Timer text */}

                <div
                  className="
                    absolute
                    inset-0
                    flex
                    flex-col
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      text-4xl
                      sm:text-5xl
                      font-mono
                      font-medium
                      tracking-tight
                    "
                    style={{
                      color: "hsl(var(--foreground))",

                      textShadow: isActive
                        ? "0 0 15px color-mix(in srgb, hsl(var(--primary)) 70%, transparent)"
                        : "none",
                    }}
                  >
                    {formatTime(timeLeft)}
                  </div>

                  <div
                    className="
                      mt-2
                      text-sm
                    "
                    style={{
                      color: "hsl(var(--primary))",
                    }}
                  >
                    {isActive ? "Focus..." : "Ready"}
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                CONTROLS
            ================================================= */}

            <div
              className="
                flex
                items-center
                gap-4
                mt-[-5px]
              "
            >
              {/* Play / Pause */}

              <button
                onClick={toggleTimer}
                className="
                  w-13
                  h-13
                  sm:w-14
                  sm:h-14
                  rounded-full
                  flex
                  items-center
                  justify-center
                  border
                  hover:scale-105
                  transition-all
                "
                style={{
                  background: `linear-gradient(
                      135deg,
                      hsl(var(--primary)),
                      hsl(var(--accent))
                    )`,

                  color: "hsl(var(--primary-foreground))",

                  borderColor:
                    "color-mix(in srgb, hsl(var(--primary)) 45%, transparent)",

                  boxShadow:
                    "0 0 35px color-mix(in srgb, hsl(var(--primary)) 40%, transparent)",
                }}
              >
                {isActive ? (
                  <Pause size={28} fill="currentColor" />
                ) : (
                  <Play size={28} fill="currentColor" className="ml-1" />
                )}
              </button>

              {/* Reset */}

              <button
                onClick={resetTimer}
                className="
                  w-13
                  h-13
                  sm:w-14
                  sm:h-14
                  rounded-full
                  flex
                  items-center
                  justify-center
                  border
                  hover:scale-105
                  transition-all
                "
                style={{
                  backgroundColor:
                    "color-mix(in srgb, hsl(var(--background)) 88%, hsl(var(--primary)))",

                  color: "hsl(var(--foreground))",

                  borderColor:
                    "color-mix(in srgb, hsl(var(--primary)) 28%, transparent)",
                }}
              >
                <RotateCcw size={25} />
              </button>

              {/* Complete */}

              <button
                onClick={finalizeSession}
                disabled={
                  isSaving || (timeLeft <= 0 && elapsedMsRef.current <= 0)
                }
                className="
                  w-13
                  h-13
                  sm:w-14
                  sm:h-14
                  rounded-full
                  flex
                  items-center
                  justify-center
                  border-2
                  hover:scale-105
                  transition-all
                "
                style={{
                  backgroundColor:
                    "color-mix(in srgb, hsl(var(--background)) 92%, #22c55e)",

                  borderColor: "#34d399",

                  color: "#34d399",

                  boxShadow: "0 0 25px rgba(52,211,153,0.2)",
                }}
              >
                <Check size={29} />
              </button>
            </div>

            <div className="min-h-8 px-5 text-center mt-3">
              {isSaving ? (
                <p
                  className="text-xs"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  Saving your meditation...
                </p>
              ) : saveMessage ? (
                <p className="text-xs" style={{ color: "hsl(var(--primary))" }}>
                  {saveMessage}
                </p>
              ) : (
                <p
                  className="text-xs"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  Complete the session to save your meditation energy.
                </p>
              )}
            </div>

            {/* =================================================
                DURATION BUTTONS
            ================================================= */}

            <div
              className="
                flex
                flex-wrap
                justify-center
                gap-3
                mt-3
                mb-3
                px-4
              "
            >
              {durations.map((duration) => {
                const selected = selectedDuration === duration.value;

                return (
                  <button
                    key={duration.value}
                    onClick={() => handleDurationSelect(duration)}
                    className="
                        min-w-[60px]
                        sm:min-w-[72px]
                        px-5
                        py-3
                        rounded-full
                        text-sm
                        font-medium
                        transition-all
                        border
                      "
                    style={{
                      background: selected
                        ? `linear-gradient(
                                90deg,
                                hsl(var(--primary)),
                                hsl(var(--accent))
                              )`
                        : "color-mix(in srgb, hsl(var(--background)) 86%, hsl(var(--primary)))",

                      borderColor: selected
                        ? "color-mix(in srgb, hsl(var(--primary)) 48%, transparent)"
                        : "color-mix(in srgb, hsl(var(--primary)) 20%, transparent)",

                      color: selected
                        ? "hsl(var(--primary-foreground))"
                        : "hsl(var(--muted-foreground))",

                      boxShadow: selected
                        ? "0 0 25px color-mix(in srgb, hsl(var(--primary)) 30%, transparent)"
                        : "none",
                    }}
                  >
                    {duration.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationScreen;
