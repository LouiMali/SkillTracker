const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });

  // Falls dein Backend bei Fehlern JSON liefert: { message: "...", ... }
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.message ? `: ${data.message}` : "";
    } catch {
      // ignore
    }
    throw new Error(`HTTP ${res.status}${detail}`);
  }

  // Manche Endpunkte liefern evtl. 204 No Content
  if (res.status === 204) return null;

  return res.json();
}
