const getColorBrightness = (color: string): number => {
  // Convert hex color to RGB
  if (color.startsWith("#")) {
    color = color.slice(1);
  }
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  // Calculate brightness using the formula: 0.299*R + 0.587*G + 0.114*B
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
};

export const decideTextColor = (bgColor: string): string => {
  // Simple logic to decide text color based on background color brightness
  const color = getColorBrightness(bgColor) > 128 ? "black" : "white";
  return color;
};
