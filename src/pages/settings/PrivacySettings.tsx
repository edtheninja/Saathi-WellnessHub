import { useEffect, useState } from "react";
import {
  BookOpen,
  Database,
  Eye,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { readUserSetting, writeUserSetting } from "@/lib/userPersistence";

const STORAGE_KEY = "saathi_privacy_settings_v1";

interface PrivacyPreferences {
  privateJournal: boolean;
  communitySharing: boolean;
  wellnessData: boolean;
  analytics: boolean;
}

const DEFAULT_PREFERENCES: PrivacyPreferences = {
  privateJournal: true,
  communitySharing: true,
  wellnessData: true,
  analytics: false,
};

const PrivacySettings = () => {
  const [preferences, setPreferences] =
    useState<PrivacyPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...JSON.parse(saved),
        });
      }
    } catch {
      // Keep the safe defaults if stored data is unavailable or invalid.
    }
    void readUserSetting(STORAGE_KEY, DEFAULT_PREFERENCES).then((saved) => {
      setPreferences((current) => ({ ...current, ...saved }));
    });
  }, []);

  const updatePreference = (
    key: keyof PrivacyPreferences,
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

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pb-32">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Privacy & Data
            </h1>
            <p className="text-sm text-muted-foreground">
              Control how your Saathi data is used and shared.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy status */}
      <Card className="border-0 shadow-soft">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-1">
            <h2 className="font-semibold">Your privacy comes first</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Saathi is designed to keep your personal wellness information
              private. Use the controls below to decide which optional
              features are enabled.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy controls */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
        </CardHeader>

        <CardContent className="space-y-1">
          {/* Journal */}
          <div className="flex items-center justify-between gap-4 border-b py-4">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-1 h-5 w-5 shrink-0 text-primary" />

              <div>
                <p className="font-medium">Private Journal</p>
                <p className="text-sm text-muted-foreground">
                  Keep your journal entries visible only to you.
                </p>
              </div>
            </div>

            <Switch
              checked={preferences.privateJournal}
              onCheckedChange={(value) =>
                updatePreference("privateJournal", value)
              }
              aria-label="Private Journal"
            />
          </div>

          {/* Community */}
          <div className="flex items-center justify-between gap-4 border-b py-4">
            <div className="flex items-start gap-3">
              <Users className="mt-1 h-5 w-5 shrink-0 text-primary" />

              <div>
                <p className="font-medium">Community Sharing</p>
                <p className="text-sm text-muted-foreground">
                  Allow optional sharing of moments through the Saathi
                  community.
                </p>
              </div>
            </div>

            <Switch
              checked={preferences.communitySharing}
              onCheckedChange={(value) =>
                updatePreference("communitySharing", value)
              }
              aria-label="Community Sharing"
            />
          </div>

          {/* Wellness data */}
          <div className="flex items-center justify-between gap-4 border-b py-4">
            <div className="flex items-start gap-3">
              <Database className="mt-1 h-5 w-5 shrink-0 text-primary" />

              <div>
                <p className="font-medium">Wellness Data</p>
                <p className="text-sm text-muted-foreground">
                  Allow Saathi features to use your wellness activity to
                  provide progress insights.
                </p>
              </div>
            </div>

            <Switch
              checked={preferences.wellnessData}
              onCheckedChange={(value) =>
                updatePreference("wellnessData", value)
              }
              aria-label="Wellness Data"
            />
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-start gap-3">
              <Eye className="mt-1 h-5 w-5 shrink-0 text-primary" />

              <div>
                <p className="font-medium">Anonymous Analytics</p>
                <p className="text-sm text-muted-foreground">
                  Allow anonymous usage information to help improve Saathi.
                </p>
              </div>
            </div>

            <Switch
              checked={preferences.analytics}
              onCheckedChange={(value) =>
                updatePreference("analytics", value)
              }
              aria-label="Anonymous Analytics"
            />
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Your Data
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Your mood, journal, meditation, goals, and other wellness
            information should be treated as personal information.
          </p>

          <p>
            Turning off an optional preference does not delete existing
            information. Use the account data controls when you want to remove
            stored data.
          </p>

          <p>
            These preferences are currently stored locally on this device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;