// src/components/Tile/TileColorPicker.tsx
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useTheme, HSL } from "../../context/ThemeContext";

export default function TileColorPicker({ id }: { id: string }) {
  const { getTileColor, setTileColor } = useTheme();

  const saved = getTileColor(id) || { h: 250, s: 70, l: 50 };
  const [hsl, setHsl] = useState<HSL>(saved);

  const updateColor = (key: "h" | "s" | "l", value: number) => {
    const updated = { ...hsl, [key]: value };
    setHsl(updated);
    setTileColor(id, updated);
  };

  const presets: HSL[] = [
    { h: 210, s: 80, l: 55 },
    { h: 150, s: 70, l: 50 },
    { h: 280, s: 70, l: 60 },
    { h: 20,  s: 85, l: 60 },
    { h: 45,  s: 90, l: 55 },
  ];

  const preview = `hsl(${hsl.h}deg ${hsl.s}% ${hsl.l}%)`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-10 h-10 rounded-full shadow-md border border-border cursor-pointer"
          style={{ backgroundColor: preview }}
        />
      </PopoverTrigger>

      <PopoverContent className="w-64 p-4 space-y-4">
        <h3 className="font-medium text-sm">Tile Color</h3>

        {/* Presets */}
        <div className="flex gap-2">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => setTileColor(id, p)}
              className="w-8 h-8 rounded-full shadow"
              style={{ backgroundColor: `hsl(${p.h}deg ${p.s}% ${p.l}%)` }}
            />
          ))}
        </div>

        {/* Sliders */}
        <div>
          <p className="text-xs opacity-70">Hue</p>
          <Slider min={0} max={360} value={[hsl.h]} onValueChange={(v) => updateColor("h", v[0])} />
        </div>

        <div>
          <p className="text-xs opacity-70">Saturation</p>
          <Slider min={0} max={100} value={[hsl.s]} onValueChange={(v) => updateColor("s", v[0])} />
        </div>

        <div>
          <p className="text-xs opacity-70">Lightness</p>
          <Slider min={0} max={100} value={[hsl.l]} onValueChange={(v) => updateColor("l", v[0])} />
        </div>

        <button
          onClick={() => { setTileColor(id, { h: 250, s: 70, l: 50 }); setHsl({ h: 250, s: 70, l: 50 }); }}
          className="w-full mt-2 text-xs py-1 rounded-md bg-muted hover:bg-muted/80"
        >
          Reset
        </button>
      </PopoverContent>
    </Popover>
  );
}
