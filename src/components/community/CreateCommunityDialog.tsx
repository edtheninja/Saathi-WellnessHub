import { useState } from "react";
import { Plus, Sparkles, Zap } from "lucide-react";

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

import {
  createCommunity,
  type CreatedCommunity,
} from "@/lib/communityApi";

interface Props {
  onCreated: (community: CreatedCommunity) => void;
}

function getEnergyLabel(score: number) {
  if (score <= 20) return "Calm";
  if (score <= 40) return "Healing";
  if (score <= 60) return "Balanced";
  if (score <= 80) return "Positive";
  return "Energetic";
}

function getEnergyDescription(score: number) {
  if (score <= 20) {
    return "A peaceful space for comfort and quiet reflection.";
  }

  if (score <= 40) {
    return "A gentle space for healing and emotional support.";
  }

  if (score <= 60) {
    return "A balanced space for relaxed and meaningful conversations.";
  }

  if (score <= 80) {
    return "A positive space for motivation and encouragement.";
  }

  return "A lively space for high-energy conversations and celebration.";
}

function getEnergyEmoji(score: number) {
  if (score <= 20) return "🌙";
  if (score <= 40) return "🌱";
  if (score <= 60) return "😌";
  if (score <= 80) return "😊";
  return "⚡";
}

export default function CreateCommunityDialog({
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const [roomType, setRoomType] =
    useState<CreatedCommunity["room_type"]>("support");

  const [energyLevel, setEnergyLevel] = useState(50);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const energyLabel = getEnergyLabel(energyLevel);
  const energyDescription = getEnergyDescription(energyLevel);
  const energyEmoji = getEnergyEmoji(energyLevel);

  const handleCreate = async () => {
    if (name.trim().length < 3) {
      setError("Community name must be at least 3 characters.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const { data } = await createCommunity({
        name: name.trim(),
        topic: topic.trim(),
        description: description.trim(),
        roomType,
        energyLevel,
      });

      onCreated(data);

      setOpen(false);

      setName("");
      setTopic("");
      setDescription("");
      setRoomType("support");
      setEnergyLevel(50);
    } catch (creationError) {
      setError(
        creationError instanceof Error
          ? creationError.message
          : "Unable to create community",
      );
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

      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Create your community
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Community name */}
          <div className="space-y-2">
            <label
              htmlFor="community-name"
              className="text-sm font-semibold"
            >
              Community name
            </label>

            <Input
              id="community-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Give your community a name"
              maxLength={80}
            />
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <label
              htmlFor="community-topic"
              className="text-sm font-semibold"
            >
              Conversation topic
            </label>

            <Input
              id="community-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="What will people talk about?"
              maxLength={140}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="community-description"
              className="text-sm font-semibold"
            >
              Description
            </label>

            <Textarea
              id="community-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="What is this community about?"
              maxLength={500}
              rows={4}
            />
          </div>

          {/* Community type */}
          <div className="space-y-2">
            <label
              htmlFor="community-type"
              className="text-sm font-semibold"
            >
              Community type
            </label>

            <select
              id="community-type"
              value={roomType}
              onChange={(event) =>
                setRoomType(
                  event.target.value as CreatedCommunity["room_type"],
                )
              }
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
            >
              <option value="support">Support</option>
              <option value="discussion">Discussion</option>
              <option value="circle">Circle</option>
              <option value="event">Event</option>
            </select>
          </div>

          {/* Energy level */}
          <div className="space-y-4 rounded-3xl border bg-muted/20 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />

                  <h3 className="font-semibold">
                    Community energy level
                  </h3>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Set the emotional energy of this community.
                </p>
              </div>

              <div className="rounded-2xl bg-primary/10 px-3 py-2 text-center">
                <p className="text-2xl font-bold text-primary">
                  {energyLevel}
                </p>

                <p className="text-[10px] font-medium text-muted-foreground">
                  / 100
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                id="community-energy"
                type="range"
                min={0}
                max={100}
                step={1}
                value={energyLevel}
                onChange={(event) =>
                  setEnergyLevel(Number(event.target.value))
                }
                aria-label="Community energy level"
                className="h-2 w-full cursor-pointer accent-primary"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>🌙 Calm</span>
                <span>😌 Balanced</span>
                <span>⚡ Energetic</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-background p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                {energyEmoji}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />

                  <p className="font-semibold">
                    {energyLabel}
                  </p>
                </div>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {energyDescription}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="button"
            onClick={handleCreate}
            disabled={isSaving}
            className="h-12 w-full rounded-2xl"
          >
            {isSaving ? "Creating..." : "Create Community"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}