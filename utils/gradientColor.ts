// Convert a single hex color to a gradient array by lightening the second color
export function createGradientColors(hexColor: string): [string, string] {
  // Remove '#' if present
  const hex = hexColor.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Lighten the color by 20% for a subtle gradient effect
  const lightenFactor = 0.2;
  const lighterR = Math.min(255, Math.round(r + (255 - r) * lightenFactor));
  const lighterG = Math.min(255, Math.round(g + (255 - g) * lightenFactor));
  const lighterB = Math.min(255, Math.round(b + (255 - b) * lightenFactor));

  const lighterHex = `#${lighterR.toString(16).padStart(2, "0")}${lighterG.toString(16).padStart(2, "0")}${lighterB.toString(16).padStart(2, "0")}`;

  // FF = opaque, 00 = transparent
  return [hexColor + "00", lighterHex + "FF"];
}
