import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from "lucide-react";

const MusicScreen = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playlists = [
    {
      title: "-Sukoon🫀-Marham-e-Dil",
      tracks: [
        { title: "Banjara", duration: "5:36", artist: "Mhammed Irfan", src: "public/music/Banjara.mp3" },
        { title: "Humdard", duration: "4:20", artist: "Arijit Singh", src: "public/music/Humdard.mp3" },
        { title: "Tere Binaa", duration: "5:09", artist: "A.R. Rahman", src: "public/music/Terebina.mp3" }
      ],
      color: "bg-gradient-mint",
    },

    {
      title: "Meditation Music",
      tracks: [
        { title: "Tibetan Bowls", duration: "8:30", artist: "Zen Garden", src: "music/tibetan.mp3" },
        { title: "Crystal Singing", duration: "11:15", artist: "Healing Sounds", src: "music/crystal.mp3" },
        { title: "Peaceful Piano", duration: "9:42", artist: "Calm Keys", src: "music/piano.mp3" }
      ],
      color: "bg-gradient-ocean",
    },

    {
      title: "Sleep Stories",
      tracks: [
        { title: "Moonlit Garden", duration: "22:30", artist: "Sleep Stories", src: "music/moon.mp3" },
        { title: "Forest Whispers", duration: "18:45", artist: "Bedtime Tales", src: "music/forest.mp3" },
        { title: "Ocean Journey", duration: "25:12", artist: "Dream Voyages", src: "music/ocean.mp3" }
      ],
      color: "bg-gradient-peaceful",
    },
  ];

  const currentPlaylist = playlists[0];
  const track = currentPlaylist.tracks[currentTrack];

  const startTrack = (index) => {
    const selected = currentPlaylist.tracks[index];
    setCurrentTrack(index);

    audio.src = selected.src; 
    audio.load();

    audio.play().then(() => {
      setIsPlaying(true);
    });

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };
  };

 
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

  
  const nextTrack = () => {
    const next = (currentTrack + 1) % currentPlaylist.tracks.length;
    startTrack(next);
  };

  const prevTrack = () => {
    const prev = currentTrack === 0 ? currentPlaylist.tracks.length - 1 : currentTrack - 1;
    startTrack(prev);
  };


  useEffect(() => {
    const update = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("ended", nextTrack);

    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("ended", nextTrack);
    };
  }, [audio, currentTrack]);

  
  const handleSeek = (e) => {
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };


  const format = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Relaxing Music</h1>
          <p className="text-muted-foreground">Soothing sounds for your soul</p>
        </div>

        {/* NOW PLAYING */}
        <Card className="shadow-elevated border-0 bg-gradient-calm">
          <CardContent className="p-6 text-center space-y-6">

            <div className="w-40 h-40 mx-auto rounded-2xl bg-primary-foreground/20 flex items-center justify-center shadow-soft animate-float">
              <Volume2 className="w-16 h-16 text-primary-foreground/60" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-foreground">{track.title}</h3>
              <p className="text-primary-foreground/80">{track.artist}</p>
            </div>

            {/* TIMELINE */}
            <div className="px-4">
               <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-primary-foreground/70">
                <span>{format(currentTime)}</span>
                <span>{format(duration)}</span>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="flex items-center justify-center space-x-6">
              <Button
                onClick={prevTrack}
                size="lg"
                variant="ghost"
                className="w-12 h-12 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
              >
                <SkipBack className="w-6 h-6" />
              </Button>

              <Button
                onClick={togglePlay}
                size="lg"
                className="w-16 h-16 rounded-full bg-primary-foreground text-primary hover:shadow-soft"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </Button>

              <Button
                onClick={nextTrack}
                size="lg"
                variant="ghost"
                className="w-12 h-12 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
              >
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PLAYLIST */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Recommended Playlists</h2>

          {playlists.map((playlist, playlistIndex) => (
            <Card key={playlistIndex} className="shadow-soft border-0">
              <CardContent className="p-0">

                <div className={`${playlist.color} p-4 rounded-t-lg`}>
                  <h3 className="text-lg font-semibold text-primary-foreground">{playlist.title}</h3>
                  <p className="text-primary-foreground/80 text-sm">
                    {playlist.tracks.length} tracks
                  </p>
                </div>

                <div className="p-2">
                  {playlist.tracks.map((t, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-accent/50 ${
                        playlistIndex === 0 && index === currentTrack
                          ? "bg-primary/10 border-l-4 border-primary"
                          : ""
                      }`}
                      onClick={() => startTrack(index)}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 rounded-full p-0 hover:bg-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          startTrack(index);
                        }}
                      >
                        {playlistIndex === 0 &&
                        index === currentTrack &&
                        isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>

                      <div className="flex-1">
                        <p className="font-medium text-foreground truncate">{t.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{t.artist}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 rounded-full p-0 hover:text-destructive"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{t.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};
export default MusicScreen;