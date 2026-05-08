const translations = {
  "pt-BR": {
    title:"Laboratório de carteira", create_wallet:"Criar carteira", create:"Criar/carregar", create_faucet_wallet:"Criar carteira faucet", new_address:"Novo endereço", result:"Resultado", ready:"Pronto.", running:"Executando...", wallet_placeholder:"carteira-estudo", label_placeholder:"rótulo", wallets:"Carteiras existentes", loading:"Carregando...", balance:"Saldo", addresses:"Endereços", no_addresses:"Nenhum endereço conhecido", confirmations:"confirmações", delete_wallet:"Excluir", delete_title:"Excluir carteira?", delete_confirm:"A carteira {name} será excluída somente se o saldo estiver zerado. Esta ação não deve ser usada em carteiras com fundos.", confirm_delete:"Excluir carteira", cancel:"Cancelar", subtitle:"Crie carteiras, gere endereços e gerencie chaves.", no_faucet_wallet:"Nenhuma carteira faucet encontrada. Crie uma para habilitar o faucet.",
    export_wallet:"Exportar", export_all:"Exportar todas", import_wallet:"Importar", export_title:"Exportar carteiras?", export_title_single:"Exportar carteira?", export_confirm:"Exportar", export_warning:"O arquivo conterá chaves privadas. Guarde-o em local seguro.",
    scanning:"Escaneando blockchain…", scanning_pct:"Escaneando {pct}%",
    nav_home:"Início", nav_faucet:"Faucet", nav_mempool:"Mempool", nav_wallet:"Carteira", nav_signing:"Assinatura", nav_stats:"Stats", nav_docs:"Docs", nav_display:"Display", nav_terminal:"Terminal", nav_last_refresh:"Última atualização", brand_subtitle:"Plataforma de estudo do Core"
  },
  "en-GB": {
    title:"Wallet lab", create_wallet:"Create wallet", create:"Create/load", create_faucet_wallet:"Create faucet wallet", new_address:"New address", result:"Result", ready:"Ready.", running:"Running...", wallet_placeholder:"study-wallet", label_placeholder:"label", wallets:"Existing wallets", loading:"Loading...", balance:"Balance", addresses:"Addresses", no_addresses:"No known addresses", confirmations:"confirmations", delete_wallet:"Delete", delete_title:"Delete wallet?", delete_confirm:"Wallet {name} will be deleted only if the balance is zero. Do not use this action on wallets with funds.", confirm_delete:"Delete wallet", cancel:"Cancel", subtitle:"Create wallets, derive addresses and manage keys.", no_faucet_wallet:"No faucet wallet found. Create one to enable the faucet.",
    export_wallet:"Export", export_all:"Export all", import_wallet:"Import", export_title:"Export wallets?", export_title_single:"Export wallet?", export_confirm:"Export", export_warning:"The file will contain private keys. Store it in a safe place.",
    scanning:"Scanning blockchain…", scanning_pct:"Scanning {pct}%",
    nav_home:"Home", nav_faucet:"Faucet", nav_mempool:"Mempool", nav_wallet:"Wallet", nav_signing:"Signing", nav_stats:"Stats", nav_docs:"Docs", nav_display:"Display", nav_terminal:"Terminal", nav_last_refresh:"Last refresh", brand_subtitle:"Core study platform"
  }
};
let currentLang = localStorage.getItem("lang")||document.body.dataset.defaultLang||"pt-BR";
let currentWallets = [];
let pendingDeleteWallet = "";
function setLang(lang){currentLang=translations[lang]?lang:"pt-BR";localStorage.setItem("lang",currentLang);document.documentElement.lang=currentLang;document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(translations[currentLang]?.[k])el.textContent=translations[currentLang][k]});document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const k=el.dataset.i18nPlaceholder;if(translations[currentLang]?.[k])el.placeholder=translations[currentLang][k]});document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===currentLang));updateDeleteMessage()}
const out=document.getElementById("output");
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
const btc = n => n === null || n === undefined || Number.isNaN(Number(n)) ? "-" : Number(n).toFixed(8);
const sats = n => n === null || n === undefined || Number.isNaN(Number(n)) ? "-" : Math.round(Number(n) * 100_000_000).toLocaleString(currentLang);
const amountParts = n => ({ btc:`${btc(Number(n))} sBTC`, sats:`${sats(Number(n))} s-sats` });
const COPY_ICON_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`;
function renderCopy(value, label){
  const safe = escapeHtml(value);
  const aria = escapeHtml(label || "Copy");
  return `<button type="button" class="copy-btn" data-copy="${safe}" title="${aria}" aria-label="${aria}">${COPY_ICON_SVG}</button>`;
}
function renderAddress(value){
  const address = String(value || "");
  const safe = escapeHtml(address);
  const href = `/mempool#address=${encodeURIComponent(address)}`;
  let inner;
  if(address.length <= 24){
    inner = `<a class="address-link address-text" href="${href}" title="${safe}">${safe}</a>`;
  } else {
    inner = `<a class="address-link address-text" href="${href}" title="${safe}"><mark>${escapeHtml(address.slice(0, 10))}</mark><span>${escapeHtml(address.slice(10, -10))}</span><mark>${escapeHtml(address.slice(-10))}</mark></a>`;
  }
  return `<span class="hash-with-copy">${inner}${renderCopy(address, "Copy address")}</span>`;
}
setLang(currentLang);
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{
  setLang(b.dataset.lang);
  document.getElementById("settings-popover").hidden = true;
  document.getElementById("settings-toggle").setAttribute("aria-expanded","false");
}));
function updateDeleteMessage(){
  const nameEl = document.getElementById("delete-wallet-name");
  const message = document.getElementById("delete-message");
  if(nameEl) nameEl.textContent = pendingDeleteWallet || "-";
  if(message) message.textContent = translations[currentLang].delete_confirm.replace("{name}", pendingDeleteWallet || "-");
}
function openDeleteModal(name){
  pendingDeleteWallet = name;
  updateDeleteMessage();
  document.getElementById("delete-modal").hidden = false;
  document.getElementById("confirm-delete").focus();
}
function closeDeleteModal(){
  pendingDeleteWallet = "";
  document.getElementById("delete-modal").hidden = true;
}
async function postForm(url, form){out.textContent=translations[currentLang].running;const res=await fetch(url,{method:"POST",body:new FormData(form)});const data=await res.json();out.textContent=JSON.stringify(data,null,2);loadWallets()}
async function postData(url, data){out.textContent=translations[currentLang].running;const body=new FormData();Object.entries(data).forEach(([key,value])=>body.append(key,value));const res=await fetch(url,{method:"POST",body});out.textContent=JSON.stringify(await res.json(),null,2);loadWallets()}
function renderWallet(wallet){
  const balance = amountParts(wallet.balance);
  const addressesCount = wallet.addresses?.length || 0;
  const addresses = addressesCount ? wallet.addresses.map(a=>{
    const amount = amountParts(a.amount);
    return `<div class="address-row">
      <div class="address-main">${renderAddress(a.address)}<small><span class="address-label-tag">Label:</span> ${escapeHtml(a.label || "-")}</small></div>
      <div class="address-meta"><strong>${escapeHtml(amount.btc)}</strong><small>${escapeHtml(amount.sats)}</small><em>${escapeHtml(a.confirmations)} ${escapeHtml(translations[currentLang].confirmations)}</em></div>
    </div>`;
  }).join("") : `<div class="empty compact">${escapeHtml(translations[currentLang].no_addresses)}</div>`;
  return `<article class="wallet-card" data-wallet="${escapeHtml(wallet.name)}">
    <div class="wallet-head">
      <div class="wallet-title"><h3>${escapeHtml(wallet.name)}</h3></div>
      <div class="wallet-actions">
        <button class="newaddr-wallet" type="button" data-wallet="${escapeHtml(wallet.name)}">${escapeHtml(translations[currentLang].new_address)}</button>
        <button class="export-wallet" type="button" data-wallet="${escapeHtml(wallet.name)}">${escapeHtml(translations[currentLang].export_wallet)}</button>
        <button class="delete-wallet" type="button" data-wallet="${escapeHtml(wallet.name)}">${escapeHtml(translations[currentLang].delete_wallet)}</button>
      </div>
    </div>
    <div class="wallet-balance">
      <span>${escapeHtml(translations[currentLang].balance)}</span>
      <strong>${escapeHtml(balance.btc)}</strong>
      <small>${escapeHtml(balance.sats)}</small>
    </div>${wallet.scanning ? `<div class="wallet-scanning"><div class="scanning-bar"><div class="scanning-fill" style="width:${typeof wallet.scanning==="number"?Math.round(wallet.scanning*100):0}%"></div></div><span>${typeof wallet.scanning==="number"?translations[currentLang].scanning_pct.replace("{pct}",Math.round(wallet.scanning*100)):translations[currentLang].scanning}</span></div>` : ""}
    ${wallet.error ? `<pre>${escapeHtml(wallet.error)}</pre>` : `<div class="wallet-section-title"><h4>${escapeHtml(translations[currentLang].addresses)}</h4><span>${escapeHtml(addressesCount)}</span></div>${addresses}`}
  </article>`;
}
function syncFaucetButton(){
  const panel = document.getElementById("faucet-wallet-panel");
  if(!panel) return;
  const faucetName = document.body.dataset.faucetWallet || "";
  const exists = !!faucetName && currentWallets.some(w => w.name === faucetName);
  panel.hidden = exists;
}
async function loadWallets(){
  const target=document.getElementById("wallets-list");
  target.innerHTML=`<div class="empty">${escapeHtml(translations[currentLang].loading)}</div>`;
  try{
    const data=await fetch("/api/wallet/overview").then(r=>r.json());
    currentWallets=data.wallets||[];
    target.innerHTML=currentWallets.map(renderWallet).join("") || `<div class="empty">${escapeHtml(translations[currentLang].no_addresses)}</div>`;
  }catch(e){
    target.innerHTML=`<div class="empty">${escapeHtml(e)}</div>`;
  }
  syncFaucetButton();
  if(typeof window.markRefreshed === "function") window.markRefreshed();
  scheduleScanPoll();
}
let _scanTimer=0;
function scheduleScanPoll(){
  clearTimeout(_scanTimer);
  if(currentWallets.some(w=>w.scanning)) _scanTimer=setTimeout(pollScanning,3000);
}
async function pollScanning(){
  try{
    const data=await fetch("/api/wallet/overview").then(r=>r.json());
    const fresh=data.wallets||[];
    for(const w of fresh){
      const card=document.querySelector(`.wallet-card[data-wallet="${CSS.escape(w.name)}"]`);
      if(!card) continue;
      const old=currentWallets.find(o=>o.name===w.name);
      const balDiv=card.querySelector(".wallet-balance");
      if(balDiv){
        const bal=amountParts(w.balance);
        balDiv.querySelector("strong").textContent=bal.btc;
        balDiv.querySelector("small").textContent=bal.sats;
      }
      let scanDiv=card.querySelector(".wallet-scanning");
      if(w.scanning){
        const pct=typeof w.scanning==="number"?Math.round(w.scanning*100):0;
        const label=typeof w.scanning==="number"?translations[currentLang].scanning_pct.replace("{pct}",pct):translations[currentLang].scanning;
        if(scanDiv){
          scanDiv.querySelector(".scanning-fill").style.width=pct+"%";
          scanDiv.querySelector("span").textContent=label;
        }else{
          const tmp=document.createElement("div");
          tmp.innerHTML=`<div class="wallet-scanning"><div class="scanning-bar"><div class="scanning-fill" style="width:${pct}%"></div></div><span>${escapeHtml(label)}</span></div>`;
          balDiv.after(tmp.firstElementChild);
        }
      }else{
        if(scanDiv) scanDiv.remove();
        if(old&&old.scanning) loadWallets();
      }
    }
    currentWallets=fresh;
  }catch(e){}
  scheduleScanPoll();
}
function downloadJSON(data, filename){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

let pendingExport = null;
function renderExportList(wallets){
  return wallets.map(w => {
    const addrCount = w.addresses?.length || 0;
    const bal = amountParts(w.balance);
    const addrRows = (w.addresses || []).map(a =>
      `<div class="export-addr"><code>${escapeHtml(a.address)}</code></div>`
    ).join("");
    return `<div class="export-wallet-item">
      <div class="export-wallet-head">
        <strong>${escapeHtml(w.name)}</strong>
        <span class="export-wallet-bal">${escapeHtml(bal.btc)}</span>
      </div>
      <div class="export-wallet-meta">${escapeHtml(addrCount)} ${escapeHtml(translations[currentLang].addresses.toLowerCase())}</div>
      ${addrRows ? `<div class="export-addr-list">${addrRows}</div>` : ""}
    </div>`;
  }).join("");
}
function openExportModal(wallets, mode){
  const t = translations[currentLang];
  const isSingle = wallets.length === 1;
  document.getElementById("export-title").textContent = isSingle ? t.export_title_single : t.export_title;
  document.getElementById("export-wallet-list").innerHTML = renderExportList(wallets);
  document.getElementById("export-warning").textContent = t.export_warning;
  document.getElementById("confirm-export").textContent = isSingle ? t.export_wallet : t.export_all;
  pendingExport = { wallets, mode, name: isSingle ? wallets[0].name : null };
  document.getElementById("export-modal").hidden = false;
}
function closeExportModal(){
  pendingExport = null;
  document.getElementById("export-modal").hidden = true;
}
async function executeExport(){
  if(!pendingExport) return;
  const { mode, name } = pendingExport;
  closeExportModal();
  out.textContent = translations[currentLang].running;
  try{
    if(mode === "single"){
      const res = await fetch(`/api/wallet/export?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      out.textContent = JSON.stringify(data, null, 2);
      if(res.ok) downloadJSON(data, `${name}-export.json`);
    } else {
      const res = await fetch("/api/wallet/export-all");
      const data = await res.json();
      out.textContent = JSON.stringify(data, null, 2);
      if(res.ok) downloadJSON(data, `wallets-export-${new Date().toISOString().slice(0,10)}.json`);
    }
  }catch(e){ out.textContent = String(e); }
}
function openExportSingle(name){
  const w = currentWallets.find(w => w.name === name);
  if(w) openExportModal([w], "single");
}
function openExportAll(){
  if(currentWallets.length) openExportModal(currentWallets, "all");
}
document.getElementById("create-wallet").addEventListener("submit",e=>{e.preventDefault();postForm("/api/wallet/create",e.target)});
document.getElementById("create-faucet-wallet").addEventListener("click",()=>postData("/api/wallet/create-faucet",{}));
document.getElementById("wallets-list").addEventListener("click",e=>{
  const addrBtn=e.target.closest(".newaddr-wallet");
  if(addrBtn){ postData("/api/wallet/address",{wallet:addrBtn.dataset.wallet,label:""}); return; }
  const exportBtn=e.target.closest(".export-wallet");
  if(exportBtn){ openExportSingle(exportBtn.dataset.wallet); return; }
  const deleteBtn=e.target.closest(".delete-wallet");
  if(deleteBtn){ openDeleteModal(deleteBtn.dataset.wallet); return; }
});
document.getElementById("export-all-wallets").addEventListener("click", openExportAll);
document.getElementById("confirm-export").addEventListener("click", executeExport);
document.getElementById("cancel-export").addEventListener("click", closeExportModal);
document.querySelectorAll("[data-close-export]").forEach(el => el.addEventListener("click", closeExportModal));
document.getElementById("import-wallets").addEventListener("click", () => document.getElementById("import-file-input").click());
document.getElementById("import-file-input").addEventListener("change", async e => {
  const file = e.target.files[0];
  if(!file) return;
  e.target.value = "";
  out.textContent = translations[currentLang].running;
  try{
    const text = await file.text();
    const json = JSON.parse(text);
    const res = await fetch("/api/wallet/import", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(json),
    });
    const data = await res.json();
    out.textContent = JSON.stringify(data, null, 2);
    loadWallets();
  }catch(err){ out.textContent = String(err); }
});
document.getElementById("confirm-delete").addEventListener("click",()=>{
  if(!pendingDeleteWallet) return;
  const name = pendingDeleteWallet;
  closeDeleteModal();
  postData("/api/wallet/delete",{name});
});
document.getElementById("cancel-delete").addEventListener("click",closeDeleteModal);
document.querySelectorAll("[data-close-delete]").forEach(el=>el.addEventListener("click",closeDeleteModal));
document.getElementById("settings-toggle").addEventListener("click",()=>{
  const popover = document.getElementById("settings-popover");
  const nextHidden = !popover.hidden;
  popover.hidden = nextHidden;
  document.getElementById("settings-toggle").setAttribute("aria-expanded", String(!nextHidden));
});
document.addEventListener("click",e=>{
  const menu = e.target.closest(".settings-menu");
  if(menu) return;
  const popover = document.getElementById("settings-popover");
  if(!popover.hidden){
    popover.hidden = true;
    document.getElementById("settings-toggle").setAttribute("aria-expanded","false");
  }
});
document.addEventListener("keydown",e=>{
  if(e.key !== "Escape") return;
  closeDeleteModal();
  closeExportModal();
  document.getElementById("settings-popover").hidden = true;
  document.getElementById("settings-toggle").setAttribute("aria-expanded","false");
});
loadWallets();
