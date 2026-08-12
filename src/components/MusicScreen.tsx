import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import {
  ChevronDown,
  Heart,
  ListMusic,
  MoreHorizontal,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  ChevronRight,
  Shuffle,
} from "lucide-react";

type Track = {
  title: string;
  duration: string;
  artist: string;
  src: string;
};

type Playlist = {
  title: string;
  tracks: Track[];
  color: string;
  artwork: "mint" | "ocean" | "purple";
};

type AlbumArtworkProps = {
  variant: Playlist["artwork"];
  small?: boolean;
};

function AlbumArtwork({ variant, small = false }: AlbumArtworkProps) {
  const variantClass = {
    mint: "from-emerald-100 via-teal-200 to-slate-700",
    ocean: "from-sky-100 via-blue-200 to-slate-700",
    purple: "from-violet-100 via-purple-200 to-slate-700",
  }[variant];

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${variantClass} shadow-inner ${
        small ? "h-14 w-14" : "aspect-square w-full"
      }`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-slate-950/20" />
      <div className="absolute left-[18%] top-[20%] h-[62%] w-[62%] -rotate-[28deg] rounded-[55%_45%_58%_42%] border border-white/55 bg-white/25 shadow-lg backdrop-blur-[2px]" />
      <div className="absolute left-[48%] top-[8%] h-[78%] w-px rotate-[28deg] bg-white/55" />
      <div className="absolute left-[24%] top-[50%] h-px w-[58%] rotate-[28deg] bg-white/35" />
      <div className="absolute inset-x-3 bottom-3 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/80">
        Saathi
      </div>
    </div>
  );
}

const MusicScreen = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => new Audio());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expandedPlaylist, setExpandedPlaylist] = useState<number | null>(
    null,
  );

  /*
   * ORIGINAL MUSIC LIBRARY — kept intact.
   * This pass changes the presentation only.
   */
  const playlists: Playlist[] = [
    {
      title: "-Sukoon🫀-Marham-e-Dil",
      tracks: [
        {
          title: "Banjara",
          duration: "5:36",
          artist: "Mhammed Irfan",
          src: "public/music/Banjara.mp3",
        },
        {
          title: "Humdard",
          duration: "4:20",
          artist: "Arijit Singh",
          src: "public/music/Humdard.mp3",
        },
        {
          title: "Tere Binaa",
          duration: "5:09",
          artist: "A.R. Rahman",
          src: "public/music/Terebina.mp3",
        },
      ],
      color: "bg-gradient-mint",
      artwork: "mint",
    },
    {
      title: "Meditation Music",
      tracks: [
        {
          title: "Tibetan Bowls",
          duration: "8:30",
          artist: "Zen Garden",
          src: "music/tibetan.mp3",
        },
        {
          title: "Crystal Singing",
          duration: "11:15",
          artist: "Healing Sounds",
          src: "music/crystal.mp3",
        },
        {
          title: "Peaceful Piano",
          duration: "9:42",
          artist: "Calm Keys",
          src: "music/piano.mp3",
        },
      ],
      color: "bg-gradient-ocean",
      artwork: "ocean",
    },
    {
      title: "Sleep Stories",
      tracks: [
        {
          title: "Moonlit Garden",
          duration: "22:30",
          artist: "Sleep Stories",
          src: "music/moon.mp3",
        },
        {
          title: "Forest Whispers",
          duration: "18:45",
          artist: "Bedtime Tales",
          src: "music/forest.mp3",
        },
        {
          title: "Ocean Journey",
          duration: "25:12",
          artist: "Dream Voyages",
          src: "music/ocean.mp3",
        },
      ],
      color: "bg-gradient-peaceful",
      artwork: "purple",
    },
  ];

  const currentPlaylist = playlists[0];
  const track = currentPlaylist.tracks[currentTrack];

  const startTrack = useCallback(
    (index: number) => {
      const selected = currentPlaylist.tracks[index];

      setCurrentTrack(index);
      setCurrentTime(0);

      audio.src = selected.src;
      audio.load();

      audio.play().then(() => {
        setIsPlaying(true);
      });

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
    },
    [audio, currentPlaylist.tracks],
  );

  const togglePlay = () => {
    if (!isPlaying) {
      if (!audio.src) {
        startTrack(currentTrack);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const nextTrack = useCallback(() => {
    const next =
      (currentTrack + 1) % currentPlaylist.tracks.length;

    startTrack(next);
  }, [currentTrack, currentPlaylist.tracks.length, startTrack]);

  const prevTrack = () => {
    const prev =
      currentTrack === 0
        ? currentPlaylist.tracks.length - 1
        : currentTrack - 1;

    startTrack(prev);
  };

  useEffect(() => {
    const update = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("ended", nextTrack);

    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("ended", nextTrack);
      audio.pause();
    };
  }, [audio, nextTrack]);

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);

    audio.currentTime = value;
    setCurrentTime(value);
  };

  const format = (seconds: number) => {
    if (!seconds) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${remaining}`;
  };

  const progress =
    duration > 0
      ? Math.min((currentTime / duration) * 100, 100)
      : 0;

  useEffect(() => {
    if (isPlaying) {
      setExpandedPlaylist(0);
    } else {
      setExpandedPlaylist(null);
    }
  }, [isPlaying]);

  const waveform = [
    8, 13, 7, 18, 10, 24, 14, 31, 12, 22, 16, 36, 18, 27, 11, 20,
    9, 28, 15, 34, 12, 24, 8, 19, 14, 30, 10, 22, 7, 17, 11, 26,
    9, 20, 13, 29, 8, 16, 12, 23, 10, 18, 7, 15, 11, 21, 8, 14,
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-5 pb-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Minimal page header */}
        <header className="mb-6 flex items-center justify-between gap-4 px-1">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Music menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronDown className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Saathi Music
              </p>
              <h1 className="truncate text-lg font-semibold tracking-tight">
                Your quiet space
              </h1>
            </div>
          </div>

          <button
            type="button"
            aria-label="Open music queue"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ListMusic className="h-4 w-4" />
          </button>
        </header>

        {/* Main music workspace */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          {/* Now Playing */}
          <section className="rounded-[2rem] border border-border/60 bg-card p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Now Playing
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentPlaylist.title}
                </p>
              </div>

              <button
                type="button"
                aria-label={`Favourite ${track.title}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>

            {/* Album artwork */}
            <div className="mx-auto w-full max-w-[440px]">
              <AlbumArtwork variant={currentPlaylist.artwork} />
            </div>

            {/* Track information */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <h2 className="truncate text-2xl font-semibold tracking-tight sm:text-[2rem]">
                  {track.title}
                </h2>
                <button
                  type="button"
                  aria-label="More track options"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {track.artist}
              </p>

              <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                <span>Album</span>
                <span aria-hidden="true">•</span>
                <span className="max-w-[220px] truncate normal-case tracking-normal">
                  {currentPlaylist.title}
                </span>
              </div>
            </div>

            {/* Waveform-inspired progress */}
            <div className="mt-7">
              <div className="flex h-10 items-center gap-[3px] overflow-hidden px-1">
                {waveform.map((height, index) => {
                  const played =
                    index / waveform.length <= progress / 100;

                  return (
                    <span
                      key={`${height}-${index}`}
                      className={`w-[3px] shrink-0 rounded-full transition-colors duration-200 ${
                        played ? "bg-foreground" : "bg-muted-foreground/25"
                      }`}
                      style={{
                        height: `${Math.max(
                          height * (isPlaying ? 1 : 0.85),
                          5,
                        )}px`,
                      }}
                    />
                  );
                })}
              </div>

              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                aria-label="Seek through current track"
                className="mt-1 h-1 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
              />

              <div className="mt-2 flex justify-between text-[10px] font-medium text-muted-foreground">
                <span>{format(currentTime)}</span>
                <span>{format(duration)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div className="mt-6 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={prevTrack}
                aria-label="Previous track"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause track" : "Play track"}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-transform hover:scale-[1.03]"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="ml-0.5 h-6 w-6" />
                )}
              </button>

              <button
                type="button"
                onClick={nextTrack}
                aria-label="Next track"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <div className="mx-auto mt-5 flex max-w-xs items-center gap-3">
              <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="h-1 flex-1 rounded-full bg-muted">
                <div className="h-full w-[70%] rounded-full bg-foreground/60" />
              </div>
            </div>
          </section>

          {/* Playlist / Library */}
          <section className="rounded-[2rem] border border-border/60 bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 shrink-0 sm:w-24">
                <AlbumArtwork variant={currentPlaylist.artwork} />
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Album · {currentPlaylist.tracks.length} songs
                </p>
                <h2 className="mt-1 truncate text-xl font-semibold tracking-tight">
                  {currentPlaylist.title}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Saathi Collection
                </p>
              </div>

              <button
                type="button"
                aria-label="Playlist options"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => startTrack(currentTrack)}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition-transform hover:scale-[1.01]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Play
              </button>

              <button
                type="button"
                onClick={() => startTrack(0)}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-muted px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted/80"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Shuffle
              </button>
            </div>

            <div className="mt-5 space-y-1">
              {currentPlaylist.tracks.map((item, index) => {
                const isCurrent = index === currentTrack;

                return (
                  <div
                    key={index}
                    className={`group flex items-center gap-3 rounded-2xl px-2 py-3 transition-colors ${
                      isCurrent
                        ? "bg-muted/70"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <span className="w-6 shrink-0 text-center text-[10px] font-semibold text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (isCurrent && isPlaying) {
                          togglePlay();
                        } else {
                          startTrack(index);
                        }
                      }}
                      aria-label={
                        isCurrent && isPlaying
                          ? `Pause ${item.title}`
                          : `Play ${item.title}`
                      }
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isCurrent
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="ml-0.5 h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => startTrack(index)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p
                        className={`truncate text-sm font-semibold ${
                          isCurrent ? "text-foreground" : "text-foreground/90"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {item.artist}
                      </p>
                    </button>

                    <button
                      type="button"
                      aria-label={`Favourite ${item.title}`}
                      className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group-hover:flex sm:flex"
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </button>

                    <span className="w-10 shrink-0 text-right text-[10px] font-medium text-muted-foreground">
                      {item.duration}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </section>

        {/* Collapsible playlists */}
        <section className="mt-6">
          <div className="mb-4 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Playlists
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              Choose your atmosphere
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Playlists stay compact until you open one.
            </p>
          </div>

          <div className="space-y-3">
            {playlists.map((playlist, playlistIndex) => {
              const isExpanded = expandedPlaylist === playlistIndex;
              const isActive = playlistIndex === 0;

              return (
                <article
                  key={playlistIndex}
                  className={`overflow-hidden rounded-[1.5rem] border bg-card shadow-sm transition-all duration-300 ${
                    isExpanded
                      ? "border-border/70 shadow-md"
                      : "border-border/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedPlaylist((current) =>
                        current === playlistIndex
                          ? null
                          : playlistIndex,
                      )
                    }
                    className="group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
                    aria-expanded={isExpanded}
                  >
                    <AlbumArtwork
                      variant={playlist.artwork}
                      small
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {playlist.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {playlist.tracks.length} tracks
                        {isActive && isPlaying ? " · Playing now" : ""}
                      </p>
                    </div>

                    <ChevronRight
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-border/40 px-3 pb-3 pt-2">
                        <div className="mb-2 flex items-center justify-between px-1">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Tracks
                          </span>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (playlistIndex === 0) {
                                startTrack(currentTrack);
                              }
                            }}
                            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Shuffle className="h-3 w-3" />
                            Play
                          </button>
                        </div>

                        <div className="space-y-1">
                          {playlist.tracks.map((item, index) => {
                            const isCurrent =
                              playlistIndex === 0 &&
                              index === currentTrack;

                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  if (playlistIndex === 0) {
                                    startTrack(index);
                                  }
                                }}
                                disabled={playlistIndex !== 0}
                                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                                  isCurrent
                                    ? "bg-muted/80"
                                    : "hover:bg-muted/50"
                                } ${
                                  playlistIndex !== 0
                                    ? "cursor-default"
                                    : ""
                                }`}
                              >
                                <span className="w-5 shrink-0 text-center text-[10px] font-semibold text-muted-foreground">
                                  {String(index + 1).padStart(2, "0")}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`truncate text-xs font-semibold ${
                                      isCurrent
                                        ? "text-foreground"
                                        : "text-foreground/90"
                                    }`}
                                  >
                                    {item.title}
                                  </p>
                                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                    {item.artist}
                                  </p>
                                </div>

                                <span className="shrink-0 text-[10px] text-muted-foreground">
                                  {item.duration}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
};

export default MusicScreen;
