import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  MoreVertical,
  Volume2,
  VolumeX,
  Music2,
} from "lucide-react";
import { supabase } from "@/supabaseClient";

/* =========================================================
   TYPES
========================================================= */

type Music = {
  id: string;
  title: string;
  audio_url: string;
};

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

  const meditationIdRef =
    useRef<string | null>(null);

  const hasCompletedRef =
    useRef(false);

  const endTimeRef =
    useRef<number | null>(null);

  const timerFrameRef =
    useRef<number | null>(null);

  const lastDisplayedSecondRef =
    useRef(300);

  /* =========================================================
     MUSIC
  ========================================================= */

  const [musicList, setMusicList] =
    useState<Music[]>([]);

  const [selectedMusic, setSelectedMusic] =
    useState<Music | null>(null);

  const [isMusicPlaying, setIsMusicPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const [musicLoading, setMusicLoading] =
    useState(false);

  /* =========================================================
     WAVEFORM
  ========================================================= */

  const [waveform, setWaveform] =
    useState<number[]>(
      Array(96).fill(0.12)
    );

  /* =========================================================
     AUDIO REFS
  ========================================================= */

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const analyserRef =
    useRef<AnalyserNode | null>(null);

  const sourceRef =
    useRef<MediaElementAudioSourceNode | null>(null);

  const audioFrameRef =
    useRef<number | null>(null);

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
     FETCH MUSIC
  ========================================================= */

  useEffect(() => {
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    setMusicLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("music")
      .select("id, title, audio_url")
      .order("title", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Failed to fetch music:",
        error
      );

      setMusicLoading(false);
      return;
    }

    setMusicList(data ?? []);

    if (
      data &&
      data.length > 0
    ) {
      setSelectedMusic(data[0]);
    }

    setMusicLoading(false);
  };

  /* =========================================================
     START MEDITATION
  ========================================================= */

  const startMeditation = async () => {
    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      console.error(
        "No authenticated user found."
      );

      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("meditation")
      .insert({
        user_id: user.id,
        duration: selectedDuration,
        completed: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        "Insert failed:",
        error
      );

      return;
    }

    meditationIdRef.current =
      data.id;
  };

  /* =========================================================
     COMPLETE MEDITATION
  ========================================================= */

  const markCompleted = async () => {
    if (
      hasCompletedRef.current
    ) {
      return;
    }

    hasCompletedRef.current =
      true;

    setIsActive(false);

    endTimeRef.current =
      null;

    if (timerFrameRef.current) {
      cancelAnimationFrame(
        timerFrameRef.current
      );

      timerFrameRef.current =
        null;
    }

    stopMusic();

    if (
      !meditationIdRef.current
    ) {
      return;
    }

    const {
      error,
    } = await supabase
      .from("meditation")
      .update({
        completed: true,
      })
      .eq(
        "id",
        meditationIdRef.current
      );

    if (error) {
      console.error(
        "Completion update failed:",
        error
      );
    }
  };

  /* =========================================================
     ACCURATE TIMER
  ========================================================= */

  useEffect(() => {
    if (!isActive) {
      if (timerFrameRef.current) {
        cancelAnimationFrame(
          timerFrameRef.current
        );

        timerFrameRef.current =
          null;
      }

      return;
    }

    /*
      Use a real timestamp instead of
      subtracting 1 every second.
    */
    endTimeRef.current =
      Date.now() +
      timeLeft * 1000;

    const updateTimer = () => {
      if (
        !endTimeRef.current
      ) {
        return;
      }

      const remainingMs =
        endTimeRef.current -
        Date.now();

      if (remainingMs <= 0) {
        setTimeLeft(0);
        markCompleted();
        return;
      }

      const remainingSeconds =
        Math.ceil(
          remainingMs / 1000
        );

      if (
        remainingSeconds !==
        lastDisplayedSecondRef.current
      ) {
        lastDisplayedSecondRef.current =
          remainingSeconds;

        setTimeLeft(
          remainingSeconds
        );
      }

      timerFrameRef.current =
        requestAnimationFrame(
          updateTimer
        );
    };

    timerFrameRef.current =
      requestAnimationFrame(
        updateTimer
      );

    return () => {
      if (
        timerFrameRef.current
      ) {
        cancelAnimationFrame(
          timerFrameRef.current
        );

        timerFrameRef.current =
          null;
      }
    };
  }, [isActive]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatTime = (
    seconds: number
  ) => {
    const mins = Math.floor(
      seconds / 60
    );

    const secs =
      seconds % 60;

    return `${mins}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = () => {
    const durationSeconds =
      selectedDuration * 60;

    if (!durationSeconds) {
      return 0;
    }

    return (
      ((durationSeconds -
        timeLeft) /
        durationSeconds) *
      100
    );
  };

  /* =========================================================
     AUDIO ANALYSER
  ========================================================= */

  const createAudioAnalyser =
    () => {
      if (!audioRef.current) {
        return;
      }

      /*
        Do not create the same
        MediaElementSource twice.
      */
      if (
        audioContextRef.current &&
        analyserRef.current &&
        sourceRef.current
      ) {
        return;
      }

      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        console.error(
          "Web Audio API is not supported."
        );

        return;
      }

      const context =
        new AudioContextClass();

      const analyser =
        context.createAnalyser();

      analyser.fftSize = 256;

      analyser.smoothingTimeConstant =
        0.8;

      const source =
        context.createMediaElementSource(
          audioRef.current
        );

      source.connect(analyser);
      analyser.connect(
        context.destination
      );

      audioContextRef.current =
        context;

      analyserRef.current =
        analyser;

      sourceRef.current =
        source;
    };

  /* =========================================================
     AUDIO WAVEFORM
  ========================================================= */

  const updateWaveform = () => {
    const analyser =
      analyserRef.current;

    if (
      !analyser ||
      !isMusicPlaying
    ) {
      return;
    }

    const bufferLength =
      analyser.frequencyBinCount;

    const dataArray =
      new Uint8Array(
        bufferLength
      );

    analyser.getByteFrequencyData(
      dataArray
    );

    const barCount = 96;

    const nextWaveform: number[] =
      [];

    for (
      let i = 0;
      i < barCount;
      i++
    ) {
      const start =
        Math.floor(
          (i / barCount) *
            bufferLength
        );

      const end =
        Math.floor(
          ((i + 1) / barCount) *
            bufferLength
        );

      let sum = 0;
      let count = 0;

      for (
        let j = start;
        j < end;
        j++
      ) {
        sum += dataArray[j];
        count++;
      }

      const average =
        count > 0
          ? sum / count / 255
          : 0;

      nextWaveform.push(
        0.08 +
        Math.min(1, average) *
          0.92
      );
    }

    setWaveform(
      nextWaveform
    );

    audioFrameRef.current =
      requestAnimationFrame(
        updateWaveform
      );
  };

  useEffect(() => {
    if (!isMusicPlaying) {
      if (
        audioFrameRef.current
      ) {
        cancelAnimationFrame(
          audioFrameRef.current
        );

        audioFrameRef.current =
          null;
      }

      setWaveform(
        Array(96).fill(
          0.12
        )
      );

      return;
    }

    updateWaveform();

    return () => {
      if (
        audioFrameRef.current
      ) {
        cancelAnimationFrame(
          audioFrameRef.current
        );

        audioFrameRef.current =
          null;
      }
    };
  }, [isMusicPlaying]);

  /* =========================================================
     LOAD SELECTED MUSIC
  ========================================================= */

  useEffect(() => {
    if (!selectedMusic) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio =
      new Audio(
        selectedMusic.audio_url
      );

    audio.preload = "auto";
    audio.loop = true;
    audio.muted = isMuted;

    audio.addEventListener(
      "error",
      (event) => {
        console.error(
          "Audio loading failed:",
          event
        );
      }
    );

    audioRef.current =
      audio;

    setIsMusicPlaying(false);

    setWaveform(
      Array(96).fill(0.12)
    );

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [selectedMusic]);

  /* =========================================================
     MUSIC
  ========================================================= */

  const startMusic = async () => {
    if (!audioRef.current) {
      return;
    }

    createAudioAnalyser();

    if (
      audioContextRef.current?.state ===
      "suspended"
    ) {
      await audioContextRef.current.resume();
    }

    try {
      await audioRef.current.play();
      setIsMusicPlaying(true);
    } catch (error) {
      console.error(
        "Music playback failed:",
        error
      );
    }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) {
      return;
    }

    if (
      audioRef.current.paused
    ) {
      await startMusic();
    } else {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  };

  const stopMusic = () => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();

    setIsMusicPlaying(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) {
      return;
    }

    const nextMuted =
      !audioRef.current.muted;

    audioRef.current.muted =
      nextMuted;

    setIsMuted(
      nextMuted
    );
  };

  /* =========================================================
     SELECT MUSIC
  ========================================================= */

  const handleMusicSelect = (
    music: Music
  ) => {
    if (
      selectedMusic?.id ===
      music.id
    ) {
      return;
    }

    stopMusic();

    setSelectedMusic(
      music
    );
  };

  /* =========================================================
     DURATION
  ========================================================= */

  const handleDurationSelect = (
    duration: (typeof durations)[number]
  ) => {
    setIsActive(false);

    if (timerFrameRef.current) {
      cancelAnimationFrame(
        timerFrameRef.current
      );

      timerFrameRef.current =
        null;
    }

    setSelectedDuration(
      duration.value
    );

    setTimeLeft(
      duration.seconds
    );

    meditationIdRef.current =
      null;

    hasCompletedRef.current =
      false;

    endTimeRef.current =
      null;

    lastDisplayedSecondRef.current =
      duration.seconds;
  };

  /* =========================================================
     TIMER TOGGLE
  ========================================================= */

  const toggleTimer = () => {
    /* ---------------- PAUSE ---------------- */

    if (isActive) {
      if (
        endTimeRef.current
      ) {
        const remainingMs =
          endTimeRef.current -
          Date.now();

        const remainingSeconds =
          Math.max(
            0,
            Math.ceil(
              remainingMs /
                1000
            )
          );

        setTimeLeft(
          remainingSeconds
        );

        lastDisplayedSecondRef.current =
          remainingSeconds;
      }

      endTimeRef.current =
        null;

      setIsActive(false);

      stopMusic();

      return;
    }

    /* ---------------- START ---------------- */

    if (timeLeft <= 0) {
      return;
    }

    hasCompletedRef.current =
      false;

    /*
      UI timer starts immediately.
      Supabase does not block it.
    */
    setIsActive(true);

    if (
      !meditationIdRef.current
    ) {
      startMeditation();
    }

    if (audioRef.current) {
      startMusic();
    }
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetTimer = () => {
    setIsActive(false);

    if (timerFrameRef.current) {
      cancelAnimationFrame(
        timerFrameRef.current
      );

      timerFrameRef.current =
        null;
    }

    const duration =
      durations.find(
        (item) =>
          item.value ===
          selectedDuration
      );

    const resetSeconds =
      duration?.seconds ?? 300;

    setTimeLeft(
      resetSeconds
    );

    meditationIdRef.current =
      null;

    hasCompletedRef.current =
      false;

    endTimeRef.current =
      null;

    lastDisplayedSecondRef.current =
      resetSeconds;

    stopMusic();

    if (audioRef.current) {
      audioRef.current.currentTime =
        0;
    }
  };

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      if (
        timerFrameRef.current
      ) {
        cancelAnimationFrame(
          timerFrameRef.current
        );
      }

      if (
        audioFrameRef.current
      ) {
        cancelAnimationFrame(
          audioFrameRef.current
        );
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (
        audioContextRef.current
      ) {
        audioContextRef.current.close();
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
                    color:
                      "hsl(var(--primary))",
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
                    color:
                      "hsl(var(--foreground))",
                  }}
                >
                  Focus Timer
                </h1>

                <p
                  className="text-sm"
                  style={{
                    color:
                      "hsl(var(--muted-foreground))",
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
                color:
                  "hsl(var(--muted-foreground))",
              }}
            >
              <MoreVertical
                size={20}
              />
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
              color:
                "color-mix(in srgb, hsl(var(--primary)) 45%, transparent)",
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
                backgroundColor:
                  "hsl(var(--primary))",

                boxShadow:
                  "0 0 10px hsl(var(--primary))",
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

                  opacity:
                    isActive
                      ? 1
                      : 0.6,

                  transform:
                    isActive
                      ? "scale(1.1)"
                      : "scale(1)",
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
                  background:
                    `linear-gradient(
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
                    backgroundColor:
                      "hsl(var(--background))",

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
                    background:
                      `conic-gradient(
                        from 0deg,
                        hsl(var(--primary))
                        ${getProgress()}%,
                        transparent
                        ${getProgress()}%
                      )`,

                    mask:
                      "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 0)",

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
                      color:
                        "hsl(var(--foreground))",

                      textShadow:
                        isActive
                          ? "0 0 15px color-mix(in srgb, hsl(var(--primary)) 70%, transparent)"
                          : "none",
                    }}
                  >
                    {formatTime(
                      timeLeft
                    )}
                  </div>

                  <div
                    className="
                      mt-2
                      text-sm
                    "
                    style={{
                      color:
                        "hsl(var(--primary))",
                    }}
                  >
                    {isActive
                      ? "Focus..."
                      : "Ready"}
                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                AUDIO WAVEFORM
            ================================================= */}

            <div
              className="
                w-full
                max-w-[480px]
                h-20
                mt-[-8px]
                relative
                overflow-hidden
              "
            >

              {/* Ambient glow */}

              <div
                className="
                  absolute
                  inset-0
                  blur-2xl
                  transition-opacity
                  duration-500
                "
                style={{
                  backgroundColor:
                    "color-mix(in srgb, hsl(var(--primary)) 8%, transparent)",

                  opacity:
                    isMusicPlaying
                      ? 1
                      : 0.4,
                }}
              />

              {/* Center line */}

              <div
                className="
                  absolute
                  inset-x-0
                  top-1/2
                  h-px
                "
                style={{
                  background:
                    `linear-gradient(
                      to right,
                      transparent,
                      hsl(var(--primary)),
                      transparent
                    )`,

                  boxShadow:
                    "0 0 15px hsl(var(--primary))",
                }}
              />

              {/* Bars */}

              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  gap-[2px]
                  px-2
                "
              >

                {waveform.map(
                  (
                    height,
                    index
                  ) => {

                    const centerDistance =
                      Math.abs(
                        index -
                          waveform.length /
                            2
                      ) /
                      (waveform.length /
                        2);

                    const scale =
                      1 -
                      centerDistance *
                        0.2;

                    const finalHeight =
                      Math.max(
                        4,
                        height *
                          54 *
                          scale
                      );

                    return (
                      <div
                        key={index}
                        className="
                          flex-1
                          max-w-[4px]
                          rounded-full
                        "
                        style={{
                          height:
                            `${finalHeight}px`,

                          opacity:
                            isMusicPlaying
                              ? 0.95
                              : 0.3,

                          background:
                            `linear-gradient(
                              to top,
                              hsl(var(--primary)),
                              hsl(var(--accent))
                            )`,

                          boxShadow:
                            "0 0 8px color-mix(in srgb, hsl(var(--primary)) 65%, transparent)",

                          transition:
                            "height 60ms linear",
                        }}
                      />
                    );
                  }
                )}

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
                onClick={
                  toggleTimer
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
                  border
                  hover:scale-105
                  transition-all
                "
                style={{
                  background:
                    `linear-gradient(
                      135deg,
                      hsl(var(--primary)),
                      hsl(var(--accent))
                    )`,

                  color:
                    "hsl(var(--primary-foreground))",

                  borderColor:
                    "color-mix(in srgb, hsl(var(--primary)) 45%, transparent)",

                  boxShadow:
                    "0 0 35px color-mix(in srgb, hsl(var(--primary)) 40%, transparent)",
                }}
              >

                {isActive ? (
                  <Pause
                    size={28}
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    size={28}
                    fill="currentColor"
                    className="ml-1"
                  />
                )}

              </button>

              {/* Reset */}

              <button
                onClick={
                  resetTimer
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
                  border
                  hover:scale-105
                  transition-all
                "
                style={{
                  backgroundColor:
                    "color-mix(in srgb, hsl(var(--background)) 88%, hsl(var(--primary)))",

                  color:
                    "hsl(var(--foreground))",

                  borderColor:
                    "color-mix(in srgb, hsl(var(--primary)) 28%, transparent)",
                }}
              >

                <RotateCcw
                  size={25}
                />

              </button>

              {/* Complete */}

              <button
                onClick={
                  markCompleted
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

                  borderColor:
                    "#34d399",

                  color:
                    "#34d399",

                  boxShadow:
                    "0 0 25px rgba(52,211,153,0.2)",
                }}
              >

                <Check
                  size={29}
                />

              </button>

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

              {durations.map(
                (duration) => {

                  const selected =
                    selectedDuration ===
                    duration.value;

                  return (
                    <button
                      key={
                        duration.value
                      }
                      onClick={() =>
                        handleDurationSelect(
                          duration
                        )
                      }
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
                        background:
                          selected
                            ? `linear-gradient(
                                90deg,
                                hsl(var(--primary)),
                                hsl(var(--accent))
                              )`
                            : "color-mix(in srgb, hsl(var(--background)) 86%, hsl(var(--primary)))",

                        borderColor:
                          selected
                            ? "color-mix(in srgb, hsl(var(--primary)) 48%, transparent)"
                            : "color-mix(in srgb, hsl(var(--primary)) 20%, transparent)",

                        color:
                          selected
                            ? "hsl(var(--primary-foreground))"
                            : "hsl(var(--muted-foreground))",

                        boxShadow:
                          selected
                            ? "0 0 25px color-mix(in srgb, hsl(var(--primary)) 30%, transparent)"
                            : "none",
                      }}
                    >
                      {duration.label}
                    </button>
                  );
                }
              )}

            </div>

            {/* =================================================
                MUSIC SELECTOR
            ================================================= */}

            <div
              className="
                w-full
                px-5
                mt-2
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-2
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <Music2
                    size={14}
                    style={{
                      color:
                        "hsl(var(--primary))",
                    }}
                  />

                  <span
                    className="text-xs"
                    style={{
                      color:
                        "hsl(var(--muted-foreground))",
                    }}
                  >
                    Meditation Music
                  </span>

                </div>

                <button
                  onClick={
                    toggleMute
                  }
                  className="
                    transition
                  "
                  style={{
                    color:
                      "hsl(var(--muted-foreground))",
                  }}
                >
                  {isMuted ? (
                    <VolumeX
                      size={15}
                    />
                  ) : (
                    <Volume2
                      size={15}
                    />
                  )}
                </button>

              </div>

              {/* Music list */}

              <div
                className="
                  flex
                  gap-2
                  overflow-x-auto
                  pb-1
                  scrollbar-hide
                "
              >

                {musicLoading ? (
                  <div
                    className="text-xs"
                    style={{
                      color:
                        "hsl(var(--muted-foreground))",
                    }}
                  >
                    Loading music...
                  </div>
                ) : musicList.length ===
                  0 ? (
                  <div
                    className="text-xs"
                    style={{
                      color:
                        "hsl(var(--muted-foreground))",
                    }}
                  >
                    No music available
                  </div>
                ) : (
                  musicList.map(
                    (music) => {

                      const selected =
                        selectedMusic?.id ===
                        music.id;

                      return (
                        <button
                          key={
                            music.id
                          }
                          onClick={() =>
                            handleMusicSelect(
                              music
                            )
                          }
                          className="
                            shrink-0
                            px-4
                            py-2
                            rounded-full
                            text-xs
                            border
                            transition-all
                          "
                          style={{
                            background:
                              selected
                                ? "color-mix(in srgb, hsl(var(--primary)) 18%, transparent)"
                                : "color-mix(in srgb, hsl(var(--background)) 82%, transparent)",

                            borderColor:
                              selected
                                ? "color-mix(in srgb, hsl(var(--primary)) 55%, transparent)"
                                : "color-mix(in srgb, hsl(var(--primary)) 15%, transparent)",

                            color:
                              selected
                                ? "hsl(var(--foreground))"
                                : "hsl(var(--muted-foreground))",

                            boxShadow:
                              selected
                                ? "0 0 18px color-mix(in srgb, hsl(var(--primary)) 20%, transparent)"
                                : "none",
                          }}
                        >
                          {music.title}
                        </button>
                      );
                    }
                  )
                )}

              </div>

            </div>

            {/* =================================================
                CURRENT TRACK
            ================================================= */}

            {selectedMusic && (
              <div
                className="
                  mt-2
                  text-center
                "
              >

                <p
                  className="text-[11px]"
                  style={{
                    color:
                      "hsl(var(--muted-foreground))",
                  }}
                >
                  {isMusicPlaying
                    ? "♪ Playing"
                    : "♪ Paused"}
                </p>

                <p
                  className="
                    text-xs
                    mt-0.5
                  "
                  style={{
                    color:
                      "color-mix(in srgb, hsl(var(--primary)) 65%, transparent)",
                  }}
                >
                  {selectedMusic.title}
                </p>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default MeditationScreen;