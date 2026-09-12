const apiBase = import.meta.env.VITE_API_URL || "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("saathi_access_token");
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Anonymous feed request failed");
  return payload;
}

export type AnonymousPost = {
  id: string;
  thought: string;
  photo_data?: string | null;
  likes_count: number;
  liked_by_me: boolean;
  created_at: string;
};

export function getAnonymousPosts() {
  return request<{ data: AnonymousPost[] }>("/anonymous-posts");
}

export function createAnonymousPost(input: { thought: string; photoData?: string | null }) {
  return request<{ data: AnonymousPost }>("/anonymous-posts", {
    method: "POST",
    body: JSON.stringify({ thought: input.thought, photoData: input.photoData }),
  });
}

export function likeAnonymousPost(postId: string) {
  return request<{ liked: boolean; likesCount: number }>(`/anonymous-posts/${postId}/like`, {
    method: "POST",
  });
}
