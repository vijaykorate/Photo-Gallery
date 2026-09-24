// Small shared play / pause glyph used by both music controls.
export default function PlayIcon({ playing, size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {playing ? (
        <>
          <rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
          <rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
        </>
      ) : (
        <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z" fill="currentColor" />
      )}
    </svg>
  );
}
