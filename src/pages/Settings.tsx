import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  Bell,
  ChevronRight,
  HeartPulse,
  Info,
  Lock,
  LogOut,
  ShieldCheck,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { disableDemoMode, enableDemoMode, isDemoMode } from "@/features/wellness/services/DemoMode";

type SectionProps = {
  title: string;
  children: ReactNode;
  danger?: boolean;
};

type RowProps = {
  icon: ReactNode;
  label: string;
  description: string;
  danger?: boolean;
  onClick: () => void;
};

function Section({ title, children, danger = false }: SectionProps) {
  return (
    <section
      className={`space-y-2 rounded-2xl border p-4 ${danger
          ? "border-red-500/20 bg-red-500/5"
          : "border-border/50 bg-card"
        }`}
    >
      <h3
        className={`px-3 text-xs font-semibold tracking-wide ${danger ? "text-red-500" : "text-muted-foreground"
          }`}
      >
        {title}
      </h3>

      {children}
    </section>
  );
}

function Row({
  icon,
  label,
  description,
  danger = false,
  onClick,
}: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left transition-colors ${danger
          ? "text-red-500 hover:bg-red-500/10"
          : "hover:bg-primary/5"
        }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-red-500/10" : "bg-muted"
            }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <span className="block text-sm font-medium">
            {label}
          </span>

          <span
            className={`mt-0.5 block text-xs ${danger
                ? "text-red-500/70"
                : "text-muted-foreground"
              }`}
          >
            {description}
          </span>
        </div>
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-hover:translate-x-1"
      />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState(isDemoMode());

  const toggleDemoMode = (enabled: boolean) => {
    if (enabled) enableDemoMode();
    else disableDemoMode();
    setDemoMode(enabled);
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 pb-32">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Header */}
        <header className="space-y-1 px-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Settings
          </h1>

          <p className="text-sm text-muted-foreground">
            Make Saathi feel right for you.
          </p>
        </header>

        {/* Account */}
        <Section title="ACCOUNT">
          <Row
            icon={
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            }
            label="Profile"
            description="Manage your personal information"
            onClick={() => navigate("/settings/profile")}
          />

          <Row
            icon={<Lock className="h-5 w-5 text-blue-400" />}
            label="Password & Security"
            description="Keep your account secure"
            onClick={() => navigate("/settings/security")}
          />
        </Section>

        {/* Wellness */}
        <Section title="WELLNESS">
          <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-medium">Demo Mode</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Load realistic wellness data for presentations</span>
              </div>
            </div>
            <Switch checked={demoMode} onCheckedChange={toggleDemoMode} aria-label="Demo Mode" />
          </div>

          <Row
            icon={
              <HeartPulse className="h-5 w-5 text-violet-400" />
            }
            label="Mood & Meditation"
            description="Personalize your wellness experience"
            onClick={() => navigate("/settings/wellness")}
          />

          <Row
            icon={<Bell className="h-5 w-5 text-amber-400" />}
            label="Daily Reminders"
            description="Manage your wellness reminders"
            onClick={() => navigate("/settings/reminders")}
          />
        </Section>

        {/* Privacy */}
        <Section title="PRIVACY">
          <Row
            icon={<Lock className="h-5 w-5 text-cyan-400" />}
            label="Journal Privacy"
            description="Control how your journal is protected"
            onClick={() => navigate("/settings/privacy")}
          />

          <Row
            icon={
              <ShieldCheck className="h-5 w-5 text-teal-400" />
            }
            label="Therapist Access"
            description="Manage shared wellness access"
            onClick={() => navigate("/settings/therapist")}
          />
        </Section>

        {/* Support */}
        <Section title="SUPPORT">
          <Row
            icon={<Info className="h-5 w-5 text-sky-400" />}
            label="About Saathi"
            description="Learn more about your companion"
            onClick={() => navigate("/settings/about")}
          />

          <Row
            icon={
              <HeartPulse className="h-5 w-5 text-rose-400" />
            }
            label="Emergency Support"
            description="Find support when you need it"
            onClick={() => navigate("/settings/emergency")}
          />
        </Section>

        {/* Account actions */}
        <Section title="ACCOUNT">
          <Row
            icon={<LogOut className="h-5 w-5 text-slate-400" />}
            label="Log Out"
            description="Sign out of your Saathi account"
            onClick={() => navigate("/auth")}
          />
        </Section>

        {/* Danger Zone */}
        <Section title="DANGER ZONE" danger>
          <Row
            icon={<Trash2 className="h-5 w-5 text-red-400" />}
            label="Delete Account"
            description="Permanently remove your Saathi account"
            danger
            onClick={() => navigate("/settings/delete-account")}
          />
        </Section>
      </div>
    </main>
  );
}