// src/pages/Settings.tsx
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Lock,
  Moon,
  LogOut,
  Trash2,
  ChevronRight,
  ShieldCheck,
  HeartPulse,
  Info,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  const Section = ({ title, children }: any) => (
    <div className="bg-card rounded-2xl p-4 space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
      {children}
    </div>
  );

  const Row = ({ icon, label, danger, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl
        ${danger ? "text-red-500 hover:bg-red-50" : "hover:bg-muted"}
      `}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-60" />
    </button>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-semibold">Settings & Privacy</h2>

      <Section title="ACCOUNT">
        <Row
          icon={<ShieldCheck className="w-5 h-5" />}
          label="Edit Profile"
          onClick={() => navigate("/settings/profile")}
        />
        <Row
          icon={<Lock className="w-5 h-5" />}
          label="Change Password"
          onClick={() => navigate("/settings/security")}
        />
      </Section>

      <Section title="WELLNESS">
        <Row
          icon={<HeartPulse className="w-5 h-5" />}
          label="Mood & Meditation Preferences"
          onClick={() => navigate("/settings/wellness")}
        />
        <Row
          icon={<Bell className="w-5 h-5" />}
          label="Daily Reminders"
          onClick={() => navigate("/settings/reminders")}
        />
      </Section>

      <Section title="PRIVACY">
        <Row
          icon={<Lock className="w-5 h-5" />}
          label="Journal Privacy"
          onClick={() => navigate("/settings/privacy")}
        />
        <Row
          icon={<ShieldCheck className="w-5 h-5" />}
          label="Therapist Access"
          onClick={() => navigate("/settings/therapist")}
        />
      </Section>

      <Section title="SUPPORT">
        <Row
          icon={<Info className="w-5 h-5" />}
          label="About Saathi"
          onClick={() => navigate("/settings/about")}
        />
        <Row
          icon={<HeartPulse className="w-5 h-5" />}
          label="Emergency Helpline"
          onClick={() => navigate("/settings/emergency")}
        />
      </Section>

      <Section title="DANGER ZONE">
        <Row
          icon={<LogOut className="w-5 h-5" />}
          label="Logout"
          onClick={() => navigate("/auth")}
        />
        <Row
          icon={<Trash2 className="w-5 h-5" />}
          label="Delete Account"
          danger
          onClick={() => navigate("/settings/delete-account")}
        />
      </Section>
    </div>
  );
}