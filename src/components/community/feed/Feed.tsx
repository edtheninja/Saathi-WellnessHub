import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

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

async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload?.error || `Request failed (${response.status})`
    );
  }

  return payload;
}

export default function Feed() {
  return <CommunityFeed />;
}

function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        setIsLoading(true);
        setError(null);

        if (!getAuthToken()) {
          throw new Error("Please login again.");
        }

        const result = await apiFetch("/api/community/feed");

        if (active) {
          setPosts(result.data ?? []);
        }
      } catch (error) {
        console.error("Failed to load community feed:", error);

        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load community feed"
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-[32px] border bg-card p-8">
      <h2 className="text-2xl font-bold">
        Community Feed
      </h2>

      {isLoading ? (
        <p className="mt-3 text-muted-foreground">
          Loading community posts...
        </p>
      ) : error ? (
        <p className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : posts.length === 0 ? (
        <p className="mt-3 text-muted-foreground">
          Be the first to share a wellness moment.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {post.mood ?? "🌱"}{" "}
                    {post.title || "Wellness moment"}
                  </h3>

                  {post.author_name && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {post.author_name}
                    </p>
                  )}
                </div>

                <time
                  className="text-xs text-muted-foreground"
                  dateTime={post.created_at}
                >
                  {new Date(
                    post.created_at
                  ).toLocaleDateString()}
                </time>
              </div>

              {post.body && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {post.body}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}