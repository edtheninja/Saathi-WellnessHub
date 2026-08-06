import { Navigate, useParams } from "react-router-dom";

import ChatRoom from "@/components/community/chat/ChatRoom";
import { communityRooms } from "./data/communityRooms";

export default function CommunityRoomPage() {
  const { roomId } = useParams();

  if (!roomId) {
    return <Navigate to="/community" replace />;
  }

  const room = communityRooms[roomId];

  if (!room) {
    return <Navigate to="/community" replace />;
  }

  return <ChatRoom room={room} />;
}