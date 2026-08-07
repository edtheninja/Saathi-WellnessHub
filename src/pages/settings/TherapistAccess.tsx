import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  HeartHandshake,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const TELE_MANAS_NUMBER = "14416";
const SAATHI_SUPPORT_EMAIL = "edtheking786@gmail.com";

const TherapistAccess = () => {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("therapistAccess") === "true";
  });

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    localStorage.setItem("therapistAccess", String(value));
  };

  const callTeleManas = () => {
    window.location.href = `tel:${TELE_MANAS_NUMBER}`;
  };

  const emailSupport = () => {
    const subject = encodeURIComponent(
      "Request for Mental Health Support through Saathi"
    );

    const body = encodeURIComponent(
      `Hello Saathi Support Team,

I am reaching out because I would like some support with my mental well-being.

What I am currently experiencing:
[Please describe what you are going through here.]

What kind of support I am looking for:
[Please describe what would be helpful.]

I understand that Saathi is not a replacement for professional or emergency care. Please guide me toward the appropriate support if needed.

Thank you,
Saathi User`
    );

    window.location.href = `mailto:${SAATHI_SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const openTeleManas = () => {
    window.open(
      "https://telemanas.mohfw.gov.in/home",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pb-32">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <HeartHandshake className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Professional Support
            </h1>
            <p className="text-sm text-muted-foreground">
              Get connected with mental-health support when you need it.
            </p>
          </div>
        </div>
      </div>

      {/* Access preference */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  enabled ? "bg-primary/10" : "bg-muted"
                }`}
              >
                {enabled ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-1">
                <p className="font-semibold">Support Access</p>
                <p className="text-sm text-muted-foreground">
                  {enabled
                    ? "Support access is enabled."
                    : "Support access is currently disabled."}
                </p>
              </div>
            </div>

            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              aria-label="Enable professional support access"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tele-MANAS */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-primary" />
            Tele-MANAS
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-2xl bg-primary/5 p-4">
            <p className="font-semibold">24/7 Mental Health Support</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Tele-MANAS is the Government of India's national tele-mental
              health service. You can call the national helpline for
              confidential mental-health support.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="text-sm text-muted-foreground">National Helpline</p>
              <p className="text-2xl font-bold tracking-wide">14416</p>
            </div>

            <Button
              type="button"
              onClick={callTeleManas}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={openTeleManas}
            className="w-full gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Visit Tele-MANAS
          </Button>
        </CardContent>
      </Card>

      {/* Saathi support email */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contact Saathi Support
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            If you would like help understanding which support option may be
            appropriate for you, you can email the Saathi team. A draft
            message will be prepared for you automatically.
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={emailSupport}
            className="h-12 w-full gap-2"
          >
            <Mail className="h-4 w-4" />
            Email Saathi Support
          </Button>
        </CardContent>
      </Card>

      {/* Emergency notice */}
      <Card className="border-amber-500/20 bg-amber-500/5 shadow-none">
        <CardContent className="flex items-start gap-3 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Need immediate help?
            </p>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Saathi is not an emergency service. If you are in immediate
              danger or need urgent assistance, contact emergency services or
              use the Tele-MANAS helpline for mental-health support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TherapistAccess;

