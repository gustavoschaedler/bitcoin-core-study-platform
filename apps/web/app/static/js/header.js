// Shared header behaviour: rewrites the Display / Terminal nav links to the
// current host, and exposes window.markRefreshed() so each page's data loader
// can stamp the "last refresh" timestamp.

(function(){
  const lang = document.documentElement.lang || document.body?.dataset.defaultLang || "pt-BR";

  const display = document.getElementById("header-display-link");
  if(display && location.hostname){
    display.href = `${location.protocol}//${location.hostname}:8181`;
  }
  const terminal = document.getElementById("header-terminal-link");
  if(terminal && location.hostname){
    terminal.href = `${location.protocol}//${location.hostname}:8182`;
  }

  function format(){
    return new Date().toLocaleTimeString(localStorage.getItem("lang") || lang);
  }

  let countdownInterval = null;
  let countdownRemaining = 0;
  const countdownBox = document.getElementById("countdown-box");
  const countdownValue = document.getElementById("countdown-value");

  function renderCountdown(){
    if(!countdownValue) return;
    countdownValue.textContent = Math.max(0, countdownRemaining);
  }

  window.markRefreshed = function(){
    const el = document.getElementById("updated");
    if(el) el.textContent = format();
    if(countdownBox && window._countdownSeconds){
      countdownRemaining = window._countdownSeconds;
      renderCountdown();
    }
  };

  window.startCountdown = function(seconds){
    window._countdownSeconds = seconds;
    countdownRemaining = seconds;
    if(countdownBox){
      countdownBox.hidden = false;
      renderCountdown();
    }
    clearInterval(countdownInterval);
    countdownInterval = setInterval(function(){
      countdownRemaining = Math.max(0, countdownRemaining - 1);
      renderCountdown();
    }, 1000);
  };

  // First mark on load so the placeholder "-" doesn't linger.
  document.addEventListener("DOMContentLoaded", () => window.markRefreshed());

  // ----- Universal copy buttons -----
  // Any button with [data-copy="VALUE"] copies VALUE to clipboard on click.
  // Visual feedback: temporary `.copied` class with a check icon.
  const COPY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
  const CHECK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="5 12 10 17 19 7"/></svg>';
  document.addEventListener("click", async (event) => {
    const btn = event.target.closest("[data-copy]");
    if(!btn) return;
    event.preventDefault();
    event.stopPropagation();
    const value = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      ta.remove();
    }
    btn.classList.add("copied");
    const original = btn.innerHTML;
    btn.innerHTML = CHECK_ICON;
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = original;
    }, 1100);
  });
})();
