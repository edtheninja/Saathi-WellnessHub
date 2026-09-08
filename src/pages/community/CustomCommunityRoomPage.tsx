import { Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatRoom from "@/components/community/chat/ChatRoom";
import type { ChatRoom } from "@/components/community/chat/types";
import { getCommunity } from "@/lib/communityApi";

export default function CustomCommunityRoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    getCommunity(roomId)
      .then(({ data }) => {
        const community = data[0];
        if (community) {
          setRoom({
            id: community.id,
            name: community.name,
            type: community.room_type,
            topic: community.topic,
            description: community.description,
            memberCount: community.member_count,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [roomId]);

  if (!loading && !room) return <Navigate to="/community" replace />;
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center">Loading community...</div>;
  return room ? <ChatRoom room={room} /> : null;
}
