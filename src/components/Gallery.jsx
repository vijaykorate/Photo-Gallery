import PhotoCard from "./PhotoCard.jsx";
import "./Gallery.css";

// A masonry grid of photos via CSS columns — no JS, no library, fully responsive
// (the browser reflows columns at any width). `startIndex` is the position of
// this group's first photo within the flattened, whole-gallery list — so clicking
// a tile opens the lightbox at the correct global index. `groupId` lets edit
// controls target it.
export default function Gallery({ photos, groupId, startIndex = 0, onOpen }) {
  return (
    <div className="gallery">
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
