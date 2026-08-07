import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Check, Loader2, Trash2 } from "lucide-react";

import { supabase } from "@/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DeleteAccount = () => {
  const navigate = useNavigate();

  const [confirmation, setConfirmation] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmation.trim().toUpperCase() === "DELETE";

  const handleDeleteAccount = async () => {
    if (!canDelete || isDeleting) return;

    setIsDeleting(true);
    setError("");

    try {
      /*
       * The actual account deletion must happen server-side.
       *
       * This endpoint should:
       * 1. Verify the authenticated Supabase user.
       * 2. Delete the user's application data.
       * 3. Delete the Supabase auth.users record.
       *
       * Do NOT place a Supabase service-role key in this frontend.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        navigate("/auth");
        return;
      }

      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Account deletion failed.");
      }

      await supabase.auth.signOut();

      navigate("/auth", {
        replace: true,
        state: {
          accountDeleted: true,
        },
      });
    } catch {
      setError(
        "We couldn't delete your account. Nothing has been removed. Please try again."
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
          aria-label="Back to settings"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Delete Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Permanently remove your Saathi account.
          </p>
        </div>
      </div>

      {/* Warning */}
      <Card className="border-red-500/30 bg-red-500/[0.04] shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <h2 className="font-semibold text-foreground">
                This action cannot be undone
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Deleting your account permanently removes your Saathi account
                and associated wellness data. Once the deletion is completed,
                the information cannot be recovered through Saathi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What gets removed */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">What will be removed</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {[
              "Your Saathi profile",
              "Mood and wellness records",
              "Journal entries",
              "Meditation records",
              "Goals and progress data",
              "Your Saathi authentication account",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10">
                  <Check className="h-4 w-4 text-red-600" />
                </div>

                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">
            {showConfirmation
              ? "Confirm account deletion"
              : "Ready to leave Saathi?"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {!showConfirmation ? (
            <>
              <p className="text-sm leading-6 text-muted-foreground">
                If you are sure you want to permanently delete your account,
                continue to the final confirmation step.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/settings")}
                  className="sm:flex-1"
                >
                  Keep My Account
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setError("");
                    setShowConfirmation(true);
                  }}
                  className="gap-2 sm:flex-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  To make sure this was intentional, type{" "}
                  <span className="font-bold text-foreground">DELETE</span>{" "}
                  below.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="delete-confirmation"
                  className="text-sm font-medium"
                >
                  Confirmation
                </label>

                <Input
                  id="delete-confirmation"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="Type DELETE"
                  autoComplete="off"
                  autoCapitalize="characters"
                  disabled={isDeleting}
                  className="h-11"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/[0.05] p-4 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isDeleting}
                  onClick={() => {
                    setConfirmation("");
                    setError("");
                    setShowConfirmation(false);
                  }}
                  className="sm:flex-1"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  disabled={!canDelete || isDeleting}
                  onClick={handleDeleteAccount}
                  className="gap-2 sm:flex-1"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Permanently Delete
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Safety note */}
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Changed your mind? You can keep your account and continue using Saathi
        without deleting your existing wellness history.
      </p>
    </div>
  );
};

export default DeleteAccount;

