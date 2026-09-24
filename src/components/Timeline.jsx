import { useReveal } from "../hooks/useReveal.js";
import { useEdit } from "./edit/EditContext.jsx";
import EditableText from "./edit/EditableText.jsx";
import ResolvedImg from "./ResolvedImg.jsx";
import "./Timeline.css";

// A visual trip timeline, built automatically from your "trip" sections.
// The trip name + note are editable here too (they're the same fields as the
// trip section, so editing either place keeps both in sync).
function TimelineItem({ item, editing, updateGroup }) {
  const [ref, visible] = useReveal({ threshold: 0.3 });
  return (
    <li ref={ref} className={`tl__item reveal ${visible ? "is-visible" : ""}`}>
      <span className="tl__node" aria-hidden="true" />
      {item.photo ? (
        <span className="tl__photo">
          <ResolvedImg src={item.photo} alt={item.trip} loading="lazy" decoding="async" draggable="false" />
        </span>
      ) : null}
      <span className="tl__text">
        <span className="tl__trip">
          <EditableText
            editing={editing}
            value={item.trip}
            onChange={(v) => updateGroup(item.id, { title: v })}
            placeholder="Trip name"
            ariaLabel="Trip name"
          />
        </span>
        {(item.place || editing) && (
          <span className="tl__place">
            <EditableText
              editing={editing}
              value={item.place}
              onChange={(v) => updateGroup(item.id, { note: v })}
              placeholder="a short note"
              ariaLabel="Trip note"
            />
          </span>
        )}
      </span>
    </li>
  );
}

export default function Timeline() {
  const { content, editing, updateGroup } = useEdit();

  const trips = content.groups
    .filter((g) => g.kind === "trip")
    .map((g) => ({
      id: g.id,
      trip: g.title,
      place: g.note,
      photo: g.photos[0]?.src || null,
    }));

  if (trips.length === 0) return null;

  return (
    <section className="tl" aria-label="A timeline of trips">
      <div className="container">
        <ol className="tl__list">
          {trips.map((item) => (
            <TimelineItem key={item.id} item={item} editing={editing} updateGroup={updateGroup} />
          ))}
        </ol>
      </div>
    </section>
  );
}
