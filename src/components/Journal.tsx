import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, BookOpen, Save } from "lucide-react";
import { supabase } from "@/supabaseClient";

type JournalEntry = {
  id: string;
  content: string;
  created_at: string;
  mood?: string;
};

const Journal = () => {
  const [currentEntry, setCurrentEntry] = useState("");
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  /* -----------------------------
     LOAD SAVED JOURNALS
  ------------------------------ */
  const fetchJournals = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch journals error:", error);
      return;
    }

    setEntries(data || []);
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  /* -----------------------------
     SAVE JOURNAL ENTRY
  ------------------------------ */
  const handleSaveEntry = async () => {
    if (!currentEntry.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Session expired. Please login again.");
      return;
    }

    const { error } = await supabase.from("journals").insert({
      user_id: user.id,
      content: currentEntry,
    });

    if (error) {
      console.error("Save journal error:", error);
      alert("Failed to save journal");
      return;
    }
    const { data: journalData } = await supabase
      .from('journal')
      .select('id')
      .eq('user_id', user.id);

    const journalCount = journalData?.length || 0;

    setCurrentEntry("");
    setShowNewEntry(false);
    fetchJournals();
  };

  const prompts = [
    "What am I grateful for today?",
    "How did I practice self-care?",
    "What emotions did I experience?",
    "What brought me joy today?",
    "How can I be kinder to myself?",
  ];

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Journal</h1>
          <p className="text-muted-foreground">
            Your private space for thoughts and reflections
          </p>
        </div>

        {/* New Entry Button */}
        <Button
          onClick={() => setShowNewEntry(!showNewEntry)}
          className="w-full h-14 bg-gradient-calm hover:shadow-soft transition-all duration-300 rounded-2xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Entry
        </Button>

        {/* New Entry Form */}
        {showNewEntry && (
          <Card className="shadow-elevated border-0 animate-scale-in">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Textarea
                placeholder="How are you feeling? What's on your mind today?"
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                className="min-h-32 rounded-xl border-border/50 focus:border-primary resize-none"
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Need inspiration?
                </p>
                <div className="flex flex-wrap gap-2">
                  {prompts.slice(0, 3).map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentEntry(
                          currentEntry +
                          (currentEntry ? "\n\n" : "") +
                          prompt +
                          " "
                        )
                      }
                      className="text-xs rounded-full border-border/50 hover:bg-accent/50"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNewEntry(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEntry}
                  disabled={!currentEntry.trim()}
                  className="flex-1 bg-gradient-mint hover:shadow-soft transition-all duration-300 rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Entries */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Recent Entries
            </h2>
          </div>

          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="shadow-soft border-0 cursor-pointer transition-all duration-300 hover:shadow-elevated"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{entry.mood || "😊"}</div>
                  <div className="flex-1 space-y-2">
                    <span className="text-sm font-medium text-primary">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">
                      {entry.content.slice(0, 120)}
                      {entry.content.length > 120 && "..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {entries.length === 0 && (
            <Card className="shadow-soft border-0">
              <CardContent className="p-8 text-center space-y-4">
                <div className="text-4xl">📝</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Start Your Journey
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Your saved memories will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
