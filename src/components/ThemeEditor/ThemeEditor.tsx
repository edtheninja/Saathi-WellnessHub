// src/components/ThemeEditor/ThemeEditor.tsx
import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Themes } from "../../themePresets";
import hexToHSL from "../../lib/hexToHsl.ts";

function clamp(n:number, a=0, b=100){ return Math.min(b, Math.max(a, n)); }

export default function ThemeEditor({ userId }: { userId?: string }) {
  const { theme, applyTheme, applyCustomVars, saveThemeToUser } = useTheme();

  // primary color represented as H S% L%
  const [h, setH] = useState(257);
  const [s, setS] = useState(90);
  const [l, setL] = useState(60);
  const [hex, setHex] = useState("#6b21a8");

  useEffect(()=>{
    // initialize hex/HSL from current theme primary if possible
    // read CSS variable --primary which is "h s% l%"
    const v = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    if (v) {
      const parts = v.split(" ");
      if (parts.length===3) {
        const hh = Number(parts[0]);
        const ss = Number(parts[1].replace("%",""));
        const ll = Number(parts[2].replace("%",""));
        if (!Number.isNaN(hh)) { setH(hh); setS(ss); setL(ll); }
      }
    }
  }, []);

  useEffect(() => {
    // update hex whenever H,S,L change
    const hsl = `hsl(${h} ${s}% ${l}%)`;
    // update primary var to "h s% l%"
    applyCustomVars({"--primary": `${h} ${s}% ${l}%`});
    // set a suitable foreground contrast
    const fg = l < 60 ? "0 0% 100%" : "0 0% 10%";
    applyCustomVars({"--primary-foreground": fg});
    // update hex field
    try {
      const tmp = hslToHex(h,s,l);
      setHex(tmp);
    } catch {}
  }, [h,s,l]);

  const onHexChange = (hexIn:string) => {
    setHex(hexIn);
    const hsl = hexToHSL(hexIn); // returns "H S% L%"
    const [hh, ss, ll] = hsl.split(" ").map(s=>s.replace("%","")).map(Number);
    if (!Number.isNaN(hh)) { setH(Math.round(hh)); setS(Math.round(ss)); setL(Math.round(ll)); }
  };

  const saveToUser = async () => {
    if (userId && typeof saveThemeToUser === "function") {
      await saveThemeToUser(userId);
    } else {
      // local save already done in theme provider
      alert("Theme applied locally. To persist across devices, enable Supabase saving.");
    }
  };

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-elevated space-y-3">
      <div className="flex items-center gap-2">
        <strong>Theme:</strong>
        <select value={theme} onChange={(e)=>applyTheme(e.target.value as any)} className="p-1 rounded border border-border bg-background">
          {Object.keys(Themes).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Primary color (hex)</label>
        <div className="flex gap-2 items-center">
          <input value={hex} onChange={(e)=>onHexChange(e.target.value)} className="p-2 border rounded w-32" />
          <input type="color" value={hex} onChange={(e)=>onHexChange(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Hue</label>
        <input type="range" min={0} max={360} value={h} onChange={(e)=>setH(Number(e.target.value))} />
        <div className="text-xs">H: {h}</div>
      </div>

      <div>
        <label className="block text-sm mb-1">Saturation</label>
        <input type="range" min={0} max={100} value={s} onChange={(e)=>setS(Number(e.target.value))} />
        <div className="text-xs">S: {s}%</div>
      </div>

      <div>
        <label className="block text-sm mb-1">Lightness</label>
        <input type="range" min={0} max={100} value={l} onChange={(e)=>setL(Number(e.target.value))} />
        <div className="text-xs">L: {l}%</div>
      </div>

      <div className="flex gap-2">
        <button onClick={()=>applyCustomVars({"--primary": `${h} ${s}% ${l}%`})} className="px-3 py-2 bg-primary text-primary-foreground rounded">Apply</button>
        <button onClick={saveToUser} className="px-3 py-2 bg-secondary text-secondary-foreground rounded">Save</button>
      </div>
    </div>
  );
}

/* small helper: convert HSL to hex */
function hslToHex(h:number, s:number, l:number) {
  s /= 100; l /= 100;
  const k = (n:number) => (n + h/30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n:number) => {
    const color = l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
