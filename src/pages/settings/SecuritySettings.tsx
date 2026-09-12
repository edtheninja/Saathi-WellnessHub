import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Eye, EyeOff, KeyRound, LogOut, Shield } from "lucide-react";

import { supabase } from "@/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SecuritySettings = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handlePasswordChange = async () => {
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setMessage("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Your password should contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password updated successfully.");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 pb-32">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Security
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage your password and account access.
          </p>
        </header>

        {/* Security overview */}
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="font-medium">Account Security</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your Saathi account authentication is securely managed
                through your account provider.
              </p>
            </div>
          </div>
        </section>

        {/* Change password */}
        <section className="rounded-2xl border border-border/50 bg-card p-5 space-y-5">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <KeyRound className="h-4 w-4 text-primary" />
              Change Password
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Choose a new password for your Saathi account.
            </p>
          </div>

          {/* New password */}
          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="text-sm font-medium"
            >
              New Password
            </label>

            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setMessage("");
                }}
                placeholder="Enter new password"
                disabled={saving}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="text-sm font-medium"
            >
              Confirm Password
            </label>

            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setMessage("");
                }}
                placeholder="Confirm new password"
                disabled={saving}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((value) => !value)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="button"
            onClick={handlePasswordChange}
            disabled={saving}
            className="w-full"
          >
            {saving ? "Updating..." : "Update Password"}
          </Button>

          {message && (
            <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-sm">
              {message === "Password updated successfully." && (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              )}

              <span>{message}</span>
            </div>
          )}
        </section>

        {/* Sign out */}
        <section className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-medium">Sign Out</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Sign out of your current Saathi account.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SecuritySettings;