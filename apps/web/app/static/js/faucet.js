const form = document.getElementById("faucet-form");
const result = document.getElementById("result");
const addressList = document.getElementById("faucet-origin-addresses");

const COPY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

const faucetMessages = {
  "pt-BR": { sending: "Enviando...", no_addresses: "Sem endereços", select_origin: "Selecione um endereço de origem." },
  "en-GB": { sending: "Sending...", no_addresses: "No addresses", select_origin: "Select an origin address." }
};

function getLang() {
  return localStorage.getItem("lang") || document.body.dataset.defaultLang || "pt-BR";
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function renderAddr(a, selected) {
  const addr = a.address;
  const bal = Number(a.amount).toFixed(8);
  const satsBal = Math.round(Number(a.amount) * 100000000).toLocaleString();
  const first = addr.slice(0, 10);
  const mid = addr.slice(10, -10);
  const last = addr.slice(-10);
  const label = a.label || "";

  return `<div class="origin-addr${selected ? " is-selected" : ""}" data-addr="${esc(addr)}">
    <div class="origin-addr-top">
      <span class="origin-addr-check">${selected ? "&#10003;" : ""}</span>
      <span class="origin-addr-addr-group">
        <span class="origin-addr-text"><mark>${esc(first)}</mark><span>${esc(mid)}</span><mark>${esc(last)}</mark></span>
        <button class="copy-btn" type="button" data-copy="${esc(addr)}" title="Copy">${COPY_SVG}</button>
      </span>
      <span class="origin-addr-bal"><strong>${bal} <small>sBTC</small></strong><small>${satsBal} <small>s-sats</small></small></span>
    </div>
    ${label ? `<div class="origin-addr-label"><span class="origin-addr-label-tag">Label</span> ${esc(label)}</div>` : ""}
  </div>`;
}

let selectedOrigin = "";

function selectOrigin(addr) {
  selectedOrigin = addr;
  addressList.querySelectorAll(".origin-addr").forEach(el => {
    const on = el.dataset.addr === addr;
    el.classList.toggle("is-selected", on);
    const check = el.querySelector(".origin-addr-check");
    if (check) check.textContent = on ? "✓" : "";
  });
  addressList.closest(".tx-flow")?.classList.remove("tx-flow-error");
}

async function loadOriginAddresses() {
  const walletName = document.body.dataset.faucetWallet || "faucet";
  try {
    const data = await fetch("/api/wallet/overview").then(r => r.json());
    const wallet = (data.wallets || []).find(w => w.name === walletName);
    if (!wallet?.addresses?.length) {
      const lang = getLang();
      addressList.innerHTML = `<span class="origin-addr-loading">${faucetMessages[lang]?.no_addresses || "-"}</span>`;
      return;
    }
    addressList.innerHTML = wallet.addresses.map(a => renderAddr(a, a.address === selectedOrigin)).join("");
  } catch {
    addressList.innerHTML = `<span class="origin-addr-loading">-</span>`;
  }
}

addressList.addEventListener("click", e => {
  if (e.target.closest(".copy-btn")) return;
  const row = e.target.closest(".origin-addr");
  if (row) selectOrigin(row.dataset.addr);
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const lang = getLang();
  if (!selectedOrigin) {
    result.textContent = faucetMessages[lang]?.select_origin || "Select an origin address.";
    addressList.closest(".tx-flow")?.classList.add("tx-flow-error");
    return;
  }
  addressList.closest(".tx-flow")?.classList.remove("tx-flow-error");
  result.textContent = faucetMessages[lang]?.sending || "Sending...";
  try {
    const res = await fetch("/api/request", { method: "POST", body: new FormData(form) });
    result.textContent = JSON.stringify(await res.json(), null, 2);
    loadOriginAddresses();
  } catch (err) {
    result.textContent = String(err);
  }
});

loadOriginAddresses();
