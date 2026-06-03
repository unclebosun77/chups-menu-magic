import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply saved theme preference before render to avoid flash. Default = light.
try {
  const savedTheme = localStorage.getItem("chups-theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }
} catch {}

createRoot(document.getElementById("root")!).render(<App />);
