import React from "react";
import ReactDOM from "react-dom/client";
// Self-hosted premium fonts (offline, no network) — swap these in data if you
// ever want a different pairing. Fraunces = soft display serif, Inter = body.
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
