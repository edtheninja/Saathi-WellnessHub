import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  Heart,
  ListMusic,
  Music2,
  Pause,
  Play,
  Repeat2,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";

import meditationGirl from "@/assets/meditation-girl-scene.png";

/* =========================================================
   LOCAL MUSIC
   - Reads public/Music/music.json first
   - Falls back to src/assets/Music
   ========================================================= */

const musicModules = import.meta.glob(
  "/src/assets/Music/*.{mp3,wav,ogg,m4a,webm}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
) as Record<string, string>;

type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
};

/* =========================================================
   HELPERS
   ========================================================= */

const createTrackId = (value: string) =>
  value
    .split("/")
    .pop()
    ?.replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "track";

const getTitle = (value: string) => {
  const fileName =
    value
      .split("/")
      .pop()
      ?.replace(/\.[^/.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim() || "Untitled";

  return fileName
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

/* =========================================================
   FLOWER ARTWORK
   ========================================================= */

const FlowerArtwork = () => (
  <svg
    viewBox="0 0 100 100"
    className="h-8 w-8"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="50"
      cy="50"
      r="10"
      fill="hsl(var(--primary))"
      opacity="0.9"
    />

    <g
      fill="hsl(var(--primary))"
      opacity="0.55"
    >
      <ellipse cx="50" cy="24" rx="10" ry="18" />
      <ellipse cx="50" cy="76" rx="10" ry="18" />
      <ellipse cx="24" cy="50" rx="18" ry="10" />
      <ellipse cx="76" cy="50" rx="18" ry="10" />

      <ellipse
        cx="32"
        cy="32"
        rx="10"
        ry="18"
        transform="rotate(-45 32 32)"
      />

      <ellipse
        cx="68"
        cy="32"
        rx="10"
        ry="18"
        transform="rotate(45 68 32)"
      />

      <ellipse
        cx="32"
        cy="68"
        rx="10"
        ry="18"
        transform="rotate(45 32 68)"
      />

      <ellipse
        cx="68"
        cy="68"
        rx="10"
        ry="18"
        transform="rotate(-45 68 68)"
      />
    </g>
  </svg>
);

/* =========================================================
   MUSIC SCREEN
   ========================================================= */

export default function MusicScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [libraryLoading, setLibraryLoading] =
    useState(true);

  const [currentTrackIndex, setCurrentTrackIndex] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(0.85);

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [isShuffled, setIsShuffled] =
    useState(false);

  const [isRepeated, setIsRepeated] =
    useState(false);

  const [search, setSearch] =
    useState("");

  /* =======================================================
     AUDIO REFS
     ======================================================= */

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const analyserRef =
    useRef<AnalyserNode | null>(null);

  const sourceNodeRef =
    useRef<MediaElementAudioSourceNode | null>(null);

  /* =======================================================
     WAVEFORM REFS
     ======================================================= */

  const waveformCanvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const waveformDataRef =
    useRef<Uint8Array | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const barValuesRef =
    useRef<number[]>([]);

  const targetValuesRef =
    useRef<number[]>([]);

  const currentTrack =
    tracks[currentTrackIndex];

  /* =======================================================
     LOAD MUSIC
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadMusic = async () => {
      setLibraryLoading(true);

      try {
        const response = await fetch(
          "/Music/music.json",
          {
            cache: "no-store",
          }
        );

        if (response.ok) {
          const files =
            await response.json();

          if (Array.isArray(files)) {
            const publicTracks: Track[] =
              files
                .filter(
                  (file): file is string =>
                    typeof file === "string" &&
                    /\.(mp3|wav|ogg|m4a|webm)$/i.test(
                      file
                    )
                )
                .map((file) => ({
                  id: createTrackId(file),
                  title: getTitle(file),
                  artist: "Saathi Music",
                  src: `/Music/${encodeURIComponent(
                    file
                  )}`,
                }))
                .sort((a, b) =>
                  a.title.localeCompare(
                    b.title
                  )
                );

            if (!cancelled) {
              setTracks(publicTracks);
              setCurrentTrackIndex(0);
            }

            return;
          }
        }
      } catch {
        // Fallback below.
      }

      const assetTracks: Track[] =
        Object.entries(musicModules)
          .map(([path, src]) => ({
            id: createTrackId(path),
            title: getTitle(path),
            artist: "Saathi Music",
            src,
          }))
          .sort((a, b) =>
            a.title.localeCompare(b.title)
          );

      if (!cancelled) {
        setTracks(assetTracks);
        setCurrentTrackIndex(0);
      }
    };

    loadMusic()
      .catch((error) => {
        console.error(
          "Music loading failed:",
          error
        );

        if (!cancelled) {
          setTracks([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLibraryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     AUDIO ELEMENT
     ======================================================= */

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload =
        "metadata";
    }

    return audioRef.current;
  }, []);

  /* =======================================================
     ANALYSER
     ======================================================= */

  const initializeAnalyser =
    useCallback(() => {
      const audio = getAudio();

      if (
        audioContextRef.current &&
        analyserRef.current
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
        return;
      }

      try {
        const context =
          new AudioContextClass();

        const analyser =
          context.createAnalyser();

        analyser.fftSize = 512;
        analyser.smoothingTimeConstant =
          0.9;

        const source =
          context.createMediaElementSource(
            audio
          );

        source.connect(analyser);
        analyser.connect(
          context.destination
        );

        audioContextRef.current =
          context;

        analyserRef.current =
          analyser;

        sourceNodeRef.current =
          source;

        waveformDataRef.current =
          new Uint8Array(
            analyser.frequencyBinCount
          );
      } catch (error) {
        console.warn(
          "Audio analyser initialization failed:",
          error
        );
      }
    }, [getAudio]);

  /* =======================================================
     LOAD CURRENT TRACK
     ======================================================= */

  useEffect(() => {
    if (!currentTrack) {
      return;
    }

    const audio = getAudio();

    audio.src = currentTrack.src;
    audio.volume = volume;

    setCurrentTime(0);
    setDuration(0);

    audio.load();

    if (isPlaying) {
      initializeAnalyser();

      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [
    currentTrack?.src,
    getAudio,
    initializeAnalyser,
    isPlaying,
    volume,
  ]);

  /* =======================================================
     AUDIO EVENTS
     ======================================================= */

  useEffect(() => {
    const audio = getAudio();

    const handleLoadedMetadata = () => {
      setDuration(
        Number.isFinite(audio.duration)
          ? audio.duration
          : 0
      );
    };

    const handleTimeUpdate = () => {
      setCurrentTime(
        audio.currentTime || 0
      );
    };

    const handleEnded = () => {
      if (isRepeated) {
        audio.currentTime = 0;

        audio.play().catch(() => {
          setIsPlaying(false);
        });

        return;
      }

      if (!tracks.length) {
        setIsPlaying(false);
        return;
      }

      if (
        isShuffled &&
        tracks.length > 1
      ) {
        let nextIndex =
          currentTrackIndex;

        while (
          nextIndex ===
          currentTrackIndex
        ) {
          nextIndex = Math.floor(
            Math.random() *
              tracks.length
          );
        }

        setCurrentTrackIndex(
          nextIndex
        );

        setIsPlaying(true);
        return;
      }

      const nextIndex =
        currentTrackIndex + 1 >=
        tracks.length
          ? 0
          : currentTrackIndex + 1;

      setCurrentTrackIndex(
        nextIndex
      );

      setIsPlaying(true);
    };

    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, [
    currentTrackIndex,
    getAudio,
    isRepeated,
    isShuffled,
    tracks.length,
  ]);

  /* =======================================================
     VOLUME
     ======================================================= */

  useEffect(() => {
    getAudio().volume = volume;
  }, [getAudio, volume]);

  /* =======================================================
     BLACK CENTER-FOCUSED FLOWING WAVEFORM
     ======================================================= */

  useEffect(() => {
    const canvas =
      waveformCanvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const BAR_COUNT = 72;
    const GAP = 3;

    if (
      barValuesRef.current.length !==
      BAR_COUNT
    ) {
      barValuesRef.current =
        new Array(BAR_COUNT).fill(
          0.05
        );

      targetValuesRef.current =
        new Array(BAR_COUNT).fill(
          0.05
        );
    }

    const values =
      barValuesRef.current;

    const targets =
      targetValuesRef.current;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect =
        canvas.getBoundingClientRect();

      const dpr =
        window.devicePixelRatio || 1;

      width = rect.width;
      height = rect.height;

      canvas.width = Math.max(
        1,
        Math.floor(width * dpr)
      );

      canvas.height = Math.max(
        1,
        Math.floor(height * dpr)
      );

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );
    };

    resize();

    const observer =
      new ResizeObserver(resize);

    observer.observe(canvas);

    let frame = 0;

    const draw = () => {
      /*
       * DO NOT color the canvas.
       * Background remains the normal
       * UI/theme background.
       */
      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      const analyser =
        analyserRef.current;

      const data =
        waveformDataRef.current;

      /* -----------------------------------------------
         Overall music energy
         ----------------------------------------------- */

      let overallEnergy = 0.06;

      if (
        analyser &&
        data &&
        isPlaying
      ) {
        analyser.getByteFrequencyData(
          data
        );

        const usefulBins =
          Math.floor(
            data.length * 0.72
          );

        let total = 0;

        for (
          let i = 0;
          i < usefulBins;
          i++
        ) {
          total += data[i];
        }

        overallEnergy =
          total /
          Math.max(
            1,
            usefulBins
          ) /
          255;
      }

      /* -----------------------------------------------
         Build ONE audio profile
         ----------------------------------------------- */

      const halfBars =
        Math.ceil(
          BAR_COUNT / 2
        );

      const halfValues =
        new Array(
          halfBars
        ).fill(0.05);

      if (
        analyser &&
        data &&
        isPlaying
      ) {
        for (
          let i = 0;
          i < halfBars;
          i++
        ) {
          const position =
            i /
            Math.max(
              1,
              halfBars - 1
            );

          const frequencyIndex =
            Math.floor(
              Math.pow(
                position,
                1.45
              ) *
                data.length *
                0.72
            );

          let sum = 0;

          const sampleCount = 4;

          for (
            let j = 0;
            j < sampleCount;
            j++
          ) {
            const index =
              Math.min(
                data.length - 1,
                frequencyIndex +
                  j
              );

            sum += data[index];
          }

          const average =
            sum /
            sampleCount /
            255;

          halfValues[i] =
            0.055 +
            Math.pow(
              average,
              1.08
            ) *
              0.82;
        }
      } else {
        for (
          let i = 0;
          i < halfBars;
          i++
        ) {
          const position =
            i /
            Math.max(
              1,
              halfBars - 1
            );

          halfValues[i] =
            0.045 +
            (1 - position) *
              0.03;
        }
      }

      /* -----------------------------------------------
         Mirror it around the center
         ----------------------------------------------- */

      for (
        let i = 0;
        i < BAR_COUNT;
        i++
      ) {
        const distance =
          Math.abs(
            i -
              (BAR_COUNT - 1) /
                2
          ) /
          ((BAR_COUNT - 1) /
            2);

        const sourceIndex =
          Math.round(
            distance *
              (halfBars - 1)
          );

        const mirrored =
          halfValues[
            Math.max(
              0,
              Math.min(
                halfBars - 1,
                halfBars -
                  1 -
                  sourceIndex
              )
            )
          ];

        const centerWeight =
          1 -
          Math.pow(
            distance,
            1.75
          ) *
            0.34;

        const target =
          mirrored *
            centerWeight +
          overallEnergy *
            0.07;

        targets[i] =
          Math.max(
            0.045,
            Math.min(
              1,
              target
            )
          );
      }

      /* -----------------------------------------------
         Smooth the values
         ----------------------------------------------- */

      for (
        let i = 0;
        i < BAR_COUNT;
        i++
      ) {
        values[i] +=
          (targets[i] -
            values[i]) *
          0.095;
      }

      /* -----------------------------------------------
         Continuous flow
         ----------------------------------------------- */

      const time =
        performance.now() *
        0.001;

      const flow =
        time * 1.25;

      const barWidth =
        Math.max(
          2,
          (width -
            GAP *
              (BAR_COUNT - 1)) /
            BAR_COUNT
        );

      const centerY =
        height / 2;

      for (
        let i = 0;
        i < BAR_COUNT;
        i++
      ) {
        const left =
          values[
            Math.max(
              0,
              i - 1
            )
          ];

        const current =
          values[i];

        const right =
          values[
            Math.min(
              BAR_COUNT - 1,
              i + 1
            )
          ];

        let value =
          left * 0.2 +
          current * 0.6 +
          right * 0.2;

        /*
         * Flowing travelling motion.
         */
        value +=
          Math.sin(
            i * 0.23 -
              flow
          ) *
          0.06;

        value +=
          Math.sin(
            i * 0.1 -
              flow * 0.55
          ) *
          0.025;

        value = Math.max(
          0.04,
          Math.min(
            1,
            value
          )
        );

        const barHeight =
          Math.max(
            5,
            value *
              height *
              0.78
          );

        const x =
          i *
          (barWidth + GAP);

        const y =
          centerY -
          barHeight / 2;

        /*
         * PERMANENTLY BLACK.
         */
        ctx.fillStyle =
          isPlaying
            ? `rgba(0, 0, 0, ${
                0.28 +
                value * 0.62
              })`
            : "rgba(0, 0, 0, 0.14)";

        ctx.beginPath();

        ctx.roundRect(
          x,
          y,
          barWidth,
          barHeight,
          Math.min(
            barWidth / 2,
            6
          )
        );

        ctx.fill();
      }

      /*
       * Very subtle black center glow.
       * Still transparent, never a background.
       */
      const glow =
        ctx.createRadialGradient(
          width / 2,
          centerY,
          0,
          width / 2,
          centerY,
          width * 0.32
        );

      glow.addColorStop(
        0,
        "rgba(0, 0, 0, 0.045)"
      );

      glow.addColorStop(
        1,
        "rgba(0, 0, 0, 0)"
      );

      ctx.fillStyle = glow;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      frame =
        requestAnimationFrame(
          draw
        );
    };

    frame =
      requestAnimationFrame(draw);

    return () => {
      observer.disconnect();

      cancelAnimationFrame(
        frame
      );
    };
  }, [isPlaying]);

  /* =======================================================
     PLAY / PAUSE
     ======================================================= */

  const togglePlay =
    useCallback(async () => {
      const audio = getAudio();

      if (!currentTrack) {
        return;
      }

      initializeAnalyser();

      try {
        if (
          audioContextRef.current
            ?.state ===
          "suspended"
        ) {
          await audioContextRef.current.resume();
        }

        if (audio.paused) {
          await audio.play();
          setIsPlaying(true);
        } else {
          audio.pause();
          setIsPlaying(false);
        }
      } catch {
        setIsPlaying(false);
      }
    }, [
      currentTrack,
      getAudio,
      initializeAnalyser,
    ]);

  /* =======================================================
     PLAY TRACK
     ======================================================= */

  const playTrack = useCallback(
    (index: number) => {
      if (!tracks[index]) {
        return;
      }

      setCurrentTrackIndex(index);
      setCurrentTime(0);
      setIsPlaying(true);

      initializeAnalyser();
    },
    [initializeAnalyser, tracks]
  );

  /* =======================================================
     NEXT TRACK
     ======================================================= */

  const nextTrack = useCallback(() => {
    if (!tracks.length) {
      return;
    }

    let nextIndex =
      currentTrackIndex;

    if (
      isShuffled &&
      tracks.length > 1
    ) {
      while (
        nextIndex ===
        currentTrackIndex
      ) {
        nextIndex = Math.floor(
          Math.random() *
            tracks.length
        );
      }
    } else {
      nextIndex =
        currentTrackIndex + 1 >=
        tracks.length
          ? 0
          : currentTrackIndex + 1;
    }

    setCurrentTrackIndex(
      nextIndex
    );

    setIsPlaying(true);
  }, [
    currentTrackIndex,
    isShuffled,
    tracks.length,
  ]);

  /* =======================================================
     PREVIOUS TRACK
     ======================================================= */

  const previousTrack =
    useCallback(() => {
      if (!tracks.length) {
        return;
      }

      const audio = getAudio();

      if (audio.currentTime > 4) {
        audio.currentTime = 0;
        return;
      }

      const previousIndex =
        currentTrackIndex - 1 < 0
          ? tracks.length - 1
          : currentTrackIndex - 1;

      setCurrentTrackIndex(
        previousIndex
      );

      setIsPlaying(true);
    }, [
      currentTrackIndex,
      getAudio,
      tracks.length,
    ]);

  /* =======================================================
     SEEK
     ======================================================= */

  const handleSeek = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(
      event.target.value
    );

    const audio = getAudio();

    audio.currentTime = value;

    setCurrentTime(value);
  };

  /* =======================================================
     SEARCH
     ======================================================= */

  const filteredTracks =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return tracks;
      }

      return tracks.filter(
        (track) =>
          track.title
            .toLowerCase()
            .includes(query) ||
          track.artist
            .toLowerCase()
            .includes(query)
      );
    }, [search, tracks]);

  /* =======================================================
     RECOMMENDATIONS
     ======================================================= */

  const recommendations =
    useMemo(() => {
      return tracks
        .filter(
          (_, index) =>
            index !==
            currentTrackIndex
        )
        .slice(0, 4);
    }, [
      currentTrackIndex,
      tracks,
    ]);

  /* =======================================================
     CLEANUP
     ======================================================= */

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      if (
        audioContextRef.current
      ) {
        audioContextRef.current
          .close()
          .catch(() => {});
      }

      if (
        animationFrameRef.current
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, []);

  /* =======================================================
     UI
     ======================================================= */

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-32">
        {/* HEADER */}

        <header className="mb-7 sm:mb-9">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Music2 className="h-4 w-4" />

            <span>Saathi Music</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Relax, Breathe, Flow
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Soothing music for yoga,
            meditation and relaxation.
            <br className="hidden sm:block" />
            Find your peace anytime,
            anywhere.
          </p>
        </header>

        {/* MAIN MUSIC GRID */}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,.95fr)]">
          {/* LEFT */}

          <div className="flex min-w-0 flex-col gap-5">
            {/* GIRL */}

            <section className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-card shadow-sm ring-1 ring-foreground/5 sm:min-h-[460px] lg:min-h-[480px]">
              <img
                src={meditationGirl}
                alt="Girl meditating"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent p-5 sm:p-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md ring-1 ring-white/10">
                  <FlowerArtwork />

                  Peaceful moments
                </div>
              </div>
            </section>

            {/* PLAYER */}

            <section className="rounded-[2rem] bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Now Playing
                  </p>

                  <h2 className="mt-1 truncate text-xl font-semibold sm:text-2xl">
                    {currentTrack?.title ||
                      "No music found"}
                  </h2>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {currentTrack?.artist ||
                      "Add music to public/Music"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsFavorite(
                      (value) =>
                        !value
                    )
                  }
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                    isFavorite
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-label="Favourite"
                >
                  <Heart
                    className="h-5 w-5"
                    fill={
                      isFavorite
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>

              {/* BLACK WAVEFORM */}

              <div className="mt-5 overflow-hidden rounded-2xl bg-background px-2 py-1">
                <canvas
                  ref={
                    waveformCanvasRef
                  }
                  className="block h-24 w-full"
                />
              </div>

              {/* SEEK */}

              <div className="mt-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.01"
                  value={Math.min(
                    currentTime,
                    duration || 0
                  )}
                  onChange={
                    handleSeek
                  }
                  disabled={!currentTrack}
                  className="h-1.5 w-full cursor-pointer"
                  style={{
                    accentColor:
                      "hsl(var(--primary))",
                  }}
                  aria-label="Seek music"
                />

                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {formatTime(
                      currentTime
                    )}
                  </span>

                  <span>
                    {formatTime(
                      duration
                    )}
                  </span>
                </div>
              </div>

              {/* CONTROLS */}

              <div className="mt-5 flex items-center justify-center gap-3 sm:gap-5">
                <button
                  type="button"
                  onClick={() =>
                    setIsShuffled(
                      (value) =>
                        !value
                    )
                  }
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                    isShuffled
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  }`}
                  aria-label="Shuffle"
                >
                  <Shuffle className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={
                    previousTrack
                  }
                  disabled={
                    !currentTrack
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-background disabled:opacity-40"
                  aria-label="Previous"
                >
                  <SkipBack className="h-5 w-5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={
                    togglePlay
                  }
                  disabled={
                    !currentTrack
                  }
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:scale-[1.03] disabled:opacity-40"
                  aria-label={
                    isPlaying
                      ? "Pause"
                      : "Play"
                  }
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-6 w-6 fill-current" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    nextTrack
                  }
                  disabled={
                    !currentTrack
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-background disabled:opacity-40"
                  aria-label="Next"
                >
                  <SkipForward className="h-5 w-5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsRepeated(
                      (value) =>
                        !value
                    )
                  }
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                    isRepeated
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  }`}
                  aria-label="Repeat"
                >
                  <Repeat2 className="h-4 w-4" />
                </button>
              </div>

              {/* VOLUME */}

              <div className="mt-6 flex items-center gap-3">
                <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(event) =>
                    setVolume(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="h-1.5 w-full cursor-pointer"
                  style={{
                    accentColor:
                      "hsl(var(--primary))",
                  }}
                  aria-label="Volume"
                />

                <span className="w-9 text-right text-xs text-muted-foreground">
                  {Math.round(
                    volume * 100
                  )}
                  %
                </span>
              </div>
            </section>
          </div>

          {/* ALL SONGS */}

          <section className="flex min-w-0 flex-col rounded-[2rem] bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:p-6 lg:min-h-[760px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ListMusic className="h-5 w-5 text-primary" />

                  <h2 className="text-xl font-semibold">
                    Your collection
                  </h2>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  All Songs
                </p>
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {tracks.length}
              </span>
            </div>

            {/* SEARCH */}

            <div className="relative mt-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                placeholder="Search songs..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl bg-background px-10 pr-4 text-sm outline-none ring-1 ring-foreground/5 transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/25"
              />
            </div>

            {/* SONG LIST */}

            <div className="mt-4 min-h-[360px] flex-1 overflow-hidden rounded-2xl bg-background/60">
              <div className="h-full max-h-[650px] overflow-y-auto overscroll-contain p-2">
                {libraryLoading ? (
                  <div className="flex h-full min-h-[300px] items-center justify-center text-sm text-muted-foreground">
                    Loading your music...
                  </div>
                ) : filteredTracks.length ===
                  0 ? (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-6 text-center">
                    <Music2 className="mb-3 h-9 w-9 text-primary/60" />

                    <p className="font-medium">
                      {tracks.length ===
                      0
                        ? "No songs found"
                        : "No matching songs"}
                    </p>

                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                      {tracks.length ===
                      0
                        ? "Add your audio files to public/Music or src/assets/Music."
                        : "Try another search term."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTracks.map(
                      (track) => {
                        const originalIndex =
                          tracks.findIndex(
                            (item) =>
                              item.id ===
                              track.id
                          );

                        const active =
                          originalIndex ===
                          currentTrackIndex;

                        return (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() =>
                              playTrack(
                                originalIndex
                              )
                            }
                            className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                              active
                                ? "bg-primary/10"
                                : "hover:bg-card"
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card text-primary"
                              }`}
                            >
                              {active &&
                              isPlaying ? (
                                <Pause className="h-4 w-4 fill-current" />
                              ) : (
                                <Music2 className="h-4 w-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-sm font-medium ${
                                  active
                                    ? "text-primary"
                                    : "text-foreground"
                                }`}
                              >
                                {
                                  track.title
                                }
                              </p>

                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {
                                  track.artist
                                }
                              </p>
                            </div>

                            <Play
                              className={`h-4 w-4 shrink-0 text-primary transition ${
                                active
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              }`}
                            />
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </section>

        {/* =================================================
            RECOMMENDATIONS
            ================================================= */}

        {!libraryLoading &&
          recommendations.length > 0 && (
            <section className="mt-12 pb-8 sm:mt-14 lg:mt-16">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                    Continue your journey
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                    Recommended for you
                  </h2>
                </div>

                <span className="hidden text-sm text-muted-foreground sm:block">
                  More peaceful moments
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recommendations.map(
                  (track) => {
                    const originalIndex =
                      tracks.findIndex(
                        (item) =>
                          item.id ===
                          track.id
                      );

                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() =>
                          playTrack(
                            originalIndex
                          )
                        }
                        className="group rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-foreground/5 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Music2 className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {
                                track.title
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {
                                track.artist
                              }
                            </p>
                          </div>

                          <Play className="h-4 w-4 shrink-0 text-primary opacity-70 transition group-hover:scale-110 group-hover:opacity-100" />
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </section>
          )}
      </div>
    </main>
  );
}