import { useState } from "react";
import { useEdit } from "./EditContext.jsx";
import { buildBackup, downloadBackup, restoreBackup } from "../../lib/backup.js";
import "./edit.css";

// Backup (save everything to a file) and Restore (load a backup file). Shown
// only while editing. This is how you move a gallery between devices and keep
// a safe copy of your photos/songs/text.
export default function BackupControls() {
  const { content, editing } = useEdit();
  const [busy, setBusy] = useState("");

  if (!editing) return null;

  const onBackup = async () => {
    setBusy("backup");
    try {
      downloadBackup(await buildBackup(content));
    } finally {
      setBusy("");
    }
  };

  const onRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm("Restore from this backup? It will replace what's here now.")) return;
    setBusy("restore");
    try {
      await restoreBackup(file);
      window.location.reload();
    } catch (err) {
      alert("Couldn't restore: " + err.message);
      setBusy("");
    }
  };

  return (
    <div className="backup-bar">
      <button type="button" className="backup-bar__btn" onClick={onBackup}>
        {busy === "backup" ? "Saving…" : "⭳ Backup"}
      </button>
      <label className="backup-bar__btn">
        {busy === "restore" ? "Restoring…" : "⭱ Restore"}
        <input type="file" accept="application/json,.json" hidden onChange={onRestore} />
      </label>
    </div>
  );
}
