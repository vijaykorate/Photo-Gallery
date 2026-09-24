import { useEdit } from "./EditContext.jsx";
import "./edit.css";

// The single, always-visible control: a pencil to start editing, a check to
// finish. No top toolbar, no separate "Done" button.
export default function EditToggle() {
  const { editing, setEditing } = useEdit();

  return (
    <button
      type="button"
      className={`edit-fab ${editing ? "is-on" : ""}`}
      onClick={() => setEditing((v) => !v)}
      aria-pressed={editing}
      aria-label={editing ? "Finish editing" : "Edit this site"}
    >
      {editing ? (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M5 12l5 5 9-11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
            <path d="M4 20h4l10-10-4-4L4 16v4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M13.5 6.5l4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span>Edit</span>
        </>
      )}
    </button>
  );
}
