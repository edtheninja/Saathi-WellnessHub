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
  room_type:
  | "discussion"
  | "circle"
  | "support"
  | "event"
  | "announcement";
  topic: string;
  description: string;
  member_count: number;
  energy_level: number;
};

export function createCommunity(input: {
  name: string;
  topic: string;
  description: string;
  roomType: CreatedCommunity["room_type"];
  energyLevel: number;
}) {
  return communityRequest<{ data: CreatedCommunity }>(
    "/community/rooms",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function getCommunity(id: string) {
  return getCommunities().then(({ data }) => ({
    data: data.filter((community) => community.id === id),
  }));
}

export function getCommunities() {
  return communityRequest<{ data: CreatedCommunity[] }>("/community/rooms");
}

export function checkCommunityMembership(roomId: string) {
  return communityRequest<{
    isMember: boolean;
  }>(
    `/community/rooms/${encodeURIComponent(roomId)}/membership`,
  );
}

export function joinCommunity(roomId: string) {
  return communityRequest<{
    message?: string;
    isMember: boolean;
  }>(
    `/community/rooms/${encodeURIComponent(roomId)}/join`,
    {
      method: "POST",
    },
  );
}

export function leaveCommunity(roomId: string) {
  return communityRequest<{
    message?: string;
    isMember: boolean;
  }>(
    `/community/rooms/${encodeURIComponent(roomId)}/leave`,
    {
      method: "DELETE",
    },
  );
}