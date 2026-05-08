(function () {
  const sidebar = document.getElementById("docs-sidebar");
  const content = document.getElementById("docs-content");

  let activeKey = null;

  function locale() {
    const raw = localStorage.getItem("lang") ||
                document.body.dataset.defaultLang ||
                "en-GB";
    return raw.toLowerCase();
  }

  function localeAttr(loc) {
    return loc.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }

  function updateSidebarLabels() {
    const loc  = locale();
    const attr = localeAttr(loc);
    const cap  = attr.charAt(0).toUpperCase() + attr.slice(1);

    sidebar.querySelectorAll(".doc-section-toggle").forEach((btn) => {
      const title = btn.dataset["title" + cap] || btn.dataset.titleEnGb || "";
      const el = btn.querySelector(".section-title");
      if (el && title) el.textContent = title;
    });

    sidebar.querySelectorAll(".doc-link").forEach((btn) => {
      const title = btn.dataset["title" + cap] || btn.dataset.titleEnGb || "";
      const file  = btn.dataset["file"  + cap] || btn.dataset.fileEnGb || "";
      const nameEl = btn.querySelector(".doc-name");
      const fileEl = btn.querySelector(".doc-file");
      if (nameEl && title) nameEl.textContent = title;
      if (fileEl && file)  fileEl.textContent = file;
    });
  }

  async function loadDoc(key, force) {
    if (!force && key === activeKey) return;
    activeKey = key;

    sidebar.querySelectorAll(".doc-link").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.key === key);
    });

    const loadingText = translations?.[localStorage.getItem("lang")]?.loading_doc || "Loading document…";
    content.innerHTML = `<div class="docs-loading">${loadingText}</div>`;

    try {
      const res = await fetch(
        "/api/docs/" + encodeURIComponent(locale()) +
        "/"          + encodeURIComponent(key)
      );
      if (!res.ok) throw new Error("Not found");
      content.innerHTML = await res.text();
    } catch {
      const errText = translations?.[localStorage.getItem("lang")]?.doc_not_found || "Could not load document.";
      content.innerHTML = `<div class="docs-placeholder"><p>${errText}</p></div>`;
    }

    history.replaceState(null, "", "#" + key);
    if (typeof window.markRefreshed === "function") window.markRefreshed();
  }

  sidebar.addEventListener("click", (e) => {
    const toggle = e.target.closest(".doc-section-toggle");
    if (toggle) {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      return;
    }
    const btn = e.target.closest(".doc-link");
    if (!btn) return;
    loadDoc(btn.dataset.key);
  });

  document.addEventListener("app:langchange", () => {
    updateSidebarLabels();
    if (activeKey) loadDoc(activeKey, true);
  });

  const rebuildBtn = document.getElementById("rebuild-manifest");
  if (rebuildBtn) {
    rebuildBtn.addEventListener("click", async () => {
      rebuildBtn.disabled = true;
      try {
        const res = await fetch("/api/docs/rebuild-manifest", { method: "POST" });
        if (!res.ok) throw new Error(res.statusText);
        window.location.reload();
      } catch (e) {
        rebuildBtn.disabled = false;
      }
    });
  }

  updateSidebarLabels();

  const hash     = location.hash.replace("#", "");
  const firstBtn = sidebar.querySelector(".doc-link");
  if (hash) {
    const target = sidebar.querySelector(
      '.doc-link[data-key="' + CSS.escape(hash) + '"]'
    );
    loadDoc(target ? hash : (firstBtn?.dataset.key ?? null));
  } else if (firstBtn) {
    loadDoc(firstBtn.dataset.key);
  }
})();
