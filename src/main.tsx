import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply saved theme preference before render to avoid flash
try {
  const saved = localStorage.getItem("pref:darkMode");
  if (saved === "true") document.documentElement.classList.add("dark");
} catch {}

createRoot(document.getElementById("root")!).render(<App />);
