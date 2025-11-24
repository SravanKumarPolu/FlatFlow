import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

// Service worker registration is handled automatically by vite-plugin-pwa
// With registerType: "autoUpdate", the plugin injects the registration code
// The useSWUpdate hook handles update notifications in components

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

