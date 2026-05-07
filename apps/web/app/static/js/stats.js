const translations = {
  "pt-BR": {
    title:"Estatísticas dos containers", subtitle:"CPU, memória, rede e I/O de disco para todos os containers do projeto.",
    back_home:"← Início", loading:"Carregando...", disabled:"Estatísticas de containers desativadas.",
    cpu:"CPU", memory:"Memória", network:"Rede RX/TX", block:"Bloco R/W", disk:"Disco", writable:"gravável", refresh:"Atualizar", live:"Status live", updated:"Atualizado"
  },
  "en-GB": {
    title:"Container stats", subtitle:"CPU, memory, network and disk I/O for all project containers.",
    back_home:"← Home", loading:"Loading...", disabled:"Container stats are disabled.",
    cpu:"CPU", memory:"Memory", network:"Network RX/TX", block:"Block R/W", disk:"Disk", writable:"writable", refresh:"Refresh", live:"Live status", updated:"Updated"
  }
};
let currentLang = localStorage.getItem("lang")||document.body.dataset.defaultLang||"pt-BR";
function tr(key){return translations[currentLang]?.[key]||translations["en-GB"][key]||key}
function setLang(lang){currentLang=translations[lang]?lang:"pt-BR";localStorage.setItem("lang",currentLang);document.documentElement.lang=currentLang;document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(translations[currentLang]?.[k])el.textContent=translations[currentLang][k]});document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===currentLang))}
setLang(currentLang);
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{setLang(b.dataset.lang);load()}));
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
const fmtBytes = n => {if(!n)return "0 B"; const u=["B","KB","MB","GB","TB"]; let i=0; while(n>=1024&&i<u.length-1){n/=1024;i++} return `${n.toFixed(1)} ${u[i]}`};
async function load(){
  try{
    const data=await fetch("/api/container-stats").then(r=>r.json());
    if(data.enabled===false || !Array.isArray(data.containers)){
      document.getElementById("cards").innerHTML=`<div class="empty">${escapeHtml(data.message||tr("disabled"))}</div>`;
      return;
    }
    document.getElementById("cards").innerHTML=data.containers.map(c=>`<article class="card"><h2>${escapeHtml(c.name)}</h2><div>${escapeHtml(c.image)}</div><div class="status">${escapeHtml(c.status)}</div><div class="grid"><div class="metric"><span>${escapeHtml(tr("cpu"))}</span><strong>${escapeHtml(c.cpu_percent??"-")}%</strong></div><div class="metric"><span>${escapeHtml(tr("memory"))}</span><strong>${escapeHtml(fmtBytes(c.mem_usage))} / ${escapeHtml(fmtBytes(c.mem_limit))}</strong></div><div class="metric"><span>${escapeHtml(tr("disk"))}</span><strong>${escapeHtml(fmtBytes(c.disk_size))}</strong><small>${escapeHtml(fmtBytes(c.disk_rw))} ${escapeHtml(tr("writable"))}</small></div><div class="metric"><span>${escapeHtml(tr("network"))}</span><strong>${escapeHtml(fmtBytes(c.net_rx))} / ${escapeHtml(fmtBytes(c.net_tx))}</strong></div><div class="metric"><span>${escapeHtml(tr("block"))}</span><strong>${escapeHtml(fmtBytes(c.block_read))} / ${escapeHtml(fmtBytes(c.block_write))}</strong></div></div></article>`).join("");
    document.getElementById("updated-at").textContent=`${tr("updated")} ${new Date().toLocaleTimeString(currentLang)}`;
  }catch(e){
    document.getElementById("cards").innerHTML=`<div class="empty">${escapeHtml(e)}</div>`;
  }
}
document.getElementById("refresh-stats")?.addEventListener("click", load);
load();setInterval(load,30000);
