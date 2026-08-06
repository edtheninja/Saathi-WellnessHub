import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onComment?: (comment: string) => void;
}

export default function CommentSheet({
  onComment,
}: Props) {
  const [comment, setComment] = useState("");

  return (
    <div className="mt-6 rounded-[28px] border bg-card p-6">

      <h3 className="font-semibold text-lg mb-4">
        Leave encouragement 💚
      </h3>

      <Textarea
        rows={4}
        value={comment}
        placeholder="Write something kind..."
        onChange={(e) =>
          setComment(e.target.value)
        }
      />

      <Button
        className="mt-4 rounded-xl"
        onClick={() => {
          onComment?.(comment);
          setComment("");
        }}
      >
        <Send className="w-4 h-4 mr-2" />
        Send Support
      </Button>

    </div>
  );
}