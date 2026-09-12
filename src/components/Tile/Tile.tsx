import React from "react";
import { useTheme } from "../../context/ThemeContext";
import type { HSL } from "../../context/ThemeContext";

export default function Tile({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description?: string;
}) {
  const { getTileColor } = useTheme();
  const hsl = getTileColor(id); // {h, s, l} | null

  const style = hsl
    ? {
        backgroundColor: `hsl(${hsl.h}deg ${hsl.s}% ${hsl.l}%)`,
        color: getLegibleText(hsl),
      }
    : undefined;

  return (
    <div className="p-4 rounded-lg shadow-soft" style={style}>
      <h4 className="font-semibold">{title}</h4>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  );
}

/* -------------------------------------------------------
   Determine text color based on lightness
-------------------------------------------------------- */
function getLegibleText(hsl: HSL) {
  return hsl.l < 60 ? "#fff" : "#000";
}
