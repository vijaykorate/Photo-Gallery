import { useRef, useState } from "react";
import { useEdit } from "./EditContext.jsx";
import { resizeToBlob } from "../../lib/resizeImage.js";
import { putImage } from "../../lib/audioStore.js";

// The row of controls shown under a group's heading while editing:
// switch Trip/Occasion, add photos, reorder, delete.
export default function GroupEditBar({ group }) {
  const { updateGroup, removeGroup, moveGroup, addPhotos } = useEdit();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setBusy(true);
    try {
      const photos = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const { blob, width, height } = await resizeToBlob(f);
        const id = `img-${Date.now()}-${i}`;
        if (blob) await putImage(id, blob); // stored in IndexedDB (roomy, local)
        photos.push({
          src: blob ? `idb:${id}` : null,
          alt: f.name.replace(/\.[^.]+$/, ""),
          ratio: width && height ? `${width}/${height}` : "3/4",
          caption: "",
        });
      }
      addPhotos(group.id, photos);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="group-edit">
      <div className="group-edit__kind" role="group" aria-label="Section type">
        <button
          type="button"
          className={group.kind === "trip" ? "is-on" : ""}
          onClick={() => updateGroup(group.id, { kind: "trip" })}
        >
          Trip
        </button>
        <button
          type="button"
          className={group.kind === "occasion" ? "is-on" : ""}
          onClick={() => updateGroup(group.id, { kind: "occasion" })}
        >
          Occasion
        </button>
      </div>

      <label className={`group-edit__add ${busy ? "is-busy" : ""}`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {busy ? "Adding…" : "＋ Add photos"}
      </label>

      <div className="group-edit__spacer" />

      <button type="button" className="group-edit__icon" onClick={() => moveGroup(group.id, -1)} aria-label="Move section up">↑</button>
      <button type="button" className="group-edit__icon" onClick={() => moveGroup(group.id, 1)} aria-label="Move section down">↓</button>
      <button
        type="button"
        className="group-edit__del"
        onClick={() => window.confirm(`Delete "${group.title}" and its photos?`) && removeGroup(group.id)}
        aria-label="Delete section"
      >
        Delete
      </button>
    </div>
  );
}
