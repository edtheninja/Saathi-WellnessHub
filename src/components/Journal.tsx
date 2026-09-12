import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Calendar,
  BookOpen,
  Save,
  ImagePlus,
  X,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  Trash2,
} from "lucide-react";

// ------------------------------------------------------------
// BACKEND CLIENT
// Replaces the old Supabase client — talks to your Express API
// (server.js) instead. Adjust API_BASE / the token storage key
// below if your app already has its own auth helper.
// ------------------------------------------------------------

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getAuthToken(): string | null {
  return localStorage.getItem("saathi_access_token");
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

type JournalEntry = {
  id: string;
  content: string;
  created_at: string;
  mood?: string;
  title?: string;
  energy_level?: number;
};

type SelectedImage = {
  id: string;
  file: File;
  preview: string;
};

const Journal = () => {
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentEntry, setCurrentEntry] = useState("");
  const [showNewEntry, setShowNewEntry] = useState(false);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const [selectedEntry, setSelectedEntry] =
    useState<JournalEntry | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ------------------------------------------------------------
  // FETCH JOURNALS
  // ------------------------------------------------------------

  const fetchJournals = async () => {
    setIsLoadingEntries(true);

    if (!getAuthToken()) {
      setIsLoadingEntries(false);
      return;
    }

    try {
      const { data } = await apiFetch("/api/data/journals?order=created_at:desc");
      setEntries(data || []);
    } catch (error) {
      console.error("Fetch journals error:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  // ------------------------------------------------------------
  // IMAGE SELECTION
  // ------------------------------------------------------------

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    const newImages: SelectedImage[] = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);

    // Allow selecting the same image again
    event.target.value = "";
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => {
      const imageToRemove = prev.find((image) => image.id === id);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return prev.filter((image) => image.id !== id);
    });
  };

  // ------------------------------------------------------------
  // SAVE JOURNAL
  // ------------------------------------------------------------

  const handleSaveEntry = async () => {
    if (!currentEntry.trim()) return;

    if (!getAuthToken()) {
      alert("Session expired. Please login again.");
      return;
    }

    setIsSaving(true);

    try {
      // Images are intentionally NOT uploaded yet — media_url/media_type
      // on the journals table are ready for this once you wire up storage.
      await apiFetch("/data/journals", {
        method: "POST",
        body: JSON.stringify({
          title: currentTitle.trim(),
          content: currentEntry,
        }),
      });

      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });

      setSelectedImages([]);
      setCurrentTitle("");
      setCurrentEntry("");
      setShowNewEntry(false);

      await fetchJournals();
    } catch (error) {
      console.error("Save journal error:", error);
      alert("Failed to save journal");
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------------------------------------------------
  // DELETE JOURNAL
  // ------------------------------------------------------------

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;

    setIsDeleting(true);

    try {
      await apiFetch(`/api/data/journals?id=${encodeURIComponent(selectedEntry.id)}`, {
        method: "DELETE",
      });

      // Remove it from the local UI
      setEntries((prev) =>
        prev.filter((entry) => entry.id !== selectedEntry.id)
      );

      setShowDeleteDialog(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error("Delete journal error:", error);
      alert(`Failed to delete journal: ${(error as Error).message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // ------------------------------------------------------------
  // PROMPTS
  // ------------------------------------------------------------

  const prompts = [
    "What am I grateful for today?",
    "How did I practice self-care?",
    "What emotions did I experience?",
    "What brought me joy today?",
    "How can I be kinder to myself?",
  ];

  const addPrompt = (prompt: string) => {
    setCurrentEntry((previous) =>
      previous
        ? `${previous}\n\n${prompt} `
        : `${prompt} `
    );
  };

  // ------------------------------------------------------------
  // NEW ENTRY
  // ------------------------------------------------------------

  const openNewEntry = () => {
    setShowNewEntry(true);

    setTimeout(() => {
      document
        .getElementById("journal-editor")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const closeNewEntry = () => {
    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });

    setSelectedImages([]);
    setCurrentTitle("");
    setCurrentEntry("");
    setShowNewEntry(false);
  };

  // ------------------------------------------------------------
  // FULL JOURNAL READING VIEW
  // ------------------------------------------------------------

  if (selectedEntry) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 pb-24 sm:px-6">
        <div className="mx-auto w-full max-w-2xl space-y-6">

          {/* Back */}
          <Button
            variant="ghost"
            onClick={() => setSelectedEntry(null)}
            className="-ml-2 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Journal
          </Button>

          {/* Journal */}
          <Card className="overflow-hidden border-border/40 shadow-elevated">

            {/* Header */}
            <CardHeader className="space-y-5 border-b border-border/40 bg-muted/10 p-6 sm:p-8">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />

                  <span>
                    {new Date(
                      selectedEntry.created_at
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                  {selectedEntry.mood || "😊"}
                </div>
              </div>

              <div className="space-y-2">

                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Reflection
                </p>

                <CardTitle className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                  {selectedEntry.title || "Untitled reflection"}
                </CardTitle>

              </div>

            </CardHeader>

            {/* Content */}
            <CardContent className="space-y-8 p-6 sm:p-8">

              {/* Journal text */}
              <div className="whitespace-pre-wrap text-[15px] leading-8 text-foreground/90 sm:text-base">
                {selectedEntry.content}
              </div>

              {/* Memories */}
              <div className="space-y-3">

                <div className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-primary" />

                  <p className="text-sm font-semibold text-foreground">
                    Memories
                  </p>
                </div>

                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">

                  <ImagePlus className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />

                  <p className="text-sm text-muted-foreground">
                    Photos attached to this entry will appear here.
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Image storage will be connected later.
                  </p>

                </div>

              </div>

              {/* Footer */}
              <div className="border-t border-border/40 pt-5">

                <p className="text-center text-xs text-muted-foreground">
                  A moment worth remembering 🌿
                </p>

              </div>

              {/* Delete */}
              <div className="border-t border-border/40 pt-6">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  className="
                    w-full
                    rounded-xl
                    border-destructive/30
                    text-destructive
                    hover:bg-destructive/5
                    hover:text-destructive
                  "
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Entry
                </Button>

              </div>

            </CardContent>
          </Card>

          {/* ------------------------------------------------ */}
          {/* DELETE CONFIRMATION DIALOG */}
          {/* ------------------------------------------------ */}

          {showDeleteDialog && (
            <div
              className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/40
                px-4
                backdrop-blur-sm
              "
              onClick={() => {
                if (!isDeleting) {
                  setShowDeleteDialog(false);
                }
              }}
            >

              <div
                className="
                  w-full
                  max-w-md
                  rounded-2xl
                  border
                  border-border/50
                  bg-background
                  p-6
                  shadow-2xl
                "
                onClick={(event) => event.stopPropagation()}
              >

                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>

                {/* Text */}
                <div className="mt-4 space-y-2">

                  <h2 className="text-lg font-semibold text-foreground">
                    Delete this journal entry?
                  </h2>

                  <p className="text-sm leading-6 text-muted-foreground">
                    This entry will be permanently deleted.
                    This action cannot be undone.
                  </p>

                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isDeleting}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleDeleteEntry}
                    disabled={isDeleting}
                    className="
                      flex-1
                      rounded-xl
                      bg-destructive
                      text-destructive-foreground
                      hover:bg-destructive/90
                    "
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // MAIN JOURNAL PAGE
  // ------------------------------------------------------------

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24 sm:px-6">

      <div className="mx-auto w-full max-w-5xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="space-y-1">

            <div className="flex items-center gap-2">

              <BookOpen className="h-6 w-6 text-primary" />

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Journal
              </h1>

            </div>

            <p className="text-sm text-muted-foreground">
              A quiet place for your thoughts and reflections.
            </p>

          </div>

          <Button
            onClick={openNewEntry}
            className="rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>

        </div>

        {/* Today's prompt */}
        <Card className="border-border/40 bg-primary/[0.035] shadow-sm">

          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div className="space-y-1">

              <div className="flex items-center gap-2">

                <Sparkles className="h-4 w-4 text-primary" />

                <p className="text-sm font-medium text-primary">
                  Today
                </p>

              </div>

              <p className="text-sm text-muted-foreground">
                {today}
              </p>

            </div>

            <p className="max-w-xl text-sm leading-6 text-foreground/80">
              Take a moment to pause, breathe, and put your thoughts
              into words.
            </p>

          </CardContent>

        </Card>

        {/* New journal editor */}
        {showNewEntry && (
          <Card
            id="journal-editor"
            className="border-border/40 shadow-elevated"
          >

            <CardHeader className="space-y-1">

              <CardTitle className="text-xl">
                Write your reflection
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                There is no right or wrong way to journal.
              </p>

            </CardHeader>

            <CardContent className="space-y-6">

              {/* Title */}
              <div className="space-y-2">

                <label className="text-sm font-medium text-foreground">
                  Title
                </label>

                <Input
                  value={currentTitle}
                  onChange={(event) =>
                    setCurrentTitle(event.target.value)
                  }
                  placeholder="Give this moment a name..."
                  className="rounded-xl"
                />

              </div>

              {/* Text */}
              <div className="space-y-2">

                <label className="text-sm font-medium text-foreground">
                  Your thoughts
                </label>

                <Textarea
                  value={currentEntry}
                  onChange={(event) =>
                    setCurrentEntry(event.target.value)
                  }
                  placeholder="How are you feeling today?"
                  className="
                    min-h-[220px]
                    resize-none
                    rounded-xl
                    leading-7
                  "
                />

              </div>

              {/* Prompts */}
              <div className="space-y-3">

                <div className="flex items-center gap-2">

                  <Sparkles className="h-4 w-4 text-primary" />

                  <p className="text-sm font-medium">
                    Need some inspiration?
                  </p>

                </div>

                <div className="flex flex-wrap gap-2">

                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => addPrompt(prompt)}
                      className="
                        rounded-full
                        border
                        border-border/60
                        bg-muted/30
                        px-3
                        py-2
                        text-xs
                        text-muted-foreground
                        transition
                        hover:bg-primary/5
                        hover:text-foreground
                      "
                    >
                      {prompt}
                    </button>
                  ))}

                </div>

              </div>

              {/* Images */}
              <div className="space-y-3">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <ImagePlus className="h-4 w-4 text-primary" />

                    <p className="text-sm font-medium">
                      Add memories
                    </p>

                  </div>

                  <p className="text-xs text-muted-foreground">
                    Optional
                  </p>

                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-dashed
                    border-border/60
                    bg-muted/20
                    px-4
                    py-8
                    text-sm
                    text-muted-foreground
                    transition
                    hover:bg-muted/40
                    hover:text-foreground
                  "
                >
                  <ImagePlus className="h-5 w-5" />
                  Add photos
                </button>

                {/* Image previews */}
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                    {selectedImages.map((image) => (
                      <div
                        key={image.id}
                        className="
                          group
                          relative
                          aspect-square
                          overflow-hidden
                          rounded-2xl
                          border
                          border-border/40
                          bg-muted
                        "
                      >

                        <img
                          src={image.preview}
                          alt="Journal memory"
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="
                            absolute
                            right-2
                            top-2
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-black/60
                            text-white
                            backdrop-blur-sm
                            transition
                            hover:bg-black/80
                          "
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>

                      </div>
                    ))}

                  </div>
                )}

              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-border/40 pt-5 sm:flex-row sm:justify-end">

                <Button
                  type="button"
                  variant="outline"
                  onClick={closeNewEntry}
                  className="rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveEntry}
                  disabled={!currentEntry.trim() || isSaving}
                  className="rounded-xl"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Entry"}
                </Button>

              </div>

            </CardContent>
          </Card>
        )}

        {/* ------------------------------------------------ */}
        {/* RECENT JOURNALS */}
        {/* ------------------------------------------------ */}

        <div className="space-y-4">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                Recent Reflections
              </h2>

              <p className="text-sm text-muted-foreground">
                Your latest journal entries.
              </p>
            </div>

          </div>

          {/* Loading */}
          {isLoadingEntries ? (
            <Card className="border-border/40">

              <CardContent className="flex flex-col items-center justify-center py-14">

                <div
                  className="
                    h-7
                    w-7
                    animate-spin
                    rounded-full
                    border-2
                    border-primary/20
                    border-t-primary
                  "
                />

                <p className="mt-4 text-sm text-muted-foreground">
                  Loading your reflections...
                </p>

              </CardContent>

            </Card>

          ) : entries.length === 0 ? (

            /* Empty state */
            <Card className="border-border/40">

              <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">

                  <BookOpen className="h-6 w-6 text-primary" />

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  Write your first journal
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Start with a small reflection about how your day
                  feels. Your thoughts will be kept here for you.
                </p>

                <Button
                  onClick={openNewEntry}
                  className="mt-5 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Start Writing
                </Button>

              </CardContent>

            </Card>

          ) : (

            /* Entries */
            <div className="grid gap-4 sm:grid-cols-2">

              {entries.map((entry) => (

                <Card
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="
                    cursor-pointer
                    border-border/40
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-md
                  "
                >

                  <CardContent className="p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">

                          <Calendar className="h-3.5 w-3.5" />

                          <span>
                            {new Date(
                              entry.created_at
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>

                        </div>

                        <h3 className="mt-3 truncate font-semibold text-foreground">

                          {entry.title || "Untitled reflection"}

                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">

                          {entry.content}

                        </p>

                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">

                        {entry.mood || "😊"}

                      </div>

                    </div>

                    <div className="mt-4 flex items-center justify-end border-t border-border/40 pt-3">

                      <span className="flex items-center gap-1 text-xs font-medium text-primary">

                        Read reflection

                        <ChevronDown className="h-3.5 w-3.5 -rotate-90" />

                      </span>

                    </div>

                  </CardContent>

                </Card>

              ))}

            </div>

          )}

        </div>

      </div>
    </div>
  );
};

export default Journal;