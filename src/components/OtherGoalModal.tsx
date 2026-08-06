import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onClose: () => void;
  value: string;
  setValue: (v: string) => void;
};

export default function OtherGoalModal({
  open,
  onClose,
  value,
  setValue,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Your Goal</DialogTitle>
        </DialogHeader>

        <Textarea
          placeholder="What is your goal today?"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <Button className="w-full mt-4" onClick={onClose}>
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
