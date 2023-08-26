import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@styles/reset.scss";

const root = createRoot(document.getElementById("app")!);

root.render(<App />);
