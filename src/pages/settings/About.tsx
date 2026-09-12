import {
  Heart,
  HeartHandshake,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  Waves,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAILS = [
  "edtheking786@gmail.com",
  "vermaansh30122005@gmail.com",
];

const About = () => {
  const openEmail = (email: string) => {
    const subject = encodeURIComponent("Saathi Support");
    window.location.href = `mailto:${email}?subject=${subject}`;
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pb-32">
      {/* Hero */}
      <Card className="overflow-hidden border-0 shadow-soft">
        <CardContent className="relative p-6 sm:p-8">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />

          <div className="relative">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <HeartHandshake className="h-7 w-7 text-primary" />
            </div>

            <p className="mb-2 text-sm font-medium text-primary">
              Saathi · Zen Companion
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              A companion for your
              <span className="text-primary"> wellness journey.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Saathi is a digital mental wellness companion designed to support
              individuals in cultivating emotional balance, self-awareness,
              and mindful habits in their everyday lives.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Philosophy */}
      <Card className="border-0 shadow-soft">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold">Our approach</h2>
              <p className="text-xs text-muted-foreground">
                Small steps, consistent care.
              </p>
            </div>
          </div>

          <p className="text-sm leading-7 text-muted-foreground">
            We believe mental well-being is a journey, not a destination.
            Saathi provides thoughtful tools such as mood tracking, guided
            mindfulness activities, journaling, music therapy, and wellness
            reminders to encourage reflection, consistency, and emotional
            clarity.
          </p>

          <div className="rounded-2xl bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Heart className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <p className="text-sm font-medium leading-6 text-foreground">
                Your everyday moments matter. Saathi is built to help you
                notice them, reflect on them, and build healthier habits over
                time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Saathi offers */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold">What Saathi is here for</h2>
              <p className="text-xs text-muted-foreground">
                Tools for everyday self-awareness.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: Heart,
                title: "Mood Tracking",
                description: "Notice and reflect on how you feel.",
              },
              {
                icon: Waves,
                title: "Mindfulness",
                description: "Create space for calm and reflection.",
              },
              {
                icon: Sparkles,
                title: "Journaling",
                description: "Put thoughts and experiences into words.",
              },
              {
                icon: HeartHandshake,
                title: "Wellness Habits",
                description: "Build consistency through gentle reminders.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/50 bg-background p-4"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>

                  <p className="text-sm font-semibold">{item.title}</p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Values */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <h2 className="font-semibold">Built with care</h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Our platform is built with empathy, privacy, and accessibility
              at its core.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <HeartHandshake className="h-5 w-5 text-primary" />
            </div>

            <h2 className="font-semibold">A supportive space</h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Whether you use Saathi as a guest or registered user, our goal
              is to provide a safe and supportive environment for reflection
              and emotional awareness.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Important note */}
      <Card className="border-0 bg-muted/40 shadow-none">
        <CardContent className="p-5">
          <p className="text-sm font-semibold">An important note</p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Saathi does not replace professional medical or psychological care.
            It serves as a companion to help users build healthier habits and
            emotional awareness.
          </p>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="font-semibold">Get in touch</h2>
              <p className="text-xs text-muted-foreground">
                Questions or concerns about Saathi?
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {SUPPORT_EMAILS.map((email) => (
              <Button
                key={email}
                type="button"
                variant="outline"
                onClick={() => openEmail(email)}
                className="h-auto w-full justify-start gap-3 rounded-xl px-4 py-3"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />

                <span className="truncate text-sm">{email}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="space-y-2 pb-2 text-center">
        <p className="text-xs text-muted-foreground">
          Developers reserve the right to modify or discontinue services at
          any time without prior notice.
        </p>

        <p className="text-xs text-muted-foreground">
          Made with care for everyday wellness.
        </p>
      </div>
    </div>
  );
};

export default About;

