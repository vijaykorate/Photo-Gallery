import { useReveal } from "../hooks/useReveal.js";
import { useEdit } from "./edit/EditContext.jsx";
import "./Timeline.css";

// A visual trip timeline, built automatically from your "trip" sections
// (edit the trips in the gallery and this updates itself). Toggle it off via
// features.timeline in src/data/site.js.
function TimelineItem({ item }) {
  const [ref, visible] = useReveal({ threshold: 0.3 });
  return (
    <li ref={ref} className={`tl__item reveal ${visible ? "is-visible" : ""}`}>
      <span className="tl__node" aria-hidden="true" />
      {item.photo ? (
        <span className="tl__photo">
          <img src={item.photo} alt={item.trip} loading="lazy" decoding="async" draggable="false" />
        </span>
      ) : null}
      <span className="tl__text">
        <span className="tl__trip">{item.trip}</span>
        {item.place ? <span className="tl__place">{item.place}</span> : null}
      </span>
    </li>
  );
}

export default function Timeline() {
  const { content } = useEdit();

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
            <TimelineItem key={item.id} item={item} />
          ))}
        </ol>
      </div>
    </section>
  );
}
