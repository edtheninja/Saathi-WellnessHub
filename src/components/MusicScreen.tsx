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
import { supabase } from "@/supabaseClient";
/* -------------------------------------------------------------------------- */
/*                                Local music                                 */
/* -------------------------------------------------------------------------- */

const musicModules = import.meta.glob(
  "/src/assets/Music/*.{mp3,wav,ogg,m4a,webm}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

/* -------------------------------------------------------------------------- */
/*                              Supabase data                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;

  dbId?: string;

  album?: string;
  playlistName?: string;
  category?: string;
  genre?: string | null;
  coverUrl?: string;

  isAvailable?: boolean;

  durationSeconds?: number;
  energyLevel?: number | null;

  listenedTill?: number;
  repetition?: number;
  isFavorite?: boolean;

  lastListenedAt?: string | null;
};

type MusicRow = {
  id: string;
  user_id?: string;

  song_name: string;
  artist: string;

  album?: string;
  playlist_name?: string;
  category?: string;
  genre?: string | null;

  audio_url: string;
  cover_url?: string | null;

  is_available?: boolean;

  duration_seconds?: number | null;
  energy_level?: number | null;

  listened_till?: number;
  repetition?: number;
  is_favorite?: boolean;

  last_listened_at?: string | null;

  created_at?: string;
  updated_at?: string;
};

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_ENERGY_LEVEL = 50;

/*
 * Progress is written approximately every 7 seconds.
 *
 * We also force-save on:
 * - pause
 * - seek
 * - next
 * - previous
 * - track change
 * - page hide
 * - unmount
 * - ended
 */
const PROGRESS_SAVE_INTERVAL_SECONDS = 7;

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const createTrackId = (value: string) => {
  return (
    value
      .split("/")
      .pop()
      ?.replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "track"
  );
};

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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/* -------------------------------------------------------------------------- */
/*                               Flower artwork                               */
/* -------------------------------------------------------------------------- */

const FlowerArtwork = () => {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-8 w-8"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="10" fill="hsl(var(--primary))" opacity="0.9" />

      <g fill="hsl(var(--primary))" opacity="0.55">
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

        <ellipse cx="68" cy="32" rx="10" ry="18" transform="rotate(45 68 32)" />

        <ellipse cx="32" cy="68" rx="10" ry="18" transform="rotate(45 32 68)" />

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
};

/* -------------------------------------------------------------------------- */
/*                               Main component                               */
/* -------------------------------------------------------------------------- */

export default function MusicScreen() {
  /* ------------------------------------------------------------------------ */
  /*                                  State                                   */
  /* ------------------------------------------------------------------------ */

  const [tracks, setTracks] = useState<Track[]>([]);

  const [libraryLoading, setLibraryLoading] = useState(true);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);

  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(0.85);

  const [isFavorite, setIsFavorite] = useState(false);

  const [isShuffled, setIsShuffled] = useState(false);

  const [isRepeated, setIsRepeated] = useState(false);

  const [search, setSearch] = useState("");

  const [finalEnergyLevel, setFinalEnergyLevel] =
    useState(DEFAULT_ENERGY_LEVEL);

  const [hasFinalEnergy, setHasFinalEnergy] = useState(false);

  /* ------------------------------------------------------------------------ */
  /*                                   Refs                                   */
  /* ------------------------------------------------------------------------ */

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);

  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const waveformDataRef = useRef<Uint8Array | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  const barValuesRef = useRef<number[]>([]);

  const targetValuesRef = useRef<number[]>([]);

  /*
   * currentTrackRef is the track React considers current.
   */
  const currentTrackRef = useRef<Track | undefined>(undefined);
  const currentUserIdRef = useRef<string | null>(null);

  /*
   * loadedAudioTrackRef is the track actually attached
   * to the HTMLAudioElement.
   *
   * This prevents a race where React changes currentTrack
   * before the old audio element fires "pause".
   */
  const loadedAudioTrackRef = useRef<Track | undefined>(undefined);

  const currentTimeRef = useRef(0);

  const durationRef = useRef(0);

  /*
   * Last second successfully saved.
   */
  const lastSavedSecondRef = useRef(-1);

  /*
   * Prevents repetition from incrementing on every
   * play/pause cycle.
   */
  const playbackCountedTrackIdRef = useRef<string | null>(null);

  /*
   * Serializes progress updates so two asynchronous
   * requests do not overwrite each other incorrectly.
   */
  const progressSaveInFlightRef = useRef<Promise<void> | null>(null);

  const progressSaveSequenceRef = useRef(0);

  const currentTrack = tracks[currentTrackIndex];

  currentTrackRef.current = currentTrack;

  /* ------------------------------------------------------------------------ */
  /*                           Load local music                               */
  /* ------------------------------------------------------------------------ */

  const loadLocalTracks = useCallback(async (): Promise<Track[]> => {
    /*
     * Songs are bundled by Vite from:
     *
     * src/assets/Music/*
     *
     * No /Music/music.json request is necessary.
     */
    return Object.entries(musicModules)
      .map(([path, src]) => ({
        id: createTrackId(path),
        title: getTitle(path),
        artist: "Saathi Music",
        src,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                         Load music + DB metadata                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;

    const loadMusic = async () => {
      setLibraryLoading(true);

      try {
        const localTracks = await loadLocalTracks();

        if (cancelled) {
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        currentUserIdRef.current = user?.id ?? null;

        /*
         * Audio files are local frontend assets.
         * Per-user music metadata is loaded directly from Supabase.
         */
        if (!user) {
          setTracks(localTracks);
          setCurrentTrackIndex(0);
          return;
        }

        const { data: rowsData, error: rowsError } = await supabase
          .from("music")
          .select("*")
          .eq("user_id", user.id);

        if (rowsError) {
          throw rowsError;
        }

        const rows = Array.isArray(rowsData) ? (rowsData as MusicRow[]) : [];

        const findRow = (track: Track): MusicRow | undefined => {
          const exact = rows.find((row) => row.audio_url === track.src);

          if (exact) {
            return exact;
          }

          return rows.find(
            (row) =>
              row.song_name?.trim().toLowerCase() ===
                track.title.trim().toLowerCase() &&
              (row.artist || "Saathi Music").trim().toLowerCase() ===
                track.artist.trim().toLowerCase(),
          );
        };

        const merged: Track[] = localTracks.map((track) => {
          const row = findRow(track);

          if (!row) {
            return {
              ...track,
              category: "wellness",
              isAvailable: true,
              listenedTill: 0,
              repetition: 0,
              isFavorite: false,
              energyLevel: null,
            };
          }

          return {
            ...track,
            dbId: row.id,
            album: row.album ?? "",
            playlistName: row.playlist_name ?? "",
            category: row.category ?? "wellness",
            genre: row.genre ?? null,
            coverUrl: row.cover_url ?? undefined,
            isAvailable: row.is_available !== false,
            durationSeconds:
              typeof row.duration_seconds === "number" &&
              Number.isFinite(row.duration_seconds) &&
              row.duration_seconds > 0
                ? row.duration_seconds
                : undefined,
            energyLevel:
              typeof row.energy_level === "number" &&
              Number.isFinite(row.energy_level)
                ? row.energy_level
                : null,
            listenedTill: Math.max(0, Number(row.listened_till ?? 0)),
            repetition: Math.max(0, Number(row.repetition ?? 0)),
            isFavorite: row.is_favorite === true,
            lastListenedAt: row.last_listened_at ?? null,
          };
        });

        const missing = merged.filter((track) => !track.dbId);

        if (missing.length > 0) {
          const rowsToInsert = missing.map((track) => ({
            user_id: user.id,
            song_name: track.title,
            artist: track.artist,
            album: "",
            playlist_name: "",
            category: "wellness",
            genre: null,
            audio_url: track.src,
            cover_url: null,
            is_available: true,
            listened_till: 0,
            repetition: 0,
            is_favorite: false,
            energy_level: null,
          }));

          const { data: created, error: insertError } = await supabase
            .from("music")
            .insert(rowsToInsert)
            .select("*");

          if (insertError) {
            console.error("Failed to create music metadata:", insertError);
          } else {
            for (const row of (created ?? []) as MusicRow[]) {
              const index = merged.findIndex(
                (track) =>
                  track.src === row.audio_url ||
                  (track.title.trim().toLowerCase() ===
                    row.song_name.trim().toLowerCase() &&
                    track.artist.trim().toLowerCase() ===
                      (row.artist || "Saathi Music").trim().toLowerCase()),
              );

              if (index === -1) {
                continue;
              }

              merged[index] = {
                ...merged[index],
                dbId: row.id,
                album: row.album ?? "",
                playlistName: row.playlist_name ?? "",
                category: row.category ?? "wellness",
                genre: row.genre ?? null,
                coverUrl: row.cover_url ?? undefined,
                isAvailable: row.is_available !== false,
                durationSeconds:
                  typeof row.duration_seconds === "number" &&
                  row.duration_seconds > 0
                    ? row.duration_seconds
                    : undefined,
                energyLevel:
                  typeof row.energy_level === "number"
                    ? row.energy_level
                    : null,
                listenedTill: Math.max(0, Number(row.listened_till ?? 0)),
                repetition: Math.max(0, Number(row.repetition ?? 0)),
                isFavorite: row.is_favorite === true,
                lastListenedAt: row.last_listened_at ?? null,
              };
            }
          }
        }

        if (!cancelled) {
          setTracks(merged);
          setCurrentTrackIndex(0);
        }
      } catch (error) {
        console.error("Music loading failed:", error);

        const fallback = await loadLocalTracks();

        if (!cancelled) {
          setTracks(fallback);
          setCurrentTrackIndex(0);
        }
      } finally {
        if (!cancelled) {
          setLibraryLoading(false);
        }
      }
    };

    void loadMusic();

    return () => {
      cancelled = true;
    };
  }, [loadLocalTracks]);

  /* ------------------------------------------------------------------------ */
  /*                              Audio helper                                */
  /* ------------------------------------------------------------------------ */

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();

      audioRef.current.preload = "metadata";
    }

    return audioRef.current;
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                            Audio analyser                                */
  /* ------------------------------------------------------------------------ */

  const initializeAnalyser = useCallback(() => {
    const audio = getAudio();

    if (audioContextRef.current && analyserRef.current) {
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
      const context = new AudioContextClass();

      const analyser = context.createAnalyser();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.9;

      const source = context.createMediaElementSource(audio);

      source.connect(analyser);

      analyser.connect(context.destination);

      audioContextRef.current = context;

      analyserRef.current = analyser;

      sourceNodeRef.current = source;

      waveformDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    } catch (error) {
      console.warn("Audio analyser initialization failed:", error);
    }
  }, [getAudio]);

  /* ------------------------------------------------------------------------ */
  /*                         Save playback progress                            */
  /* ------------------------------------------------------------------------ */

  const persistTrackProgress = useCallback(
    async (
      track: Track | undefined,
      audio: HTMLAudioElement,
      force = false,
    ): Promise<void> => {
      if (!track?.dbId) {
        return;
      }

      const rawCurrentTime = Number(audio.currentTime);

      if (!Number.isFinite(rawCurrentTime) || rawCurrentTime < 0) {
        return;
      }

      const rawDuration = Number(audio.duration);

      const knownDuration =
        Number.isFinite(rawDuration) && rawDuration > 0
          ? rawDuration
          : Number.isFinite(track.durationSeconds ?? NaN) &&
              Number(track.durationSeconds ?? 0) > 0
            ? Number(track.durationSeconds)
            : 0;

      const listenedTill =
        knownDuration > 0
          ? Math.min(rawCurrentTime, knownDuration)
          : rawCurrentTime;

      const second = Math.floor(listenedTill);

      /*
       * Don't write every timeupdate event.
       */
      if (
        !force &&
        second - lastSavedSecondRef.current < PROGRESS_SAVE_INTERVAL_SECONDS
      ) {
        return;
      }

      const trackId = track.dbId;

      const sequence = ++progressSaveSequenceRef.current;

      const save = async () => {
        const timestamp = new Date().toISOString();

        const payload: {
          listened_till: number;
          duration_seconds?: number;
          last_listened_at: string;
        } = {
          listened_till: Math.max(0, Math.floor(listenedTill)),

          last_listened_at: timestamp,
        };

        if (knownDuration > 0) {
          payload.duration_seconds = Math.max(1, Math.ceil(knownDuration));
        }

        try {
          const userId = currentUserIdRef.current;

          if (!userId) {
            return;
          }

          const { error } = await supabase
            .from("music")
            .update(payload)
            .eq("id", trackId)
            .eq("user_id", userId);

          if (error) {
            throw error;
          }
        } catch (error) {
          console.error("Failed to save listening progress:", error);

          return;
        }

        if (sequence === progressSaveSequenceRef.current) {
          lastSavedSecondRef.current = second;

          setTracks((previous) =>
            previous.map((item) =>
              item.dbId === trackId
                ? {
                    ...item,

                    listenedTill: listenedTill,

                    durationSeconds:
                      knownDuration > 0
                        ? Math.ceil(knownDuration)
                        : item.durationSeconds,

                    lastListenedAt: timestamp,
                  }
                : item,
            ),
          );
        }
      };

      /*
       * Serialize saves.
       */
      const queued = progressSaveInFlightRef.current
        ? progressSaveInFlightRef.current.catch(() => undefined).then(save)
        : save();

      progressSaveInFlightRef.current = queued.then(
        () => undefined,
        () => undefined,
      );

      await queued;
    },
    [],
  );

  const persistCurrentTrack = useCallback(
    async (force = true) => {
      const audio = audioRef.current;

      const track = currentTrackRef.current;

      if (!audio || !track) {
        return;
      }

      await persistTrackProgress(track, audio, force);
    },
    [persistTrackProgress],
  );

  /* ------------------------------------------------------------------------ */
  /*                          Repetition tracking                             */
  /* ------------------------------------------------------------------------ */

  const incrementRepetition = useCallback(async (track: Track | undefined) => {
    if (!track?.dbId) {
      return;
    }

    /*
     * A single play session only increments once.
     *
     * Play -> Pause -> Play
     *
     * does NOT become two repetitions.
     */
    if (playbackCountedTrackIdRef.current === track.id) {
      return;
    }

    playbackCountedTrackIdRef.current = track.id;

    const nextRepetition = Math.max(0, Number(track.repetition ?? 0)) + 1;

    const timestamp = new Date().toISOString();

    try {
      const userId = currentUserIdRef.current;

      if (!userId) {
        return;
      }

      const { error } = await supabase
        .from("music")
        .update({
          repetition: nextRepetition,
          last_listened_at: timestamp,
        })
        .eq("id", track.dbId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      /*
       * Allow retry if DB update failed.
       */
      playbackCountedTrackIdRef.current = null;

      console.error("Failed to save music repetition:", error);

      return;
    }

    setTracks((previous) =>
      previous.map((item) =>
        item.dbId === track.dbId
          ? {
              ...item,

              repetition: nextRepetition,

              lastListenedAt: timestamp,
            }
          : item,
      ),
    );
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                          Track switching                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!currentTrack) {
      return;
    }

    const audio = getAudio();

    /*
     * Pause old track first.
     *
     * Its pause event still sees the previous
     * loadedAudioTrackRef.
     */
    audio.pause();

    audio.src = currentTrack.src;

    loadedAudioTrackRef.current = currentTrack;

    audio.volume = volume;

    const savedPosition = Number.isFinite(currentTrack.listenedTill ?? NaN)
      ? Math.max(0, Number(currentTrack.listenedTill ?? 0))
      : 0;

    const knownDuration =
      Number.isFinite(currentTrack.durationSeconds ?? NaN) &&
      Number(currentTrack.durationSeconds ?? 0) > 0
        ? Number(currentTrack.durationSeconds)
        : 0;

    currentTimeRef.current = Math.min(
      savedPosition,
      knownDuration || Number.MAX_SAFE_INTEGER,
    );

    durationRef.current = knownDuration;

    setCurrentTime(currentTimeRef.current);

    setDuration(knownDuration);

    playbackCountedTrackIdRef.current = null;

    lastSavedSecondRef.current = Math.floor(currentTimeRef.current);

    audio.load();

    if (isPlaying) {
      initializeAnalyser();

      void audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrack?.id, getAudio, initializeAnalyser, isPlaying]);

  /* ------------------------------------------------------------------------ */
  /*                            Audio events                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const audio = getAudio();

    const handleLoadedMetadata = () => {
      const actualDuration = Number(audio.duration);

      if (!Number.isFinite(actualDuration) || actualDuration <= 0) {
        return;
      }

      durationRef.current = actualDuration;

      setDuration(actualDuration);

      const track = loadedAudioTrackRef.current;

      /*
       * Store actual duration in Supabase.
       */
      if (track?.dbId) {
        const durationSeconds = Math.max(1, Math.ceil(actualDuration));

        const userId = currentUserIdRef.current;

        if (userId) {
          void supabase
            .from("music")
            .update({ duration_seconds: durationSeconds })
            .eq("id", track.dbId)
            .eq("user_id", userId)
            .then(({ error }) => {
              if (error) {
                throw error;
              }

              setTracks((previous) =>
                previous.map((item) =>
                  item.dbId === track.dbId
                    ? {
                        ...item,
                        durationSeconds,
                      }
                    : item,
                ),
              );
            })
            .catch((error) => {
              console.error("Failed to save song duration:", error);
            });
        }
      }

      /*
       * Resume from saved listened_till.
       */
      const savedPosition = Math.max(0, Number(track?.listenedTill ?? 0));

      const resumePosition = Math.min(
        savedPosition,
        Math.max(0, actualDuration - 0.25),
      );

      if (Number.isFinite(resumePosition) && resumePosition > 0) {
        try {
          audio.currentTime = resumePosition;

          currentTimeRef.current = resumePosition;

          setCurrentTime(resumePosition);
        } catch {
          /*
           * Ignore browser currentTime errors.
           */
        }
      }
    };

    const handleTimeUpdate = () => {
      const time = Number(audio.currentTime);

      if (!Number.isFinite(time) || time < 0) {
        return;
      }

      currentTimeRef.current = time;

      setCurrentTime(time);

      const track = loadedAudioTrackRef.current;

      if (
        track?.dbId &&
        Math.floor(time) - lastSavedSecondRef.current >=
          PROGRESS_SAVE_INTERVAL_SECONDS
      ) {
        void persistTrackProgress(track, audio, false);
      }
    };

    const handlePlay = () => {
      void incrementRepetition(loadedAudioTrackRef.current);
    };

    const handlePause = () => {
      /*
       * IMPORTANT:
       *
       * Do NOT use currentTrackRef here.
       *
       * When changing songs, React may already have
       * rendered the new track while the audio element
       * is still firing pause for the old track.
       */
      const track = loadedAudioTrackRef.current;

      if (!track) {
        return;
      }

      void persistTrackProgress(track, audio, true);
    };

    const handleEnded = () => {
      const track = loadedAudioTrackRef.current;

      const finalDuration = Number(audio.duration);

      const finalPosition =
        Number.isFinite(finalDuration) && finalDuration > 0
          ? finalDuration
          : durationRef.current;

      currentTimeRef.current = Math.max(0, finalPosition);

      setCurrentTime(currentTimeRef.current);

      /*
       * Save listened_till = duration.
       */
      if (track?.dbId) {
        void persistTrackProgress(track, audio, true);
      }

      /* ------------------------------ Repeat ----------------------------- */

      if (isRepeated) {
        /*
         * A repeat is a new playback session.
         */
        playbackCountedTrackIdRef.current = null;

        audio.currentTime = 0;

        currentTimeRef.current = 0;

        setCurrentTime(0);

        void audio.play().catch(() => {
          setIsPlaying(false);
        });

        return;
      }

      if (!tracks.length) {
        setIsPlaying(false);
        return;
      }

      /* ------------------------------ Shuffle ---------------------------- */

      if (isShuffled && tracks.length > 1) {
        let nextIndex = currentTrackIndex;

        while (nextIndex === currentTrackIndex) {
          nextIndex = Math.floor(Math.random() * tracks.length);
        }

        playbackCountedTrackIdRef.current = null;

        setCurrentTrackIndex(nextIndex);

        setIsPlaying(true);

        return;
      }

      /* --------------------------- Normal next --------------------------- */

      const nextIndex =
        currentTrackIndex + 1 >= tracks.length ? 0 : currentTrackIndex + 1;

      playbackCountedTrackIdRef.current = null;

      setCurrentTrackIndex(nextIndex);

      setIsPlaying(true);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    audio.addEventListener("timeupdate", handleTimeUpdate);

    audio.addEventListener("play", handlePlay);

    audio.addEventListener("pause", handlePause);

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);

      audio.removeEventListener("timeupdate", handleTimeUpdate);

      audio.removeEventListener("play", handlePlay);

      audio.removeEventListener("pause", handlePause);

      audio.removeEventListener("ended", handleEnded);
    };
  }, [
    currentTrackIndex,
    getAudio,
    incrementRepetition,
    isRepeated,
    isShuffled,
    persistTrackProgress,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                              Volume                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    getAudio().volume = volume;
  }, [getAudio, volume]);

  /* ------------------------------------------------------------------------ */
  /*                            Waveform                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const canvas = waveformCanvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const BAR_COUNT = 72;
    const GAP = 3;

    if (barValuesRef.current.length !== BAR_COUNT) {
      barValuesRef.current = new Array(BAR_COUNT).fill(0.05);

      targetValuesRef.current = new Array(BAR_COUNT).fill(0.05);
    }

    const values = barValuesRef.current;

    const targets = targetValuesRef.current;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;

      width = rect.width;

      height = rect.height;

      canvas.width = Math.max(1, Math.floor(width * dpr));

      canvas.height = Math.max(1, Math.floor(height * dpr));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const observer = new ResizeObserver(resize);

    observer.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;

      const data = waveformDataRef.current;

      let overallEnergy = 0.06;

      if (analyser && data && isPlaying) {
        analyser.getByteFrequencyData(data);

        const usefulBins = Math.floor(data.length * 0.72);

        let total = 0;

        for (let i = 0; i < usefulBins; i++) {
          total += data[i];
        }

        overallEnergy = total / Math.max(1, usefulBins) / 255;
      }

      const halfBars = Math.ceil(BAR_COUNT / 2);

      const halfValues = new Array(halfBars).fill(0.05);

      if (analyser && data && isPlaying) {
        for (let i = 0; i < halfBars; i++) {
          const position = i / Math.max(1, halfBars - 1);

          const frequencyIndex = Math.floor(
            Math.pow(position, 1.45) * data.length * 0.72,
          );

          let sum = 0;

          for (let j = 0; j < 4; j++) {
            const index = Math.min(data.length - 1, frequencyIndex + j);

            sum += data[index];
          }

          const average = sum / 4 / 255;

          halfValues[i] = 0.055 + Math.pow(average, 1.08) * 0.82;
        }
      } else {
        for (let i = 0; i < halfBars; i++) {
          const position = i / Math.max(1, halfBars - 1);

          halfValues[i] = 0.045 + (1 - position) * 0.03;
        }
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        const distance =
          Math.abs(i - (BAR_COUNT - 1) / 2) / ((BAR_COUNT - 1) / 2);

        const sourceIndex = Math.round(distance * (halfBars - 1));

        const mirrored =
          halfValues[
            Math.max(0, Math.min(halfBars - 1, halfBars - 1 - sourceIndex))
          ];

        const centerWeight = 1 - Math.pow(distance, 1.75) * 0.34;

        const target = mirrored * centerWeight + overallEnergy * 0.07;

        targets[i] = Math.max(0.045, Math.min(1, target));
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        values[i] += (targets[i] - values[i]) * 0.095;
      }

      const time = performance.now() / 1000;

      const flow = time * 1.25;

      const barWidth = Math.max(2, (width - GAP * (BAR_COUNT - 1)) / BAR_COUNT);

      const centerY = height / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const left = values[Math.max(0, i - 1)];

        const current = values[i];

        const right = values[Math.min(BAR_COUNT - 1, i + 1)];

        let value = left * 0.2 + current * 0.6 + right * 0.2;

        value += Math.sin(i * 0.23 - flow) * 0.06;

        value += Math.sin(i * 0.1 - flow * 0.55) * 0.025;

        value = Math.max(0.04, Math.min(1, value));

        const barHeight = Math.max(5, value * height * 0.78);

        const x = i * (barWidth + GAP);

        const y = centerY - barHeight / 2;

        ctx.fillStyle = isPlaying
          ? `rgba(0, 0, 0, ${0.28 + value * 0.62})`
          : "rgba(0, 0, 0, 0.14)";

        ctx.beginPath();

        ctx.roundRect(x, y, barWidth, barHeight, Math.min(barWidth / 2, 6));

        ctx.fill();
      }

      const glow = ctx.createRadialGradient(
        width / 2,
        centerY,
        0,
        width / 2,
        centerY,
        width * 0.32,
      );

      glow.addColorStop(0, "rgba(0, 0, 0, 0.045)");

      glow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = glow;

      ctx.fillRect(0, 0, width, height);

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  /* ------------------------------------------------------------------------ */
  /*                               Play / Pause                               */
  /* ------------------------------------------------------------------------ */

  const togglePlay = useCallback(async () => {
    const audio = getAudio();

    if (!currentTrack) {
      return;
    }

    initializeAnalyser();

    try {
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      if (audio.paused) {
        await audio.play();

        setIsPlaying(true);
      } else {
        audio.pause();

        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Music playback failed:", error);

      setIsPlaying(false);
    }
  }, [currentTrack, getAudio, initializeAnalyser]);

  /* ------------------------------------------------------------------------ */
  /*                              Play track                                  */
  /* ------------------------------------------------------------------------ */

  const playTrack = useCallback(
    (index: number) => {
      const nextTrack = tracks[index];

      if (!nextTrack) {
        return;
      }

      /*
       * Save current track before changing.
       */
      if (audioRef.current && currentTrackRef.current) {
        void persistCurrentTrack(true);
      }

      /*
       * Clicking the currently playing song
       * starts it again from zero.
       */
      if (index === currentTrackIndex) {
        const audio = audioRef.current;

        audio?.pause();

        if (audio) {
          audio.currentTime = 0;
        }

        currentTimeRef.current = 0;

        setCurrentTime(0);
      }

      /*
       * New playback session.
       */
      playbackCountedTrackIdRef.current = null;

      setCurrentTrackIndex(index);

      setIsPlaying(true);

      initializeAnalyser();
    },
    [currentTrackIndex, initializeAnalyser, persistCurrentTrack, tracks],
  );

  /* ------------------------------------------------------------------------ */
  /*                               Next track                                 */
  /* ------------------------------------------------------------------------ */

  const nextTrack = useCallback(() => {
    if (!tracks.length) {
      return;
    }

    void persistCurrentTrack(true);

    let nextIndex = currentTrackIndex;

    if (isShuffled && tracks.length > 1) {
      while (nextIndex === currentTrackIndex) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      }
    } else {
      nextIndex =
        currentTrackIndex + 1 >= tracks.length ? 0 : currentTrackIndex + 1;
    }

    playbackCountedTrackIdRef.current = null;

    setCurrentTrackIndex(nextIndex);

    setIsPlaying(true);
  }, [currentTrackIndex, isShuffled, persistCurrentTrack, tracks.length]);

  /* ------------------------------------------------------------------------ */
  /*                            Previous track                                */
  /* ------------------------------------------------------------------------ */

  const previousTrack = useCallback(() => {
    if (!tracks.length) {
      return;
    }

    const audio = getAudio();

    /*
     * If more than 4 seconds into song,
     * previous means restart current song.
     */
    if (audio.currentTime > 4) {
      audio.currentTime = 0;

      currentTimeRef.current = 0;

      setCurrentTime(0);

      void persistCurrentTrack(true);

      return;
    }

    void persistCurrentTrack(true);

    const previousIndex =
      currentTrackIndex - 1 < 0 ? tracks.length - 1 : currentTrackIndex - 1;

    playbackCountedTrackIdRef.current = null;

    setCurrentTrackIndex(previousIndex);

    setIsPlaying(true);
  }, [currentTrackIndex, getAudio, persistCurrentTrack, tracks.length]);

  /* ------------------------------------------------------------------------ */
  /*                                  Seek                                    */
  /* ------------------------------------------------------------------------ */

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);

    if (!Number.isFinite(value) || value < 0) {
      return;
    }

    const audio = getAudio();

    const safeValue =
      durationRef.current > 0 ? Math.min(value, durationRef.current) : value;

    audio.currentTime = safeValue;

    currentTimeRef.current = safeValue;

    setCurrentTime(safeValue);

    /*
     * Seeking is an important event,
     * therefore save immediately.
     */
    void persistCurrentTrack(true);
  };

  /* ------------------------------------------------------------------------ */
  /*                              Search                                      */
  /* ------------------------------------------------------------------------ */

  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tracks;
    }

    return tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query),
    );
  }, [search, tracks]);

  /* ------------------------------------------------------------------------ */
  /*                         Load final energy                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;

    const loadFinalEnergy = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            setFinalEnergyLevel(DEFAULT_ENERGY_LEVEL);
            setHasFinalEnergy(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("wellness_scores")
          .select("final_energy_level")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        const value = Number(data?.final_energy_level);

        if (Number.isFinite(value) && value >= 1 && value <= 100) {
          if (!cancelled) {
            setFinalEnergyLevel(Math.round(value));
            setHasFinalEnergy(true);
          }
        } else if (!cancelled) {
          setFinalEnergyLevel(DEFAULT_ENERGY_LEVEL);
          setHasFinalEnergy(false);
        }
      } catch (error) {
        console.error("Final energy lookup failed:", error);

        if (!cancelled) {
          setFinalEnergyLevel(DEFAULT_ENERGY_LEVEL);
          setHasFinalEnergy(false);
        }
      }
    };

    void loadFinalEnergy();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                         Music recommendations                             */
  /* ------------------------------------------------------------------------ */

  const recommendations = useMemo(() => {
    /*
     * If wellness score exists:
     *
     *   use final energy
     *
     * Otherwise:
     *
     *   use default 50
     */
    const targetEnergy = hasFinalEnergy
      ? finalEnergyLevel
      : DEFAULT_ENERGY_LEVEL;

    return (
      tracks

        /*
         * Do not recommend currently playing track.
         */
        .filter(
          (track, index) =>
            index !== currentTrackIndex && track.isAvailable !== false,
        )

        .map((track) => {
          /*
           * Songs without energy metadata are neutral.
           *
           * They won't require a valid energy value
           * just to appear in recommendations.
           */
          const energy =
            typeof track.energyLevel === "number" &&
            Number.isFinite(track.energyLevel)
              ? track.energyLevel
              : targetEnergy;

          /*
           * PRIMARY:
           *
           * closest energy level.
           */
          const energyDistance = Math.abs(energy - targetEnergy);

          /*
           * SECONDARY:
           *
           * Favorites get a small boost.
           */
          const favoriteBonus = track.isFavorite ? 8 : 0;

          /*
           * Don't endlessly recommend a song
           * that has already been played many times.
           */
          const repetitionPenalty = Math.min(
            10,
            Math.max(0, Number(track.repetition ?? 0)),
          );

          /*
           * Recently listened songs get
           * a small penalty.
           */
          const lastListenedTime = track.lastListenedAt
            ? new Date(track.lastListenedAt).getTime()
            : 0;

          const daysSinceListened =
            lastListenedTime > 0
              ? Math.max(
                  0,
                  (Date.now() - lastListenedTime) / (24 * 60 * 60 * 1000),
                )
              : Infinity;

          const recentPenalty = Number.isFinite(daysSinceListened)
            ? Math.max(0, 5 - Math.min(5, daysSinceListened))
            : 0;

          /*
           * Lower score = better recommendation.
           */
          const score =
            energyDistance * 100 -
            favoriteBonus +
            repetitionPenalty +
            recentPenalty;

          return {
            track,
            score,
            energyDistance,
          };
        })

        .sort((a, b) => {
          if (a.score !== b.score) {
            return a.score - b.score;
          }

          if (a.energyDistance !== b.energyDistance) {
            return a.energyDistance - b.energyDistance;
          }

          return a.track.title.localeCompare(b.track.title);
        })

        .slice(0, 4)

        .map(({ track }) => track)
    );
  }, [currentTrackIndex, finalEnergyLevel, hasFinalEnergy, tracks]);

  /* ------------------------------------------------------------------------ */
  /*                            Favorite sync                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setIsFavorite(currentTrack?.isFavorite === true);
  }, [currentTrack?.id, currentTrack?.isFavorite]);

  /* ------------------------------------------------------------------------ */
  /*                         Toggle favorite                                  */
  /* ------------------------------------------------------------------------ */

  const toggleFavorite = useCallback(async () => {
    const track = currentTrackRef.current;

    if (!track?.dbId) {
      return;
    }

    const previousValue = track.isFavorite === true;

    const nextValue = !previousValue;

    /*
     * Optimistic UI update.
     */
    setIsFavorite(nextValue);

    setTracks((previous) =>
      previous.map((item) =>
        item.dbId === track.dbId
          ? {
              ...item,
              isFavorite: nextValue,
            }
          : item,
      ),
    );

    try {
      const userId = currentUserIdRef.current;

      if (!userId) {
        throw new Error("No authenticated user");
      }

      const { error } = await supabase
        .from("music")
        .update({ is_favorite: nextValue })
        .eq("id", track.dbId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Failed to save favourite:", error);

      /*
       * Rollback.
       */
      setIsFavorite(previousValue);

      setTracks((previous) =>
        previous.map((item) =>
          item.dbId === track.dbId
            ? {
                ...item,
                isFavorite: previousValue,
              }
            : item,
        ),
      );
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                       Save when page disappears                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        void persistCurrentTrack(true);
      }
    };

    const handlePageHide = () => {
      void persistCurrentTrack(true);
    };

    document.addEventListener("visibilitychange", handleVisibility);

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);

      window.removeEventListener("pagehide", handlePageHide);

      /*
       * Best-effort final save.
       */
      void persistCurrentTrack(true);

      if (audioRef.current) {
        audioRef.current.pause();

        audioRef.current.src = "";

        loadedAudioTrackRef.current = undefined;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [persistCurrentTrack]);

  /* ------------------------------------------------------------------------ */
  /*                                    UI                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-32">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <header className="mb-7 sm:mb-9">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Music2 className="h-4 w-4" />

            <span>Saathi Music</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Relax, Breathe, Flow
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Soothing music for yoga, meditation and relaxation.
            <br className="hidden sm:block" />
            Find your peace anytime, anywhere.
          </p>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Main player + collection                                         */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,.95fr)]">
          {/* ============================================================= */}
          {/* LEFT                                                           */}
          {/* ============================================================= */}

          <div className="flex min-w-0 flex-col gap-5">
            {/* Meditation image */}

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

            {/* Player */}

            <section className="rounded-[2rem] bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:p-6">
              {/* Track information */}

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Now Playing
                  </p>

                  <h2 className="mt-1 truncate text-xl font-semibold sm:text-2xl">
                    {currentTrack?.title || "No music found"}
                  </h2>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {currentTrack?.artist || "Add music to src/assets/Music"}
                  </p>
                </div>

                {/* Favorite */}

                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={!currentTrack?.dbId}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                    isFavorite
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  } disabled:opacity-40`}
                  aria-label="Favourite"
                >
                  <Heart
                    className="h-5 w-5"
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Waveform */}

              <div className="mt-5 overflow-hidden rounded-2xl bg-background px-2 py-1">
                <canvas ref={waveformCanvasRef} className="block h-24 w-full" />
              </div>

              {/* Seek */}

              <div className="mt-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.01"
                  value={Math.min(currentTime, duration || 0)}
                  onChange={handleSeek}
                  disabled={!currentTrack}
                  className="h-1.5 w-full cursor-pointer"
                  style={{
                    accentColor: "hsl(var(--primary))",
                  }}
                  aria-label="Seek music"
                />

                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>

                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}

              <div className="mt-5 flex items-center justify-center gap-3 sm:gap-5">
                {/* Shuffle */}

                <button
                  type="button"
                  onClick={() => setIsShuffled((value) => !value)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                    isShuffled
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  }`}
                  aria-label="Shuffle"
                >
                  <Shuffle className="h-4 w-4" />
                </button>

                {/* Previous */}

                <button
                  type="button"
                  onClick={previousTrack}
                  disabled={!currentTrack}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-background disabled:opacity-40"
                  aria-label="Previous"
                >
                  <SkipBack className="h-5 w-5 fill-current" />
                </button>

                {/* Play / pause */}

                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!currentTrack}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:scale-[1.03] disabled:opacity-40"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-6 w-6 fill-current" />
                  )}
                </button>

                {/* Next */}

                <button
                  type="button"
                  onClick={nextTrack}
                  disabled={!currentTrack}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-background disabled:opacity-40"
                  aria-label="Next"
                >
                  <SkipForward className="h-5 w-5 fill-current" />
                </button>

                {/* Repeat */}

                <button
                  type="button"
                  onClick={() => setIsRepeated((value) => !value)}
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

              {/* Volume */}

              <div className="mt-6 flex items-center gap-3">
                <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="h-1.5 w-full cursor-pointer"
                  style={{
                    accentColor: "hsl(var(--primary))",
                  }}
                  aria-label="Volume"
                />

                <span className="w-9 text-right text-xs text-muted-foreground">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </section>
          </div>

          {/* ============================================================= */}
          {/* RIGHT                                                          */}
          {/* ============================================================= */}

          <section className="flex min-w-0 flex-col rounded-[2rem] bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:p-6 lg:min-h-[760px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ListMusic className="h-5 w-5 text-primary" />

                  <h2 className="text-xl font-semibold">Your collection</h2>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">All Songs</p>
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {tracks.length}
              </span>
            </div>

            {/* Search */}

            <div className="relative mt-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                placeholder="Search songs..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-xl bg-background px-10 pr-4 text-sm outline-none ring-1 ring-foreground/5 transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/25"
              />
            </div>

            {/* Songs */}

            <div className="mt-4 min-h-[360px] flex-1 overflow-hidden rounded-2xl bg-background/60">
              <div className="h-full max-h-[650px] overflow-y-auto overscroll-contain p-2">
                {libraryLoading ? (
                  <div className="flex h-full min-h-[300px] items-center justify-center text-sm text-muted-foreground">
                    Loading your music...
                  </div>
                ) : filteredTracks.length === 0 ? (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-6 text-center">
                    <Music2 className="mb-3 h-9 w-9 text-primary/60" />

                    <p className="font-medium">
                      {tracks.length === 0
                        ? "No songs found"
                        : "No matching songs"}
                    </p>

                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                      {tracks.length === 0
                        ? "Add your audio files to src/assets/Music."
                        : "Try another search term."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTracks.map((track) => {
                      const originalIndex = tracks.findIndex(
                        (item) => item.id === track.id,
                      );

                      const active = originalIndex === currentTrackIndex;

                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => playTrack(originalIndex)}
                          className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                            active ? "bg-primary/10" : "hover:bg-card"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-primary"
                            }`}
                          >
                            {active && isPlaying ? (
                              <Pause className="h-4 w-4 fill-current" />
                            ) : (
                              <Music2 className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm font-medium ${
                                active ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {track.title}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {track.artist}
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
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Recommendations                                                  */}
        {/* ---------------------------------------------------------------- */}

        {!libraryLoading && recommendations.length > 0 && (
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

              <span className="hidden text-right text-sm text-muted-foreground sm:block">
                Energy match:{" "}
                {hasFinalEnergy ? finalEnergyLevel : DEFAULT_ENERGY_LEVEL}
                /100
                {!hasFinalEnergy ? " · default" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.map((track) => {
                const originalIndex = tracks.findIndex(
                  (item) => item.id === track.id,
                );

                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => playTrack(originalIndex)}
                    className="group rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-foreground/5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Music2 className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {track.title}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {track.artist}
                        </p>
                      </div>

                      <Play className="h-4 w-4 shrink-0 text-primary opacity-70 transition group-hover:scale-110 group-hover:opacity-100" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
