// UI, die API testet (/health und /skills)

// CSS in JS importieren
import "./style.css";

// 1) API-URL bestimmen
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// In index.html gibt es <div id="app"></div>
const app = document.querySelector("#app");

// 2) Helper: Elemente per JS bauen
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") {
      node.className = value;
    } else if (key.startsWith("on") && typeof value === "function") {
      // onClick -> "click"
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value);
    }
  }

  for (const child of children) node.append(child);

  return node;
}

// 3) Helper: JSON von API holen & Fehler sauber anzeigen
async function fetchJSON(path) {
  const res = await fetch(`${API_URL}${path}`);
  const text = await res.text();

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      typeof data === "string"
        ? data
        : data?.error || data?.message || "Unbekannter Fehler";

    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }

  return data;
}

// 4) UI rendern
function render() {
  app.innerHTML = "";

  const title = el("h1", {}, ["SkillTracker Frontend ✅"]);
  const info = el("p", { class: "muted" }, ["API: ", el("code", {}, [API_URL])]);

  // OUTPUT-Feld (hat in deiner Version gefehlt)
  const out = el("pre", { class: "out" }, ["Klicke einen Button zum Testen."]);

  const btnHealth = el(
    "button",
    {
      onClick: async () => {
        out.textContent = "Lade /health ...";
        try {
          const data = await fetchJSON("/health");
          out.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
          out.textContent = String(e.message || e);
        }
      },
    },
    ["Test /health"]
  );

  const btnSkills = el(
    "button",
    {
      onClick: async () => {
        out.textContent = "Lade /skills ...";
        try {
          const data = await fetchJSON("/skills");
          out.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
          out.textContent = String(e.message || e);
        }
      },
    },
    ["Test /skills"]
  );

  const row = el("div", { class: "row" }, [btnHealth, btnSkills]);

  app.append(title, info, row, out);
}

render();
