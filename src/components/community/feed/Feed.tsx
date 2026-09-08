import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

type CommunityPost = {
  id: string;
  title: string;
  body: string;
  mood?: string;
  created_at: string;
};

export default function Feed() {
  return (
    <CommunityFeed />
  );
}

function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("community_posts")
      .select("*")
      .eq("visibility", "community")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (active) setPosts((data ?? []) as CommunityPost[]);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="rounded-[32px] border bg-card p-8">
      <h2 className="text-2xl font-bold">Community Feed</h2>
      {posts.length === 0 ? (
        <p className="mt-3 text-muted-foreground">Be the first to share a wellness moment.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border p-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold">{post.mood ?? "🌱"} {post.title || "Wellness moment"}</h3>
                <time className="text-xs text-muted-foreground" dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString()}
                </time>
              </div>
              {post.body && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{post.body}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}