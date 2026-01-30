// src/screens/ModeSelector.tsx
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Moon, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ModeSelector() {
  const { themeMode, setThemeMode } = useTheme();
  const navigate = useNavigate();

  const modes = [
    { id: "light", label: "Light Mode", icon: Sun },
    { id: "dark", label: "Dark Mode", icon: Moon },
    { id: "system", label: "System Default", icon: Monitor },
  ];

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/profile")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="mx-auto text-xl font-semibold">Choose Mode</h1>
      </div>

      <div className="space-y-4">
        {modes.map((m) => {
          const Icon = m.icon;
          const active = themeMode === m.id;

          return (
            <div
              key={m.id}
              onClick={() => setThemeMode(m.id as any)}
              className={`p-5 rounded-3xl cursor-pointer glass border transition 
                hover:scale-[1.02] flex items-center gap-4 
                ${active ? "border-primary bg-primary/10" : "border-white/10"}`}
            >
              <Icon className="w-6 h-6" />
              <div className="flex-1">
                <h3 className="font-semibold">{m.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {m.id === "system" ? "Uses your device settings" : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
