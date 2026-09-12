import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCommunity, type CreatedCommunity } from "@/lib/communityApi";

interface Props {
  onCreated: (community: CreatedCommunity) => void;
}

export default function CreateCommunityDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [roomType, setRoomType] = useState<CreatedCommunity["room_type"]>("support");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (name.trim().length < 3) {
      setError("Community name must be at least 3 characters.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const { data } = await createCommunity({ name, topic, description, roomType });
      onCreated(data);
      setOpen(false);
      setName("");
      setTopic("");
      setDescription("");
    } catch (creationError) {
      setError(creationError instanceof Error ? creationError.message : "Unable to create community");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create your community</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Community name" maxLength={80} />
          <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Conversation topic" maxLength={140} />
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this community about?" maxLength={500} />
          <select value={roomType} onChange={(event) => setRoomType(event.target.value as CreatedCommunity["room_type"])} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="support">Support</option>
            <option value="discussion">Discussion</option>
            <option value="circle">Circle</option>
            <option value="event">Event</option>
          </select>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleCreate} disabled={isSaving} className="w-full rounded-xl">
            {isSaving ? "Creating..." : "Create Community"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
