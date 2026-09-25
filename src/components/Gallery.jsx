import { useCallback, useEffect, useRef } from "react";
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

  // Compute each card's row span from its measured height + the grid's own
  // row unit / gap (read from computed style, so it stays in sync with the CSS
  // breakpoints without duplicating them here).
  const resize = useCallback((card) => {
    const grid = gridRef.current;
    if (!grid || !card) return;
    const cs = getComputedStyle(grid);
    const row = parseFloat(cs.gridAutoRows) || 8;
    const gap = parseFloat(cs.rowGap) || 0;
    const h = card.getBoundingClientRect().height;
    const span = Math.max(1, Math.round((h + gap) / (row + gap)));
    card.style.setProperty("--span", span);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.children);
    const layoutAll = () => cards.forEach(resize);
    layoutAll();

    // Recompute a card whenever its size changes (image decodes, caption wraps).
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => entries.forEach((e) => resize(e.target)))
        : null;
    if (ro) cards.forEach((c) => ro.observe(c));

    window.addEventListener("resize", layoutAll);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", layoutAll);
    };
  }, [photos, resize]);

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
