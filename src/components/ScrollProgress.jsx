import { useEffect, useState } from "react";
import "./ScrollProgress.css";

// A thin bar along the top that fills as you scroll the page.
export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span className="scroll-progress__fill" style={{ transform: `scaleX(${pct / 100})` }} />
    </div>
  );
}
