const translations = {
  "pt-BR": {
    title:"Laboratório de carteira e assinatura", create_wallet:"Criar carteira", create:"Criar/carregar", create_faucet_wallet:"Criar carteira faucet", new_address:"Novo endereço", select_wallet:"Selecione a carteira", generate:"Gerar", sign_tx:"Criar e assinar transação", create_sign:"Criar PSBT e assinar", back_home:"← Início", result:"Resultado", ready:"Pronto.", running:"Executando...", wallet_placeholder:"carteira-estudo", label_placeholder:"rótulo", wallets:"Carteiras existentes", refresh:"Atualizar", loading:"Carregando...", balance:"Saldo", loaded:"Carregada", addresses:"Endereços", no_addresses:"Nenhum endereço conhecido", confirmations:"confirmações", delete_wallet:"Excluir", delete_title:"Excluir carteira?", delete_confirm:"A carteira {name} será excluída somente se o saldo estiver zerado. Esta ação não deve ser usada em carteiras com fundos.", confirm_delete:"Excluir carteira", cancel:"Cancelar", language:"Idioma", yes:"sim", no:"não"
  },
  "en-GB": {
    title:"Wallet and signing lab", create_wallet:"Create wallet", create:"Create/load", create_faucet_wallet:"Create faucet wallet", new_address:"New address", select_wallet:"Select wallet", generate:"Generate", sign_tx:"Create and sign transaction", create_sign:"Create PSBT and sign", back_home:"← Home", result:"Result", ready:"Ready.", running:"Running...", wallet_placeholder:"study-wallet", label_placeholder:"label", wallets:"Existing wallets", refresh:"Refresh", loading:"Loading...", balance:"Balance", loaded:"Loaded", addresses:"Addresses", no_addresses:"No known addresses", confirmations:"confirmations", delete_wallet:"Delete", delete_title:"Delete wallet?", delete_confirm:"Wallet {name} will be deleted only if the balance is zero. Do not use this action on wallets with funds.", confirm_delete:"Delete wallet", cancel:"Cancel", language:"Language", yes:"yes", no:"no"
  }
};
let currentLang = localStorage.getItem("lang")||document.body.dataset.defaultLang||"pt-BR";
let currentWallets = [];
let pendingDeleteWallet = "";
function setLang(lang){currentLang=translations[lang]?lang:"pt-BR";localStorage.setItem("lang",currentLang);document.documentElement.lang=currentLang;document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(translations[currentLang]?.[k])el.textContent=translations[currentLang][k]});document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const k=el.dataset.i18nPlaceholder;if(translations[currentLang]?.[k])el.placeholder=translations[currentLang][k]});document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===currentLang));renderWalletOptions(currentWallets);updateDeleteMessage()}
const out=document.getElementById("output");
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
const btc = n => n === null || n === undefined || Number.isNaN(Number(n)) ? "-" : Number(n).toFixed(8);
const sats = n => n === null || n === undefined || Number.isNaN(Number(n)) ? "-" : Math.round(Number(n) * 100_000_000).toLocaleString(currentLang);
const signetAmount = n => `${btc(Number(n))} sBTC / ${sats(Number(n))} s-sats`;
const amountParts = n => ({ btc:`${btc(Number(n))} sBTC`, sats:`${sats(Number(n))} s-sats` });
function renderAddress(value){
  const address = String(value || "");
  const safe = escapeHtml(address);
  const href = `/mempool#address=${encodeURIComponent(address)}`;
  if(address.length <= 24) return `<a class="address-link address-text" href="${href}" title="${safe}">${safe}</a>`;
  return `<a class="address-link address-text" href="${href}" title="${safe}"><mark>${escapeHtml(address.slice(0, 10))}</mark><span>${escapeHtml(address.slice(10, -10))}</span><mark>${escapeHtml(address.slice(-10))}</mark></a>`;
}
setLang(currentLang);
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{
  setLang(b.dataset.lang);
  document.getElementById("settings-popover").hidden = true;
  document.getElementById("settings-toggle").setAttribute("aria-expanded","false");
}));
function updateDeleteMessage(){
  const message = document.getElementById("delete-message");
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
function renderWalletOptions(wallets){
  const select=document.getElementById("new-address-wallet");
  if(!select) return;
  const previous=select.value;
  select.innerHTML=`<option value="">${escapeHtml(translations[currentLang].select_wallet)}</option>`+(wallets||[]).map(wallet=>`<option value="${escapeHtml(wallet.name)}">${escapeHtml(wallet.name)}${wallet.loaded ? "" : " (not loaded)"}</option>`).join("");
  if((wallets||[]).some(wallet=>wallet.name===previous)) select.value=previous;
}
function renderWallet(wallet){
  const balance = amountParts(wallet.balance);
  const addressesCount = wallet.addresses?.length || 0;
  const addresses = addressesCount ? wallet.addresses.map(a=>{
    const amount = amountParts(a.amount);
    return `<div class="address-row">
      <div class="address-main">${renderAddress(a.address)}<small>${escapeHtml(a.label || "-")}</small></div>
      <div class="address-meta"><strong>${escapeHtml(amount.btc)}</strong><small>${escapeHtml(amount.sats)}</small><em>${escapeHtml(a.confirmations)} ${escapeHtml(translations[currentLang].confirmations)}</em></div>
    </div>`;
  }).join("") : `<div class="empty compact">${escapeHtml(translations[currentLang].no_addresses)}</div>`;
  return `<article class="wallet-card">
    <div class="wallet-head">
      <div class="wallet-title"><h3>${escapeHtml(wallet.name)}</h3><span class="wallet-status ${wallet.loaded ? "is-loaded" : "is-unloaded"}">${escapeHtml(translations[currentLang].loaded)}: ${wallet.loaded ? translations[currentLang].yes : translations[currentLang].no}</span></div>
      <button class="delete-wallet" type="button" data-wallet="${escapeHtml(wallet.name)}">${escapeHtml(translations[currentLang].delete_wallet)}</button>
    </div>
    <div class="wallet-balance">
      <span>${escapeHtml(translations[currentLang].balance)}</span>
      <strong>${escapeHtml(balance.btc)}</strong>
      <small>${escapeHtml(balance.sats)}</small>
    </div>
    ${wallet.error ? `<pre>${escapeHtml(wallet.error)}</pre>` : `<div class="wallet-section-title"><h4>${escapeHtml(translations[currentLang].addresses)}</h4><span>${escapeHtml(addressesCount)}</span></div>${addresses}`}
  </article>`;
}
async function loadWallets(){
  const target=document.getElementById("wallets-list");
  target.innerHTML=`<div class="empty">${escapeHtml(translations[currentLang].loading)}</div>`;
  try{
    const data=await fetch("/api/wallet/overview").then(r=>r.json());
    currentWallets=data.wallets||[];
    renderWalletOptions(currentWallets);
    target.innerHTML=currentWallets.map(renderWallet).join("") || `<div class="empty">${escapeHtml(translations[currentLang].no_addresses)}</div>`;
  }catch(e){
    target.innerHTML=`<div class="empty">${escapeHtml(e)}</div>`;
  }
}
document.getElementById("create-wallet").addEventListener("submit",e=>{e.preventDefault();postForm("/api/wallet/create",e.target)});
document.getElementById("new-address").addEventListener("submit",e=>{e.preventDefault();postForm("/api/wallet/address",e.target)});
document.getElementById("sign-tx").addEventListener("submit",e=>{e.preventDefault();postForm("/api/wallet/sign",e.target)});
document.getElementById("refresh-wallets").addEventListener("click",loadWallets);
document.getElementById("create-faucet-wallet").addEventListener("click",()=>postData("/api/wallet/create-faucet",{}));
document.getElementById("wallets-list").addEventListener("click",e=>{
  const button=e.target.closest(".delete-wallet");
  if(!button) return;
  openDeleteModal(button.dataset.wallet);
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
  document.getElementById("settings-popover").hidden = true;
  document.getElementById("settings-toggle").setAttribute("aria-expanded","false");
});
loadWallets();
