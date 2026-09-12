import { X } from "lucide-react";

interface Props {
  reply: {
    id: string;
    sender: string;
    text: string;
  };
  onCancel: () => void;
}

export default function ReplyPreview({ reply, onCancel }: Props) {
  return (
    <div className="flex items-center gap-3 border-t border-white/10 bg-background/80 px-4 py-2">
      <div className="flex-1 rounded-xl border-l-2 border-primary bg-muted/40 px-3 py-1.5">
        <p className="text-xs font-semibold text-primary">{reply.sender}</p>
        <p className="truncate text-xs text-muted-foreground">{reply.text}</p>
      </div>
      <button
        onClick={onCancel}
        className="rounded-full p-1 hover:bg-muted transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
