import { useEdit } from "./EditContext.jsx";

// Buttons at the end of the gallery (edit mode only) to start a new
// trip or occasion section.
export default function AddGroup() {
  const { addGroup } = useEdit();
  return (
    <div className="add-group">
      <p className="add-group__label">Add a new section</p>
      <div className="add-group__buttons">
        <button type="button" onClick={() => addGroup("trip")}>＋ Trip</button>
        <button type="button" onClick={() => addGroup("occasion")}>＋ Occasion</button>
      </div>
    </div>
  );
}
