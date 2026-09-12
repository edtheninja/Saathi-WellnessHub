import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getAuthToken(): string | null {
  return localStorage.getItem("saathi_access_token");
}

type CommunityPost = {
  id: string;
  author_id: string;
  author_name?: string;
  title: string;
  body: string;
  mood?: string | null;
  post_type: string;
  visibility: "community" | "private";
  stats?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }

  return payload;
}

export default function Feed() {
  return <CommunityFeed />;
}

function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Create post form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState("🌱");

  // --------------------------------------------------
  // LOAD COMMUNITY POSTS
  // --------------------------------------------------

  async function loadPosts() {
    try {
      setIsLoading(true);
      setError(null);

      if (!getAuthToken()) {
        throw new Error("Please login again.");
      }

      const result = await apiFetch("/community/feed");

      setPosts(result.data ?? []);
    } catch (error) {
      console.error("Failed to load community feed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load community feed",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  // --------------------------------------------------
  // CREATE COMMUNITY POST
  // --------------------------------------------------

  async function handleCreatePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreateError(null);

    if (!getAuthToken()) {
      setCreateError("Please login again.");
      return;
    }

    if (!title.trim() && !body.trim()) {
      setCreateError("Please write something before sharing.");
      return;
    }

    try {
      setIsCreating(true);

      await apiFetch("/community/feed", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          mood,
          postType: "reflection",
          visibility: "community",
        }),
      });

      // Clear form
      setTitle("");
      setBody("");
      setMood("🌱");

      // Reload feed so new post appears
      await loadPosts();
    } catch (error) {
      console.error("Failed to create community post:", error);

      setCreateError(
        error instanceof Error ? error.message : "Failed to create post",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="rounded-[32px] border bg-card p-8">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h2 className="text-2xl font-bold">Community Feed</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Share your wellness journey with the community.
        </p>
      </div>

      {/* ==================================================
          CREATE POST
      ================================================== */}

      <form
        onSubmit={handleCreatePost}
        className="mt-6 rounded-2xl border bg-background p-5"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>

          <h3 className="font-semibold">Share with the community</h3>
        </div>

        {/* TITLE */}

        <div className="mt-4">
          <label
            htmlFor="community-title"
            className="mb-2 block text-sm font-medium"
          >
            Title
          </label>

          <input
            id="community-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your post a title..."
            maxLength={150}
            className="w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none transition focus:ring-2"
          />
        </div>

        {/* BODY */}

        <div className="mt-4">
          <label
            htmlFor="community-body"
            className="mb-2 block text-sm font-medium"
          >
            What's on your mind?
          </label>

          <textarea
            id="community-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Share a thought, reflection, achievement, or wellness moment..."
            rows={5}
            maxLength={2000}
            className="w-full resize-none rounded-xl border bg-card px-4 py-3 text-sm outline-none transition focus:ring-2"
          />

          <p className="mt-1 text-right text-xs text-muted-foreground">
            {body.length}/2000
          </p>
        </div>

        {/* MOOD */}

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">How are you feeling?</p>

          <div className="flex flex-wrap gap-2">
            {[
              { emoji: "🌱", label: "Calm" },
              { emoji: "😊", label: "Happy" },
              { emoji: "😌", label: "Peaceful" },
              { emoji: "😔", label: "Low" },
              { emoji: "😰", label: "Anxious" },
              { emoji: "💪", label: "Strong" },
            ].map((item) => {
              const selected = mood === item.emoji;

              return (
                <button
                  key={item.emoji}
                  type="button"
                  onClick={() => setMood(item.emoji)}
                  title={item.label}
                  className={`rounded-xl border px-3 py-2 text-lg transition ${
                    selected ? "border-primary bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  {item.emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* ERROR */}

        {createError && (
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {createError}
          </p>
        )}

        {/* SUBMIT */}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={isCreating || (!title.trim() && !body.trim())}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "Sharing..." : "Share Post"}
          </button>
        </div>
      </form>

      {/* ==================================================
          FEED
      ================================================== */}

      <div className="mt-8">
        <h3 className="text-lg font-semibold">Recent Posts</h3>

        {isLoading ? (
          <p className="mt-4 text-muted-foreground">
            Loading community posts...
          </p>
        ) : error ? (
          <div className="mt-4">
            <p className="text-sm text-destructive">{error}</p>

            <button
              type="button"
              onClick={() => void loadPosts()}
              className="mt-3 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed p-8 text-center">
            <p className="text-3xl">🌱</p>

            <p className="mt-3 font-medium">
              Be the first to share a wellness moment.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Your experience might help someone else.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border p-5 transition hover:shadow-sm"
              >
                {/* POST HEADER */}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold">
                      {post.mood ?? "🌱"} {post.title || "Wellness moment"}
                    </h4>

                    {post.author_name && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {post.author_name}
                      </p>
                    )}
                  </div>

                  <time
                    className="shrink-0 text-xs text-muted-foreground"
                    dateTime={post.created_at}
                  >
                    {new Date(post.created_at).toLocaleDateString()}
                  </time>
                </div>

                {/* POST BODY */}

                {post.body && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {post.body}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
