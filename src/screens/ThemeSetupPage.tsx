import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useEffect } from "react";

export default function ThemeSetupPage() {
  const navigate = useNavigate();
  const { theme, applyTheme } = useTheme();

  const presets = [
    { name: "default", label: "Default", color: "#6366f1" },
    { name: "ocean", label: "Ocean", color: "#0aa7f5" },
    { name: "lavender", label: "Lavender", color: "#b388ff" },
    { name: "warm", label: "Warm", color: "#ff8b6b" },
  ];

  useEffect(() => {
    const done = localStorage.getItem("theme_setup_done");
    if (done === "yes") navigate("/dashboard");
  }, []);

  function saveChoice() {
    localStorage.setItem("theme_setup_done", "yes");
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col justify-center items-center p-6">

      {/* Heading */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Personalize Your Experience 🎨
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          Choose a theme that feels right for your mood and personality.
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl max-w-xl w-full animate-slide-up">

        {/* Live Preview */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold text-foreground opacity-80 mb-2">
            Live Preview
          </h3>
          <div
            className="w-full h-28 rounded-2xl shadow-lg transition-all duration-300"
            style={{
              background: `var(--primary)`,
              opacity: 0.8,
            }}
          ></div>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyTheme(p.name as any)}
              className={`group p-6 rounded-2xl border transition-all
                shadow-soft hover:shadow-xl hover:-translate-y-1
                bg-card relative overflow-hidden
                ${theme === p.name ? "ring-4 ring-primary" : ""}
              `}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 shadow-inner"
                style={{ backgroundColor: p.color }}
              />

              <p className="font-semibold text-sm text-center text-foreground">
                {p.label}
              </p>

              {/* Glow Effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition bg-[radial-gradient(circle_at_center,white,transparent)]"
              />
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => saveChoice()}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg hover:scale-105 transition"
          >
            Continue →
          </button>

          <button
            onClick={() => saveChoice()}
            className="text-muted-foreground hover:underline text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
