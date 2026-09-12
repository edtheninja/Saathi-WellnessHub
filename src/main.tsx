import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { GoalsProvider } from "./context/GoalsContext";
 import { MascotProvider } from "./context/MascotContext";
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
