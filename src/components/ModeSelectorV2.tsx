import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ModeSelectorV2() {
  const { themeMode, setThemeMode } = useTheme();

  const [selectedMode, setSelectedMode] = useState<
    "light" | "dark" | "system"
  >(themeMode);

  const handleSave = () => {
    setThemeMode(selectedMode);
    localStorage.setItem("saathi_theme", selectedMode);
    localStorage.setItem("saathi_mode_chosen", "1");

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "saathi_mode_chosen",
        newValue: "1",
      })
    );
  };

  const Option = ({
    mode,
    icon: Icon,
    label,
  }: {
    mode: "light" | "dark" | "system";
    icon: any;
    label: string;
  }) => {
    const active = selectedMode === mode;

    return (
      <button
        onClick={() => setSelectedMode(mode)}
        className={`relative w-full flex items-center gap-4 rounded-2xl border p-4 transition-all
          ${
            active
              ? "border-primary ring-2 ring-primary/40 bg-primary/5"
              : "border-border hover:bg-muted"
          }
        `}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center
            ${active ? "bg-primary text-primary-foreground" : "bg-muted"}
          `}
        >
          <Icon className="w-5 h-5" />
        </div>

        <span className="font-medium text-foreground">{label}</span>

        {active && (
          <Check className="absolute right-4 w-5 h-5 text-primary" />
        )}
      </button>
    );
  };

  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="p-8 rounded-3xl shadow-elevated bg-card w-full max-w-md space-y-6"
    >
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Choose Appearance
        </h1>
        <p className="text-sm text-muted-foreground">
          You can change this anytime from Profile
        </p>
      </div>

      <div className="space-y-3">
        <Option mode="light" icon={Sun} label="Light Mode" />
        <Option mode="dark" icon={Moon} label="Dark Mode" />
        <Option mode="system" icon={Monitor} label="System Default" />
      </div>

      {/* 🔥 DISTINCT PRIMARY ACTION */}
      <Button
        onClick={handleSave}
        className="w-full h-12 rounded-2xl text-base font-semibold
          bg-gradient-to-r from-indigo-500 to-purple-600
          hover:from-indigo-600 hover:to-purple-700
          text-white shadow-lg"
      >
        Save & Continue
      </Button>
    </motion.div>
  );
}