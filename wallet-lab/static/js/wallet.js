const translations = {
  "pt-BR": {
    title:"Laboratório de carteira e assinatura", create_wallet:"Criar carteira", create:"Criar/carregar", new_address:"Novo endereço", generate:"Gerar", sign_tx:"Criar e assinar transação", create_sign:"Criar PSBT e assinar", back_home:"← Início", result:"Resultado", ready:"Pronto.", running:"Executando...", wallet_placeholder:"carteira-estudo", label_placeholder:"rótulo", wallets:"Carteiras existentes", refresh:"Atualizar", loading:"Carregando...", balance:"Saldo", loaded:"Carregada", addresses:"Endereços", no_addresses:"Nenhum endereço conhecido", confirmations:"confirmações"
  },
  "en-GB": {
    title:"Wallet and signing lab", create_wallet:"Create wallet", create:"Create/load", new_address:"New address", generate:"Generate", sign_tx:"Create and sign transaction", create_sign:"Create PSBT and sign", back_home:"← Home", result:"Result", ready:"Ready.", running:"Running...", wallet_placeholder:"study-wallet", label_placeholder:"label", wallets:"Existing wallets", refresh:"Refresh", loading:"Loading...", balance:"Balance", loaded:"Loaded", addresses:"Addresses", no_addresses:"No known addresses", confirmations:"confirmations"
  }
};
let currentLang = localStorage.getItem("lang")||document.body.dataset.defaultLang||"pt-BR";
function setLang(lang){currentLang=translations[lang]?lang:"pt-BR";localStorage.setItem("lang",currentLang);document.documentElement.lang=currentLang;document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(translations[currentLang]?.[k])el.textContent=translations[currentLang][k]});document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const k=el.dataset.i18nPlaceholder;if(translations[currentLang]?.[k])el.placeholder=translations[currentLang][k]});document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===currentLang))}
setLang(currentLang);
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));
const out=document.getElementById("output");
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
const btc = n => n === null || n === undefined || Number.isNaN(Number(n)) ? "-" : Number(n).toFixed(8);
const sats = n => n === null || n === undefined || Number.isNaN(Number(n)) ? "-" : Math.round(Number(n) * 100_000_000).toLocaleString(currentLang);
const signetAmount = n => `${btc(Number(n))} sBTC / ${sats(Number(n))} s-sats`;
async function postForm(url, form){out.textContent=translations[currentLang].running;const res=await fetch(url,{method:"POST",body:new FormData(form)});out.textContent=JSON.stringify(await res.json(),null,2);loadWallets()}
function renderWallet(wallet){
  const addresses = wallet.addresses?.length ? wallet.addresses.map(a=>`<div class="address-row"><span>${escapeHtml(a.address)}</span><small>${escapeHtml(a.label || "-")} / ${escapeHtml(signetAmount(Number(a.amount)))} / ${escapeHtml(a.confirmations)} ${escapeHtml(translations[currentLang].confirmations)}</small></div>`).join("") : `<div class="empty compact">${escapeHtml(translations[currentLang].no_addresses)}</div>`;
  return `<article class="wallet-card">
    <div class="wallet-head"><h3>${escapeHtml(wallet.name)}</h3><span>${escapeHtml(translations[currentLang].loaded)}: ${wallet.loaded ? "yes" : "no"}</span></div>
    <div class="wallet-balance"><span>${escapeHtml(translations[currentLang].balance)}</span><strong>${escapeHtml(signetAmount(Number(wallet.balance)))}</strong></div>
    ${wallet.error ? `<pre>${escapeHtml(wallet.error)}</pre>` : `<h4>${escapeHtml(translations[currentLang].addresses)}</h4>${addresses}`}
  </article>`;
}
async function loadWallets(){
  const target=document.getElementById("wallets-list");
  target.innerHTML=`<div class="empty">${escapeHtml(translations[currentLang].loading)}</div>`;
  try{
    const data=await fetch("/api/wallet/overview").then(r=>r.json());
    target.innerHTML=(data.wallets||[]).map(renderWallet).join("") || `<div class="empty">${escapeHtml(translations[currentLang].no_addresses)}</div>`;
  }catch(e){
    target.innerHTML=`<div class="empty">${escapeHtml(e)}</div>`;
  }
}
document.getElementById("create-wallet").addEventListener("submit",e=>{e.preventDefault();postForm("/api/wallet/create",e.target)});
document.getElementById("new-address").addEventListener("submit",e=>{e.preventDefault();postForm("/api/wallet/address",e.target)});
document.getElementById("sign-tx").addEventListener("submit",e=>{e.preventDefault();postForm("/api/wallet/sign",e.target)});
document.getElementById("refresh-wallets").addEventListener("click",loadWallets);
loadWallets();
