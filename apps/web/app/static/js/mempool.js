const translations = {
  "pt-BR": {
    home:"Inicio", mempool:"Mempool", faucet:"Faucet", wallet:"Carteira", stats:"Estatisticas",
    page_title:"Monitor da mempool", subtitle:"Mempool Signet ao vivo, faixas de taxa e blocos projetados.",
    refresh:"Atualizar", high:"Alta prioridade", medium:"Media prioridade", low:"Baixa prioridade",
    transactions:"Transacoes", in_mempool:"na mempool", blocks_label:"Blocos", to_be_mined:"a serem minerados", latest_transactions:"Transacoes nao confirmadas", node:"No",
    chain:"Rede", block_height:"Altura", sync:"Sincronia", peers:"Pares", headers:"Headers",
    mempool_bytes:"Bytes da mempool", memory_usage:"Uso de memoria", min_fee:"Taxa minima",
    fee_rate:"Taxa", size:"Tamanho", output:"Saida",
    projected_blocks:"Blocos a serem minerados", projected_hint:"Estimativa pela ordem de taxas da mempool local", mined_blocks:"Últimos blocos minerados",
    projected_block:"Bloco projetado", empty_blocks:"Mempool vazia. Sem blocos projetados.",
    empty_txs:"Mempool vazia.", loading_blocks:"Carregando blocos...", loading_txs:"Carregando transacoes...",
    txs:"transacoes", fees:"taxas", ago:"atras", inputs:"entradas", outputs:"saidas", failed:"Falha ao carregar",
    block_transactions:"Transacoes do bloco", loading_block:"Carregando transacoes do bloco...",
    block_value:"Valor de saida", block_time:"Horario", no_block_txs:"Nenhuma transacao encontrada neste bloco",
    transaction:"Transacao", close:"Fechar", loading_tx:"Carregando transacao...", overview:"Resumo",
    status:"Status", fee:"Taxa", total_in:"Total entrada", total_out:"Total saida", virtual_size:"Tamanho virtual",
    weight:"Peso", version:"Versao", locktime:"Locktime", details:"Detalhes", no_address:"Sem endereco",
    witness:"Witness", sequence:"Sequence", raw_hex:"Hex bruto", dependencies:"Dependencias", children:"Filhas",
    source:"Origem", destination:"Destino", value:"Valor", previous_output:"Saida anterior", output_index:"Indice da saida",
    previous:"Anterior", next:"Proxima", page:"Pagina", in_about:"Em ~", minutes:"minutos", decoded_json:"Transacao decodificada",
    search_button:"Buscar", search_placeholder:"Buscar transacao, endereco, bloco, hash ou metrica do node",
    search_no_results:"Nenhum resultado local", block:"Bloco", tx_projected_block:"Bloco projetado", metric:"Metrica", address:"Endereco",
    address_detail:"Detalhes do endereco", confirmed:"Confirmado", unconfirmed:"Nao confirmado",
    balance:"Saldo", received:"Recebido", spent:"Gasto", utxos:"UTXOs", recent_transactions:"Transacoes recentes",
    no_transactions:"Nenhuma transacao encontrada neste node", chain_stats:"Estatisticas confirmadas", mempool_stats:"Estatisticas da mempool",
    sent:"Enviado", transaction_history:"Historico de transacoes", lookup_method:"Fonte da consulta",
    loading_address:"Carregando carteira", loading_address_hint:"Consultando wallets carregadas, UTXOs e historico local do node.",
    balance_history:"Historico de saldo", unspent_outputs:"Saidas nao gastas", address_type:"Tipo", external_view:"Abrir no mempool.space",
    copy_address:"Copiar endereco", copied:"Copiado", show_qrcode:"Mostrar QR Code",
    nav_home:"Início", nav_faucet:"Faucet", nav_mempool:"Mempool", nav_wallet:"Carteira",
    nav_stats:"Stats", nav_docs:"Docs", nav_display:"Display", nav_terminal:"Terminal",
    nav_last_refresh:"Última atualização", brand_subtitle:"Plataforma de estudo do Core"
  },
  "en-GB": {
    home:"Home", mempool:"Mempool", faucet:"Faucet", wallet:"Wallet lab", stats:"Stats",
    page_title:"Mempool monitor", subtitle:"Live Signet mempool, fee buckets and projected blocks.",
    refresh:"Refresh", high:"High priority", medium:"Medium priority", low:"Low priority",
    transactions:"Transactions", in_mempool:"in mempool", blocks_label:"Blocks", to_be_mined:"to be mined", latest_transactions:"Unconfirmed mempool transactions", node:"Node",
    chain:"Chain", block_height:"Block height", sync:"Sync", peers:"Peers", headers:"Headers",
    mempool_bytes:"Mempool bytes", memory_usage:"Memory usage", min_fee:"Min fee",
    fee_rate:"Fee rate", size:"Size", output:"Output",
    projected_blocks:"Blocks to be mined", projected_hint:"Approximation from local mempool fee order", mined_blocks:"Mined blocks last",
    projected_block:"Projected block", empty_blocks:"Mempool empty. No projected blocks.",
    empty_txs:"Mempool empty.", loading_blocks:"Loading blocks...", loading_txs:"Loading transactions...",
    txs:"transactions", fees:"fees", ago:"ago", inputs:"inputs", outputs:"outputs", failed:"Failed to load",
    block_transactions:"Block transactions", loading_block:"Loading block transactions...",
    block_value:"Output value", block_time:"Time", no_block_txs:"No transactions found in this block",
    transaction:"Transaction", close:"Close", loading_tx:"Loading transaction...", overview:"Overview",
    status:"Status", fee:"Fee", total_in:"Total input", total_out:"Total output", virtual_size:"Virtual size",
    weight:"Weight", version:"Version", locktime:"Locktime", details:"Details", no_address:"No address",
    witness:"Witness", sequence:"Sequence", raw_hex:"Raw hex", dependencies:"Dependencies", children:"Children",
    source:"Source", destination:"Destination", value:"Value", previous_output:"Previous output", output_index:"Output index",
    previous:"Previous", next:"Next", page:"Page", in_about:"In ~", minutes:"minutes", decoded_json:"Decoded transaction",
    search_button:"Search", search_placeholder:"Search transaction, address, block, hash or node metric",
    search_no_results:"No local results", block:"Block", tx_projected_block:"Projected block", metric:"Metric", address:"Address",
    address_detail:"Address details", confirmed:"Confirmed", unconfirmed:"Unconfirmed",
    balance:"Balance", received:"Received", spent:"Spent", utxos:"UTXOs", recent_transactions:"Recent transactions",
    no_transactions:"No transactions found on this node", chain_stats:"Confirmed stats", mempool_stats:"Mempool stats",
    sent:"Sent", transaction_history:"Transaction history", lookup_method:"Lookup source",
    loading_address:"Loading wallet", loading_address_hint:"Checking loaded wallets, UTXOs and local node history.",
    balance_history:"Balance history", unspent_outputs:"Unspent outputs", address_type:"Type", external_view:"Open on mempool.space",
    copy_address:"Copy address", copied:"Copied", show_qrcode:"Show QR Code",
    nav_home:"Home", nav_faucet:"Faucet", nav_mempool:"Mempool", nav_wallet:"Wallet",
    nav_stats:"Stats", nav_docs:"Docs", nav_display:"Display", nav_terminal:"Terminal",
    nav_last_refresh:"Last refresh", brand_subtitle:"Core study platform"
  }
};

let currentLang = localStorage.getItem("lang") || document.body.dataset.defaultLang || "pt-BR";
const PAGE_SIZE = 10;
const BLOCK_PAGE_SIZE = 10;
const MINED_BLOCK_LIMIT = 50;
let allTxs = [];
let txPage = 1;
let currentTip = null;
let projectedBlocksSignature = "";
let minedBlocksSignature = "";
let projectedScrollInitialized = false;
let latestStatus = {};
let latestInfo = {};
let latestProjectedBlocks = [];
let latestMinedBlocks = [];
let latestSearchResults = [];
let searchRequestId = 0;
let currentAddressDetail = "";
let addressRefreshTimer = null;
let addressRequestId = 0;
let modalStackZ = 80;
let blockTxPage = 1;
let blockTxRows = [];
let blockTxLabel = "";

function tr(key){
  return translations[currentLang]?.[key] || translations["en-GB"][key] || key;
}

function setLang(lang){
  currentLang = translations[lang] ? lang : "pt-BR";
  localStorage.setItem("lang", currentLang);
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if(translations[currentLang]?.[key]) el.textContent = translations[currentLang][key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if(translations[currentLang]?.[key]) el.placeholder = translations[currentLang][key];
  });
  document.querySelectorAll("[data-lang]").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === currentLang));
}

function visibleModals(){
  return ["block-modal", "address-modal", "tx-modal"]
    .map(id => $(id))
    .filter(modal => modal && !modal.hidden);
}

function refreshModalOpenState(){
  document.body.classList.toggle("modal-open", visibleModals().length > 0);
}

function bringModalToFront(modal){
  if(!modal) return;
  modalStackZ += 10;
  modal.style.zIndex = String(modalStackZ);
}

function topVisibleModal(){
  return visibleModals()
    .sort((a,b) => Number(b.style.zIndex || 50) - Number(a.style.zIndex || 50))[0];
}

const $ = id => document.getElementById(id);
const fmt = n => n === null || n === undefined || Number.isNaN(Number(n)) ? "-" : Number(n).toLocaleString(currentLang);
const btc = n => n === null || n === undefined || Number.isNaN(Number(n)) ? "-" : Number(n).toFixed(8);
const sBtcLabel = n => `${btc(Number(n))} sBTC`;
const signetDualLines = n => `<span>${escapeHtml(btc(Number(n)))} sBTC</span><small>${escapeHtml(fmt(sats(n)))} s-sats</small>`;
const sbtc = n => n === null || n === undefined || Number.isNaN(Number(n)) ? "0.000" : Number(n).toFixed(3);
const sats = n => Math.round(Number(n || 0) * 100_000_000);
const satsLabel = n => `${fmt(Math.round(Number(n || 0)))} s-sats`;
const short = x => x ? `${x.slice(0, 12)}...${x.slice(-12)}` : "-";
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
const txUrl = txid => `https://mempool.space/signet/tx/${encodeURIComponent(txid)}`;
const txTime = tx => Number.isFinite(Number(tx?.time)) ? Number(tx.time) : Number.MAX_SAFE_INTEGER;
const cubeSize = (value, max) => {
  if(!max || !Number.isFinite(Number(value))) return 156;
  const ratio = Math.max(0, Math.min(1, Number(value) / Number(max)));
  return Math.round(156 + ratio * 22);
};
const projectedSortValue = block => Number(block?.vbytes || block?.tx_count || 0);
const minedSortValue = block => Number(block?.size || block?.weight || block?.tx_count || 0);
const projectedHeightValue = (block, fallbackIndex = 0) => (
  currentTip ? currentTip + Number(block?.index || fallbackIndex + 1) : Number(block?.index || fallbackIndex + 1)
);

function ago(ts){
  if(!ts) return "-";
  const d = Math.max(0, Math.floor(Date.now()/1000 - ts));
  if(d < 60) return `${d}s`;
  if(d < 3600) return `${Math.floor(d/60)}m`;
  return `${Math.floor(d/3600)}h`;
}

function percentile(values, p){
  if(!values.length) return "-";
  const sorted = [...values].sort((a,b)=>a-b);
  return sorted[Math.min(sorted.length-1, Math.floor((p/100)*sorted.length))].toFixed(2);
}

function feeClass(rate){
  const value = Number(rate || 0);
  if(value >= 5) return "fee-hot";
  if(value >= 2) return "fee-mid";
  return "fee-low";
}

function satRate(value){
  const rate = Number(value || 0);
  return rate >= 100 ? rate.toFixed(0) : rate >= 10 ? rate.toFixed(1) : rate.toFixed(2);
}

function avgRateFromBlock(block){
  const fees = Number(block?.fees || 0);
  const vbytes = Number(block?.vbytes || block?.size || 0);
  if(block?.avg_fee_rate !== undefined) return Number(block.avg_fee_rate || 0);
  if(!fees || !vbytes) return 0;
  return (fees * 100_000_000) / vbytes;
}

function renderBlockFace({ avgRate, minRate, maxRate, fees, txCount, timeLabel }){
  return `<div class="block-face">
    <span class="fee-average">~${escapeHtml(satRate(avgRate))} s-sats/vB</span>
    <span class="fee-range">${escapeHtml(satRate(minRate))} - ${escapeHtml(satRate(maxRate))} s-sats/vB</span>
    <strong>${escapeHtml(sbtc(fees))} sBTC</strong>
    <span>${escapeHtml(fmt(txCount))} ${escapeHtml(tr("txs"))}</span>
    <span>${escapeHtml(timeLabel)}</span>
  </div>`;
}

function renderTxRef(txid){
  if(!txid) return "-";
  const safe = escapeHtml(txid);
  return `<a class="hash-link" href="${txUrl(txid)}" target="_blank" rel="noopener noreferrer" title="${safe}">${safe}</a>`;
}

const COPY_ICON_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`;
const CHECK_ICON_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="5 12 10 17 19 7"/></svg>`;

function copyButton(value, label){
  const safe = escapeHtml(value);
  const aria = escapeHtml(label || "Copy");
  return `<button type="button" class="copy-btn" data-copy="${safe}" title="${aria}" aria-label="${aria}">${COPY_ICON_SVG}</button>`;
}

function renderEdgeHash(value, className = "hash-link"){
  if(!value) return "-";
  const safe = escapeHtml(value);
  if(value.length <= 24){
    return `<span class="${className}" title="${safe}"><span class="hash-edge">${safe}</span></span>`;
  }
  const head = escapeHtml(value.slice(0, 10));
  const tail = escapeHtml(value.slice(-10));
  const middle = escapeHtml(value.slice(10, -10));
  // Render full value; setupEdgeHashes() observes width and collapses the
  // middle to "…" only if the content overflows.
  return `<span class="${className}" data-edge-hash data-edge-head="${head}" data-edge-mid="${middle}" data-edge-tail="${tail}" title="${safe}"><span class="hash-edge">${head}</span><span class="hash-middle">${middle}</span><span class="hash-edge">${tail}</span></span>`;
}

function renderEdgeHashWithCopy(value, className = "hash-link", copyLabel){
  if(!value) return "-";
  return `<span class="hash-with-copy">${renderEdgeHash(value, className)}${copyButton(value, copyLabel || tr("copy_address") || "Copy")}</span>`;
}

function setupEdgeHashes(root){
  const scope = root || document;
  const targets = scope.querySelectorAll("[data-edge-hash]:not([data-edge-init])");
  for(const el of targets){
    el.dataset.edgeInit = "1";
    const head = el.dataset.edgeHead;
    const mid = el.dataset.edgeMid;
    const tail = el.dataset.edgeTail;
    const fullHTML = `<span class="hash-edge">${head}</span><span class="hash-middle">${mid}</span><span class="hash-edge">${tail}</span>`;
    const truncatedHTML = `<span class="hash-edge">${head}</span><span class="hash-ellipsis" aria-hidden="true">…</span><span class="hash-edge">${tail}</span>`;
    const apply = () => {
      // Render full at the children's natural width to detect overflow
      // independently of any CSS rules that already shrink the middle.
      el.innerHTML = fullHTML;
      el.classList.add("edge-hash-measuring");
      const fits = el.scrollWidth <= el.clientWidth + 1;
      el.classList.remove("edge-hash-measuring");
      if(!fits) el.innerHTML = truncatedHTML;
    };
    apply();
    new ResizeObserver(apply).observe(el);
  }
}

function renderAddressRef(address){
  if(!address) return escapeHtml(tr("no_address"));
  const safe = escapeHtml(address);
  return `<button class="address-link" type="button" data-address="${safe}" title="${safe}">${safe}</button>`;
}

function renderIoAddressRef(address){
  if(!address) return escapeHtml(tr("no_address"));
  const safe = escapeHtml(address);
  return `<span class="hash-with-copy"><button class="address-link io-address-link" type="button" data-address="${safe}" title="${safe}">${renderEdgeHash(address, "io-hash-text")}</button>${copyButton(address, tr("copy_address"))}</span>`;
}

function renderIoTxRef(txid){
  if(!txid) return "-";
  const safe = escapeHtml(txid);
  return `<span class="hash-with-copy"><a class="hash-link io-hash-link" href="${txUrl(txid)}" target="_blank" rel="noopener noreferrer" title="${safe}">${renderEdgeHash(txid, "io-hash-text")}</a>${copyButton(txid, "Copy TXID")}</span>`;
}

function renderFullTxid(txid){
  if(!txid) return "-";
  const safe = escapeHtml(txid);
  const head = escapeHtml(txid.slice(0, 7));
  const body = escapeHtml(txid.slice(7, -7));
  const tail = escapeHtml(txid.slice(-7));
  return `<span class="hash-with-copy"><a class="txid tx-link" href="#tx=${encodeURIComponent(txid)}" data-txid="${safe}" title="${safe}"><span class="tx-edge">${head}</span>${body}<span class="tx-edge">${tail}</span></a>${copyButton(txid, "Copy TXID")}</span>`;
}

function iconSvg(name){
  if(name === "copy") return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  if(name === "qr") return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><path d="M14 14h2v2h-2zM19 14h2v2h-2zM14 19h2v2h-2zM18 18h3v3h-3z"></path></svg>`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7"></path><path d="M10 14 21 3"></path><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"></path></svg>`;
}

function projectedTimeLabel(block, fallbackIndex){
  return `${tr("in_about")}${Number(block?.index || fallbackIndex + 1) * 10} ${tr("minutes")}`;
}

function renderBlocks(blocks){
  const el = $("blocks");
  if(!blocks?.length){
    el.innerHTML = `<div class="loading">${escapeHtml(tr("empty_blocks"))}</div>`;
    $("projected-block-count").textContent = "0";
    if($("blocks-to-mine-count")) $("blocks-to-mine-count").textContent = "0";
    projectedBlocksSignature = "";
    projectedScrollInitialized = false;
    return;
  }
  const colours = ["#ff625f", "#f7931a", "#ffd166", "#24c26a", "#5ba7ff", "#b48cff"];
  const sortedBlocks = [...blocks]
    .sort((a,b)=>projectedHeightValue(b) - projectedHeightValue(a));
  $("projected-block-count").textContent = fmt(sortedBlocks.length);
  if($("blocks-to-mine-count")) $("blocks-to-mine-count").textContent = fmt(sortedBlocks.length);
  const signature = sortedBlocks.map((b, index) => `${projectedHeightValue(b, index)}:${projectedSortValue(b)}:${b.tx_count}:${b.fees}`).join("|");
  if(signature === projectedBlocksSignature) return;
  const previousScroll = el.scrollLeft;
  projectedBlocksSignature = signature;
  const maxVbytes = Math.max(...sortedBlocks.map(projectedSortValue), 1);
  el.innerHTML = sortedBlocks.map((b, index) => {
    const value = projectedSortValue(b);
    const fill = Math.max(8, Math.min(100, (value / 1000000) * 100));
    const size = cubeSize(value, maxVbytes);
    const projectedHeight = currentTip ? projectedHeightValue(b, index) : null;
    const displayHeight = projectedHeight || b.index;
    const heightLabel = projectedHeight ? escapeHtml(fmt(projectedHeight)) : `${escapeHtml(tr("projected_block"))} ${escapeHtml(b.index)}`;
    return `<article class="block" data-block-height="${escapeHtml(displayHeight)}" style="--fill:${fill}%;--block-size:${size}px;--block-color:${colours[index % colours.length]}">
      <i class="cube-side"></i><i class="cube-base"></i>
      <h3><button class="block-height-button" type="button" data-block-kind="projected" data-block-index="${escapeHtml(b.index)}" data-block-height="${escapeHtml(displayHeight)}">${heightLabel}</button></h3>
      ${renderBlockFace({
        avgRate: avgRateFromBlock(b),
        minRate: b.min_fee_rate,
        maxRate: b.max_fee_rate,
        fees: b.fees,
        txCount: b.tx_count,
        timeLabel: projectedTimeLabel(b, index),
      })}
    </article>`;
  }).join("");
  if(projectedScrollInitialized){
    el.scrollLeft = previousScroll;
  }else{
    el.scrollLeft = el.scrollWidth;
    projectedScrollInitialized = true;
  }
}

function renderMinedBlocks(data){
  const el = $("mined-blocks");
  $("tip-height").textContent = data?.tip ? `#${fmt(data.tip)}` : "-";
  if(!data?.blocks?.length){
    el.innerHTML = `<div class="loading">${escapeHtml(tr("empty_blocks"))}</div>`;
    $("mined-block-count").textContent = "0";
    minedBlocksSignature = "";
    return;
  }
  const sortedBlocks = [...data.blocks]
    .sort((a,b)=>Number(b.height || 0) - Number(a.height || 0))
    .slice(0,MINED_BLOCK_LIMIT);
  $("mined-block-count").textContent = fmt(sortedBlocks.length);
  const signature = sortedBlocks.map(b => `${b.height}:${minedSortValue(b)}:${b.tx_count}:${b.time}`).join("|");
  if(signature === minedBlocksSignature) return;
  minedBlocksSignature = signature;
  const maxSize = Math.max(...sortedBlocks.map(minedSortValue), 1);
  el.innerHTML = sortedBlocks.map((b) => `<article class="block mined-block" data-block-height="${escapeHtml(b.height)}" data-block-hash="${escapeHtml(b.hash)}" style="--block-size:${cubeSize(minedSortValue(b), maxSize)}px">
      <i class="cube-side"></i><i class="cube-base"></i>
      <h3><button class="block-height-button" type="button" data-block-kind="mined" data-block-height="${escapeHtml(b.height)}">${escapeHtml(fmt(b.height))}</button></h3>
      ${renderBlockFace({
        avgRate: avgRateFromBlock(b),
        minRate: b.min_fee_rate,
        maxRate: b.max_fee_rate,
        fees: b.fees,
        txCount: b.tx_count,
        timeLabel: `${ago(b.time)} ${tr("ago")}`,
      })}
    </article>`).join("");
}

function renderTxs(txs){
  const el = $("tx-list");
  if(!txs?.length){
    el.innerHTML = `<div class="empty">${escapeHtml(tr("empty_txs"))}</div>`;
    return;
  }
  el.innerHTML = txs.map(tx => {
    const safeTxid = escapeHtml(tx.txid);
    if(tx.error){
      return `<div class="tx-row"><div>${renderFullTxid(tx.txid)}<span class="sub">${escapeHtml(tx.error)}</span></div><span class="pill">-</span><span class="pill">error</span><span></span><span></span></div>`;
    }
    return `<div class="tx-row">
      <div>${renderFullTxid(tx.txid)}<span class="sub">${escapeHtml(tx.vin)} ${escapeHtml(tr("inputs"))} / ${escapeHtml(tx.vout)} ${escapeHtml(tr("outputs"))} / ${escapeHtml(ago(tx.time))} ${escapeHtml(tr("ago"))}</span></div>
      <span class="pill">${escapeHtml(tx.projected_block_height ? fmt(tx.projected_block_height) : "-")}</span>
      <span class="pill ${feeClass(tx.fee_rate)}">${escapeHtml(tx.fee_rate ?? "-")} s-sats/vB</span>
      <span class="pill">${escapeHtml(fmt(tx.vsize))} vB</span>
      <span class="pill output-amount">${signetDualLines(tx.value_out)}</span>
    </div>`;
  }).join("");
}

function renderTransactionTableRows(txs, blockLabel){
  return txs.map(tx => {
    if(tx.error){
      return `<div class="tx-row"><div>${renderFullTxid(tx.txid)}<span class="sub">${escapeHtml(tx.error)}</span></div><span class="pill">${escapeHtml(blockLabel || "-")}</span><span class="pill">error</span><span></span><span></span></div>`;
    }
    const blockValue = blockLabel || (tx.projected_block_height ? fmt(tx.projected_block_height) : "-");
    return `<div class="tx-row">
      <div>${renderFullTxid(tx.txid)}<span class="sub">${escapeHtml(tx.vin)} ${escapeHtml(tr("inputs"))} / ${escapeHtml(tx.vout)} ${escapeHtml(tr("outputs"))} / ${escapeHtml(ago(tx.time))} ${escapeHtml(tr("ago"))}</span></div>
      <span class="pill">${escapeHtml(blockValue)}</span>
      <span class="pill ${feeClass(tx.fee_rate)}">${escapeHtml(tx.fee_rate ?? "-")} s-sats/vB</span>
      <span class="pill">${escapeHtml(fmt(tx.vsize))} vB</span>
      <span class="pill output-amount">${signetDualLines(tx.value_out)}</span>
    </div>`;
  }).join("");
}

function renderBlockTxPage(){
  const rowsEl = $("block-tx-page-rows");
  const pageEl = $("block-tx-page");
  const prev = $("block-tx-prev");
  const next = $("block-tx-next");
  if(!rowsEl || !pageEl) return;
  const totalPages = Math.max(1, Math.ceil(blockTxRows.length / BLOCK_PAGE_SIZE));
  blockTxPage = Math.min(Math.max(1, blockTxPage), totalPages);
  const start = (blockTxPage - 1) * BLOCK_PAGE_SIZE;
  rowsEl.innerHTML = renderTransactionTableRows(blockTxRows.slice(start, start + BLOCK_PAGE_SIZE), blockTxLabel);
  pageEl.textContent = `${tr("page")} ${fmt(blockTxPage)} / ${fmt(totalPages)} · ${fmt(blockTxRows.length)} ${tr("txs")}`;
  if(prev) prev.disabled = blockTxPage <= 1;
  if(next) next.disabled = blockTxPage >= totalPages;
}

function renderTxPage(){
  const totalPages = Math.max(1, Math.ceil(allTxs.length / PAGE_SIZE));
  txPage = Math.min(Math.max(1, txPage), totalPages);
  const start = (txPage - 1) * PAGE_SIZE;
  renderTxs(allTxs.slice(start, start + PAGE_SIZE));
  $("tx-page").textContent = `${tr("page")} ${txPage} / ${totalPages}`;
  $("tx-prev").disabled = txPage <= 1;
  $("tx-next").disabled = txPage >= totalPages;
}

function renderKeyValue(label, value, suffix = ""){
  return `<div class="detail-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value ?? "-")}${suffix ? ` ${escapeHtml(suffix)}` : ""}</strong></div>`;
}

function renderIoRow(item, type){
  const prevout = item.prevout || {};
  const address = type === "input" ? prevout.address : item.address;
  const value = type === "input" ? prevout.value : item.value;
  const txid = type === "input" ? item.txid : null;
  const index = type === "input" ? item.vout : item.n;
  const reference = type === "input" && txid
    ? renderIoTxRef(txid)
    : `#${escapeHtml(index ?? "-")}`;
  const headLabel = type === "input" ? tr("previous_output") : tr("output_index");
  const meta = type === "input"
    ? `${tr("sequence")} ${item.sequence ?? "-"} · ${tr("witness")} ${item.witness_items ?? 0}`
    : `${tr("address_type")} ${item.type || "-"}`;
  return `<div class="io-card ${type === "input" ? "io-input" : "io-output"}">
    <div class="io-card-main">
      <div class="io-line">
        <span class="io-caption">${escapeHtml(headLabel)}</span>
        <span class="io-reference">${reference}</span>
      </div>
      <div class="io-line">
        <span class="io-caption">${escapeHtml(tr("address"))}</span>
        <span class="io-address-cell">${address ? renderIoAddressRef(address) : escapeHtml(tr("no_address"))}</span>
      </div>
      <div class="io-meta">${escapeHtml(meta)}</div>
    </div>
    <div class="io-value"><strong>${escapeHtml(sBtcLabel(value))}</strong><small>${escapeHtml(fmt(sats(value)))} s-sats</small></div>
  </div>`;
}

function renderTxDetail(tx){
  const explorer = txUrl(tx.txid);
  const depends = tx.depends?.length ? tx.depends.map(renderTxRef).join("") : "-";
  const spentby = tx.spentby?.length ? tx.spentby.map(renderTxRef).join("") : "-";
  const decoded = {
    identity: {
      txid: tx.txid,
      status: tx.status,
      version: tx.version,
      locktime: tx.locktime,
      height: tx.height,
      time: tx.time,
    },
    economics: {
      fee_btc: tx.fee,
      fee_rate_sat_vb: tx.fee_rate,
      total_input_btc: tx.total_in,
      total_output_btc: tx.total_out,
    },
    size: {
      bytes: tx.size,
      virtual_bytes: tx.vsize,
      weight_units: tx.weight,
    },
    dependencies: tx.depends || [],
    children: tx.spentby || [],
    inputs: tx.inputs || [],
    outputs: tx.outputs || [],
  };
  return `<section class="detail-overview">
    ${renderKeyValue(tr("status"), tx.status)}
    ${renderKeyValue(tr("fee"), sBtcLabel(tx.fee))}
    ${renderKeyValue(tr("fee_rate"), tx.fee_rate, "s-sats/vB")}
    ${renderKeyValue(tr("virtual_size"), tx.vsize, "vB")}
    ${renderKeyValue(tr("weight"), tx.weight, "WU")}
    ${renderKeyValue(tr("total_out"), sBtcLabel(tx.total_out))}
  </section>

  <section class="tx-hash-card">
    <span>TXID</span>
    <span class="hash-with-copy">
      <a href="${explorer}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(tx.txid)}">${renderEdgeHash(tx.txid, "hash-edges")}</a>
      ${copyButton(tx.txid, "Copy TXID")}
    </span>
  </section>

  <section class="io-grid">
    <div class="io-panel">
      <h3>${escapeHtml(tr("inputs"))} (${escapeHtml(tx.inputs?.length || 0)})</h3>
      ${(tx.inputs || []).map(input => renderIoRow(input, "input")).join("")}
    </div>
    <div class="io-panel">
      <h3>${escapeHtml(tr("outputs"))} (${escapeHtml(tx.outputs?.length || 0)})</h3>
      ${(tx.outputs || []).map(output => renderIoRow(output, "output")).join("")}
    </div>
  </section>

  <section class="detail-grid">
    ${renderKeyValue(tr("total_in"), tx.total_in ? sBtcLabel(tx.total_in) : "-")}
    ${renderKeyValue(tr("version"), tx.version)}
    ${renderKeyValue(tr("locktime"), tx.locktime)}
    ${renderKeyValue("Height", tx.height)}
  </section>

  <section class="link-groups">
    <div><span>${escapeHtml(tr("dependencies"))}</span><div>${depends}</div></div>
    <div><span>${escapeHtml(tr("children"))}</span><div>${spentby}</div></div>
  </section>

  <details class="raw-hex">
    <summary>${escapeHtml(tr("raw_hex"))}</summary>
    <pre>${escapeHtml(tx.hex || "")}</pre>
  </details>

  <details class="decoded-json">
    <summary>${escapeHtml(tr("decoded_json"))}</summary>
    <pre>${escapeHtml(JSON.stringify(decoded, null, 2))}</pre>
  </details>`;
}

async function openTxDetail(txid){
  const modal = $("tx-modal");
  const body = $("tx-detail-body");
  $("tx-detail-title").innerHTML = `<span class="hash-with-copy">${renderEdgeHash(txid, "hash-edges")}${copyButton(txid, "Copy TXID")}</span>`;
  $("tx-detail-title").title = txid;
  setupEdgeHashes($("tx-detail-title"));
  body.innerHTML = `<div class="empty">${escapeHtml(tr("loading_tx"))}</div>`;
  modal.hidden = false;
  bringModalToFront(modal);
  refreshModalOpenState();
  try{
    const res = await fetch(`/api/mempool/tx/${encodeURIComponent(txid)}`);
    const tx = await res.json();
    if(!res.ok) throw new Error(tx.detail || res.statusText);
    $("tx-detail-title").innerHTML = `<span class="hash-with-copy">${renderEdgeHash(tx.txid, "hash-edges")}${copyButton(tx.txid, "Copy TXID")}</span>`;
    $("tx-detail-title").title = tx.txid;
    body.innerHTML = renderTxDetail(tx);
    setupEdgeHashes(modal);
    history.replaceState(null, "", `#tx=${encodeURIComponent(tx.txid)}`);
  }catch(e){
    body.innerHTML = `<div class="empty">${escapeHtml(tr("failed"))}: ${escapeHtml(e.message || e)}</div>`;
  }
}

function closeTxDetail(){
  $("tx-modal").hidden = true;
  refreshModalOpenState();
  if(location.hash.startsWith("#tx=")) history.replaceState(null, "", location.pathname + location.search);
}

function renderBlockTransactions(data){
  const transactions = data.transactions || [];
  const overview = `<section class="detail-overview block-overview">
    ${renderKeyValue(tr("block"), data.height ? `#${fmt(data.height)}` : `${tr("projected_block")} ${data.index || "-"}`)}
    ${renderKeyValue(tr("transactions"), fmt(data.tx_count ?? transactions.length))}
    ${renderKeyValue(tr("size"), data.vbytes || data.size || "-", data.vbytes ? "vB" : "bytes")}
    ${renderKeyValue(tr("fees"), data.fees !== undefined && data.fees !== null ? sBtcLabel(data.fees) : "-")}
    ${renderKeyValue("Hash", data.hash || "-")}
    ${renderKeyValue(tr("block_time"), data.time ? `${ago(data.time)} ${tr("ago")}` : "-")}
  </section>`;
  if(!transactions.length) return `${overview}<div class="empty">${escapeHtml(tr("no_block_txs"))}</div>`;
  const blockLabel = data.height ? fmt(data.height) : `${tr("projected_block")} ${data.index || "-"}`;
  blockTxRows = transactions;
  blockTxLabel = blockLabel;
  blockTxPage = 1;
  return `${overview}<section class="block-tx-list">
    <div class="table-head">
      <span>TXID</span>
      <span data-i18n="tx_projected_block">${escapeHtml(tr("tx_projected_block"))}</span>
      <span data-i18n="fee_rate">${escapeHtml(tr("fee_rate"))}</span>
      <span data-i18n="size">${escapeHtml(tr("size"))}</span>
      <span data-i18n="output">${escapeHtml(tr("output"))}</span>
    </div>
    <div id="block-tx-page-rows"></div>
    <div class="pagination block-pagination">
      <button id="block-tx-prev" type="button">${escapeHtml(tr("previous"))}</button>
      <span id="block-tx-page">-</span>
      <button id="block-tx-next" type="button">${escapeHtml(tr("next"))}</button>
    </div>
  </section>`;
}

async function openBlockTransactions(kind, identifier, displayHeight){
  const modal = $("block-modal");
  const body = $("block-detail-body");
  const title = kind === "mined" ? `${tr("block")} #${fmt(identifier)}` : `${tr("projected_block")} #${fmt(displayHeight || identifier)}`;
  $("block-detail-title").textContent = title;
  body.innerHTML = `<div class="empty">${escapeHtml(tr("loading_block"))}</div>`;
  modal.hidden = false;
  bringModalToFront(modal);
  refreshModalOpenState();
  try{
    const path = kind === "mined"
      ? `/api/blocks/${encodeURIComponent(identifier)}/txs`
      : `/api/mempool/projected-block/${encodeURIComponent(identifier)}`;
    const res = await fetch(path);
    const data = await res.json();
    if(!res.ok) throw new Error(data.detail || res.statusText);
    $("block-detail-title").textContent = kind === "mined"
      ? `${tr("block")} #${fmt(data.height || identifier)}`
      : `${tr("projected_block")} #${fmt(displayHeight || data.height || identifier)}`;
    body.innerHTML = renderBlockTransactions(data);
    renderBlockTxPage();
  }catch(e){
    body.innerHTML = `<div class="empty">${escapeHtml(tr("failed"))}: ${escapeHtml(e.message || e)}</div>`;
  }
}

function closeBlockTransactions(){
  $("block-modal").hidden = true;
  refreshModalOpenState();
}

function addressTxids(data){
  if(data.transactions?.length) return data.transactions;
  const txids = new Map();
  (data.mempool || []).forEach(match => {
    if(match.txid) txids.set(match.txid, { txid:match.txid, source:"mempool", amount:null, height:null });
  });
  (data.wallets || []).forEach(match => (match.txids || []).forEach(txid => txids.set(txid, {
    txid,
    source:`wallet ${match.wallet}`,
    amount:match.amount,
    height:null,
  })));
  (data.utxos || []).forEach(utxo => {
    if(!utxo.txid) return;
    txids.set(utxo.txid, {
      txid:utxo.txid,
      source:"utxo",
      amount:utxo.amount,
      height:utxo.height,
    });
  });
  return [...txids.values()];
}

function renderBalanceHistory(txs){
  const ordered = [...txs].sort((a,b)=>(a.block_time || 0) - (b.block_time || 0));
  let balance = 0;
  const points = ordered.map((tx, index) => {
    balance += sats(tx.value_to_address || 0) - sats(tx.value_from_address || 0);
    return { x:index, y:balance };
  });
  if(!points.length) points.push({ x:0, y:0 });
  const max = Math.max(...points.map(p => p.y), 1);
  const min = Math.min(...points.map(p => p.y), 0);
  const span = Math.max(1, max - min);
  const width = 720;
  const height = 220;
  const left = 54;
  const right = 20;
  const top = 18;
  const bottom = 30;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const xy = p => {
    const x = left + (points.length === 1 ? chartWidth : (p.x / (points.length - 1)) * chartWidth);
    const y = top + chartHeight - ((p.y - min) / span) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };
  const line = points.map(xy).join(" ");
  const area = `${left},${height-bottom} ${line} ${width-right},${height-bottom}`;
  return `<section class="address-section">
    <div class="address-section-title">
      <h3>${escapeHtml(tr("balance_history"))}</h3>
    </div>
    <svg class="balance-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Balance history">
      <line x1="${left}" y1="${top}" x2="${left}" y2="${height-bottom}" class="chart-axis"></line>
      <line x1="${left}" y1="${height-bottom}" x2="${width-right}" y2="${height-bottom}" class="chart-axis"></line>
      <text x="8" y="${top + 8}" class="chart-label">${escapeHtml(satsLabel(max))}</text>
      <text x="8" y="${height-bottom}" class="chart-label">${escapeHtml(satsLabel(min))}</text>
      <polygon points="${area}" class="chart-area"></polygon>
      <polyline points="${line}" class="chart-line"></polyline>
    </svg>
  </section>`;
}

function renderUtxoBubbles(utxos){
  const rotatingIndex = utxos.length ? Math.floor(Math.random() * utxos.length) : -1;
  return `<section class="address-section">
    <div class="address-section-title"><h3>${escapeHtml(tr("unspent_outputs"))}</h3></div>
    <div class="utxo-bubbles">
      ${utxos.length ? utxos.map((utxo, index) => {
        const amountSats = sats(utxo.amount);
        const size = Math.max(88, Math.min(150, 78 + Math.sqrt(Math.max(amountSats, 1)) * 0.75));
        const blockLabel = utxo.height ? `#${fmt(utxo.height)}` : "mempool";
        const valueAmount = fmt(amountSats);
        const voutLabel = utxo.vout === undefined || utxo.vout === null ? "-" : `vout ${utxo.vout}`;
        return `<button class="utxo-bubble coin-svg${index === rotatingIndex ? " coin-spin-once" : ""}" type="button" data-txid="${escapeHtml(utxo.txid || "")}" style="--bubble-size:${size}px">
          <span class="coin-shell">
            <span class="coin-side coin-front">
              <img class="coin-line-art" src="/static/img/abstract-linear-bitcoin-coin.svg" alt="" aria-hidden="true">
              <small class="coin-block">${escapeHtml(blockLabel)}</small>
              <strong class="coin-value"><span>${escapeHtml(valueAmount)}</span><small>s-sats</small></strong>
            </span>
            <span class="coin-side coin-back">
              <img class="coin-line-art" src="/static/img/abstract-linear-bitcoin-coin.svg" alt="" aria-hidden="true">
              <small class="coin-block">${escapeHtml(blockLabel)}</small>
              <strong class="coin-value"><span>${escapeHtml(voutLabel)}</span><small>output</small></strong>
            </span>
          </span>
        </button>`;
      }).join("") : `<div class="empty">${escapeHtml(tr("no_transactions"))}</div>`}
    </div>
  </section>`;
}

function renderAddressDetail(data){
  const chain = data.chain_stats || {};
  const mempool = data.mempool_stats || {};
  const balance = Number(data.balance ?? ((chain.funded_txo_sum || 0) - (chain.spent_txo_sum || 0) + (mempool.funded_txo_sum || 0) - (mempool.spent_txo_sum || 0)));
  const txs = addressTxids(data);
  const received = Number(chain.funded_txo_sum || 0) + Number(mempool.funded_txo_sum || 0);
  const sent = Number(chain.spent_txo_sum || 0) + Number(mempool.spent_txo_sum || 0);
  const safeAddress = escapeHtml(data.address);
  const encodedAddress = encodeURIComponent(data.address);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodedAddress}`;
  return `<section class="mempool-address-page">
    <div class="address-title-line">
      <div>
        <span>${escapeHtml(tr("address_detail"))}</span>
        <h2 title="${safeAddress}"><span class="hash-with-copy">${renderEdgeHash(data.address, "hash-edges")}${copyButton(data.address, tr("copy_address"))}</span></h2>
      </div>
      <div class="address-actions">
        <button class="icon-action" type="button" data-copy-address="${safeAddress}" title="${escapeHtml(tr("copy_address"))}" aria-label="${escapeHtml(tr("copy_address"))}">${iconSvg("copy")}</button>
        <button class="icon-action" type="button" data-qr-address="${safeAddress}" title="${escapeHtml(tr("show_qrcode"))}" aria-label="${escapeHtml(tr("show_qrcode"))}">${iconSvg("qr")}</button>
        <a class="icon-action" href="https://mempool.space/signet/address/${encodedAddress}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(tr("external_view"))}" aria-label="${escapeHtml(tr("external_view"))}">${iconSvg("external")}</a>
      </div>
    </div>
    <div class="address-qr-card" id="address-qr-card" hidden>
      <img src="${qrUrl}" alt="QR Code ${safeAddress}">
      <code>${safeAddress}</code>
    </div>

    <section class="address-reference-stats">
      <div class="address-reference-card">
        <div><span>${escapeHtml(tr("confirmed"))} ${escapeHtml(tr("balance").toLowerCase())}</span><strong>${escapeHtml(btc(balance))} <small>sBTC</small></strong><em>$0.00</em></div>
        <div><span>${escapeHtml(tr("confirmed"))} ${escapeHtml(tr("utxos"))}</span><strong>${escapeHtml(fmt((data.utxos || []).length))}</strong></div>
        <div><span>${escapeHtml(tr("received"))}</span><strong>${escapeHtml(btc(received))} <small>sBTC</small></strong></div>
      </div>
      <div class="address-reference-card">
        <div><span>${escapeHtml(tr("unconfirmed"))}</span><strong>+${escapeHtml(btc((mempool.funded_txo_sum || 0) - (mempool.spent_txo_sum || 0)))} <small>sBTC</small></strong><em>$0.00</em></div>
        <div><span>${escapeHtml(tr("unconfirmed"))} ${escapeHtml(tr("utxos"))}</span><strong>${escapeHtml(fmt(mempool.funded_txo_count || 0))}</strong></div>
        <div><span>${escapeHtml(tr("address_type"))}</span><strong><mark>${escapeHtml(data.address_type || "-")}</mark></strong></div>
      </div>
    </section>

    ${renderBalanceHistory(txs)}
    ${renderUtxoBubbles(data.utxos || [])}

  <section class="address-list">
    <h3>${escapeHtml(tr("transaction_history"))}</h3>
    ${txs.length ? txs.map(tx => `<div class="address-tx-row">
      <button class="hash-link address-tx-link" type="button" data-txid="${escapeHtml(tx.txid)}">${escapeHtml(tx.txid)}</button>
      <span>${escapeHtml(tx.status || tx.source || "-")}</span>
      <strong class="${Number(tx.value_from_address || 0) > Number(tx.value_to_address || tx.amount || 0) ? "sent" : "received"}">${escapeHtml(sBtcLabel(Math.abs(Number(tx.value_to_address ?? tx.amount ?? 0) - Number(tx.value_from_address || 0))))}</strong>
      <small>${tx.block_height ? `#${escapeHtml(fmt(tx.block_height))}` : "-"}</small>
    </div>`).join("") : `<div class="empty">${escapeHtml(tr("no_transactions"))}</div>`}
  </section>
  </section>`;
}

function renderAddressLoading(address){
  return `<section class="address-loading-card" aria-live="polite">
    <div class="wallet-loader" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    <div>
      <strong>${escapeHtml(tr("loading_address"))}</strong>
      <p>${escapeHtml(tr("loading_address_hint"))}</p>
      <code>${escapeHtml(address)}</code>
    </div>
  </section>`;
}

async function copyText(value){
  if(navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(value);
    return;
  }
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function stopAddressAutoRefresh(){
  if(addressRefreshTimer){
    clearInterval(addressRefreshTimer);
    addressRefreshTimer = null;
  }
}

async function refreshAddressDetail(address, options = {}){
  const body = $("address-detail-body");
  const requestId = ++addressRequestId;
  const params = options.bypassCache ? "?refresh=true" : "";
  try{
    const res = await fetch(`/api/search/address/${encodeURIComponent(address)}${params}`);
    const data = await res.json();
    if(requestId !== addressRequestId || $("address-modal").hidden || currentAddressDetail !== address) return;
    if(!res.ok) throw new Error(data.detail || res.statusText);
    $("address-detail-title").textContent = data.address;
    body.innerHTML = renderAddressDetail(data);
    setupEdgeHashes(body);
    history.replaceState(null, "", `#address=${encodeURIComponent(data.address)}`);
  }catch(e){
    if(requestId !== addressRequestId || $("address-modal").hidden || currentAddressDetail !== address) return;
    body.innerHTML = `<div class="empty">${escapeHtml(tr("failed"))}: ${escapeHtml(e.message || e)}</div>`;
  }
}

function startAddressAutoRefresh(address){
  stopAddressAutoRefresh();
  addressRefreshTimer = setInterval(() => {
    if(!$("address-modal").hidden && currentAddressDetail === address){
      refreshAddressDetail(address, { bypassCache:true });
    }
  }, 30000);
}

function openAddressDetail(address){
  const modal = $("address-modal");
  const body = $("address-detail-body");
  stopAddressAutoRefresh();
  currentAddressDetail = address;
  addressRequestId += 1;
  $("address-detail-title").textContent = address;
  body.innerHTML = renderAddressLoading(address);
  modal.hidden = false;
  bringModalToFront(modal);
  refreshModalOpenState();
  refreshAddressDetail(address);
  startAddressAutoRefresh(address);
}

function closeAddressDetail(){
  stopAddressAutoRefresh();
  currentAddressDetail = "";
  addressRequestId += 1;
  $("address-modal").hidden = true;
  refreshModalOpenState();
  if(location.hash.startsWith("#address=")) history.replaceState(null, "", location.pathname + location.search);
}

function openTxFromHash(){
  if(location.hash.startsWith("#tx=")){
    openTxDetail(decodeURIComponent(location.hash.slice(4)));
  }else if(location.hash.startsWith("#address=")){
    openAddressDetail(decodeURIComponent(location.hash.slice(9)));
  }
}

function nodeMetrics(){
  return [
    { id:"chain", label:tr("chain"), value:latestStatus.chain },
    { id:"blocks-height", label:tr("block_height"), value:latestStatus.blocks },
    { id:"sync", label:tr("sync"), value:latestStatus.verificationprogress },
    { id:"peers", label:tr("peers"), value:latestStatus.peers },
    { id:"headers", label:tr("headers"), value:latestStatus.headers },
    { id:"bytes", label:tr("mempool_bytes"), value:latestInfo.bytes },
    { id:"usage", label:tr("memory_usage"), value:latestInfo.usage },
    { id:"minfee", label:tr("min_fee"), value:latestInfo.mempoolminfee },
  ];
}

function searchItems(query){
  const q = query.trim().toLowerCase();
  if(!q) return [];
  const results = [];
  allTxs.forEach(tx => {
    if(String(tx.txid || "").toLowerCase().includes(q)){
      results.push({ type:"tx", id:tx.txid, title:"TXID", detail:short(tx.txid) });
    }
    (tx.addresses || []).forEach(address => {
      if(String(address || "").toLowerCase().includes(q)){
        results.push({ type:"address", id:address, title:`${tr("address")}: ${address}`, detail:short(tx.txid) });
      }
    });
  });
  latestMinedBlocks.forEach(block => {
    const height = String(block.height || "");
    const hash = String(block.hash || "").toLowerCase();
    if(height.includes(q) || hash.includes(q)){
      results.push({ type:"block", id:height, title:`${tr("block")} #${fmt(block.height)}`, detail:block.hash ? short(block.hash) : `${ago(block.time)} ${tr("ago")}` });
    }
  });
  latestProjectedBlocks.forEach((block, index) => {
    const height = String(projectedHeightValue(block, index));
    if(height.includes(q)){
      results.push({ type:"block", id:height, title:`${tr("projected_block")} #${fmt(height)}`, detail:`${fmt(block.tx_count)} ${tr("txs")}` });
    }
  });
  nodeMetrics().forEach(item => {
    const haystack = `${item.label} ${item.value ?? ""}`.toLowerCase();
    if(haystack.includes(q)){
      results.push({ type:"metric", id:item.id, title:`${tr("metric")}: ${item.label}`, detail:fmt(item.value) });
    }
  });
  return results.slice(0, 10);
}

const looksLikeAddress = query => /^(tb1|bcrt1|bc1|[mn2])[a-zA-Z0-9]{12,90}$/.test(query.trim());

function addressSearchResults(data){
  const results = [];
  const count = (data.mempool || []).length + (data.wallets || []).length + (data.utxos || []).length;
  if(count){
    results.push({ type:"address", id:data.address, title:`${tr("address")}: ${data.address}`, detail:`${count} ${tr("recent_transactions").toLowerCase()}` });
  }
  (data.mempool || []).forEach(match => {
    results.push({ type:"tx", id:match.txid, title:`${tr("address")}: ${data.address}`, detail:`mempool ${short(match.txid)}` });
  });
  (data.wallets || []).forEach(match => {
    const txid = match.txids?.[0];
    results.push({ type:txid ? "tx" : "metric", id:txid || "headers", title:`${tr("address")}: ${data.address}`, detail:`wallet ${match.wallet}` });
  });
  (data.utxos || []).forEach(match => {
    results.push({ type:"tx", id:match.txid, title:`${tr("address")}: ${data.address}`, detail:`UTXO ${sBtcLabel(match.amount)}` });
  });
  return results.filter(result => result.id).slice(0, 10);
}

async function renderSearchResults(query){
  const box = $("node-search-results");
  if(!box) return;
  const requestId = ++searchRequestId;
  latestSearchResults = searchItems(query);
  if(!query.trim()){
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  if(!latestSearchResults.length){
    if(looksLikeAddress(query)){
      box.hidden = false;
      box.innerHTML = `<div class="search-empty">...</div>`;
      try{
        const res = await fetch(`/api/search/address/${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if(requestId !== searchRequestId) return;
        if(res.ok) latestSearchResults = addressSearchResults(data);
      }catch(_e){
        if(requestId !== searchRequestId) return;
      }
      if(latestSearchResults.length){
        box.hidden = false;
        box.innerHTML = latestSearchResults.map((result, index) => `<button type="button" class="search-result" data-result-index="${index}">
          <strong>${escapeHtml(result.title)}</strong>
          <span>${escapeHtml(result.detail || "")}</span>
        </button>`).join("");
        return;
      }
    }
    box.hidden = false;
    box.innerHTML = `<div class="search-empty">${escapeHtml(tr("search_no_results"))}</div>`;
    return;
  }
  box.hidden = false;
  box.innerHTML = latestSearchResults.map((result, index) => `<button type="button" class="search-result" data-result-index="${index}">
    <strong>${escapeHtml(result.title)}</strong>
    <span>${escapeHtml(result.detail || "")}</span>
  </button>`).join("");
}

function flashElement(element){
  if(!element) return;
  element.classList.remove("focus-flash");
  element.scrollIntoView({ behavior:"smooth", block:"center", inline:"center" });
  requestAnimationFrame(() => element.classList.add("focus-flash"));
}

function selectSearchResult(result){
  if(!result) return;
  $("node-search-results").hidden = true;
  if(result.type === "tx"){
    openTxDetail(result.id);
    return;
  }
  if(result.type === "address"){
    openAddressDetail(result.id);
    return;
  }
  if(result.type === "block"){
    const block = document.querySelector(`[data-block-height="${CSS.escape(result.id)}"]`);
    if(block?.parentElement) block.parentElement.scrollLeft = Math.max(0, block.offsetLeft - 20);
    flashElement(block);
    return;
  }
  if(result.type === "metric"){
    flashElement($(result.id)?.closest(".metric, .status-strip div, .summary-card") || $(result.id));
  }
}

async function load(){
  try{
    const [status, info, txData, blockData, minedData] = await Promise.all([
      fetch("/api/status").then(r=>r.json()),
      fetch("/api/mempool").then(r=>r.json()),
      fetch("/api/mempool/txs?limit=120").then(r=>r.json()),
      fetch("/api/mempool/blocks").then(r=>r.json()),
      fetch(`/api/blocks/recent?limit=${MINED_BLOCK_LIMIT}`).then(async r=>{
        const data = await r.json();
        if(!r.ok) throw new Error(data.detail?.[0]?.msg || data.detail || r.statusText);
        return data;
      })
    ]);
    latestStatus = status;
    latestInfo = info;

    $("tx-count").textContent = fmt(info.size);
    $("chain").textContent = status.chain ?? "-";
    $("blocks-height").textContent = fmt(status.blocks);
    currentTip = Number(status.blocks || 0);
    $("headers").textContent = fmt(status.headers);
    $("sync").textContent = `${status.verificationprogress ?? "-"}%`;
    $("peers").textContent = fmt(status.peers);
    $("bytes").textContent = fmt(info.bytes);
    $("bytes-card").textContent = fmt(info.bytes);
    $("usage").textContent = fmt(info.usage);
    $("minfee").textContent = info.mempoolminfee === undefined || info.mempoolminfee === null ? "-" : `${info.mempoolminfee} sBTC/kvB`;

    const rates = (txData.txs || []).map(x => x.fee_rate).filter(x => x !== null && x !== undefined).map(Number);
    $("fee-high").textContent = percentile(rates, 80);
    $("fee-medium").textContent = percentile(rates, 50);
    $("fee-low").textContent = percentile(rates, 20);

    latestProjectedBlocks = blockData.blocks || [];
    latestMinedBlocks = minedData.blocks || [];
    renderBlocks(latestProjectedBlocks);
    renderMinedBlocks(minedData);
    const previousFirstTx = allTxs[0]?.txid;
    allTxs = (txData.txs || []).sort((a,b)=>txTime(b) - txTime(a) || String(a.txid || "").localeCompare(String(b.txid || "")));
    if(previousFirstTx !== allTxs[0]?.txid) txPage = 1;
    renderTxPage();
    $("updated").textContent = new Date().toLocaleTimeString(currentLang);
    if(typeof window.markRefreshed === "function") window.markRefreshed();
  }catch(e){
    $("tx-list").innerHTML = `<div class="empty">${escapeHtml(tr("failed"))}: ${escapeHtml(e)}</div>`;
  }
}

function enableDragScroll(row){
  if(!row) return;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let releaseTimer = null;

  const maxScroll = () => Math.max(0, row.scrollWidth - row.clientWidth);
  const setElastic = offset => row.style.setProperty("--elastic-offset", `${offset}px`);
  const releaseElastic = () => {
    window.clearTimeout(releaseTimer);
    row.classList.add("elastic-release");
    setElastic(0);
    releaseTimer = window.setTimeout(() => row.classList.remove("elastic-release"), 240);
  };

  row.addEventListener("pointerdown", event => {
    if(event.button !== 0) return;
    if(event.target.closest("button, a, input, textarea, select")) return;
    dragging = true;
    startX = event.clientX;
    startScroll = row.scrollLeft;
    row.classList.add("dragging");
    row.classList.remove("elastic-release");
    row.setPointerCapture?.(event.pointerId);
  });

  row.addEventListener("pointermove", event => {
    if(!dragging) return;
    event.preventDefault();
    const target = startScroll - (event.clientX - startX);
    const max = maxScroll();
    const clamped = Math.max(0, Math.min(max, target));
    row.scrollLeft = clamped;
    if(target < 0){
      setElastic(Math.min(42, Math.abs(target) * 0.22));
    }else if(target > max){
      setElastic(-Math.min(42, Math.abs(target - max) * 0.22));
    }else{
      setElastic(0);
    }
  });

  const stop = event => {
    if(!dragging) return;
    dragging = false;
    row.classList.remove("dragging");
    releaseElastic();
    row.releasePointerCapture?.(event.pointerId);
  };
  row.addEventListener("pointerup", stop);
  row.addEventListener("pointercancel", stop);
  row.addEventListener("pointerleave", stop);
  row.addEventListener("wheel", event => {
    const max = maxScroll();
    if(!max) return;
    const movingLeftPastStart = row.scrollLeft <= 0 && event.deltaX < 0;
    const movingRightPastEnd = row.scrollLeft >= max - 1 && event.deltaX > 0;
    if(!movingLeftPastStart && !movingRightPastEnd) return;
    setElastic(movingLeftPastStart ? Math.min(26, Math.abs(event.deltaX) * 0.18) : -Math.min(26, Math.abs(event.deltaX) * 0.18));
    releaseElastic();
  }, { passive: true });
}

setLang(currentLang);

// Cog menu (shared header)
const _cogToggle = $("settings-toggle");
const _cogPopover = $("settings-popover");
if(_cogToggle && _cogPopover){
  _cogToggle.addEventListener("click", () => {
    const next = !_cogPopover.hidden;
    _cogPopover.hidden = next;
    _cogToggle.setAttribute("aria-expanded", String(!next));
  });
  document.addEventListener("click", e => {
    if(e.target.closest(".settings-menu")) return;
    _cogPopover.hidden = true;
    _cogToggle.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", e => {
    if(e.key !== "Escape") return;
    _cogPopover.hidden = true;
    _cogToggle.setAttribute("aria-expanded", "false");
  });
}

document.querySelectorAll("[data-lang]").forEach(btn => btn.addEventListener("click", () => {
  setLang(btn.dataset.lang);
  if(_cogPopover) _cogPopover.hidden = true;
  if(_cogToggle) _cogToggle.setAttribute("aria-expanded", "false");
  load();
}));
$("refresh")?.addEventListener("click", load);
$("tx-prev")?.addEventListener("click", () => {
  txPage -= 1;
  renderTxPage();
});
$("tx-next")?.addEventListener("click", () => {
  txPage += 1;
  renderTxPage();
});
$("node-search-input")?.addEventListener("input", event => renderSearchResults(event.target.value));
$("node-search")?.addEventListener("submit", event => {
  event.preventDefault();
  const query = $("node-search-input")?.value || "";
  renderSearchResults(query);
  const exactTx = /^[0-9a-fA-F]{64}$/.test(query.trim()) ? { type:"tx", id:query.trim() } : null;
  selectSearchResult(latestSearchResults[0] || exactTx);
});
$("node-search-results")?.addEventListener("click", event => {
  const item = event.target.closest(".search-result");
  if(!item) return;
  selectSearchResult(latestSearchResults[Number(item.dataset.resultIndex)]);
});
$("tx-list")?.addEventListener("click", event => {
  const link = event.target.closest(".tx-link");
  if(link?.dataset.txid){
    event.preventDefault();
    openTxDetail(link.dataset.txid);
  }
});
document.querySelectorAll("[data-close-tx]").forEach(el => el.addEventListener("click", closeTxDetail));
document.querySelectorAll("[data-close-address]").forEach(el => el.addEventListener("click", closeAddressDetail));
document.querySelectorAll("[data-close-block]").forEach(el => el.addEventListener("click", closeBlockTransactions));
document.addEventListener("keydown", event => {
  if(event.key === "Escape"){
    const modal = topVisibleModal();
    if(modal?.id === "tx-modal") closeTxDetail();
    else if(modal?.id === "address-modal") closeAddressDetail();
    else if(modal?.id === "block-modal") closeBlockTransactions();
  }
  if(event.key === "Escape") $("node-search-results") && ($("node-search-results").hidden = true);
});
document.addEventListener("click", event => {
  if(!event.target.closest(".node-search")) $("node-search-results") && ($("node-search-results").hidden = true);
  const nestedTxLink = event.target.closest(".tx-link");
  if(nestedTxLink?.dataset.txid && !event.target.closest("#tx-list")){
    event.preventDefault();
    openTxDetail(nestedTxLink.dataset.txid);
    return;
  }
  const blockButton = event.target.closest(".block-height-button");
  if(blockButton?.dataset.blockKind){
    event.preventDefault();
    event.stopPropagation();
    const id = blockButton.dataset.blockKind === "mined" ? blockButton.dataset.blockHeight : blockButton.dataset.blockIndex;
    openBlockTransactions(blockButton.dataset.blockKind, id, blockButton.dataset.blockHeight);
    return;
  }
  const blockTxButton = event.target.closest(".block-tx-open");
  if(blockTxButton?.dataset.txid){
    event.preventDefault();
    openTxDetail(blockTxButton.dataset.txid);
    return;
  }
  if(event.target.closest("#block-tx-prev")){
    event.preventDefault();
    blockTxPage -= 1;
    renderBlockTxPage();
    return;
  }
  if(event.target.closest("#block-tx-next")){
    event.preventDefault();
    blockTxPage += 1;
    renderBlockTxPage();
    return;
  }
  const copyButton = event.target.closest("[data-copy-address]");
  if(copyButton?.dataset.copyAddress){
    copyText(copyButton.dataset.copyAddress).then(() => {
      copyButton.classList.add("copied");
      copyButton.setAttribute("title", tr("copied"));
      window.setTimeout(() => {
        copyButton.classList.remove("copied");
        copyButton.setAttribute("title", tr("copy_address"));
      }, 1200);
    }).catch(() => {});
  }
  const qrButton = event.target.closest("[data-qr-address]");
  if(qrButton?.dataset.qrAddress){
    const card = $("address-qr-card");
    if(card) card.hidden = !card.hidden;
  }
  const addressLink = event.target.closest(".address-link");
  if(addressLink?.dataset.address){
    event.preventDefault();
    openAddressDetail(addressLink.dataset.address);
  }
  const addressTxLink = event.target.closest(".address-tx-link");
  if(addressTxLink?.dataset.txid){
    event.preventDefault();
    openTxDetail(addressTxLink.dataset.txid);
  }
});
window.addEventListener("hashchange", openTxFromHash);
$("blocks").innerHTML = `<div class="loading">${escapeHtml(tr("loading_blocks"))}</div>`;
$("mined-blocks").innerHTML = `<div class="loading">${escapeHtml(tr("loading_blocks"))}</div>`;
$("tx-list").innerHTML = `<div class="empty">${escapeHtml(tr("loading_txs"))}</div>`;
enableDragScroll($("blocks"));
enableDragScroll($("mined-blocks"));
load();
const _refreshMs = (parseInt(document.body.dataset.refreshInterval, 10) || 5) * 1000;
setInterval(load, _refreshMs);
if(typeof window.startCountdown === "function") window.startCountdown(_refreshMs / 1000);
openTxFromHash();
