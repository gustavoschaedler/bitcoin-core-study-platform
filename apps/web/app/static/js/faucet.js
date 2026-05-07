const form = document.getElementById("faucet-form");
const result = document.getElementById("result");
const faucetMessages = {
  "pt-BR": { sending: "Enviando..." },
  "en-GB": { sending: "Sending..." }
};

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const lang = localStorage.getItem("lang") || document.body.dataset.defaultLang || "pt-BR";
  result.textContent = faucetMessages[lang]?.sending || faucetMessages["en-GB"].sending;
  const data = new FormData(form);
  try {
    const res = await fetch("/api/request", { method: "POST", body: data });
    const body = await res.json();
    result.textContent = JSON.stringify(body, null, 2);
  } catch (err) {
    result.textContent = String(err);
  }
});
