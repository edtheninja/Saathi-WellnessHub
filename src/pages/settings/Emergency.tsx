import {
  AlertTriangle,
  Baby,
  HeartHandshake,
  Phone,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const callNumber = (number: string) => {
  window.location.href = `tel:${number}`;
};

type SupportOptionProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  number: string;
  actionLabel: string;
  urgent?: boolean;
};

const SupportOption = ({
  icon,
  title,
  description,
  number,
  actionLabel,
  urgent = false,
}: SupportOptionProps) => {
  return (
    <Card
      className={`border shadow-sm ${
        urgent
          ? "border-red-500/30 bg-red-500/[0.04]"
          : "border-border/50 bg-card"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              urgent ? "bg-red-500/10" : "bg-primary/10"
            }`}
          >
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-foreground">{title}</h2>

              {urgent && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                  Immediate
                </span>
              )}
            </div>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                onClick={() => callNumber(number)}
                className={`h-11 gap-2 ${
                  urgent
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : ""
                }`}
              >
                <Phone className="h-4 w-4" />
                {actionLabel}
              </Button>

              <span className="text-sm font-semibold text-muted-foreground">
                {number}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Emergency = () => {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-6 pb-32">
      {/* Emergency header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Emergency Help
            </h1>
            <p className="text-sm text-muted-foreground">
              Quick access to the right support.
            </p>
          </div>
        </div>
      </div>

      {/* Highest priority action */}
      <Card className="overflow-hidden border-red-500/30 bg-red-500/[0.05] shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                If there is immediate danger
              </p>

              <h2 className="mt-1 text-xl font-bold text-foreground">
                Call 112 now
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                If you or someone else is in immediate danger, seriously
                injured, or needs urgent emergency assistance, do not wait
                here. Call emergency services.
              </p>

              <Button
                type="button"
                onClick={() => callNumber("112")}
                className="mt-5 h-12 w-full gap-2 bg-red-600 text-base font-semibold text-white hover:bg-red-700 sm:w-auto sm:px-8"
              >
                <Phone className="h-5 w-5" />
                Call 112
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick decision */}
      <div className="pt-2">
        <h2 className="text-lg font-semibold text-foreground">
          What kind of help do you need?
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose the closest match. If you are unsure, call 112.
        </p>
      </div>

      {/* Physical / medical */}
      <SupportOption
        icon={<Stethoscope className="h-5 w-5 text-primary" />}
        title="Physical injury or medical emergency"
        description="For serious injury, illness, unconsciousness, severe pain, or another situation requiring urgent medical assistance."
        number="112"
        actionLabel="Call Emergency Services"
      />

      {/* Mental health */}
      <SupportOption
        icon={<HeartHandshake className="h-5 w-5 text-primary" />}
        title="Mental or emotional distress"
        description="For overwhelming distress, emotional crisis, thoughts of self-harm, or when you need immediate mental-health support."
        number="14416"
        actionLabel="Call Tele-MANAS"
      />

      {/* Women */}
      <SupportOption
        icon={<UserRound className="h-5 w-5 text-primary" />}
        title="Woman facing violence or safety concerns"
        description="For women experiencing violence, abuse, harassment, or a situation where safety and support are needed."
        number="181"
        actionLabel="Call Women Helpline"
      />

      {/* Children */}
      <SupportOption
        icon={<Baby className="h-5 w-5 text-primary" />}
        title="Child or minor in danger"
        description="For a child who is unsafe, being harmed, missing, abandoned, or otherwise in need of protection and support."
        number="1098"
        actionLabel="Call Child Helpline"
      />

      {/* Unsure */}
      <Card className="border-0 bg-muted/40 shadow-none">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

            <div>
              <p className="font-semibold text-foreground">
                Not sure which option applies?
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                You do not need to figure everything out before asking for
                help. If there is immediate risk or you are unsure what to do,
                call 112 and explain what is happening.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => callNumber("112")}
                className="mt-4 gap-2"
              >
                <Phone className="h-4 w-4" />
                Call 112
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final safety note */}
      <div className="rounded-2xl border border-border/50 bg-card p-4">
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Saathi provides quick access to support services but does not replace
          emergency responders, doctors, mental-health professionals, police,
          child-protection services, or other authorities.
        </p>
      </div>
    </div>
  );
};

export default Emergency;
