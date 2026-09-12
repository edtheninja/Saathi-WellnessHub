import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  ChevronDown,
  CircleUserRound,
  Heart,
  ImagePlus,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Smile,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getAnonymousPosts,
  likeAnonymousPost,
  createAnonymousPost,
  type AnonymousPost,
} from "@/lib/anonymousApi";
import { isDemoMode } from "@/features/wellness/services/DemoMode";

type Filter =
  | "All Posts"
  | "My Posts"
  | "Encouragement"
  | "Self Care"
  | "Gratitude"
  | "Daily Life";

type VisualPost = AnonymousPost & {
  title: string;
  tags: string[];
};

const filters: Filter[] = [
  "All Posts",
  "My Posts",
  "Encouragement",
  "Self Care",
  "Gratitude",
  "Daily Life",
];

const moods = ["Calm", "Happy", "Hopeful", "Thoughtful", "Grateful"];
const tagOptions = [
  "SelfCare",
  "Gratitude",
  "MentalHealth",
  "Support",
  "Mindful",
  "Progress",
  "Community",
];

const demoPosts: AnonymousPost[] = [
  {
    id: "demo-anonymous-1",
    thought:
      "After weeks of overthinking, I just sat with my tea, looked at the sky and breathed. It felt good. Sometimes, we really do need to pause.",
    photo_data: null,
    likes_count: 24,
    liked_by_me: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-anonymous-2",
    thought:
      "Struggling with anxiety lately, but reading other people's posts here really helps. Thank you all.",
    photo_data: null,
    likes_count: 38,
    liked_by_me: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-anonymous-3",
    thought:
      "Small progress today. I chose peace over overthinking. That's a win! 🌼",
    photo_data: null,
    likes_count: 41,
    liked_by_me: false,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-anonymous-4",
    thought:
      "Grateful for this community. Reading your stories gives me strength.",
    photo_data: null,
    likes_count: 56,
    liked_by_me: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;

  return new Date(date).toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

function getTitle(thought: string) {
  const clean = thought.replace(/\s+/g, " ").trim();

  if (!clean) return "A quiet thought";
  if (clean.length <= 52) return clean;

  const shortened = clean.slice(0, 52);
  const lastSpace = shortened.lastIndexOf(" ");

  return `${lastSpace > 25 ? shortened.slice(0, lastSpace) : shortened}...`;
}

function getTags(thought: string): string[] {
  const text = thought.toLowerCase();
  const tags: string[] = [];

  if (
    /grat(e|it)ful|thankful|grateful|appreciate|thank/.test(text)
  ) {
    tags.push("Gratitude");
  }

  if (
    /self|rest|break|sleep|walk|breathe|peace|calm|pause|care/.test(text)
  ) {
    tags.push("SelfCare");
  }

  if (
    /anxiety|mental|stress|overthink|sad|emotion|healing/.test(text)
  ) {
    tags.push("MentalHealth");
  }

  if (
    /progress|win|achieve|project|work|finished|success|goal/.test(text)
  ) {
    tags.push("Progress");
  }

  if (
    /community|people|support|help|together|story|stories/.test(text)
  ) {
    tags.push("Community");
  }

  if (
    /today|morning|evening|day|tea|work|walk/.test(text)
  ) {
    tags.push("DailyLife");
  }

  if (tags.length === 0) tags.push("Mindful");

  return Array.from(new Set(tags)).slice(0, 3);
}

function getDecorativeMessage(tags: string[], index: number) {
  if (tags.includes("Gratitude")) {
    return {
      title: "Small steps make big changes",
      icon: "heart",
    };
  }

  if (tags.includes("MentalHealth")) {
    return {
      title: "You are not alone",
      icon: "heart",
    };
  }

  if (tags.includes("Progress")) {
    return {
      title: "Better days ahead",
      icon: "flower",
    };
  }

  if (tags.includes("Community")) {
    return {
      title: "Kind people are my kind of people",
      icon: "heart",
    };
  }

  const defaults = [
    {
      title: "Small steps make big changes",
      icon: "heart",
    },
    {
      title: "You are not alone",
      icon: "heart",
    },
    {
      title: "Better days ahead",
      icon: "flower",
    },
    {
      title: "Kind people are my kind of people",
      icon: "heart",
    },
  ];

  return defaults[index % defaults.length];
}

function getFilteredPosts(
  posts: VisualPost[],
  filter: Filter,
  myPostIds: Set<string>,
) {
  if (filter === "All Posts") return posts;
  if (filter === "My Posts") {
    return posts.filter((post) => myPostIds.has(post.id));
  }

  return posts.filter((post) => {
    const tags = post.tags.map((tag) => tag.toLowerCase());

    if (filter === "Encouragement") {
      return (
        tags.includes("community") ||
        tags.includes("progress") ||
        /support|hope|strength|help/.test(post.thought.toLowerCase())
      );
    }

    if (filter === "Self Care") {
      return tags.includes("selfcare");
    }

    if (filter === "Gratitude") {
      return tags.includes("gratitude");
    }

    if (filter === "Daily Life") {
      return tags.includes("dailylife");
    }

    return true;
  });
}

export default function AnonymousThoughts() {
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [thought, setThought] = useState("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>("All Posts");
  const [sortBy, setSortBy] = useState<"Latest" | "Popular">("Latest");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [myPostIds, setMyPostIds] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);

  const loadPosts = () => {
    setError("");

    void getAnonymousPosts()
      .then(({ data }) => {
        setPosts(data);
      })
      .catch(() => {
        if (isDemoMode()) {
          setPosts(demoPosts);
          return;
        }

        setError("Unable to load anonymous thoughts");
      });
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const visualPosts = useMemo<VisualPost[]>(
    () =>
      posts.map((post) => ({
        ...post,
        title: getTitle(post.thought),
        tags: getTags(post.thought),
      })),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const result = getFilteredPosts(visualPosts, activeFilter, myPostIds);

    return [...result].sort((a, b) => {
      if (sortBy === "Popular") {
        return b.likes_count - a.likes_count;
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  }, [activeFilter, myPostIds, sortBy, visualPosts]);

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setError("Choose an image smaller than 2 MB.");
      return;
    }

    setError("");

    const reader = new FileReader();

    reader.onload = () => {
      setPhotoData(String(reader.result));
    };

    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    const trimmedThought = thought.trim();

    if (trimmedThought.length < 20) {
      setError("Please share at least 20 characters.");
      return;
    }

    setIsPosting(true);
    setError("");

    try {
      const composedThought = [
        selectedMood ? `Mood: ${selectedMood}` : "",
        selectedTag ? `#${selectedTag}` : "",
        trimmedThought,
      ]
        .filter(Boolean)
        .join(" • ");

      const { data } = await createAnonymousPost({
        thought: composedThought,
        photoData,
      });

      setPosts((current) => [data, ...current]);

      setMyPostIds((current) => {
        const next = new Set(current);
        next.add(data.id);
        return next;
      });

      setThought("");
      setPhotoData(null);
      setSelectedMood("");
      setSelectedTag("");
      setShowMoodPicker(false);
      setShowTagPicker(false);
    } catch (postError) {
      setError(
        postError instanceof Error
          ? postError.message
          : "Unable to publish thought",
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (post: AnonymousPost) => {
    try {
      const result = await likeAnonymousPost(post.id);

      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                liked_by_me: result.liked,
                likes_count: result.likesCount,
              }
            : item,
        ),
      );
    } catch {
      setError("Unable to update the reaction.");
    }
  };

  return (
    <section className="min-h-screen w-full bg-background px-3 py-4 text-foreground sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        {/* HERO */}
        <header className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-white/50 bg-gradient-to-r from-violet-100 via-sky-50 to-blue-100 px-5 py-7 shadow-sm dark:border-white/10 dark:from-violet-950/50 dark:via-slate-900 dark:to-blue-950/50 sm:px-8 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_90%,rgba(167,139,250,0.18),transparent_35%),radial-gradient(circle_at_75%_0%,rgba(125,211,252,0.18),transparent_40%)]" />

          <div className="absolute -bottom-16 left-1/2 h-36 w-[75%] -translate-x-1/2 rounded-[50%] bg-white/35 blur-sm dark:bg-white/5" />

          <div className="absolute right-5 top-3 hidden opacity-70 sm:block">
            <div className="relative h-28 w-48">
              <span className="absolute left-10 top-7 h-14 w-8 -rotate-45 rounded-full bg-violet-300/60 blur-[1px]" />
              <span className="absolute left-20 top-3 h-20 w-10 rounded-full rounded-b-none bg-fuchsia-300/50 blur-[1px]" />
              <span className="absolute left-28 top-7 h-14 w-8 rotate-45 rounded-full bg-pink-300/50 blur-[1px]" />
              <span className="absolute right-1 top-11 h-5 w-16 -rotate-12 rounded-full bg-sky-300/60" />
              <span className="absolute right-4 top-20 h-4 w-20 rotate-12 rounded-full bg-blue-300/45" />
            </div>
          </div>

          <div className="relative z-10 max-w-2xl">
            <h1 className="font-serif text-3xl font-medium italic tracking-tight text-violet-700 dark:text-violet-300 sm:text-4xl">
              Anonymous. Safe. Supportive.
            </h1>

            <p className="mt-3 max-w-lg text-xs leading-5 text-slate-600 dark:text-slate-300 sm:text-sm">
              Share your thoughts, feelings and daily moments.
              <br />
              You&apos;re not alone.
            </p>
          </div>
        </header>

        {/* COMPOSER */}
        <div className="rounded-[24px] border border-border/60 bg-card p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                <CircleUserRound className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <Textarea
                  value={thought}
                  onChange={(event) => setThought(event.target.value)}
                  placeholder="Share what's on your mind..."
                  maxLength={1000}
                  rows={1}
                  className="min-h-11 resize-none rounded-full border border-border/50 bg-background px-5 py-3 text-sm shadow-none focus-visible:ring-1"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handlePost}
              disabled={isPosting || thought.trim().length < 20}
              className="h-11 shrink-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-6 text-white shadow-sm hover:from-violet-600 hover:to-purple-600"
            >
              <Send className="mr-2 h-4 w-4" />
              {isPosting ? "Post..." : "Post"}
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3 pl-1">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                handlePhoto(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ImagePlus className="h-4 w-4 text-violet-500" />
              Photo
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowMoodPicker((value) => !value);
                  setShowTagPicker(false);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selectedMood
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Smile className="h-4 w-4 text-violet-500" />
                {selectedMood || "Mood"}
              </button>

              {showMoodPicker && (
                <div className="absolute left-0 top-full z-30 mt-2 w-44 rounded-2xl border border-border bg-card p-2 shadow-xl">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => {
                        setSelectedMood(mood);
                        setShowMoodPicker(false);
                      }}
                      className="block w-full rounded-xl px-3 py-2 text-left text-xs transition hover:bg-muted"
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowTagPicker((value) => !value);
                  setShowMoodPicker(false);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selectedTag
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Tag className="h-4 w-4 text-violet-500" />
                {selectedTag ? `#${selectedTag}` : "Tag"}
              </button>

              {showTagPicker && (
                <div className="absolute left-0 top-full z-30 mt-2 grid w-56 grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-2 shadow-xl">
                  {tagOptions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTag(tag);
                        setShowTagPicker(false);
                      }}
                      className="rounded-xl px-3 py-2 text-left text-xs transition hover:bg-muted"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ml-auto hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex">
              <ShieldCheck className="h-4 w-4 text-violet-500" />
              Anonymous &amp; private
            </div>
          </div>

          {photoData && (
            <div className="mt-3 overflow-hidden rounded-2xl border bg-muted/20 p-2">
              <div className="relative">
                <img
                  src={photoData}
                  alt="Selected work or day"
                  className="max-h-48 w-full rounded-xl object-cover"
                />

                <button
                  type="button"
                  onClick={() => setPhotoData(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="px-2 pt-3 text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* FILTER BAR */}
        <div className="overflow-x-auto pb-1 [scrollbar-width:none]">
          <div className="flex min-w-max items-center gap-2 rounded-2xl border border-border/50 bg-card p-1.5 shadow-sm">
            {filters.map((filter) => {
              const active = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-[11px] font-medium transition ${
                    active
                      ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-2">
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as "Latest" | "Popular")
                }
                className="cursor-pointer appearance-none border-0 bg-transparent pr-5 text-[11px] font-medium outline-none"
              >
                <option value="Latest">Latest</option>
                <option value="Popular">Popular</option>
              </select>

              <ChevronDown className="pointer-events-none -ml-5 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* POSTS */}
        <div className="space-y-3">
          {filteredPosts.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-border bg-card px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
                <Sparkles className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-base font-semibold">
                Nothing here yet
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Be the first person to share a thought in this space.
              </p>
            </div>
          )}

          {filteredPosts.map((post, index) => {
            const decorative = getDecorativeMessage(post.tags, index);

            return (
              <article
                key={post.id}
                className="group relative overflow-hidden rounded-[24px] border border-border/50 bg-card px-4 py-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md sm:px-5 sm:py-5"
              >
                {/* DECORATIVE RIGHT SIDE */}
                <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[180px] overflow-hidden md:block">
                  <div
                    className={`absolute right-5 top-1/2 flex h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br ${
                      index % 3 === 0
                        ? "from-violet-100 via-fuchsia-50 to-blue-100"
                        : index % 3 === 1
                          ? "from-fuchsia-100 via-pink-50 to-violet-100"
                          : "from-pink-100 via-violet-50 to-sky-100"
                    } opacity-90`}
                  >
                    <div className="absolute inset-0 rounded-full bg-white/25 blur-md" />

                    <div className="relative flex h-full w-full items-center justify-center">
                      {decorative.icon === "flower" ? (
                        <div className="relative h-16 w-16">
                          <span className="absolute left-5 top-0 h-9 w-6 rounded-full rounded-b-[55%] bg-pink-300/70" />
                          <span className="absolute left-1 top-5 h-8 w-5 -rotate-45 rounded-full bg-pink-200/80" />
                          <span className="absolute right-1 top-5 h-8 w-5 rotate-45 rounded-full bg-pink-200/80" />
                          <span className="absolute left-5 top-6 h-8 w-6 rounded-full bg-fuchsia-200/80" />
                          <span className="absolute bottom-1 left-5 h-4 w-3 rounded-full bg-pink-400/70" />
                        </div>
                      ) : (
                        <div className="relative">
                          <Heart className="h-9 w-9 rotate-[-8deg] fill-violet-200 text-violet-400/80" />
                          <Heart className="absolute -right-6 top-6 h-5 w-5 fill-pink-100 text-pink-300/80" />
                        </div>
                      )}

                      <div className="absolute bottom-4 right-4 rotate-[-6deg] text-center font-serif text-[10px] leading-3 text-violet-500/80">
                        {decorative.title}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 max-w-[calc(100%-0px)] pr-0 md:max-w-[calc(100%-165px)] md:pr-3">
                  {/* POST HEADER */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                        <CircleUserRound className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          Anonymous
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {relativeTime(post.created_at)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="More options"
                      className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  {/* TITLE */}
                  <h3 className="mt-3 text-sm font-bold leading-5 text-foreground">
                    {post.title}
                  </h3>

                  {/* BODY */}
                  <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                    {post.thought}
                  </p>

                  {/* PHOTO */}
                  {post.photo_data && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-border/50">
                      <img
                        src={post.photo_data}
                        alt="Anonymous work or day"
                        className="max-h-80 w-full object-cover"
                      />
                    </div>
                  )}

                  {/* TAGS */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-violet-100/80 px-2.5 py-1 text-[10px] font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleLike(post)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs transition ${
                          post.liked_by_me
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        aria-label="Like anonymous thought"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            post.liked_by_me ? "fill-current" : ""
                          }`}
                        />
                        {post.likes_count}
                      </button>

                      <button
                        type="button"
                        title="Comments are disabled for anonymous posts"
                        className="inline-flex cursor-default items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-muted-foreground"
                        aria-label="Comments disabled"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      aria-label="Share"
                      onClick={async () => {
                        const shareText = post.thought;

                        try {
                          if (navigator.share) {
                            await navigator.share({
                              title: "Anonymous Daily Thought",
                              text: shareText,
                            });
                            return;
                          }

                          await navigator.clipboard.writeText(shareText);
                          setError("Thought copied to clipboard.");
                          window.setTimeout(() => setError(""), 1800);
                        } catch {
                          // User cancelled share or clipboard was unavailable.
                        }
                      }}
                      className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* PRIVACY FOOTER */}
        <div className="flex flex-col items-center justify-center gap-2 py-5 text-center text-[11px] text-muted-foreground sm:flex-row">
          <ShieldCheck className="h-4 w-4 text-violet-500" />
          <span>
            Your identity stays hidden. Anonymous posts are supportive spaces
            with no public comments.
          </span>
        </div>
      </div>
    </section>
  );
}