/* =====================================================================
 *  CONFIGURAÇÃO — ARTHUR, EDITE AQUI  ✏️
 * ===================================================================== */
const CONFIG = {
  // Dica da combinação do cadeado (fase 3). Troque quando decidir o código.
  LOCK_HINT: "Os números estão na nossa história.",

  // Onde a caixinha está escondida (fase 3). Ex.: "embaixo da nossa cama".
  // Deixe genérico se quiser que ela procure mais.
  BOX_HINT: "aqui por perto",

  // (Opcional) Se o cartão dentro da caixinha tiver um QR, coloque aqui a URL
  // completa dele. Aí o botão da câmera aparece na fase 3 e leva até lá.
  // Vazio = fase 3 não mostra câmera (o cartão físico guia o próximo passo).
  FINAL_QR_URL: "",
  FINAL_CODE: "",   // código digitável opcional para o FINAL_QR_URL
};
/* ===================================================================== */

const STEPS = [
  { token: "7e2d624bb694", code: "43C6J", seal: "💌",
    kicker: "Pri, chegou uma carta pra você", headline: "Uma aventura começa aqui",
    title: "Meu amor,",
    body: () => ["Algo que você ama pode derreter, então coloquei no lugar mais frio da casa."],
    hint: "Encontrou o próximo código? Toque na câmera 📷" },
  { token: "2d7e6b2c6a9a", code: "4TA6N", seal: "🍫",
    kicker: "Você achou! Mais uma carta pra você", headline: "O caminho continua",
    title: "Pra adoçar o caminho…",
    body: () => [
      "Esse chocolate é só um mimo pra você seguir em frente.",
      "Agora procure onde moram histórias que não fazem barulho: elas têm capa, mas não sentem frio; têm folhas, mas não são árvores.",
      "Uma delas está guardando o próximo passo pra você."],
    hint: "Encontrou o próximo código? Toque na câmera 📷" },
  { token: "9bf3e1d763c5", code: "YXNC9", seal: "🔐",
    kicker: "Você está indo tão bem", headline: "Quase lá…",
    title: "Algumas coisas a gente guarda a sete chaves,",
    body: () => [
      "e essa é uma delas.",
      "Procure uma caixinha trancada " + CONFIG.BOX_HINT + ". Pra abrir, você vai precisar de alguns números…",
      CONFIG.LOCK_HINT,
      "Quando conseguir abrir, o que estiver lá dentro vai te dizer o que fazer. ❤️"],
    hint: "" },
];

const KEY = "nmc_progress_v1";
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const norm = s => String(s || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

function getProgress() { try { return parseInt(localStorage.getItem(KEY) || "0", 10) || 0; } catch (e) { return -1; } }
function setProgress(n) { try { if (n > getProgress()) localStorage.setItem(KEY, String(n)); } catch (e) {} }

/* ---------- background ---------- */
function hearts() {
  for (let i = 0; i < 22; i++) {
    const e = el("div", "h"); e.textContent = ["❤️", "💕", "💗", "🤍"][i % 4];
    e.style.left = Math.random() * 100 + "vw"; e.style.fontSize = 14 + Math.random() * 24 + "px";
    e.style.animationDuration = 8 + Math.random() * 9 + "s"; e.style.animationDelay = -Math.random() * 14 + "s";
    document.body.appendChild(e);
  }
  for (let i = 0; i < 14; i++) {
    const s = el("div", "sparkle"); s.style.left = Math.random() * 100 + "vw"; s.style.top = Math.random() * 100 + "vh";
    s.style.animationDelay = -Math.random() * 3 + "s"; document.body.appendChild(s);
  }
}

function progressPill(n) {
  const p = el("div", "progress");
  p.innerHTML = `<span>Fase ${n} de 3</span><span class="dots">${[1, 2, 3].map(i => `<span class="dot ${i <= n ? "on" : ""}">❤️</span>`).join("")}</span>`;
  return p;
}

/* ---------- next-step matching ---------- */
function nextTarget(stepIdx) {
  const nx = STEPS[stepIdx + 1];
  if (nx) return { match: t => t.includes(nx.token) || norm(t) === nx.code, url: "../" + nx.token + "/", code: nx.code };
  if (CONFIG.FINAL_QR_URL) {
    const u = CONFIG.FINAL_QR_URL.replace(/\/+$/, "");
    return { match: t => t.trim().replace(/\/+$/, "") === u || (CONFIG.FINAL_CODE && norm(t) === norm(CONFIG.FINAL_CODE)), url: CONFIG.FINAL_QR_URL };
  }
  return null;
}
function wrongMsg(text, stepIdx) {
  const other = STEPS.findIndex(s => text.includes(s.token) || norm(text) === s.code);
  if (other > -1 && other <= stepIdx) return "Esse você já encontrou 😉 Procure o próximo!";
  return "Hmm, esse não é o código certo… tenta de novo ❤️";
}
function celebrate(url) {
  const s = el("div", "success", "<span>💖</span>"); document.body.appendChild(s);
  if (navigator.vibrate) try { navigator.vibrate([60, 40, 60]); } catch (e) {}
  setTimeout(() => { location.href = url; }, 900);
}

/* ---------- code typing overlay ---------- */
function openTyping(opts) {
  const ov = el("div", "overlay");
  ov.innerHTML = `<h3 class="ov-title">${esc(opts.title)}</h3>
    <p style="margin:0 0 18px;text-align:center;opacity:.9">${esc(opts.sub)}</p>
    <input class="codeinput" maxlength="8" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" aria-label="código">
    <div class="ov-msg"></div>
    <div class="ov-row"><button class="btn ghost" data-x>Voltar</button><button class="btn" data-ok>Abrir ❤️</button></div>`;
  document.body.appendChild(ov);
  const inp = $("input", ov), msg = $(".ov-msg", ov);
  setTimeout(() => inp.focus(), 100);
  const close = () => ov.remove();
  const submit = () => {
    const r = opts.check(inp.value);
    if (r === true) { close(); return; }
    msg.textContent = r; msg.className = "ov-msg err"; inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake");
  };
  $("[data-x]", ov).onclick = close; $("[data-ok]", ov).onclick = submit;
  inp.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
}

/* ---------- QR scanner overlay ---------- */
let scanState = null;
async function openScanner(stepIdx) {
  const target = nextTarget(stepIdx);
  const ov = el("div", "overlay");
  ov.innerHTML = `<h3 class="ov-title">Aponte para o código ❤️</h3>
    <div class="scanbox"><video playsinline muted autoplay></video><div class="frame"></div><div class="line"></div></div>
    <div class="ov-msg">Abrindo a câmera…</div>
    <div class="ov-row"><button class="btn ghost" data-x>Fechar</button><button class="btn ghost" data-type>Digitar código</button></div>`;
  document.body.appendChild(ov);
  const video = $("video", ov), msg = $(".ov-msg", ov);
  const st = scanState = { stop: false, stream: null, lastWrong: 0 };
  const close = () => { st.stop = true; if (st.stream) st.stream.getTracks().forEach(t => t.stop()); ov.remove(); };
  $("[data-x]", ov).onclick = close;
  $("[data-type]", ov).onclick = () => { close(); typeNext(stepIdx); };

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    msg.textContent = "Seu navegador não abriu a câmera. Toque em “Digitar código” 😉"; msg.className = "ov-msg err"; return;
  }
  try {
    st.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
  } catch (e) {
    msg.textContent = "Não consegui usar a câmera (talvez a permissão foi negada). Toque em “Digitar código” 😉"; msg.className = "ov-msg err"; return;
  }
  if (st.stop) { st.stream.getTracks().forEach(t => t.stop()); return; }
  video.srcObject = st.stream;
  try { await video.play(); } catch (e) {}
  msg.textContent = "Procurando…";

  let detector = null;
  if ("BarcodeDetector" in window) { try { detector = new BarcodeDetector({ formats: ["qr_code"] }); } catch (e) {} }
  const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d", { willReadFrequently: true });

  const onText = text => {
    if (target && target.match(text)) { close(); celebrate(target.url); return true; }
    const now = Date.now();
    if (now - st.lastWrong > 1500) { st.lastWrong = now; msg.textContent = wrongMsg(text, stepIdx); msg.className = "ov-msg err"; }
    return false;
  };
  const tick = async () => {
    if (st.stop) return;
    if (video.readyState >= 2 && video.videoWidth) {
      try {
        if (detector) {
          const codes = await detector.detect(video);
          for (const c of codes) if (onText(c.rawValue)) return;
        } else if (window.jsQR) {
          const w = video.videoWidth, h = video.videoHeight, s = Math.min(1, 720 / Math.max(w, h));
          canvas.width = w * s | 0; canvas.height = h * s | 0;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const r = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
          if (r && r.data && onText(r.data)) return;
        }
      } catch (e) { if (detector) detector = null; } // fall back to jsQR
    }
    setTimeout(() => requestAnimationFrame(tick), 120);
  };
  tick();
}

function typeNext(stepIdx) {
  const target = nextTarget(stepIdx);
  openTyping({
    title: "Digitar código", sub: "É o código escrito embaixo do QR que você encontrou.",
    check: v => { if (target && target.match(v)) { celebrate(target.url); return true; } return wrongMsg(v, stepIdx); }
  });
}

/* ---------- screens ---------- */
function renderStep(app, idx) {
  const s = STEPS[idx];
  app.append(progressPill(idx + 1));
  app.append(el("p", "kicker", esc(s.kicker)));
  app.append(el("h1", "headline", esc(s.headline)));
  const stage = el("div", "stage");
  const env = el("div", "envelope");
  env.setAttribute("role", "button"); env.setAttribute("tabindex", "0"); env.setAttribute("aria-label", "Abrir a carta");
  env.innerHTML = `<div class="env-back"></div><div class="env-letter">Pri ❤️</div><div class="env-front"></div><div class="env-flap"></div><div class="seal">${s.seal}</div>`;
  const tap = el("p", "tap", "Toque para abrir");
  stage.append(env, tap); app.append(stage);

  let opened = false;
  const open = () => {
    if (opened) return; opened = true;
    if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
    env.classList.add("open"); tap.style.visibility = "hidden";
    setTimeout(() => env.classList.add("gone"), 1500);
    setTimeout(() => { stage.remove(); app.querySelector(".headline").remove(); app.querySelector(".kicker").remove(); showLetter(app, idx); }, 2050);
  };
  env.addEventListener("click", open);
  env.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
}

function showLetter(app, idx) {
  const s = STEPS[idx];
  const card = el("article", "card");
  const paras = s.body();
  card.innerHTML = `<h2>${esc(s.title)}</h2><div class="body">${paras.map((p, i) => `<p style="animation-delay:${0.5 + i * 0.9}s">${esc(p)}</p>`).join("")}</div>
    <div class="sign" style="animation-delay:${0.6 + paras.length * 0.9}s">– Arthur</div>`;
  app.append(card);
  const delay = 1.2 + paras.length * 0.9;
  if (s.hint) { const h = el("p", "hint", esc(s.hint)); h.style.animationDelay = delay + "s"; app.append(h); }
  if (nextTarget(idx)) {
    const bar = el("div", "actions");
    bar.innerHTML = `<div class="inner"><button class="typebtn" data-type>⌨️ digitar código</button>
      <button class="cambtn" data-cam aria-label="Abrir câmera"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.8"/></svg></button></div>`;
    document.body.append(bar);
    setTimeout(() => bar.classList.add("show"), delay * 1000);
    $("[data-cam]", bar).onclick = () => openScanner(idx);
    $("[data-type]", bar).onclick = () => typeNext(idx);
  }
}

function renderLocked(app, idx) {
  const box = el("div", "locked");
  box.innerHTML = `<div class="big">🙈</div><h1 class="headline">Ainda não é hora</h1>
    <p>Essa parte da aventura ainda está guardadinha. Comece do começo ❤️</p>
    <button class="link" data-unlock>Já passei pela fase anterior</button>`;
  app.append(box);
  $("[data-unlock]", box).onclick = () => openTyping({
    title: "Fase anterior", sub: "Digite o código que estava embaixo do QR da fase anterior.",
    check: v => {
      if (norm(v) === STEPS[idx - 1].code) { setProgress(idx); location.reload(); return true; }
      return "Hmm, não é esse… ❤️";
    }
  });
}

function renderMessage(app, big, title, text) {
  const box = el("div", "locked");
  box.innerHTML = `<div class="big">${big}</div><h1 class="headline">${esc(title)}</h1><p>${esc(text)}</p>`;
  app.append(box);
}

/* ---------- boot ---------- */
(function boot() {
  hearts();
  const app = $("#app");
  const params = new URLSearchParams(location.search);
  if (params.has("reset")) { // para o Arthur testar: adicione ?reset no final da URL
    try { localStorage.removeItem(KEY); } catch (e) {}
    history.replaceState(null, "", location.pathname);
    renderMessage(app, "🧹", "Tudo zerado", "O progresso deste aparelho foi apagado.");
    return;
  }
  const idx = parseInt(document.body.dataset.step, 10) - 1;
  if (!(idx >= 0 && STEPS[idx])) { renderMessage(app, "💗", "Ainda não é hora", "Comece do começo ❤️"); return; }
  const prog = getProgress();
  const allowed = idx === 0 || prog === -1 /* storage indisponível: não travar */ || prog >= idx;
  if (!allowed) { renderLocked(app, idx); return; }
  setProgress(idx + 1);
  renderStep(app, idx);
})();
