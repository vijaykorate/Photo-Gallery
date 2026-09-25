import { useEffect, useRef } from "react";
import "./ScrollProgress.css";

// A thin bar along the top that fills as you scroll the page. Updates are
// coalesced with requestAnimationFrame and written straight to the DOM so we
// never re-render on scroll.
export default function ScrollProgress() {
  const fillRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? h.scrollTop / max : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${pct})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span className="scroll-progress__fill" ref={fillRef} style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
