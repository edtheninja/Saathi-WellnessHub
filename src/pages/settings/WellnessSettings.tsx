import { useEffect, useState } from "react";
import { HeartPulse, BookOpen, Brain, BarChart3 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { readUserSetting, writeUserSetting } from "@/lib/userPersistence";

type WellnessPreferences = {
  moodCheckIn: boolean;
  wellnessInsights: boolean;
  meditationSuggestions: boolean;
  journalPrompts: boolean;
};

const STORAGE_KEY = "saathi_wellness_preferences";

const defaultPreferences: WellnessPreferences = {
  moodCheckIn: true,
  wellnessInsights: true,
  meditationSuggestions: true,
  journalPrompts: true,
};

const WellnessSettings = () => {
  const [preferences, setPreferences] =
    useState<WellnessPreferences>(defaultPreferences);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setPreferences({
          ...defaultPreferences,
          ...JSON.parse(saved),
        });
      }
    } catch {
      // Keep default preferences if stored data is invalid.
    }
    void readUserSetting(STORAGE_KEY, defaultPreferences).then((saved) => {
      setPreferences((current) => ({ ...current, ...saved }));
    });
  }, []);

  const updatePreference = (
    key: keyof WellnessPreferences,
    value: boolean
  ) => {
    setPreferences((current) => {
      const updated = {
        ...current,
        [key]: value,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      void writeUserSetting(STORAGE_KEY, updated);

      return updated;
    });
  };

  const wellnessOptions = [
    {
      key: "moodCheckIn" as const,
      title: "Daily Mood Check-in",
      description: "Keep daily mood tracking available in your routine.",
      icon: HeartPulse,
    },
    {
      key: "wellnessInsights" as const,
      title: "Wellness Insights",
      description: "Show your progress and wellness patterns.",
      icon: BarChart3,
    },
    {
      key: "meditationSuggestions" as const,
      title: "Meditation Suggestions",
      description: "Allow Saathi to highlight meditation activities.",
      icon: Brain,
    },
    {
      key: "journalPrompts" as const,
      title: "Journal Prompts",
      description: "Show prompts that can help you reflect and write.",
      icon: BookOpen,
    },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-6 pb-32">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Wellness Preferences
          </h1>

          <p className="text-sm text-muted-foreground">
            Personalize how Saathi supports your wellness routine.
          </p>
        </header>

        {/* Preferences */}
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold">
              Wellness Experience
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Choose the parts of your wellness experience you want to
              use.
            </p>
          </div>

          <div className="divide-y divide-border/50">
            {wellnessOptions.map((option) => {
              const Icon = option.icon;

              return (
                <div
                  key={option.key}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {option.title}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </p>
                  </div>

                  <Switch
                    checked={preferences[option.key]}
                    onCheckedChange={(value) =>
                      updatePreference(option.key, value)
                    }
                    aria-label={option.title}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Privacy note */}
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <h2 className="text-sm font-semibold">
            Your Preferences
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            These preferences are stored on this device and can be
            changed whenever you want.
          </p>
        </section>
      </div>
    </main>
  );
};

export default WellnessSettings;