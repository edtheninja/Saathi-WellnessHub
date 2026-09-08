import { useEffect, useRef, useState } from "react";
import { Heart, ImagePlus, Send, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAnonymousPosts, likeAnonymousPost, createAnonymousPost, type AnonymousPost } from "@/lib/anonymousApi";
import { isDemoMode } from "@/features/wellness/services/DemoMode";

export default function AnonymousThoughts() {
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [thought, setThought] = useState("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadPosts = () => {
    void getAnonymousPosts().then(({ data }) => setPosts(data)).catch(() => {
      if (isDemoMode()) {
        setPosts([
          { id: "demo-anonymous-1", thought: "Finished a difficult project today and finally took a proper break. Small wins count.", photo_data: null, likes_count: 24, liked_by_me: false, created_at: new Date().toISOString() },
          { id: "demo-anonymous-2", thought: "Went for a morning walk before work. My focus was noticeably better afterward.", photo_data: null, likes_count: 18, liked_by_me: false, created_at: new Date(Date.now() - 86400000).toISOString() },
        ]);
      } else setError("Unable to load anonymous thoughts");
    });
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setError("Choose an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoData(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    setIsPosting(true);
    setError("");
    try {
      const { data } = await createAnonymousPost({ thought, photoData });
      setPosts((current) => [data, ...current]);
      setThought("");
      setPhotoData(null);
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : "Unable to publish thought");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (post: AnonymousPost) => {
    const result = await likeAnonymousPost(post.id);
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, liked_by_me: result.liked, likes_count: result.likesCount } : item));
  };

  return (
    <section className="space-y-5 rounded-[32px] border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Anonymous Daily Thoughts</h2>
          <p className="mt-1 text-sm text-muted-foreground">Share your day or a work moment. Your identity is never shown, and posts cannot receive comments.</p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border p-4">
        <Textarea value={thought} onChange={(event) => setThought(event.target.value)} placeholder="How was your day? What are you working on?" maxLength={1000} rows={4} />
        {photoData && <img src={photoData} alt="Selected work or day" className="max-h-56 rounded-xl object-cover" />}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handlePhoto(event.target.files?.[0])} />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="rounded-xl">
            <ImagePlus className="mr-2 h-4 w-4" /> Add photo
          </Button>
          <Button type="button" disabled={isPosting || thought.trim().length < 20} onClick={handlePost} className="rounded-xl">
            <Send className="mr-2 h-4 w-4" /> {isPosting ? "Posting..." : "Post anonymously"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded-2xl border p-4">
            <p className="whitespace-pre-wrap text-sm leading-6">{post.thought}</p>
            {post.photo_data && <img src={post.photo_data} alt="Anonymous work or day" className="mt-4 max-h-72 w-full rounded-xl object-cover" />}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleString()}</time>
              <button type="button" onClick={() => void handleLike(post)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition ${post.liked_by_me ? "bg-primary/10 text-primary" : "hover:bg-muted"}`} aria-label="Like anonymous thought">
                <Heart className={`h-4 w-4 ${post.liked_by_me ? "fill-current" : ""}`} /> {post.likes_count}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
