import { useReveal } from "../hooks/useReveal.js";
import Gallery from "./Gallery.jsx";
import EditableText from "./edit/EditableText.jsx";
import GroupEditBar from "./edit/GroupEditBar.jsx";
import { useEdit } from "./edit/EditContext.jsx";
import "./Section.css";

// One memory group (a trip or an occasion): a small type label, an (editable)
// title + note, and its masonry gallery.
export default function Section({ group, startIndex, onOpen, index = 0 }) {
  const { editing, updateGroup } = useEdit();
  const [ref, visible] = useReveal({ threshold: 0.08 });

  const kindLabel = group.kind === "occasion" ? "Occasion" : "Trip";

  return (
    <section
      id={group.id}
      className={`memory-section ${index % 2 === 1 ? "memory-section--tint" : ""}`}
    >
      <div className="container">
        <header
          ref={ref}
          className={`memory-section__head reveal ${visible ? "is-visible" : ""}`}
        >
          <div className="memory-section__heading">
            <span className="eyebrow memory-section__kind">{kindLabel}</span>
            <h2 className="memory-section__title">
              <EditableText
                editing={editing}
                value={group.title}
                onChange={(v) => updateGroup(group.id, { title: v })}
                placeholder="Section name"
                className="memory-section__title-text"
                ariaLabel="Section name"
              />
            </h2>
            {(group.note || editing) && (
              <p className="memory-section__note">
                <EditableText
                  editing={editing}
                  value={group.note}
                  onChange={(v) => updateGroup(group.id, { note: v })}
                  placeholder="A short note (optional)"
                  className="memory-section__note-text"
                  ariaLabel="Section note"
                />
              </p>
            )}
          </div>
          <span className="memory-section__rule" aria-hidden="true" />
        </header>

        {editing ? <GroupEditBar group={group} /> : null}

        {group.photos.length > 0 ? (
          <Gallery photos={group.photos} groupId={group.id} startIndex={startIndex} onOpen={onOpen} />
        ) : editing ? (
          <p className="memory-section__empty">No photos yet — use “＋ Add photos”.</p>
        ) : null}
      </div>
    </section>
  );
}
