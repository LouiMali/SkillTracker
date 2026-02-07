/* SkillTracker – Mobile App Logic (Vite) */
import "./styles.css";

(() => {
  "use strict";

  /* API URL – Vite env variable or localStorage override or default */
  const API_URL =
    localStorage.getItem("skilltracker_api") ||
    (import.meta.env.VITE_API_URL || "http://localhost:3000");

  /* --- DOM Helpers --- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* --- State --- */
  let skills = [];
  let categories = [];
  let demoMode = false;
  let nextDemoId = 100;
  let filterCategory = "all";
  let filterPriority = "all";

  /* --- Elements --- */
  const skillsList = $("#skills-list");
  const emptyState = $("#empty-state");
  const errorState = $("#error-state");
  const retryBtn = $("#retry-btn");
  const statTotal = $("#stat-total");
  const statAvg = $("#stat-avg");
  const statMastered = $("#stat-mastered");
  const filterCategoryEl = $("#filter-category");
  const filterPriorityEl = $("#filter-priority");
  const filterToggle = $("#filter-toggle");
  const filterBar = $("#filter-bar");
  const fab = $("#fab-add");
  const modalOverlay = $("#modal-overlay");
  const modalClose = $("#modal-close");
  const modalCancel = $("#modal-cancel");
  const skillForm = $("#skill-form");
  const formStatus = $("#form-status");

  /* --- API --- */
  async function fetchJSON(url, opts) {
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      ...opts,
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.error) msg = data.error;
      } catch (_) { /* ignore */ }
      throw new Error(msg);
    }
    return res.json();
  }

  async function checkAPI() {
    /* Quick connectivity check with short timeout */
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2000);
    try {
      const res = await fetch(`${API_URL}/health`, { signal: ctrl.signal });
      clearTimeout(timer);
      return res.ok;
    } catch (_) {
      clearTimeout(timer);
      return false;
    }
  }

  async function loadSkills() {
    showLoading();

    /* Check if backend is reachable before making real requests */
    const apiReady = await checkAPI();
    if (!apiReady) {
      activateDemoMode();
      return;
    }

    try {
      const data = await fetchJSON(`${API_URL}/skills`);
      skills = Array.isArray(data) ? data : [];
      demoMode = false;
      extractCategories();
      updateStats();
      renderSkills();
    } catch (err) {
      console.warn("SkillTracker API Fehler:", err.message);
      activateDemoMode();
    }
  }

  async function createSkill(payload) {
    return fetchJSON(`${API_URL}/skills`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /* --- Demo Mode --- */
  function activateDemoMode() {
    demoMode = true;
    skills = [
      { id: 1, name: "JavaScript", category_id_fk: 1, category_name: "Programmierung", current_level: 3, target_level: 5, priority: "High", notes: "Fokus auf ES6+ und async/await", created_at: "2025-12-19T10:00:00Z" },
      { id: 2, name: "Python", category_id_fk: 1, category_name: "Programmierung", current_level: 2, target_level: 4, priority: "Medium", notes: "Grundlagen und OOP", created_at: "2025-12-19T10:00:00Z" },
      { id: 3, name: "Java", category_id_fk: 1, category_name: "Programmierung", current_level: 2, target_level: 4, priority: "Medium", notes: null, created_at: "2025-12-20T09:00:00Z" },
      { id: 4, name: "HTML & CSS", category_id_fk: 2, category_name: "Webentwicklung", current_level: 4, target_level: 5, priority: "High", notes: "Responsive Design und Accessibility", created_at: "2025-12-19T10:00:00Z" },
      { id: 5, name: "React", category_id_fk: 2, category_name: "Webentwicklung", current_level: 1, target_level: 4, priority: "Medium", notes: "Nächstes Lernziel", created_at: "2025-12-21T14:00:00Z" },
      { id: 6, name: "MySQL", category_id_fk: 3, category_name: "Datenbanken", current_level: 2, target_level: 4, priority: "High", notes: "Joins, Subqueries, Indexing", created_at: "2025-12-19T10:00:00Z" },
      { id: 7, name: "Linux Grundlagen", category_id_fk: 4, category_name: "DevOps", current_level: 3, target_level: 3, priority: "Low", notes: null, created_at: "2025-12-20T11:00:00Z" },
      { id: 8, name: "Git & GitHub", category_id_fk: 4, category_name: "DevOps", current_level: 3, target_level: 4, priority: "Medium", notes: "Branching und Pull Requests", created_at: "2025-12-19T10:00:00Z" },
    ];
    extractCategories();
    updateStats();
    renderSkills();
    showDemoBanner();
  }

  function addSkillLocally(payload) {
    const catName = categories.find((c) => c.id === payload.category_id_fk);
    skills.push({
      id: nextDemoId++,
      name: payload.name,
      category_id_fk: payload.category_id_fk,
      category_name: catName ? catName.name : "Unkategorisiert",
      current_level: payload.current_level,
      target_level: payload.target_level,
      priority: payload.priority || "Medium",
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
    });
    extractCategories();
    updateStats();
    renderSkills();
  }

  function showDemoBanner() {
    let banner = $("#demo-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "demo-banner";
      banner.className = "demo-banner";
      banner.setAttribute("role", "status");
      banner.innerHTML =
        '<span>Demo-Modus – Beispieldaten werden angezeigt</span>' +
        '<button class="demo-banner__close" aria-label="Schliessen">&times;</button>';
      const main = $("#app-main");
      if (main) main.prepend(banner);
      banner.querySelector(".demo-banner__close").addEventListener("click", () => {
        banner.remove();
      });
    }
  }

  /* --- Categories --- */
  function extractCategories() {
    const map = new Map();
    skills.forEach((s) => {
      const id = s.category_id_fk || s.category_id;
      const name = s.category_name || s.category || "Unkategorisiert";
      if (id && !map.has(id)) map.set(id, name);
    });
    categories = Array.from(map, ([id, name]) => ({ id, name }));
    populateCategorySelects();
  }

  function populateCategorySelects() {
    const filterOpts = categories
      .map((c) => `<option value="${c.id}">${esc(c.name)}</option>`)
      .join("");

    filterCategoryEl.innerHTML = `<option value="all">Alle</option>${filterOpts}`;
    filterCategoryEl.value = filterCategory;

    const formSelect = $("#skill-category");
    if (formSelect) {
      formSelect.innerHTML =
        `<option value="" disabled selected>Kategorie wählen...</option>` + filterOpts;
    }
  }

  /* --- Stats --- */
  function updateStats() {
    const filtered = getFilteredSkills();
    const total = filtered.length;
    statTotal.textContent = total;

    if (total === 0) {
      statAvg.textContent = "–";
      statMastered.textContent = "0";
      return;
    }

    const avg = filtered.reduce((sum, s) => sum + (s.current_level || 0), 0) / total;
    statAvg.textContent = avg.toFixed(1);

    const mastered = filtered.filter(
      (s) => s.current_level >= s.target_level
    ).length;
    statMastered.textContent = mastered;
  }

  /* --- Filtering --- */
  function getFilteredSkills() {
    return skills.filter((s) => {
      if (filterCategory !== "all") {
        const id = s.category_id_fk || s.category_id;
        if (String(id) !== String(filterCategory)) return false;
      }
      if (filterPriority !== "all" && s.priority !== filterPriority) return false;
      return true;
    });
  }

  /* --- Render --- */
  function renderSkills() {
    const filtered = getFilteredSkills();

    if (filtered.length === 0 && skills.length === 0) {
      skillsList.innerHTML = "";
      emptyState.hidden = false;
      errorState.hidden = true;
      return;
    }

    emptyState.hidden = true;
    errorState.hidden = true;

    if (filtered.length === 0) {
      skillsList.innerHTML =
        `<div class="empty-state"><p class="empty-state__text">Keine Skills für diesen Filter gefunden.</p></div>`;
      return;
    }

    /* Group by category */
    const grouped = new Map();
    filtered.forEach((s) => {
      const catName = s.category_name || s.category || "Unkategorisiert";
      if (!grouped.has(catName)) grouped.set(catName, []);
      grouped.get(catName).push(s);
    });

    let html = "";
    let idx = 0;
    grouped.forEach((items, catName) => {
      html += `
        <div class="category-header">
          <span class="category-name">${esc(catName)}</span>
          <span class="category-count">${items.length}</span>
        </div>`;

      items.forEach((s) => {
        const pct = s.target_level > 0
          ? Math.round((s.current_level / s.target_level) * 100)
          : 0;
        const complete = s.current_level >= s.target_level;
        const prioClass =
          s.priority === "High" ? "priority--high" :
          s.priority === "Low" ? "priority--low" : "priority--medium";
        const prioLabel =
          s.priority === "High" ? "Hoch" :
          s.priority === "Low" ? "Niedrig" : "Mittel";

        html += `
          <article class="skill-card" role="listitem" style="animation-delay:${idx * 0.05}s">
            <div class="skill-card__header">
              <h3 class="skill-card__name">${esc(s.name)}</h3>
              <span class="skill-card__priority ${prioClass}">${prioLabel}</span>
            </div>
            <div class="progress">
              <div class="progress__header">
                <span class="progress__label">Level ${s.current_level} / ${s.target_level}</span>
                <span class="progress__value">${pct}%</span>
              </div>
              <div class="progress__track">
                <div class="progress__fill${complete ? " progress__fill--complete" : ""}" style="width:${pct}%"></div>
              </div>
            </div>
            ${s.notes ? `<p class="skill-card__notes">${esc(s.notes)}</p>` : ""}
            <div class="skill-card__meta">
              <span class="skill-card__category-badge">${esc(s.category_name || s.category || "")}</span>
              ${s.created_at ? `<span>${formatDate(s.created_at)}</span>` : ""}
            </div>
          </article>`;
        idx++;
      });
    });

    skillsList.innerHTML = html;
  }

  function showLoading() {
    emptyState.hidden = true;
    errorState.hidden = true;
    skillsList.innerHTML = `
      <div class="skill-card skeleton-card" aria-hidden="true"><div class="skeleton skeleton--title"></div><div class="skeleton skeleton--bar"></div><div class="skeleton skeleton--text"></div></div>
      <div class="skill-card skeleton-card" aria-hidden="true"><div class="skeleton skeleton--title"></div><div class="skeleton skeleton--bar"></div><div class="skeleton skeleton--text"></div></div>
      <div class="skill-card skeleton-card" aria-hidden="true"><div class="skeleton skeleton--title"></div><div class="skeleton skeleton--bar"></div><div class="skeleton skeleton--text"></div></div>`;
  }

  function showError() {
    skillsList.innerHTML = "";
    emptyState.hidden = true;
    errorState.hidden = false;
  }

  /* --- Filter Toggle --- */
  filterToggle.addEventListener("click", () => {
    const open = filterBar.hidden;
    filterBar.hidden = !open;
    filterToggle.setAttribute("aria-expanded", String(open));
    filterToggle.classList.toggle("is-active", open);
  });

  filterCategoryEl.addEventListener("change", (e) => {
    filterCategory = e.target.value;
    updateStats();
    renderSkills();
  });

  filterPriorityEl.addEventListener("change", (e) => {
    filterPriority = e.target.value;
    updateStats();
    renderSkills();
  });

  /* --- Modal --- */
  function openModal() {
    modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    skillForm.reset();
    formStatus.textContent = "";
    clearFormErrors();
    resetPickers();
    const firstInput = $("#skill-name");
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    document.body.style.overflow = "";
    fab.focus();
  }

  fab.addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  modalCancel.addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
  });

  /* --- Level Picker --- */
  function setupLevelPicker(pickerId, hiddenId) {
    const picker = $(`#${pickerId}`);
    const hidden = $(`#${hiddenId}`);
    if (!picker || !hidden) return;

    picker.addEventListener("click", (e) => {
      const btn = e.target.closest(".level-dot");
      if (!btn) return;
      const level = parseInt(btn.dataset.level, 10);
      hidden.value = level;
      updateLevelDots(picker, level);
    });
  }

  function updateLevelDots(picker, activeLevel) {
    $$(".level-dot", picker).forEach((dot) => {
      const l = parseInt(dot.dataset.level, 10);
      dot.classList.remove("is-active", "is-filled");
      if (l === activeLevel) dot.classList.add("is-active");
      else if (l < activeLevel) dot.classList.add("is-filled");
    });
  }

  setupLevelPicker("picker-current", "skill-current");
  setupLevelPicker("picker-target", "skill-target");

  /* --- Priority Picker --- */
  const priorityHidden = $("#skill-priority");
  $$(".priority-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".priority-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      priorityHidden.value = btn.dataset.priority;
    });
  });

  function resetPickers() {
    const pickerCurrent = $("#picker-current");
    const pickerTarget = $("#picker-target");
    if (pickerCurrent) updateLevelDots(pickerCurrent, 1);
    if (pickerTarget) updateLevelDots(pickerTarget, 5);
    $("#skill-current").value = "1";
    $("#skill-target").value = "5";

    $$(".priority-btn").forEach((b) => b.classList.remove("is-active"));
    const medBtn = $(".priority-btn[data-priority='Medium']");
    if (medBtn) medBtn.classList.add("is-active");
    priorityHidden.value = "Medium";
  }

  /* --- Form Submit --- */
  skillForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors();

    const name = $("#skill-name").value.trim();
    const categoryId = $("#skill-category").value;
    const currentLevel = parseInt($("#skill-current").value, 10);
    const targetLevel = parseInt($("#skill-target").value, 10);
    const priority = $("#skill-priority").value;
    const notes = $("#skill-notes").value.trim();

    let valid = true;

    if (name.length < 2) {
      setFormError("name", "Bitte einen Namen eingeben (min. 2 Zeichen).");
      valid = false;
    }
    if (!categoryId) {
      setFormError("category", "Bitte eine Kategorie wählen.");
      valid = false;
    }

    if (!valid) return;

    const payload = {
      name,
      category_id_fk: parseInt(categoryId, 10),
      current_level: currentLevel,
      target_level: targetLevel,
      priority,
    };
    if (notes) payload.notes = notes;

    formStatus.textContent = "Wird gespeichert...";

    if (demoMode) {
      /* In demo mode, add skill locally */
      const duplicate = skills.some(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicate) {
        formStatus.textContent = "Dieser Skill existiert bereits.";
        return;
      }
      addSkillLocally(payload);
      formStatus.textContent = "Skill gespeichert! (Demo)";
      setTimeout(closeModal, 600);
      return;
    }

    try {
      await createSkill(payload);
      formStatus.textContent = "Skill gespeichert!";
      setTimeout(() => {
        closeModal();
        loadSkills();
      }, 600);
    } catch (err) {
      if (err.message.includes("409") || err.message.toLowerCase().includes("duplicate")) {
        formStatus.textContent = "Dieser Skill existiert bereits.";
      } else {
        formStatus.textContent = `Fehler: ${err.message}`;
      }
    }
  });

  function setFormError(field, msg) {
    const el = $(`#err-${field}`);
    if (el) el.textContent = msg;
  }

  function clearFormErrors() {
    $$(".form-error").forEach((el) => (el.textContent = ""));
  }

  /* --- Retry --- */
  retryBtn.addEventListener("click", loadSkills);

  /* --- Utilities --- */
  function esc(str) {
    return String(str).replace(/[&<>"']/g, (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[s]
    );
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (_) {
      return "";
    }
  }

  /* --- Init --- */
  loadSkills();
})();
