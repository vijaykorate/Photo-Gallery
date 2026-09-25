import { useEffect, useState } from "react";
import "./ThemeToggle.css";

// A small light/dark switch. Defaults to the OS preference; once the visitor
// picks a side, the choice is remembered (localStorage) and wins over the OS.
// The actual token swap happens in src/index.css via the data-theme attribute.
const KEY = "photo-gallery/theme";
const META = { light: "#e7dcf5", dark: "#140f1f" };

function systemDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}
function stored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function apply(theme) {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") root.dataset.theme = theme;
  else delete root.dataset.theme; // follow the OS
  const effective = theme || (systemDark() ? "dark" : "light");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", META[effective]);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => stored()); // "light" | "dark" | null(system)

  useEffect(() => {
    apply(theme);
  }, [theme]);

  // While following the OS, react to OS changes live.
  useEffect(() => {
    if (theme) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => apply(null);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, [theme]);

  const isDark = theme ? theme === "dark" : systemDark();

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M12 2.6v2.4M12 19v2.4M21.4 12H19M5 12H2.6M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
