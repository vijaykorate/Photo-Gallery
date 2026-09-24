// Builds the soft gradient used as an offline placeholder when a photo has no
// real image yet (src: null). Kept in one place so every component matches.
export function toneGradient(tone) {
  const [a, b] = Array.isArray(tone) && tone.length === 2 ? tone : ["#efe6da", "#c9b39a"];
  return `linear-gradient(145deg, ${a} 0%, ${b} 100%)`;
}

export default toneGradient;
