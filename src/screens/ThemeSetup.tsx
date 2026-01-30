import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import type { ThemeName } from "../themePresets";

export default function ThemeSetup() {
  const { theme, applyTheme } = useTheme();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<ThemeName>(theme);
  const [fadeOut, setFadeOut] = useState(false);

  const presets = [
    { name: "default" as ThemeName, label: "Default", color: "#6C63FF" },
    { name: "ocean" as ThemeName, label: "Ocean", color: "#0096C7" },
    { name: "lavender" as ThemeName, label: "Lavender", color: "#B983FF" },
    { name: "warm" as ThemeName, label: "Warm", color: "#FF9E80" },
  ];

  function handleApply() {
    applyTheme(selected);

    // fade out animation
    setFadeOut(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 450); // match fade-out duration
  }

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center p-8 transition-all duration-500 
        ${fadeOut ? "opacity-0 scale-95" : "opacity-100 scale-100"}
      `}
    >
      {/* Card Container */}
      <div className="bg-card p-8 rounded-3xl shadow-xl max-w-md w-full border border-border">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Choose Your Theme 🌈
        </h1>

        <p className="text-center text-muted-foreground mb-6 text-sm">
          Personalize your Saathi experience with a theme you like.
        </p>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelected(p.name)}
              className={`p-6 rounded-2xl shadow-soft border relative
                transition-all duration-300 hover:shadow-lg bg-card
                ${selected === p.name ? "ring-4 ring-primary" : ""}
              `}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3"
                style={{ backgroundColor: p.color }}
              />

              <p className="font-semibold text-sm text-center">{p.label}</p>
            </button>
          ))}
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground 
            shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 
            transition-all duration-300"
        >
          Apply Theme →
        </button>
      </div>
    </div>
  );
}
