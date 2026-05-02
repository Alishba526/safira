import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { captureUtmSource } from "./lib/utm";
import { initPixels } from "./lib/pixels";

captureUtmSource();
initPixels();

createRoot(document.getElementById("root")!).render(<App />);
