import { createContext, useContext, useState } from "react";
import { useContent } from "../../hooks/useContent.js";

// Bundles the editable content store together with an "editing" on/off flag,
// so any component (hero, a group, a photo tile) can read content and edit it
// without threading props through every level.
const EditContext = createContext(null);

export function useEdit() {
  return useContext(EditContext);
}

export function EditProvider({ children }) {
  const store = useContent();
  const [editing, setEditing] = useState(false);
  return (
    <EditContext.Provider value={{ ...store, editing, setEditing }}>
      {children}
    </EditContext.Provider>
  );
}

export default EditProvider;
