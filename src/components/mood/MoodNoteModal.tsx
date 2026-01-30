import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MoodNoteModalProps = {
  open: boolean;
  onClose: () => void;
  mood?: string;
  note: string;
  setNote: React.Dispatch<React.SetStateAction<string>>;
  onSave: () => Promise<void>;
};

export default function MoodNoteModal({
  open,
  onClose,
  mood,
  note,
  setNote,
  onSave,
}: MoodNoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mood ? `Add note for ${mood}` : "Add Mood Note"}
          </DialogTitle>
        </DialogHeader>

        <Textarea
          placeholder="Write how you're feeling..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <Button
          onClick={async () => {
            await onSave();
            setNote("");
            onClose();
          }}
          className="mt-4 w-full"
        >
          Save Note
        </Button>
      </DialogContent>
    </Dialog>
  );
}
