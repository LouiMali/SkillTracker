import { apiFetch } from "./client";

export function getLogs() {
  return apiFetch("/study-log");
}

export function createLog(payload) {
  return apiFetch("/study-log", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
