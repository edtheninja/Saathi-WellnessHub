const apiBase = import.meta.env.VITE_API_URL || "/api";

async function communityRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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
  if (!response.ok) throw new Error(payload.error || "Community request failed");
  return payload;
}

export type CreatedCommunity = {
  id: string;
  name: string;
  room_type: "discussion" | "circle" | "support" | "event" | "announcement";
  topic: string;
  description: string;
  member_count: number;
};

export function createCommunity(input: {
  name: string;
  topic: string;
  description: string;
  roomType: CreatedCommunity["room_type"];
}) {
  return communityRequest<{ data: CreatedCommunity }>("/community/rooms", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCommunity(id: string) {
  return getCommunities().then(({ data }) => ({
    data: data.filter((community) => community.id === id),
  }));
}

export function getCommunities() {
  return communityRequest<{ data: CreatedCommunity[] }>("/community/rooms");
}
