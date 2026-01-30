import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeCustomizer() {
  const { applyCustomVars } = useTheme();

  const [h, setH] = useState(210);
  const [s, setS] = useState(60);
  const [l, setL] = useState(55);

  const color = `hsl(${h}deg ${s}% ${l}%)`;

  const applyFinalTheme = () => {
    applyCustomVars({
      "--primary": color,
      "--primary-foreground": l > 55 ? "black" : "white",
      "--card": color,
      "--card-foreground": l > 55 ? "black" : "white"
    });

    localStorage.setItem("saathi_custom_theme", JSON.stringify({ h, s, l }));
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold">Create Your Own Theme</h2>

      {/* Color Preview */}
      <div
        className="w-full h-32 rounded-2xl shadow-md border"
        style={{ background: color }}
      />

      {/* HUE WHEEL (modern round slider) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Hue</label>
        <div
          className="w-full h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-red-500"
        />
        <Slider min={0} max={360} value={[h]} onValueChange={(v) => setH(v[0])} />
      </div>

      {/* Saturation */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Saturation</label>
        <Slider min={0} max={100} value={[s]} onValueChange={(v) => setS(v[0])} />
      </div>

      {/* Lightness */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Lightness</label>
        <Slider min={0} max={100} value={[l]} onValueChange={(v) => setL(v[0])} />
      </div>

      <Button
        className="w-full mt-4 rounded-xl"
        onClick={applyFinalTheme}
      >
        Apply Theme
      </Button>
    </div>
  );
}
