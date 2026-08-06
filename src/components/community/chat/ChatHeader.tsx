import {
  ArrowLeft,
  Users,
  Sun,
  Heart,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChatRoom } from "./types";

interface Props {
  room: ChatRoom;
}

export default function ChatHeader({
  room,
}: Props) {

  const navigate = useNavigate();
  const RoomIcon =
    room.type === "discussion"
      ? Sun
      : room.type === "circle"
        ? Heart
        : ShieldAlert;
  return (

    <header
      className="
      sticky
      top-0
      z-20
      backdrop-blur-xl
      bg-background/90
      border-b
      px-6
      py-4
      flex
      items-center
      justify-between
    "
    >

      <div className="flex items-center gap-4">

        <button
          onClick={() => navigate(-1)}
          className="rounded-xl p-2 hover:bg-muted transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div
          className="
      w-12
      h-12
      rounded-2xl
      bg-gradient-to-br
      from-yellow-200
      to-orange-300
      flex
      items-center
      justify-center
      shadow-md
    "
        >
          <RoomIcon
            className="w-6 h-6 text-amber-700"
            strokeWidth={2.2}
          />
        </div>

        <div>

          <h2 className="font-bold text-xl">
            {room.name}
          </h2>

          <p className="text-sm text-muted-foreground">
            {room.topic}
          </p>

        </div>

      </div>

      <div className="flex items-center gap-2">

        <Users className="w-5 h-5" />

        {room.memberCount ?? 0}

      </div>

    </header>

  );

}