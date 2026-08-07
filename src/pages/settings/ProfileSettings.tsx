import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Mail, Save, User } from "lucide-react";

import { supabase } from "@/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ProfileSettings = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!userId || saving) return;

    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: userName.trim() })
      .eq("id", userId);

    if (!error) {
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 pb-32">
        <div className="mx-auto max-w-xl">
          <p className="text-sm text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 pb-32">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Profile Settings
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage the information connected to your Saathi profile.
          </p>
        </header>

        {/* Profile */}
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <User className="h-9 w-9 text-primary" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                {userName || "Saathi Member"}
              </h2>

              <p className="text-sm text-muted-foreground">
                Your Saathi profile
              </p>
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="rounded-2xl border border-border/50 bg-card p-5 space-y-5">
          <div>
            <h2 className="text-sm font-semibold">
              Personal Information
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Keep your profile information up to date.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="full-name"
              className="text-sm font-medium"
            >
              Full Name
            </label>

            <Input
              id="full-name"
              value={userName}
              onChange={(event) => {
                setUserName(event.target.value);
                setSaved(false);
              }}
              placeholder="Enter your name"
              disabled={saving}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                value={userEmail}
                disabled
                className="pl-9"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Your email is managed by your Saathi account.
            </p>
          </div>

          {/* Save */}
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !userName.trim()}
            className="w-full"
          >
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Changes Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </>
            )}
          </Button>
        </section>

        {/* Account status */}
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Check className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="text-sm font-medium">
                Verified Member
              </h2>

              <p className="text-xs text-muted-foreground">
                Your Saathi account is active.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProfileSettings;