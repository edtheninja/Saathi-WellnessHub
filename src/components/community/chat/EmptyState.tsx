import { MessageCircle } from "lucide-react";
import { ChatRoom } from "./types";

interface Props {
  room: ChatRoom;
}

export default function EmptyState({
  room,
}: Props) {

  return (

    <div
      className="
      h-full
      flex
      flex-col
      items-center
      justify-center
      text-center
      px-8
    "
    >

      <div
        className="
        w-24
        h-24
        rounded-full
        bg-primary/10
        flex
        items-center
        justify-center
      "
      >

        <MessageCircle
          className="w-12 h-12 text-primary"
        />

      </div>

      <h3 className="mt-8 text-2xl font-semibold">

        Welcome to {room.name}

      </h3>

      <p className="mt-3 max-w-md text-muted-foreground">

        Start the conversation and
        encourage others on their
        wellness journey.

      </p>

    </div>

  );

}