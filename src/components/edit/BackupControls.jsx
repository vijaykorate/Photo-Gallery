import { useState } from "react";
import { useEdit } from "./EditContext.jsx";
import { buildBackup, downloadBackup, restoreBackup } from "../../lib/backup.js";
import { publishLocalImages, countLocalImages } from "../../lib/publishImages.js";
import { saveContent } from "../../lib/server.js";
import "./edit.css";

// Backup (save everything to a file) and Restore (load a backup file). Shown
// only while editing. This is how you move a gallery between devices and keep
// a safe copy of your photos/songs/text.
//
// Publish: upload any photos that are still local-only (idb:) to the server so
// they show on OTHER devices too. Needs owner sign-in (a token).
export default function BackupControls() {
  const { content, editing, token, replaceContent } = useEdit();
  const [busy, setBusy] = useState("");
  const [progress, setProgress] = useState(null); // { done, total }
  const [status, setStatus] = useState("");

  if (!editing) return null;

  const localCount = countLocalImages(content);

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

  const onPublish = async () => {
    if (!token) {
      setStatus("Sign in first to publish to all devices.");
      return;
    }
    setBusy("publish");
    setStatus("");
    setProgress({ done: 0, total: localCount });
    try {
      const result = await publishLocalImages(content, token, (done, total) =>
        setProgress({ done, total })
      );
      // Persist locally (this also triggers the debounced server auto-save)…
      replaceContent(result.content);
      // …and push immediately so it's live for other devices right away.
      await saveContent(result.content, token);
      if (result.total === 0) {
        setStatus("Everything is already published. Other devices are up to date.");
      } else if (result.failed === 0) {
        setStatus(`Published ${result.uploaded} photo${result.uploaded === 1 ? "" : "s"}. Other devices will now show them.`);
      } else {
        setStatus(`Published ${result.uploaded}, but ${result.failed} couldn't upload — try again.`);
      }
    } catch (err) {
      setStatus("Publish failed: " + (err?.message || "unknown error"));
    } finally {
      setBusy("");
      setProgress(null);
    }
  };

  const publishLabel =
    busy === "publish"
      ? progress
        ? `Publishing ${progress.done}/${progress.total}…`
        : "Publishing…"
      : localCount > 0
      ? `☁ Publish to all devices (${localCount})`
      : "☁ Publish to all devices";

  return (
    <div className="backup-bar">
      <button
        type="button"
        className={`backup-bar__btn${token && localCount > 0 ? " backup-bar__btn--attn" : ""}`}
        onClick={onPublish}
        disabled={busy === "publish"}
        title={token ? "Upload local photos so other devices can see them" : "Sign in as owner to publish"}
      >
        {publishLabel}
      </button>
      <button type="button" className="backup-bar__btn" onClick={onBackup} disabled={!!busy}>
        {busy === "backup" ? "Saving…" : "⭳ Backup"}
      </button>
      <label className="backup-bar__btn">
        {busy === "restore" ? "Restoring…" : "⭱ Restore"}
        <input type="file" accept="application/json,.json" hidden onChange={onRestore} />
      </label>
      {status ? <span className="backup-bar__status">{status}</span> : null}
    </div>
  );
}
