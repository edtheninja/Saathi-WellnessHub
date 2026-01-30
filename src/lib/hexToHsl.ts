// src/lib/hexToHsl.ts
export default function hexToHSL(hex:string) {
  // accepts "#RRGGBB" or "#RGB"
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const r = parseInt(hex.substr(0,2),16)/255;
  const g = parseInt(hex.substr(2,2),16)/255;
  const b = parseInt(hex.substr(4,2),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = h * 60;
  }
  return `${Math.round(h)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
}
