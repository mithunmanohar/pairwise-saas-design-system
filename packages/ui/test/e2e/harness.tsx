// Mounts one fixture from fixtures.tsx: index.html?fixture=<name>&theme=light|dark&density=compact|comfortable
import { createRoot } from "react-dom/client";
import { fixtures } from "./fixtures";

const q = new URLSearchParams(location.search);
const name = q.get("fixture") || "";
document.documentElement.dataset.theme = q.get("theme") || "light";
document.documentElement.dataset.density = q.get("density") || "compact";
const Fixture = fixtures[name];
const root = document.getElementById("root");
if (!root) throw new Error("no #root");
if (!Fixture) root.textContent = `Unknown fixture "${name}". Known: ${Object.keys(fixtures).join(", ")}`;
else createRoot(root).render(<Fixture />);
