import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getCommunitySocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem("saathi_access_token");
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    const url = apiUrl?.startsWith("http") ? apiUrl.replace(/\/api\/?$/, "") : window.location.origin;
    socket = io(url, {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

export function closeCommunitySocket() {
  socket?.disconnect();
  socket = null;
}
