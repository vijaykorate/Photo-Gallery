import { useEffect, useRef } from "react";
import PhotoCard from "./PhotoCard.jsx";
import "./Gallery.css";

// A masonry grid of photos. Unlike CSS `column-count` (which fills top-to-bottom
// per column and scrambles reading order), this lays out row-major with CSS grid
// and gives each tile a row span computed from its actual rendered height — so
// photos read left-to-right, top-to-bottom in the intended sequence.
//
// `startIndex` is the position of this group's first photo within the flattened,
// whole-gallery list — so clicking a tile opens the lightbox at the correct
// global index. `groupId` lets edit controls target it.
export default function Gallery({ photos, groupId, startIndex = 0, onOpen }) {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (typeof ResizeObserver === "undefined") return; // graceful: even columns

    // One ResizeObserver for all tiles. We use the observer's own height
    // measurement (contentRect) instead of getBoundingClientRect, so recomputing
    // spans never forces a synchronous reflow — much smoother with many photos.
    const ro = new ResizeObserver((entries) => {
      const cs = getComputedStyle(grid);
      const row = parseFloat(cs.gridAutoRows) || 8;
      const gap = parseFloat(cs.rowGap) || 0;
      for (const e of entries) {
        const h = e.contentRect.height;
        const span = Math.max(1, Math.round((h + gap) / (row + gap)));
        e.target.style.setProperty("--span", span);
      }
    });
    Array.from(grid.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [photos]);

  return (
    <div className="gallery" ref={gridRef}>
      {photos.map((photo, i) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          groupId={groupId}
          index={i}
          onOpen={() => onOpen(startIndex + i)}
        />
      ))}
    </div>
  );
}
