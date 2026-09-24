import { useState } from "react";
import { useEdit } from "./EditContext.jsx";
import { login } from "../../lib/server.js";
import "./edit.css";

// After the secret 4-tap unlock, the owner signs in here. A correct password
// gets a token so edits sync to the server. There's also an "on this device
// only" option (local editing when there's no server, e.g. plain `vite`).
export default function PasswordGate() {
  const { unlocked, token, setToken, setEditing, setUnlocked } = useEdit();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!unlocked || token) return null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await login(pw);
    setBusy(false);
    if (r.ok) {
      setToken(r.token);
      setEditing(true);
    } else {
      setErr(r.error || "Wrong password.");
    }
  };

  return (
    <div className="pw-gate" role="dialog" aria-modal="true" aria-label="Owner sign in">
      <form className="pw-gate__box" onSubmit={submit}>
        <p className="pw-gate__title">Owner sign‑in</p>
        <p className="pw-gate__hint">Enter your password to edit the live site.</p>
        <input
          type="password"
          className="pw-gate__input"
          value={pw}
          placeholder="Password"
          autoFocus
          onChange={(e) => setPw(e.target.value)}
        />
        {err ? <p className="pw-gate__err">{err}</p> : null}
        <div className="pw-gate__row">
          <button type="button" className="pw-gate__cancel" onClick={() => setUnlocked(false)}>
            Cancel
          </button>
          <button type="submit" className="pw-gate__go" disabled={busy}>
            {busy ? "…" : "Unlock"}
          </button>
        </div>
        <button type="button" className="pw-gate__local" onClick={() => setEditing(true)}>
          Edit on this device only
        </button>
      </form>
    </div>
  );
}
