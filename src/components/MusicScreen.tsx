import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Heart,
  ListMusic,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Repeat2,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";

import musicLibrary from "virtual:music-library";

/* =========================================================
   TYPES
========================================================= */

type MusicFile = {
  name: string;
  src?: string;
};

type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration: number;
};

/* =========================================================
   HELPERS
========================================================= */

function createTrackId(filename: string) {
  return filename
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getTitle(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

/* =========================================================
   MUSIC SCREEN
========================================================= */

export default function MusicScreen() {
  /* =======================================================
     LIBRARY
  ======================================================= */

  const [tracks, setTracks] = useState<Track[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);

  /* =======================================================
     PLAYER
  ======================================================= */

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(0.75);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     AUDIO
  ======================================================= */

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  /* =======================================================
     WEB AUDIO API
  ======================================================= */

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const analyserRef =
    useRef<AnalyserNode | null>(null);

  const sourceNodeRef =
    useRef<MediaElementAudioSourceNode | null>(null);

  const visualizerDataRef =
    useRef<Uint8Array | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const visualizerCanvasRef =
    useRef<HTMLCanvasElement | null>(null);

  /* =======================================================
     THEME
  ======================================================= */

  const theme = useMemo(
    () => ({
      primary: "hsl(var(--primary))",
      primaryForeground:
        "hsl(var(--primary-foreground))",

      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",

      card: "hsl(var(--card))",
      cardForeground:
        "hsl(var(--card-foreground))",

      secondary: "hsl(var(--secondary))",
      secondaryForeground:
        "hsl(var(--secondary-foreground))",

      accent: "hsl(var(--accent))",
      accentForeground:
        "hsl(var(--accent-foreground))",

      muted: "hsl(var(--muted))",
      mutedForeground:
        "hsl(var(--muted-foreground))",

      border: "hsl(var(--border))",
    }),
    []
  );

  /* =======================================================
     LOAD REAL MUSIC DIRECTORY
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadMusic() {
      setLibraryLoading(true);

      const files =
        (musicLibrary as MusicFile[]) ?? [];

      /*
       * Convert every real file returned by the Vite
       * music-library plugin into a track.
       */
      const baseTracks: Track[] =
        files.map((file) => {
          const src =
            file.src ??
            `${import.meta.env.BASE_URL}Music/${encodeURIComponent(
              file.name
            )}`;

          return {
            id: createTrackId(file.name),
            title: getTitle(file.name),
            artist: "Local Music",
            src,
            duration: 0,
          };
        });

      /*
       * Read actual duration from every audio file.
       */
      const tracksWithMetadata =
        await Promise.all(
          baseTracks.map(
            (track) =>
              new Promise<Track>((resolve) => {
                const tempAudio =
                  document.createElement("audio");

                tempAudio.preload = "metadata";
                tempAudio.src = track.src;

                const cleanup = () => {
                  tempAudio.pause();
                  tempAudio.removeAttribute("src");
                  tempAudio.load();
                };

                tempAudio.addEventListener(
                  "loadedmetadata",
                  () => {
                    const realDuration =
                      Number.isFinite(
                        tempAudio.duration
                      )
                        ? tempAudio.duration
                        : 0;

                    resolve({
                      ...track,
                      duration: realDuration,
                    });

                    cleanup();
                  },
                  { once: true }
                );

                tempAudio.addEventListener(
                  "error",
                  () => {
                    resolve(track);
                    cleanup();
                  },
                  { once: true }
                );
              })
          )
        );

      if (!cancelled) {
        setTracks(tracksWithMetadata);
        setLibraryLoading(false);
      }
    }

    loadMusic();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     CURRENT TRACK
  ======================================================= */

  const currentTrack =
    tracks[currentTrackIndex] ?? null;

  /* =======================================================
     AUDIO ELEMENT
  ======================================================= */

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();

      audio.preload = "metadata";
      audio.volume = volume;

      audioRef.current = audio;
    }

    return audioRef.current;
  }, [volume]);

  /* =======================================================
     INITIALIZE ANALYSER
  ======================================================= */

  const initializeAnalyser = useCallback(
    (audio: HTMLAudioElement) => {
      if (
        audioContextRef.current &&
        analyserRef.current &&
        sourceNodeRef.current
      ) {
        return audioContextRef.current;
      }

      const AudioContextClass =
        window.AudioContext ??
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      try {
        const audioContext =
          new AudioContextClass();

        const source =
          audioContext.createMediaElementSource(
            audio
          );

        const analyser =
          audioContext.createAnalyser();

        analyser.fftSize = 512;

        analyser.minDecibels = -85;
        analyser.maxDecibels = -8;

        analyser.smoothingTimeConstant = 0.86;

        source.connect(analyser);
        analyser.connect(
          audioContext.destination
        );

        audioContextRef.current =
          audioContext;

        sourceNodeRef.current =
          source;

        analyserRef.current =
          analyser;

        visualizerDataRef.current =
          new Uint8Array(
            analyser.frequencyBinCount
          );

        return audioContext;
      } catch (error) {
        console.warn(
          "Could not initialize audio visualizer:",
          error
        );

        return null;
      }
    },
    []
  );

  /* =======================================================
     PLAY TRACK
  ======================================================= */

  const playTrack = useCallback(
    async (index: number) => {
      const selectedTrack =
        tracks[index];

      if (!selectedTrack) {
        return;
      }

      const audio =
        getAudio();

      const audioContext =
        initializeAnalyser(audio);

      if (
        audioContext &&
        audioContext.state ===
          "suspended"
      ) {
        await audioContext
          .resume()
          .catch(() => {});
      }

      audio.pause();

      audio.src =
        selectedTrack.src;

      audio.currentTime = 0;

      setCurrentTrackIndex(index);
      setCurrentTime(0);
      setDuration(selectedTrack.duration);
      setIsFavorite(false);

      audio.load();

      try {
        await audio.play();

        setIsPlaying(true);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Unable to play audio:",
          error
        );

        setIsPlaying(false);
      }
    },
    [
      tracks,
      getAudio,
      initializeAnalyser,
    ]
  );

  /* =======================================================
     AUDIO EVENTS
  ======================================================= */

  useEffect(() => {
    const audio =
      getAudio();

    const handleTimeUpdate =
      () => {
        setCurrentTime(
          audio.currentTime
        );
      };

    const handleMetadata =
      () => {
        if (
          Number.isFinite(
            audio.duration
          )
        ) {
          setDuration(
            audio.duration
          );
        }
      };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded =
      async () => {
        if (!tracks.length) {
          return;
        }

        if (isRepeated) {
          audio.currentTime = 0;

          try {
            await audio.play();
            setIsPlaying(true);
          } catch {
            setIsPlaying(false);
          }

          return;
        }

        let nextIndex: number;

        if (isShuffled) {
          if (tracks.length === 1) {
            nextIndex = 0;
          } else {
            do {
              nextIndex =
                Math.floor(
                  Math.random() *
                    tracks.length
                );
            } while (
              nextIndex ===
              currentTrackIndex
            );
          }
        } else {
          nextIndex =
            (currentTrackIndex + 1) %
            tracks.length;
        }

        await playTrack(nextIndex);
      };

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audio.addEventListener(
      "loadedmetadata",
      handleMetadata
    );

    audio.addEventListener(
      "play",
      handlePlay
    );

    audio.addEventListener(
      "pause",
      handlePause
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audio.removeEventListener(
        "loadedmetadata",
        handleMetadata
      );

      audio.removeEventListener(
        "play",
        handlePlay
      );

      audio.removeEventListener(
        "pause",
        handlePause
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, [
    getAudio,
    tracks,
    currentTrackIndex,
    isRepeated,
    isShuffled,
    playTrack,
  ]);

  /* =======================================================
     VOLUME
  ======================================================= */

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume =
        volume;
    }
  }, [volume]);

  /* =======================================================
     REAL-TIME CANVAS VISUALIZER
  ======================================================= */

  useEffect(() => {
    const canvas =
      visualizerCanvasRef.current;

    const analyser =
      analyserRef.current;

    const data =
      visualizerDataRef.current;

    if (!canvas || !analyser || !data) {
      return;
    }

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect =
        canvas.getBoundingClientRect();

      const pixelRatio =
        Math.min(
          window.devicePixelRatio || 1,
          2
        );

      width = rect.width;
      height = rect.height;

      canvas.width =
        Math.max(
          1,
          Math.floor(
            width * pixelRatio
          )
        );

      canvas.height =
        Math.max(
          1,
          Math.floor(
            height * pixelRatio
          )
        );

      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
      );
    };

    const getThemeColor = (
      variable: string,
      fallback: string
    ) => {
      const value =
        getComputedStyle(
          document.documentElement
        )
          .getPropertyValue(variable)
          .trim();

      return value
        ? `hsl(${value})`
        : fallback;
    };

    const withAlpha = (
      color: string,
      alpha: number
    ) => {
      return color
        .replace(
          "hsl(",
          "hsla("
        )
        .replace(
          ")",
          `, ${alpha})`
        );
    };

    const draw = () => {
      if (!width || !height) {
        resize();
      }

      analyser.getByteFrequencyData(
        data
      );

      const primary =
        getThemeColor(
          "--primary",
          "hsl(257 90% 60%)"
        );

      const accent =
        getThemeColor(
          "--accent",
          "hsl(340 70% 60%)"
        );

      const foreground =
        getThemeColor(
          "--foreground",
          "hsl(180 40% 15%)"
        );

      context.clearRect(
        0,
        0,
        width,
        height
      );

      const centerX =
        width / 2;

      const centerY =
        height / 2;

      const baseRadius =
        Math.min(
          width,
          height
        ) * 0.255;

      const maxBarLength =
        Math.min(
          width,
          height
        ) * 0.22;

      const bars = 96;

      /* -----------------------------------------------------
         Average energy
      ----------------------------------------------------- */

      let total = 0;

      for (
        let i = 0;
        i < data.length;
        i++
      ) {
        total += data[i];
      }

      const average =
        total /
        (data.length * 255);

      /* -----------------------------------------------------
         Background glow
      ----------------------------------------------------- */

      const glow =
        context.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          Math.min(width, height) * 0.48
        );

      glow.addColorStop(
        0,
        withAlpha(
          primary,
          0.16 +
            average * 0.18
        )
      );

      glow.addColorStop(
        0.5,
        withAlpha(
          accent,
          0.06 +
            average * 0.08
        )
      );

      glow.addColorStop(
        1,
        "transparent"
      );

      context.fillStyle = glow;

      context.fillRect(
        0,
        0,
        width,
        height
      );

      /* -----------------------------------------------------
         Subtle circular rings
      ----------------------------------------------------- */

      context.save();

      for (
        let ring = 0;
        ring < 4;
        ring++
      ) {
        const radius =
          baseRadius +
          ring *
            Math.min(
              width,
              height
            ) *
            0.085;

        context.beginPath();

        context.arc(
          centerX,
          centerY,
          radius,
          0,
          Math.PI * 2
        );

        context.strokeStyle =
          withAlpha(
            primary,
            0.07 -
              ring * 0.012
          );

        context.lineWidth =
          1;

        context.stroke();
      }

      /* -----------------------------------------------------
         Real spectrum bars
      ----------------------------------------------------- */

      for (
        let i = 0;
        i < bars;
        i++
      ) {
        const dataIndex =
          Math.floor(
            Math.pow(
              i / bars,
              1.45
            ) *
              data.length *
              0.78
          );

        const raw =
          (data[dataIndex] ?? 0) /
          255;

        const smoothed =
          Math.pow(
            Math.max(
              raw,
              0
            ),
            0.72
          );

        const idleAmount =
          isPlaying
            ? smoothed
            : 0.025;

        const angle =
          (i / bars) *
            Math.PI *
            2 -
          Math.PI / 2;

        /*
         * Slightly different radius for every
         * third bar prevents the ring from looking
         * mechanically uniform.
         */
        const innerRadius =
          baseRadius +
          (i % 3) * 2;

        const barLength =
          5 +
          idleAmount *
            maxBarLength;

        const outerRadius =
          innerRadius +
          barLength;

        const x1 =
          centerX +
          Math.cos(angle) *
            innerRadius;

        const y1 =
          centerY +
          Math.sin(angle) *
            innerRadius;

        const x2 =
          centerX +
          Math.cos(angle) *
            outerRadius;

        const y2 =
          centerY +
          Math.sin(angle) *
            outerRadius;

        const barGradient =
          context.createLinearGradient(
            x1,
            y1,
            x2,
            y2
          );

        barGradient.addColorStop(
          0,
          primary
        );

        barGradient.addColorStop(
          1,
          accent
        );

        context.beginPath();

        context.moveTo(
          x1,
          y1
        );

        context.lineTo(
          x2,
          y2
        );

        context.strokeStyle =
          barGradient;

        context.globalAlpha =
          0.55 +
          idleAmount * 0.5;

        context.lineWidth =
          i % 4 === 0
            ? 2.5
            : 1.8;

        context.lineCap =
          "round";

        context.stroke();

        /* Bright tip */

        if (
          idleAmount >
          0.15
        ) {
          context.beginPath();

          context.arc(
            x2,
            y2,
            1.1 +
              idleAmount * 1.5,
            0,
            Math.PI * 2
          );

          context.fillStyle =
            i % 5 === 0
              ? accent
              : primary;

          context.globalAlpha =
            0.65 +
            idleAmount *
              0.35;

          context.fill();
        }
      }

      /* -----------------------------------------------------
         Rotating particles
      ----------------------------------------------------- */

      const now =
        performance.now();

      for (
        let i = 0;
        i < 28;
        i++
      ) {
        const angle =
          (i / 28) *
            Math.PI *
            2 +
          now / 10000;

        const frequency =
          data[
            (i * 7) %
              data.length
          ] / 255;

        const radius =
          baseRadius *
          (1.65 +
            (i % 4) *
              0.055);

        const x =
          centerX +
          Math.cos(angle) *
            radius;

        const y =
          centerY +
          Math.sin(angle) *
            radius;

        context.beginPath();

        context.arc(
          x,
          y,
          0.8 +
            frequency * 2.1,
          0,
          Math.PI * 2
        );

        context.fillStyle =
          i % 2 === 0
            ? primary
            : accent;

        context.globalAlpha =
          0.18 +
          frequency * 0.55;

        context.fill();
      }

      /* -----------------------------------------------------
         Center glow
      ----------------------------------------------------- */

      const centerGlow =
        context.createRadialGradient(
          centerX,
          centerY,
          4,
          centerX,
          centerY,
          baseRadius * 1.8
        );

      centerGlow.addColorStop(
        0,
        withAlpha(
          primary,
          0.22 +
            average * 0.28
        )
      );

      centerGlow.addColorStop(
        0.55,
        withAlpha(
          accent,
          0.08 +
            average * 0.15
        )
      );

      centerGlow.addColorStop(
        1,
        "transparent"
      );

      context.fillStyle =
        centerGlow;

      context.beginPath();

      context.arc(
        centerX,
        centerY,
        baseRadius * 1.8,
        0,
        Math.PI * 2
      );

      context.fill();

      /* -----------------------------------------------------
         Center waveform
      ----------------------------------------------------- */

      context.beginPath();

      const waveformPoints = 110;

      for (
        let i = 0;
        i < waveformPoints;
        i++
      ) {
        const dataIndex =
          Math.floor(
            (i /
              waveformPoints) *
              data.length *
              0.65
          );

        const value =
          data[dataIndex] / 255;

        const x =
          centerX -
          baseRadius * 0.72 +
          (i /
            (waveformPoints - 1)) *
            baseRadius *
            1.44;

        const y =
          centerY +
          (value - 0.5) *
            baseRadius *
            0.34;

        if (i === 0) {
          context.moveTo(
            x,
            y
          );
        } else {
          context.lineTo(
            x,
            y
          );
        }
      }

      context.strokeStyle =
        withAlpha(
          foreground,
          isPlaying
            ? 0.24
            : 0.12
        );

      context.lineWidth = 1.2;

      context.globalAlpha =
        0.8;

      context.stroke();

      context.restore();

      animationFrameRef.current =
        requestAnimationFrame(draw);
    };

    resize();

    animationFrameRef.current =
      requestAnimationFrame(draw);

    const resizeObserver =
      new ResizeObserver(
        resize
      );

    resizeObserver.observe(
      canvas
    );

    return () => {
      resizeObserver.disconnect();

      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }
    };
  }, [isPlaying]);

  /* =======================================================
     PLAY / PAUSE
  ======================================================= */

  const togglePlay =
    async () => {
      if (!currentTrack) {
        return;
      }

      const audio =
        getAudio();

      const audioContext =
        initializeAnalyser(audio);

      if (
        audioContext &&
        audioContext.state ===
          "suspended"
      ) {
        await audioContext
          .resume()
          .catch(() => {});
      }

      /*
       * First play after page load.
       */
      if (!audio.src) {
        audio.src =
          currentTrack.src;

        audio.load();
      }

      if (audio.paused) {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          if (
            error instanceof
              DOMException &&
            error.name ===
              "AbortError"
          ) {
            return;
          }

          console.error(
            "Unable to play:",
            error
          );
        }
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    };

  /* =======================================================
     NEXT
  ======================================================= */

  const nextTrack =
    async () => {
      if (!tracks.length) {
        return;
      }

      let nextIndex: number;

      if (isShuffled) {
        if (tracks.length === 1) {
          nextIndex = 0;
        } else {
          do {
            nextIndex =
              Math.floor(
                Math.random() *
                  tracks.length
              );
          } while (
            nextIndex ===
            currentTrackIndex
          );
        }
      } else {
        nextIndex =
          (currentTrackIndex + 1) %
          tracks.length;
      }

      await playTrack(
        nextIndex
      );
    };

  /* =======================================================
     PREVIOUS
  ======================================================= */

  const previousTrack =
    async () => {
      if (!tracks.length) {
        return;
      }

      /*
       * Pressing previous after 3 seconds
       * restarts the current song.
       */
      if (currentTime > 3) {
        const audio =
          getAudio();

        audio.currentTime =
          0;

        setCurrentTime(0);

        return;
      }

      const previousIndex =
        currentTrackIndex === 0
          ? tracks.length - 1
          : currentTrackIndex - 1;

      await playTrack(
        previousIndex
      );
    };

  /* =======================================================
     SEEK
  ======================================================= */

  const handleSeek = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      Number(
        event.target.value
      );

    if (
      !Number.isFinite(value) ||
      !currentTrack ||
      duration <= 0
    ) {
      return;
    }

    const audio =
      getAudio();

    audio.currentTime =
      value;

    setCurrentTime(value);
  };

  /* =======================================================
     FILTERED SONGS
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
        (item) =>
          item.title
            .toLowerCase()
            .includes(query) ||
          item.artist
            .toLowerCase()
            .includes(query)
      );
    }, [tracks, search]);

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
        .slice(0, 6);
    }, [
      tracks,
      currentTrackIndex,
    ]);

  /* =======================================================
     PROGRESS
  ======================================================= */

  const progress =
    duration > 0
      ? Math.min(
          100,
          (currentTime /
            duration) *
            100
        )
      : 0;

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute(
          "src"
        );
        audioRef.current.load();
      }

      sourceNodeRef.current?.disconnect();
      analyserRef.current?.disconnect();

      if (
        audioContextRef.current &&
        audioContextRef.current.state !==
          "closed"
      ) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-background
        px-4
        py-5
        pb-32
        text-foreground
        transition-colors
        duration-500
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            mb-6
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-2xl
              "
              style={{
                backgroundColor:
                  `color-mix(
                    in srgb,
                    ${theme.primary} 10%,
                    transparent
                  )`,
                color:
                  theme.primary,
              }}
            >
              <Music2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-muted-foreground
                "
              >
                Saathi Music
              </p>

              <h1
                className="
                  truncate
                  text-lg
                  font-semibold
                  tracking-tight
                "
              >
                Your quiet space
              </h1>
            </div>
          </div>

          <div
            className="
              hidden
              items-center
              gap-2
              sm:flex
            "
          >
            <div
              className="
                flex
                w-[270px]
                items-center
                gap-2
                rounded-full
                border
                border-border/60
                bg-card/80
                px-4
                py-2.5
              "
            >
              <Search
                className="
                  h-4
                  w-4
                  shrink-0
                  text-muted-foreground
                "
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search songs..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-xs
                  outline-none
                  placeholder:text-muted-foreground
                "
              />
            </div>

            <button
              type="button"
              aria-label="Filters"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-border/60
                bg-card
                text-muted-foreground
                transition
                hover:bg-muted
                hover:text-foreground
              "
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            aria-label="Music library"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-border/60
              bg-card
              text-muted-foreground
              transition
              hover:bg-muted
              hover:text-foreground
            "
          >
            <ListMusic className="h-4 w-4" />
          </button>
        </header>

        {/* =================================================
            MOBILE SEARCH
        ================================================= */}

        <div
          className="
            mb-5
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-border/60
            bg-card
            px-3
            py-2.5
            sm:hidden
          "
        >
          <Search
            className="
              h-4
              w-4
              text-muted-foreground
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search songs..."
            className="
              min-w-0
              flex-1
              bg-transparent
              text-xs
              outline-none
            "
          />
        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <section
          className="
            grid
            gap-5
            lg:grid-cols-[minmax(0,1fr)_minmax(430px,1fr)]
          "
        >
          {/* =================================================
              NOW PLAYING
          ================================================= */}

          <section
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border
              border-border/60
              bg-card
              p-5
              shadow-sm
              sm:p-7
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                opacity-80
              "
              style={{
                background: `
                  radial-gradient(
                    circle at 15% 15%,
                    color-mix(
                      in srgb,
                      ${theme.primary} 14%,
                      transparent
                    ),
                    transparent 38%
                  ),
                  radial-gradient(
                    circle at 85% 85%,
                    color-mix(
                      in srgb,
                      ${theme.accent} 10%,
                      transparent
                    ),
                    transparent 35%
                  )
                `,
              }}
            />

            <div className="relative z-10">
              {/* Top */}

              <div
                className="
                  mb-5
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <p
                    className="
                      flex
                      items-center
                      gap-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-muted-foreground
                    "
                  >
                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                      "
                      style={{
                        backgroundColor:
                          theme.primary,
                      }}
                    />

                    Now Playing
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-muted-foreground
                    "
                  >
                    {libraryLoading
                      ? "Loading your music..."
                      : `${tracks.length} local song${
                          tracks.length ===
                          1
                            ? ""
                            : "s"
                        }`}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={
                      isFavorite
                        ? "Remove favourite"
                        : "Add favourite"
                    }
                    onClick={() =>
                      setIsFavorite(
                        (value) =>
                          !value
                      )
                    }
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      text-muted-foreground
                      transition
                      hover:bg-muted
                    "
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={
                        isFavorite
                          ? "currentColor"
                          : "none"
                      }
                      style={{
                        color:
                          isFavorite
                            ? theme.primary
                            : undefined,
                      }}
                    />
                  </button>

                  <button
                    type="button"
                    aria-label="More options"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      text-muted-foreground
                      transition
                      hover:bg-muted
                    "
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* =================================================
                  REAL AUDIO VISUALIZER
              ================================================= */}

              <div
                className="
                  relative
                  mx-auto
                  aspect-square
                  w-full
                  max-w-[400px]
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-border/50
                "
                style={{
                  background: `
                    radial-gradient(
                      circle at 50% 50%,
                      color-mix(
                        in srgb,
                        ${theme.primary} 13%,
                        ${theme.background}
                      ) 0%,
                      color-mix(
                        in srgb,
                        ${theme.accent} 5%,
                        ${theme.background}
                      ) 48%,
                      ${theme.background} 100%
                    )
                  `,
                  boxShadow:
                    `inset 0 0 80px color-mix(
                      in srgb,
                      ${theme.primary} 5%,
                      transparent
                    )`,
                }}
              >
                <canvas
                  ref={
                    visualizerCanvasRef
                  }
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                  "
                  aria-label="Live audio visualizer"
                  role="img"
                />

                {/* Center */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    z-10
                    flex
                    h-24
                    w-24
                    -translate-x-1/2
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    backdrop-blur-xl
                  "
                  style={{
                    borderColor:
                      `color-mix(
                        in srgb,
                        ${theme.primary} 35%,
                        transparent
                      )`,
                    background:
                      `radial-gradient(
                        circle at 35% 30%,
                        color-mix(
                          in srgb,
                          ${theme.primary} 20%,
                          transparent
                        ),
                        color-mix(
                          in srgb,
                          ${theme.background} 84%,
                          transparent
                        )
                      )`,
                    boxShadow:
                      `0 0 40px color-mix(
                        in srgb,
                        ${theme.primary} ${
                          isPlaying ? 28 : 10
                        }%,
                        transparent
                      )`,
                  }}
                >
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                    "
                    style={{
                      background:
                        `linear-gradient(
                          135deg,
                          ${theme.primary},
                          ${theme.accent}
                        )`,
                      color:
                        theme.primaryForeground,
                    }}
                  >
                    <Music2 className="h-6 w-6" />
                  </div>
                </div>

                {/* Status */}

                <div
                  className="
                    absolute
                    bottom-4
                    left-4
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    bg-background/40
                    px-3
                    py-1.5
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    backdrop-blur-md
                  "
                  style={{
                    borderColor:
                      `color-mix(
                        in srgb,
                        ${theme.primary} 20%,
                        transparent
                      )`,
                    color:
                      theme.foreground,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        theme.primary,
                      boxShadow:
                        isPlaying
                          ? `0 0 10px ${theme.primary}`
                          : "none",
                    }}
                  />

                  {isPlaying
                    ? "Listening"
                    : "Ready"}
                </div>

                <div
                  className="
                    absolute
                    bottom-4
                    right-4
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-muted-foreground
                  "
                >
                  Saathi Music
                </div>
              </div>

              {/* =================================================
                  TRACK INFO
              ================================================= */}

              <div className="mt-6 text-center">
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  <h2
                    className="
                      max-w-[80%]
                      truncate
                      text-2xl
                      font-semibold
                      tracking-tight
                      sm:text-[2rem]
                    "
                  >
                    {currentTrack?.title ??
                      "No songs found"}
                  </h2>

                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>

                <p
                  className="
                    mt-1
                    text-sm
                    text-muted-foreground
                  "
                >
                  {currentTrack?.artist ??
                    "Add audio files to public/Music"}
                </p>
              </div>

              {/* =================================================
                  PROGRESS
              ================================================= */}

              <div className="mt-7">
                <div
                  className="
                    relative
                    flex
                    h-9
                    items-end
                    gap-[3px]
                    overflow-hidden
                  "
                >
                  {Array.from({
                    length: 56,
                  }).map(
                    (_, index) => {
                      const seed =
                        Math.abs(
                          Math.sin(
                            index *
                              1.91
                          )
                        );

                      const height =
                        6 +
                        seed * 14;

                      const played =
                        index / 56 <=
                        progress / 100;

                      return (
                        <span
                          key={index}
                          className="
                            flex-1
                            rounded-full
                            transition-all
                            duration-300
                          "
                          style={{
                            height:
                              `${height}px`,
                            backgroundColor:
                              played
                                ? theme.primary
                                : `color-mix(
                                    in srgb,
                                    ${theme.mutedForeground} 18%,
                                    transparent
                                  )`,
                          }}
                        />
                      );
                    }
                  )}
                </div>

                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={Math.min(
                    currentTime,
                    duration || 0
                  )}
                  onChange={
                    handleSeek
                  }
                  disabled={
                    !currentTrack ||
                    duration <= 0
                  }
                  className="
                    mt-2
                    h-1
                    w-full
                    cursor-pointer
                    appearance-none
                    rounded-full
                    bg-muted
                    accent-[hsl(var(--primary))]
                  "
                  aria-label="Seek through song"
                />

                <div
                  className="
                    mt-2
                    flex
                    justify-between
                    text-[10px]
                    font-medium
                    text-muted-foreground
                  "
                >
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

              {/* =================================================
                  CONTROLS
              ================================================= */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-4
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setIsShuffled(
                      (value) =>
                        !value
                    )
                  }
                  aria-label="Shuffle"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    transition
                    hover:bg-muted
                  "
                  style={{
                    color:
                      isShuffled
                        ? theme.primary
                        : theme.mutedForeground,
                  }}
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
                  aria-label="Previous song"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-muted-foreground
                    transition
                    hover:bg-muted
                    disabled:opacity-40
                  "
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={
                    togglePlay
                  }
                  disabled={
                    !currentTrack
                  }
                  aria-label={
                    isPlaying
                      ? "Pause"
                      : "Play"
                  }
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    shadow-lg
                    transition
                    hover:scale-[1.04]
                    disabled:opacity-40
                  "
                  style={{
                    background:
                      `linear-gradient(
                        135deg,
                        ${theme.primary},
                        ${theme.accent}
                      )`,
                    color:
                      theme.primaryForeground,
                    boxShadow:
                      `0 0 35px color-mix(
                        in srgb,
                        ${theme.primary} 30%,
                        transparent
                      )`,
                  }}
                >
                  {isPlaying ? (
                    <Pause
                      className="h-6 w-6"
                      fill="currentColor"
                    />
                  ) : (
                    <Play
                      className="ml-0.5 h-6 w-6"
                      fill="currentColor"
                    />
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
                  aria-label="Next song"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-muted-foreground
                    transition
                    hover:bg-muted
                    disabled:opacity-40
                  "
                >
                  <SkipForward className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsRepeated(
                      (value) =>
                        !value
                    )
                  }
                  aria-label="Repeat"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    transition
                    hover:bg-muted
                  "
                  style={{
                    color:
                      isRepeated
                        ? theme.primary
                        : theme.mutedForeground,
                  }}
                >
                  <Repeat2 className="h-4 w-4" />
                </button>
              </div>

              {/* =================================================
                  VOLUME
              ================================================= */}

              <div
                className="
                  mx-auto
                  mt-5
                  flex
                  max-w-xs
                  items-center
                  gap-3
                "
              >
                <Volume2
                  className="
                    h-4
                    w-4
                    shrink-0
                    text-muted-foreground
                  "
                />

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
                  className="
                    h-1
                    w-full
                    cursor-pointer
                    appearance-none
                    rounded-full
                    bg-muted
                    accent-[hsl(var(--primary))]
                  "
                  aria-label="Volume"
                />

                <span
                  className="
                    w-8
                    text-right
                    text-[10px]
                    font-medium
                    text-muted-foreground
                  "
                >
                  {Math.round(
                    volume * 100
                  )}
                  %
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              ALL SONGS
          ================================================= */}

          <section
            className="
              rounded-[2rem]
              border
              border-border/60
              bg-card
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-muted-foreground
                  "
                >
                  Music Library
                </p>

                <h2
                  className="
                    mt-1
                    text-3xl
                    font-semibold
                    tracking-tight
                  "
                >
                  All Songs
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  {libraryLoading
                    ? "Reading public/Music..."
                    : `${tracks.length} real file${
                        tracks.length === 1
                          ? ""
                          : "s"
                      } found`}
                </p>
              </div>

              <Music2
                className="h-5 w-5 shrink-0"
                style={{
                  color:
                    theme.primary,
                }}
              />
            </div>

            <div
              className="
                mt-5
                max-h-[650px]
                overflow-y-auto
                pr-1
              "
            >
              {libraryLoading ? (
                <div
                  className="
                    flex
                    min-h-[300px]
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
                  <div
                    className="
                      h-9
                      w-9
                      animate-spin
                      rounded-full
                      border-2
                      border-muted
                      border-t-primary
                    "
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      font-medium
                    "
                  >
                    Loading real songs...
                  </p>
                </div>
              ) : filteredTracks.length === 0 ? (
                <div
                  className="
                    flex
                    min-h-[300px]
                    flex-col
                    items-center
                    justify-center
                    px-5
                    text-center
                  "
                >
                  <Music2
                    className="
                      h-9
                      w-9
                      text-muted-foreground/50
                    "
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      font-medium
                    "
                  >
                    No songs found
                  </p>

                  <p
                    className="
                      mt-1
                      max-w-xs
                      text-xs
                      text-muted-foreground
                    "
                  >
                    Put .mp3, .wav, .ogg,
                    .m4a or .webm files
                    inside public/Music.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTracks.map(
                    (item, index) => {
                      const actualIndex =
                        tracks.findIndex(
                          (trackItem) =>
                            trackItem.id ===
                            item.id
                        );

                      const isCurrent =
                        actualIndex ===
                        currentTrackIndex;

                      return (
                        <div
                          key={item.id}
                          className="
                            grid
                            grid-cols-[28px_minmax(0,1fr)_auto]
                            items-center
                            gap-3
                            rounded-2xl
                            px-2
                            py-3
                            transition
                            sm:grid-cols-[32px_minmax(0,1.4fr)_minmax(100px,0.8fr)_72px_34px]
                          "
                          style={{
                            backgroundColor:
                              isCurrent
                                ? `color-mix(
                                    in srgb,
                                    ${theme.primary} 9%,
                                    transparent
                                  )`
                                : "transparent",
                            boxShadow:
                              isCurrent
                                ? `inset 3px 0 0 ${theme.primary}`
                                : "none",
                          }}
                        >
                          <span
                            className="
                              text-center
                              text-[10px]
                              font-semibold
                              text-muted-foreground
                            "
                          >
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              playTrack(
                                actualIndex
                              )
                            }
                            className="
                              flex
                              min-w-0
                              items-center
                              gap-3
                              text-left
                            "
                          >
                            <span
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                              "
                              style={{
                                backgroundColor:
                                  isCurrent
                                    ? theme.primary
                                    : theme.muted,
                                color:
                                  isCurrent
                                    ? theme.primaryForeground
                                    : theme.mutedForeground,
                              }}
                            >
                              {isCurrent &&
                              isPlaying ? (
                                <Pause className="h-3.5 w-3.5" />
                              ) : (
                                <Play
                                  className="
                                    ml-0.5
                                    h-3.5
                                    w-3.5
                                  "
                                />
                              )}
                            </span>

                            <span className="min-w-0">
                              <span
                                className="
                                  block
                                  truncate
                                  text-xs
                                  font-semibold
                                "
                              >
                                {item.title}
                              </span>

                              <span
                                className="
                                  mt-0.5
                                  block
                                  truncate
                                  text-[10px]
                                  text-muted-foreground
                                  sm:hidden
                                "
                              >
                                {item.artist}
                              </span>
                            </span>
                          </button>

                          <span
                            className="
                              hidden
                              truncate
                              text-[11px]
                              text-muted-foreground
                              sm:block
                            "
                          >
                            {item.artist}
                          </span>

                          <span
                            className="
                              text-right
                              text-[10px]
                              font-medium
                              text-muted-foreground
                            "
                          >
                            {formatTime(
                              item.duration
                            )}
                          </span>

                          <button
                            type="button"
                            aria-label={`Favourite ${item.title}`}
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-full
                              text-muted-foreground
                              transition
                              hover:bg-muted
                            "
                          >
                            <Heart className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>
        </section>

        {/* =================================================
            RECOMMENDED
        ================================================= */}

        {!libraryLoading &&
          recommendations.length > 0 && (
            <section className="mt-7">
              <div className="mb-4">
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-muted-foreground
                  "
                >
                  Personalized
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-semibold
                    tracking-tight
                  "
                >
                  Recommended for you
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  More sounds from your local music
                  library.
                </p>
              </div>

              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {recommendations.map(
                  (item, index) => {
                    const actualIndex =
                      tracks.findIndex(
                        (value) =>
                          value.id ===
                          item.id
                      );

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          playTrack(
                            actualIndex
                          )
                        }
                        className="
                          group
                          flex
                          items-center
                          gap-4
                          rounded-2xl
                          border
                          border-border/60
                          bg-card
                          p-4
                          text-left
                          transition
                          hover:-translate-y-0.5
                          hover:shadow-md
                        "
                      >
                        <span
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                          "
                          style={{
                            background:
                              index % 3 ===
                              0
                                ? `linear-gradient(
                                    135deg,
                                    ${theme.primary},
                                    ${theme.secondary}
                                  )`
                                : index % 3 ===
                                  1
                                ? `linear-gradient(
                                    135deg,
                                    ${theme.accent},
                                    ${theme.primary}
                                  )`
                                : `linear-gradient(
                                    135deg,
                                    ${theme.secondary},
                                    ${theme.accent}
                                  )`,
                            color:
                              theme.primaryForeground,
                          }}
                        >
                          <Music2 className="h-5 w-5" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="
                              block
                              truncate
                              text-sm
                              font-semibold
                            "
                          >
                            {item.title}
                          </span>

                          <span
                            className="
                              mt-0.5
                              block
                              truncate
                              text-xs
                              text-muted-foreground
                            "
                          >
                            {item.artist}
                          </span>
                        </span>

                        <span
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            opacity-0
                            transition
                            group-hover:opacity-100
                          "
                          style={{
                            backgroundColor:
                              `color-mix(
                                in srgb,
                                ${theme.primary} 10%,
                                transparent
                              )`,
                            color:
                              theme.primary,
                          }}
                        >
                          <Play
                            className="
                              ml-0.5
                              h-3.5
                              w-3.5
                            "
                            fill="currentColor"
                          />
                        </span>
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