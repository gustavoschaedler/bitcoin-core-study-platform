const translations = {
  "pt-BR": {
    title:"Laboratório de assinatura", subtitle:"Crie PSBTs, assine e transmita transações.",
    select_wallet:"Selecione a carteira", sign_tx:"Criar e assinar transação", create_sign:"Criar PSBT e assinar",
    result:"Resultado", ready:"Pronto.", running:"Executando...", cancel:"Cancelar", loading:"Carregando...",
    tx_queue:"Transações assinadas", tx_queue_empty:"Nenhuma transação ainda. Crie e assine uma transação para vê-la aqui.",
    broadcast:"Transmitir", broadcast_error:"Erro ao transmitir",
    tx_from:"De", tx_to:"Para", tx_amount:"Valor", tx_status_signed:"Assinada", tx_status_broadcast:"Transmitida",
    tx_status_discarded:"Descartada", tx_fee:"Taxa", tx_txid:"TXID", tx_actions:"Ações", tx_discard:"Descartar", tx_delete:"Remover",
    sign_confirm_title:"Confirmar transação", confirm_sign:"Assinar e criar",
    sign_confirm_wallet:"Carteira", sign_confirm_to:"Destino", sign_confirm_amount:"Valor",
    nav_home:"Início", nav_faucet:"Faucet", nav_mempool:"Mempool", nav_wallet:"Carteira", nav_signing:"Assinatura", nav_stats:"Stats", nav_docs:"Docs", nav_display:"Display", nav_terminal:"Terminal", nav_last_refresh:"Última atualização", brand_subtitle:"Plataforma de estudo do Core"
  },
  "en-GB": {
    title:"Signing lab", subtitle:"Create PSBTs, sign and broadcast transactions.",
    select_wallet:"Select wallet", sign_tx:"Create and sign transaction", create_sign:"Create PSBT and sign",
    result:"Result", ready:"Ready.", running:"Running...", cancel:"Cancel", loading:"Loading...",
    tx_queue:"Signed transactions", tx_queue_empty:"No transactions yet. Create and sign a transaction to see it here.",
    broadcast:"Broadcast", broadcast_error:"Broadcast error",
    tx_from:"From", tx_to:"To", tx_amount:"Amount", tx_status_signed:"Signed", tx_status_broadcast:"Broadcast",
    tx_status_discarded:"Discarded", tx_fee:"Fee", tx_txid:"TXID", tx_actions:"Actions", tx_discard:"Discard", tx_delete:"Remove",
    sign_confirm_title:"Confirm transaction", confirm_sign:"Sign and create",
    sign_confirm_wallet:"Wallet", sign_confirm_to:"To", sign_confirm_amount:"Amount",
    nav_home:"Home", nav_faucet:"Faucet", nav_mempool:"Mempool", nav_wallet:"Wallet", nav_signing:"Signing", nav_stats:"Stats", nav_docs:"Docs", nav_display:"Display", nav_terminal:"Terminal", nav_last_refresh:"Last refresh", brand_subtitle:"Core study platform"
  }
};
let currentLang = localStorage.getItem("lang")||document.body.dataset.defaultLang||"pt-BR";
function setLang(lang){currentLang=translations[lang]?lang:"pt-BR";localStorage.setItem("lang",currentLang);document.documentElement.lang=currentLang;document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(translations[currentLang]?.[k])el.textContent=translations[currentLang][k]});document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const k=el.dataset.i18nPlaceholder;if(translations[currentLang]?.[k])el.placeholder=translations[currentLang][k]});document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===currentLang));renderWalletOptions()}
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
let cachedWallets = [];
setLang(currentLang);
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{
  setLang(b.dataset.lang);
  document.getElementById("settings-popover").hidden = true;
  document.getElementById("settings-toggle").setAttribute("aria-expanded","false");
}));
async function fetchWallets(){
  try{
    const data=await fetch("/api/wallet/overview").then(r=>r.json());
    cachedWallets=data.wallets||[];
    renderWalletOptions();
  }catch(e){}
  if(typeof window.markRefreshed === "function") window.markRefreshed();
}
function renderWalletOptions(){
  const t=translations[currentLang];
  const opts = `<option value="">${escapeHtml(t.select_wallet)}</option>`+(cachedWallets||[]).map(w=>`<option value="${escapeHtml(w.name)}">${escapeHtml(w.name)}</option>`).join("");
  const select=document.getElementById("sign-tx-wallet");
  if(!select) return;
  const previous=select.value;
  select.innerHTML=opts;
  if((cachedWallets||[]).some(w=>w.name===previous)) select.value=previous;
}

function getAmountBtc(){
  const raw=document.querySelector('#sign-tx input[name="amount"]').value;
  const unit=document.getElementById("amount-unit").value;
  return unit==="sats"?Number(raw)/100_000_000:Number(raw);
}
let pendingSign=null;
function openSignConfirm(){
  const t=translations[currentLang];
  const wallet=document.getElementById("sign-tx-wallet").value;
  const toAddr=document.querySelector('#sign-tx input[name="to_address"]').value;
  const amtBtc=getAmountBtc();
  const amt=amountParts(amtBtc);
  document.getElementById("sign-confirm-body").innerHTML=`
    <div class="sign-confirm-row"><span>${escapeHtml(t.sign_confirm_wallet)}</span><strong>${escapeHtml(wallet)}</strong></div>
    <div class="sign-confirm-row"><span>${escapeHtml(t.sign_confirm_to)}</span>${renderAddress(toAddr)}</div>
    <div class="sign-confirm-row"><span>${escapeHtml(t.sign_confirm_amount)}</span><strong class="txq-amount">${escapeHtml(amt.btc)}</strong><small>${escapeHtml(amt.sats)}</small></div>`;
  pendingSign={wallet,toAddr,amtBtc};
  document.getElementById("sign-confirm-modal").hidden=false;
}
function closeSignConfirm(){pendingSign=null;document.getElementById("sign-confirm-modal").hidden=true}
async function executeSign(){
  if(!pendingSign) return;
  const {wallet,toAddr,amtBtc}=pendingSign;
  closeSignConfirm();
  out.textContent=translations[currentLang].running;
  try{
    const body=new FormData();
    body.append("wallet",wallet);
    body.append("to_address",toAddr);
    body.append("amount",amtBtc.toFixed(8));
    const res=await fetch("/api/wallet/sign",{method:"POST",body});
    const data=await res.json();
    out.textContent=JSON.stringify(data,null,2);
    if(res.ok && data.finalized?.hex){
      const fee=data.psbt?.fee!=null?data.psbt.fee:null;
      addTxToQueue({wallet:data.wallet,to_address:data.to_address,amount:data.amount,hex:data.finalized.hex,fee,complete:data.finalized.complete,ts:Date.now()});
    }
  }catch(err){out.textContent=String(err)}
}
document.getElementById("sign-tx").addEventListener("submit",e=>{e.preventDefault();openSignConfirm()});
document.getElementById("confirm-sign").addEventListener("click",executeSign);
document.getElementById("cancel-sign").addEventListener("click",closeSignConfirm);
document.querySelectorAll("[data-close-sign-confirm]").forEach(el=>el.addEventListener("click",closeSignConfirm));

let txQueue=JSON.parse(sessionStorage.getItem("txQueue")||"[]");
function saveTxQueue(){sessionStorage.setItem("txQueue",JSON.stringify(txQueue))}
function closeAllActionMenus(){document.querySelectorAll(".txq-actions-menu").forEach(m=>m.hidden=true)}
function renderTxItem(tx,i){
  const t=translations[currentLang];
  const amt=amountParts(tx.amount);
  const isBroadcast=!!tx.txid;
  const isDiscarded=!!tx.discarded;
  const statusClass=isBroadcast?"tx-status-broadcast":isDiscarded?"tx-status-discarded":tx.error?"tx-status-error":"tx-status-signed";
  const statusText=isBroadcast?t.tx_status_broadcast:isDiscarded?t.tx_status_discarded:tx.error?t.broadcast_error:t.tx_status_signed;
  const feeStr=tx.fee!=null?`${Number(tx.fee).toFixed(8)} sBTC`:"—";
  const time=new Date(tx.ts).toLocaleTimeString(currentLang);
  const canBroadcast=!isBroadcast&&!isDiscarded&&!tx.error;
  const canDiscard=!isBroadcast&&!isDiscarded;
  return `<article class="txq-item ${statusClass}" data-txi="${i}">
    <div class="txq-head">
      <span class="txq-status-badge">${escapeHtml(statusText)}</span>
      <div class="txq-head-right">
        <time>${escapeHtml(time)}</time>
        <div class="txq-actions-wrap">
          <button class="txq-actions-btn" type="button" data-txi="${i}">⋮</button>
          <div class="txq-actions-menu" hidden>
            ${canBroadcast?`<button class="txq-action-broadcast" type="button" data-txi="${i}">${escapeHtml(t.broadcast)}</button>`:""}
            ${canDiscard?`<button class="txq-action-discard" type="button" data-txi="${i}">${escapeHtml(t.tx_discard)}</button>`:""}
            ${isBroadcast||isDiscarded?`<button class="txq-action-delete" type="button" data-txi="${i}">${escapeHtml(t.tx_delete)}</button>`:""}
          </div>
        </div>
      </div>
    </div>
    <div class="txq-body">
      <div class="txq-row"><span class="txq-label">${escapeHtml(t.tx_from)}</span><strong>${escapeHtml(tx.wallet)}</strong></div>
      <div class="txq-row"><span class="txq-label">${escapeHtml(t.tx_to)}</span>${renderAddress(tx.to_address)}</div>
      <div class="txq-row"><span class="txq-label">${escapeHtml(t.tx_amount)}</span><strong class="txq-amount">${escapeHtml(amt.btc)}</strong><small>${escapeHtml(amt.sats)}</small></div>
      <div class="txq-row"><span class="txq-label">${escapeHtml(t.tx_fee)}</span><span class="txq-fee">${escapeHtml(feeStr)}</span></div>
      ${tx.txid?`<div class="txq-row txq-txid-row"><span class="txq-label">${escapeHtml(t.tx_txid)}</span><span class="hash-with-copy"><a class="address-link address-text" href="/mempool#tx=${encodeURIComponent(tx.txid)}" title="${escapeHtml(tx.txid)}"><mark>${escapeHtml(tx.txid.slice(0,8))}</mark><span>${escapeHtml(tx.txid.slice(8,-8))}</span><mark>${escapeHtml(tx.txid.slice(-8))}</mark></a>${renderCopy(tx.txid,"Copy TXID")}</span></div>`:""}
      ${tx.error?`<div class="txq-row txq-error">${escapeHtml(tx.error)}</div>`:""}
    </div>
  </article>`;
}
function renderTxQueue(){
  const list=document.getElementById("txqueue-list");
  const count=document.getElementById("txqueue-count");
  count.textContent=txQueue.length;
  if(!txQueue.length){
    list.innerHTML=`<div class="empty compact">${escapeHtml(translations[currentLang].tx_queue_empty)}</div>`;
    return;
  }
  list.innerHTML=txQueue.map((tx,i)=>renderTxItem(tx,i)).reverse().join("");
}
function addTxToQueue(tx){
  txQueue.push(tx);
  saveTxQueue();
  renderTxQueue();
}
document.getElementById("txqueue-list").addEventListener("click",async e=>{
  const toggleBtn=e.target.closest(".txq-actions-btn");
  if(toggleBtn){
    const menu=toggleBtn.nextElementSibling;
    const wasHidden=menu.hidden;
    closeAllActionMenus();
    menu.hidden=!wasHidden;
    return;
  }
  const broadcastBtn=e.target.closest(".txq-action-broadcast");
  if(broadcastBtn){
    const i=Number(broadcastBtn.dataset.txi);
    const tx=txQueue[i];
    if(!tx||tx.txid||tx.discarded) return;
    closeAllActionMenus();
    out.textContent=translations[currentLang].running;
    try{
      const body=new FormData();
      body.append("hex_tx",tx.hex);
      const res=await fetch("/api/wallet/broadcast",{method:"POST",body});
      const data=await res.json();
      out.textContent=JSON.stringify(data,null,2);
      if(res.ok&&data.txid){tx.txid=data.txid;delete tx.error}
      else{tx.error=data.detail||JSON.stringify(data)}
    }catch(err){tx.error=String(err);out.textContent=String(err)}
    saveTxQueue();renderTxQueue();
    return;
  }
  const discardBtn=e.target.closest(".txq-action-discard");
  if(discardBtn){
    const i=Number(discardBtn.dataset.txi);
    const tx=txQueue[i];
    if(!tx||tx.txid||tx.discarded) return;
    closeAllActionMenus();
    tx.discarded=true;
    saveTxQueue();renderTxQueue();
    return;
  }
  const deleteBtn=e.target.closest(".txq-action-delete");
  if(deleteBtn){
    const i=Number(deleteBtn.dataset.txi);
    if(i>=0&&i<txQueue.length){
      closeAllActionMenus();
      txQueue.splice(i,1);
      saveTxQueue();renderTxQueue();
    }
    return;
  }
});

document.getElementById("settings-toggle").addEventListener("click",()=>{
  const popover = document.getElementById("settings-popover");
  const nextHidden = !popover.hidden;
  popover.hidden = nextHidden;
  document.getElementById("settings-toggle").setAttribute("aria-expanded", String(!nextHidden));
});
document.addEventListener("click",e=>{
  const menu = e.target.closest(".settings-menu");
  if(menu) return;
  if(!e.target.closest(".txq-actions-wrap")) closeAllActionMenus();
  const popover = document.getElementById("settings-popover");
  if(!popover.hidden){
    popover.hidden = true;
    document.getElementById("settings-toggle").setAttribute("aria-expanded","false");
  }
});
document.addEventListener("keydown",e=>{
  if(e.key !== "Escape") return;
  closeSignConfirm();
  closeAllActionMenus();
  document.getElementById("settings-popover").hidden = true;
  document.getElementById("settings-toggle").setAttribute("aria-expanded","false");
});
renderTxQueue();
fetchWallets();
