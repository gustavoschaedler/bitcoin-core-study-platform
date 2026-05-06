const translations = {
  "pt-BR": {
    hero_title: "Plataforma de estudos do Bitcoin Core",
    hero_text: "Plataforma de estudos do Bitcoin Core, cobrindo comandos via bitcoin-cli, mempool, padrões de comunicação RPC e ZMQ, e assinatura de transações no ambiente Signet.",
    faucet_title: "Faucet Signet",
    faucet_text: "Solicite moedas de teste e inspecione transações geradas.",
    faucet_page_text: "Solicite moedas Signet para experimentos locais com transações e RPC.",
    mempool_title: "Explorador de mempool",
    mempool_text: "Interface inspirada na mempool.space usando apenas HTML, CSS e JavaScript.",
    wallet_title: "Laboratório de carteira e assinatura",
    wallet_text: "Crie carteiras, gere endereços, crie PSBTs e assine transações.",
    stats_title: "Estatísticas dos containers",
    stats_text: "Monitore CPU, memória, disco e rede de todos os containers.",
    study_docs: "Documentação de estudo",
    study_docs_text: "Leia notas locais sobre Bitcoin Core, RPC, ZMQ e carteiras.",
    api_text: "Explore endpoints de API baseados em RPC.",
    display_title: "Display HDMI",
    display_text: "Dashboard do nó em estilo hardware wallet para tela local.",
    commands_title: "Scripts úteis",
    request_coins: "Solicitar moedas",
    send_coins: "Enviar moedas",
    node_stats: "Estatísticas do nó",
    back_home: "← Início",
    amount: "Valor",
    cooldown: "Espera",
    signet_address: "Endereço Signet",
    ready: "Pronto.",
    blocks: "Blocos",
    peers: "Pares",
    mempool: "Mempool",
    balance: "Saldo",
    fastapi_docs: "Documentação FastAPI",
    language: "Idioma"
  },
  "en-GB": {
    hero_title: "Bitcoin Core study platform",
    hero_text: "Bitcoin Core study platform, covering its commands via bitcoin-cli, mempool, RPC and ZMQ communication patterns, and transaction signing in the Signet environment.",
    faucet_title: "Signet faucet",
    faucet_text: "Request test coins and inspect generated transactions.",
    faucet_page_text: "Request Signet coins for local transaction and RPC experiments.",
    mempool_title: "Mempool explorer",
    mempool_text: "A mempool.space-inspired interface using only HTML, CSS and JavaScript.",
    wallet_title: "Wallet and signing lab",
    wallet_text: "Create wallets, derive addresses, create PSBTs and sign transactions.",
    stats_title: "Container stats",
    stats_text: "Monitor CPU, memory, disk I/O and network usage for all containers.",
    study_docs: "Study docs",
    study_docs_text: "Read local Bitcoin Core, RPC, ZMQ and wallet notes.",
    api_text: "Explore RPC-backed API endpoints.",
    display_title: "HDMI display",
    display_text: "Hardware-wallet-style node dashboard for a local screen.",
    commands_title: "Useful scripts",
    request_coins: "Request coins",
    send_coins: "Send coins",
    node_stats: "Node stats",
    back_home: "← Home",
    amount: "Amount",
    cooldown: "Cooldown",
    signet_address: "Signet address",
    ready: "Ready.",
    blocks: "Blocks",
    peers: "Peers",
    mempool: "Mempool",
    balance: "Balance",
    fastapi_docs: "FastAPI docs",
    language: "Language"
  }
};

function setLang(lang){
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (translations[lang]?.[key]) el.textContent = translations[lang][key];
  });
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

const defaultLang = document.body.dataset.defaultLang || "pt-BR";
const lang = localStorage.getItem("lang") || defaultLang;
setLang(lang);
document.querySelectorAll("[data-lang]").forEach((btn) => btn.addEventListener("click", () => {
  setLang(btn.dataset.lang);
  const popover = document.getElementById("settings-popover");
  const toggle = document.getElementById("settings-toggle");
  if(popover && toggle){
    popover.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }
}));

const settingsToggle = document.getElementById("settings-toggle");
const settingsPopover = document.getElementById("settings-popover");
if(settingsToggle && settingsPopover){
  settingsToggle.addEventListener("click", () => {
    const nextHidden = !settingsPopover.hidden;
    settingsPopover.hidden = nextHidden;
    settingsToggle.setAttribute("aria-expanded", String(!nextHidden));
  });
  document.addEventListener("click", (event) => {
    if(event.target.closest(".settings-menu")) return;
    settingsPopover.hidden = true;
    settingsToggle.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", (event) => {
    if(event.key !== "Escape") return;
    settingsPopover.hidden = true;
    settingsToggle.setAttribute("aria-expanded", "false");
  });
}
