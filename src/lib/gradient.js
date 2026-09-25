// Builds the soft gradient used as an offline placeholder when a photo has no
// real image yet (src: null). Kept in one place so every component matches.
// The default pair is purple-tinted to match the site theme (works in light and
// dark because it sits under a scrim / low opacity).
export function toneGradient(tone) {
  const [a, b] = Array.isArray(tone) && tone.length === 2 ? tone : ["#c9b3e0", "#7c53b8"];
  return `linear-gradient(145deg, ${a} 0%, ${b} 100%)`;
}

export default toneGradient;
