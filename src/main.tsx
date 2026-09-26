import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { GoalsProvider } from "./context/GoalsContext";
import { MascotProvider } from "./context/MascotContext";

// Register Service Worker for native PWA and OS Push Notifications
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => {
        console.debug("ServiceWorker registration ready:", reg.scope);
      })
      .catch((err) => {
        console.debug("ServiceWorker registration skipped:", err);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <GoalsProvider>
        <MascotProvider>
          <App />
        </MascotProvider>
      </GoalsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
