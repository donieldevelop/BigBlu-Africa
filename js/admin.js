import { app, db } from "./firebase.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc, arrayUnion, serverTimestamp, writeBatch }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth(app);
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const STATUTS = [
  ["nouveau", "Nouveau"], ["a_rappeler", "À rappeler"], ["appele", "Appelé"], ["rdv_fixe", "RDV fixé"],
  ["dossier_ouvert", "Dossier ouvert"], ["visa_en_cours", "Visa en cours"], ["visa_obtenu", "Visa obtenu"], ["plus_tard", "Prospect plus tard"], ["pas_interesse", "Pas intéressé"]
];
const SL = Object.fromEntries(STATUTS);
const FUNNEL = ["nouveau", "a_rappeler", "appele", "rdv_fixe", "dossier_ouvert", "visa_en_cours", "visa_obtenu"];
const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

let me = null, INS = [], MSG = [], STAFF = [], INV = [], VIS = [], unsubs = [], officeWeek = 0, openId = null;

/* ---------- Dates ---------- */
const toDate = t => t?.toDate ? t.toDate() : (t ? new Date(t) : null);
const fmt = d => d ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtH = d => d ? d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
function monday(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const iso = d => d.toISOString().slice(0, 10);
const todayName = () => JOURS[new Date().getDay()];


/* ---------- Connexion Google ---------- */
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
const SETUP_KEY = "bb_setup";
const setMode = v => { try { v ? sessionStorage.setItem(SETUP_KEY, "1") : sessionStorage.removeItem(SETUP_KEY); } catch {} };
const isSetupMode = () => { try { return sessionStorage.getItem(SETUP_KEY) === "1"; } catch { return false; } };
const say = (t, cls = "") => { const m = $("#loginMsg"); m.textContent = t; m.className = "msg " + cls; };

async function google() {
  say("Ouverture de Google…");
  try { await signInWithPopup(auth, provider); }
  catch (err) {
    if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(err.code)) return signInWithRedirect(auth, provider);
    console.error(err);
    say(err.code === "auth/unauthorized-domain" ? "Ce domaine n'est pas autorisé dans Firebase (Authentication → Paramètres → Domaines autorisés)."
      : err.code === "auth/operation-not-allowed" ? "La connexion Google n'est pas activée dans Firebase."
      : err.code === "auth/popup-closed-by-user" ? "" : "Connexion impossible : " + err.code, "err");
  }
}
$("#googleBtn").addEventListener("click", () => { setMode(false); google(); });
$("#setupBtn").addEventListener("click", () => { setMode(true); google(); });
$("#logout").addEventListener("click", () => signOut(auth));

async function checkSetup() {
  try { const s = await getDoc(doc(db, "config", "setup")); $("#setupBox").hidden = s.exists(); }
  catch { $("#setupBox").hidden = true; }
}

// Donne l'accès : compte existant, première configuration, ou invitation.
async function resolveStaff(user) {
  const ref = doc(db, "staff", user.uid), snap = await getDoc(ref).catch(() => null);
  if (snap?.exists()) return snap.data();
  const email = (user.email || "").toLowerCase(), nom = user.displayName || email;
  if (isSetupMode()) {
    const b = writeBatch(db);
    b.set(ref, { nom, email, role: "admin", actif: true, createdAt: serverTimestamp() });
    b.set(doc(db, "config", "setup"), { done: true, by: user.uid, at: serverTimestamp() });
    try { await b.commit(); setMode(false); return (await getDoc(ref)).data(); }
    catch (e) { console.error(e); setMode(false); throw new Error("Le compte administrateur a déjà été créé, ou les règles Firestore ne sont pas publiées."); }
  }
  const inv = await getDoc(doc(db, "invitations", email)).catch(() => null);
  if (inv?.exists()) {
    const b = writeBatch(db);
    b.set(ref, { nom: inv.data().nom || nom, email, role: inv.data().role, actif: true, createdAt: serverTimestamp() });
    b.delete(doc(db, "invitations", email));
    await b.commit();
    return (await getDoc(ref)).data();
  }
  throw new Error(`Le compte ${email} n'a pas accès à l'espace admin. Demandez à l'administrateur de vous inviter.`);
}

onAuthStateChanged(auth, async user => {
  $("#boot").hidden = true;
  unsubs.forEach(u => u()); unsubs = [];
  if (!user) { $("#app").hidden = true; $("#login").hidden = false; checkSetup(); return; }
  say("Vérification de l'accès…");
  let data;
  try { data = await resolveStaff(user); } catch (e) { await signOut(auth); say(e.message, "err"); return; }
  if (data.actif !== true) { await signOut(auth); say("Ce compte a été désactivé.", "err"); return; }
  me = { uid: user.uid, ...data };
  $("#meName").textContent = me.nom || user.email;
  $("#meRole").textContent = me.role === "admin" ? "Admin général" : "Service client";
  $$(".admin-only").forEach(e => e.hidden = me.role !== "admin");
  $("#login").hidden = true; $("#app").hidden = false; say("");
  listen();
});

/* ---------- Données temps réel ---------- */
function listen() {
  unsubs.push(onSnapshot(query(collection(db, "inscriptions_voyage"), orderBy("createdAt", "desc")), s => {
    INS = s.docs.map(d => ({ id: d.id, ...d.data() })); renderAll();
  }, err => console.error(err)));
  unsubs.push(onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "desc")), s => {
    MSG = s.docs.map(d => ({ id: d.id, ...d.data() })); renderMsg();
  }, err => console.error(err)));
  unsubs.push(onSnapshot(collection(db, "visites"), s => { VIS = s.docs.map(d => d.data()); renderDash(); }, err => console.error(err)));
  unsubs.push(onSnapshot(collection(db, "staff"), s => { STAFF = s.docs.map(d => ({ id: d.id, ...d.data() })); renderTeam(); }, () => {}));
  if (me.role === "admin") unsubs.push(onSnapshot(collection(db, "invitations"), s => { INV = s.docs.map(d => ({ id: d.id, ...d.data() })); renderTeam(); }, () => {}));
}
function renderAll() { renderDash(); renderIns(); if (openId) openDetail(openId); $("#badgeNew").textContent = INS.filter(i => i.statut === "nouveau").length || ""; }

/* ---------- Onglets ---------- */
$$(".tabs button").forEach(b => b.addEventListener("click", () => {
  $$(".tabs button").forEach(x => x.classList.toggle("on", x === b));
  $$("[data-view]").forEach(v => v.hidden = v.dataset.view !== b.dataset.tab);
}));

/* ---------- Logique métier ---------- */
const toCallToday = i => ["nouveau", "a_rappeler"].includes(i.statut) && (i.joursAppel || []).includes(todayName());
function officeWindow(i) {
  if (i.rdvDate) { const d = new Date(i.rdvDate); return [d, d, "RDV fixé"]; }
  if (i.bureauDate) { const d = new Date(i.bureauDate); return [d, d, "Date souhaitée"]; }
  const c = toDate(i.createdAt); if (!c) return null;
  if (i.bureau === "Cette semaine") { const m = monday(c); return [m, addDays(m, 6), "Dispo. déclarée"]; }
  if (i.bureau === "La semaine prochaine") { const m = addDays(monday(c), 7); return [m, addDays(m, 6), "Dispo. déclarée"]; }
  return null;
}
function inPeriod(i) {
  const p = Number($("#period").value); if (!p) return true;
  const c = toDate(i.createdAt); return c && c >= addDays(new Date(), -p);
}

/* ---------- Tableau de bord ---------- */
$("#period").addEventListener("change", renderDash);
$$(".seg button").forEach(b => b.addEventListener("click", () => { officeWeek = Number(b.dataset.wk); $$(".seg button").forEach(x => x.classList.toggle("on", x === b)); renderOffice(); }));

function renderDash() {
  const L = INS.filter(inPeriod), wk0 = monday(new Date()), wk1 = addDays(wk0, 7);
  const cnt = s => L.filter(i => i.statut === s).length;
  const rdvWeek = INS.filter(i => i.rdvDate && new Date(i.rdvDate) >= wk0 && new Date(i.rdvDate) < wk1).length;
  const k = [["Prêts (inscription complète)", L.filter(i => (i.parcours || "complet") === "complet").length, true], ["Prospects plus tard", L.filter(i => i.parcours === "plus_tard").length],
    ["À appeler aujourd'hui", INS.filter(toCallToday).length], ["RDV cette semaine", rdvWeek],
    ["Dossiers ouverts", L.filter(i => FUNNEL.indexOf(i.statut) >= 4).length], ["Visas obtenus", cnt("visa_obtenu")]];
  $("#kpis").innerHTML = k.map(([l, v, h]) => `<div class="kpi${h ? " hl" : ""}"><small>${l}</small><strong>${v}</strong></div>`).join("");

  $("#todayLbl").textContent = todayName();
  const call = INS.filter(toCallToday);
  $("#callToday").innerHTML = call.length ? call.map(i => mini(i)).join("") : `<p class="empty">Personne à appeler aujourd'hui.</p>`;
  renderOffice();
  renderVisites(); renderRelances();

  const days = Number($("#period").value) || 30, byDay = {};
  INS.forEach(i => { const c = toDate(i.createdAt); if (c) byDay[iso(c)] = (byDay[iso(c)] || 0) + 1; });
  const arr = []; for (let n = days - 1; n >= 0; n--) { const d = addDays(new Date(), -n); arr.push([d, byDay[iso(d)] || 0]); }
  const max = Math.max(1, ...arr.map(a => a[1])), every = days > 31 ? 7 : days > 10 ? 3 : 1;
  $("#chartDays").innerHTML = arr.map(([d, v], ix) => `<div class="bar" title="${fmt(d)} : ${v}">${v ? `<em>${v}</em>` : ""}<i style="height:${v / max * 100}%"></i><span>${ix % every === 0 ? d.getDate() + "/" + (d.getMonth() + 1) : ""}</span></div>`).join("");

  const reached = s => L.filter(i => FUNNEL.indexOf(i.statut) >= FUNNEL.indexOf(s)).length, tot = Math.max(1, L.length);
  const colors = ["#8a5a00", "#a4440c", "#0b67a8", "#5b3fb8", "#0f6e56", "#0b7390", "#1d9e75"];
  $("#funnel").innerHTML = FUNNEL.map((s, ix) => { const v = reached(s); return `<div class="frow"><span>${SL[s]}</span><div class="track"><div class="fill" style="width:${v / tot * 100}%;background:${colors[ix]}"></div></div><b>${v}</b></div>`; }).join("")
    + `<div class="frow"><span>Pas intéressé</span><div class="track"><div class="fill" style="width:${cnt("pas_interesse") / tot * 100}%;background:#9aa8b5"></div></div><b>${cnt("pas_interesse")}</b></div>`;

  const tr = L.filter(i => i.programme === "travail").length, fo = L.length - tr;
  const pv = L.filter(i => i.passeport === "Oui").length, pc = L.filter(i => (i.passeport || "").startsWith("En cours")).length;
  const postes = {}; L.filter(i => i.poste).forEach(i => postes[i.poste] = (postes[i.poste] || 0) + 1);
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  $("#profile").innerHTML = `
    <b>Programmes</b><div class="split-bar">${tr ? `<div style="flex:${tr};background:var(--red)">${pct(tr, L.length)}%</div>` : ""}${fo ? `<div style="flex:${fo};background:var(--navy)">${pct(fo, L.length)}%</div>` : ""}${!L.length ? `<div style="flex:1;background:#dfe8ef;color:var(--muted)">—</div>` : ""}</div>
    <div class="legend"><span><i style="background:var(--red)"></i>Travail : ${tr}</span><span><i style="background:var(--navy)"></i>Football : ${fo}</span></div>
    <b>Passeport</b><div class="split-bar">${pv ? `<div style="flex:${pv};background:var(--green)">${pct(pv, L.length)}%</div>` : ""}${pc ? `<div style="flex:${pc};background:#e0a800">${pct(pc, L.length)}%</div>` : ""}${L.length - pv - pc ? `<div style="flex:${L.length - pv - pc};background:#9aa8b5">${pct(L.length - pv - pc, L.length)}%</div>` : ""}${!L.length ? `<div style="flex:1;background:#dfe8ef;color:var(--muted)">—</div>` : ""}</div>
    <div class="legend"><span><i style="background:var(--green)"></i>Valide : ${pv}</span><span><i style="background:#e0a800"></i>En cours : ${pc}</span><span><i style="background:#9aa8b5"></i>Non : ${L.length - pv - pc}</span></div>
    <b>Postes (football)</b><div class="legend" style="margin-top:6px">${Object.entries(postes).map(([p, v]) => `<span>${esc(p)} : <b>${v}</b></span>`).join("") || "<span>—</span>"}</div>`;
}
function renderVisites() {
  const p = Number($("#period").value), lim = p ? addDays(new Date(), -p) : null;
  const V = VIS.filter(v => { const c = toDate(v.createdAt); return !lim || (c && c >= lim); });
  const uniq = e => new Set(V.filter(v => v.etape === e).map(v => v.sid)).size;
  const L = INS.filter(inPeriod), complet = L.filter(i => (i.parcours || "complet") === "complet").length;
  const rows = [["Avantages vus", uniq("avantages")], ["Procédure et frais vus", uniq("procedure")], ["Documents vus (prêts à payer)", uniq("documents")],
    ["Formulaire ouvert", uniq("formulaire")], ["Inscription complète envoyée", complet]];
  const max = Math.max(1, rows[0][1]);
  $("#visites").innerHTML = rows.map(([l, v]) => `<div class="frow"><span>${l}</span><div class="track"><div class="fill" style="width:${v / max * 100}%;background:var(--blue)"></div></div><b>${v}</b></div>`).join("")
    + `<div class="legend" style="margin-top:12px"><span>« Non, merci » à l'étape 1 : <b>${uniq("choix_non")}</b></span><span>« Pas pour le moment » à l'étape 2 : <b>${uniq("choix_plus_tard")}</b></span>`
    + `<span>Prospects « plus tard » enregistrés : <b>${L.filter(i => i.parcours === "plus_tard").length}</b></span><span>Contacts « non » laissés : <b>${L.filter(i => i.parcours === "non").length}</b></span></div>`;
}
const DELAI = { "Dans 2 semaines": 14, "Dans 1 mois": 30, "Dans 3 mois": 90, "Je ne sais pas encore": 30 };
function relanceDate(i) { const c = toDate(i.createdAt); return c ? addDays(c, DELAI[i.quandPret] ?? 30) : null; }
function renderRelances() {
  const L = INS.filter(i => i.statut === "plus_tard").map(i => [i, relanceDate(i)]).filter(([, d]) => d).sort((a, b) => a[1] - b[1]);
  const now = new Date();
  $("#relances").innerHTML = L.length ? L.map(([i, d]) => mini(i, (d <= now ? "⏰ À relancer maintenant" : "Relance le " + fmt(d)) + " · " + (i.quandPret || ""))).join("") : `<p class="empty">Aucun prospect à relancer.</p>`;
}
function renderOffice() {
  const s = addDays(monday(new Date()), 7 * officeWeek), e = addDays(s, 6);
  const L = INS.filter(i => i.statut !== "pas_interesse").map(i => [i, officeWindow(i)]).filter(([, w]) => w && w[0] <= addDays(e, 1) && w[1] >= s);
  L.sort((a, b) => a[1][0] - b[1][0]);
  $("#office").innerHTML = L.length ? L.map(([i, w]) => mini(i, `${w[2]}${w[0].getTime() === w[1].getTime() ? " · " + fmt(w[0]) : ""}`)).join("") : `<p class="empty">Aucun passage prévu.</p>`;
}
function mini(i, extra) {
  return `<div class="mini" data-id="${i.id}"><div><b>${esc(i.prenoms)} ${esc(i.nom)}</b><br><small>${esc(i.telephone)} · ${esc(i.creneau || "")}${extra ? " · " + esc(extra) : ""}</small></div><span class="pill p-${i.programme}">${i.programme === "travail" ? "Travail" : "Football"}</span></div>`;
}
document.addEventListener("click", e => { const m = e.target.closest(".mini[data-id],.row[data-id]"); if (m) openDetail(m.dataset.id); });

/* ---------- Liste des inscriptions ---------- */
$("#fStat").innerHTML += STATUTS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
["#q", "#fProg", "#fStat", "#fToday"].forEach(s => $(s).addEventListener("input", renderIns));
function filtered() {
  const q = $("#q").value.trim().toLowerCase(), p = $("#fProg").value, st = $("#fStat").value, t = $("#fToday").checked;
  return INS.filter(i => (!p || i.programme === p) && (!st || i.statut === st) && (!t || toCallToday(i)) &&
    (!q || `${i.nom} ${i.prenoms} ${i.telephone} ${i.email} ${i.ville}`.toLowerCase().includes(q)));
}
function renderIns() {
  const L = filtered();
  $("#insCount").textContent = `${L.length} inscription${L.length > 1 ? "s" : ""}`;
  $("#insList").innerHTML = L.map(i => `<div class="row" data-id="${i.id}">
    <div><span class="n">${esc(i.prenoms)} ${esc(i.nom)}</span><small>${esc(i.telephone)} · ${esc(i.ville)}</small></div>
    <div class="c2"><span class="pill p-${i.programme}">${i.programme === "travail" ? "💼 Travail" : "⚽ Football"}</span><small>Passeport : ${esc(i.passeport)}</small></div>
    <div class="c3"><small>📞 ${esc((i.joursAppel || []).map(j => j.slice(0, 3)).join(", "))}</small><small>${esc(i.creneau)}</small></div>
    <div><span class="pill s-${i.statut}">${SL[i.statut] || i.statut}</span><small>${fmt(toDate(i.createdAt))}</small></div></div>`).join("") || `<p class="empty">Aucune inscription.</p>`;
}

/* ---------- Fiche détaillée ---------- */
$("#drawer").addEventListener("click", e => { if (e.target.dataset.close !== undefined) closeDetail(); });
function closeDetail() { $("#drawer").hidden = true; openId = null; }
function openDetail(id) {
  const i = INS.find(x => x.id === id); if (!i) return closeDetail();
  openId = id;
  const tel = (i.telephone || "").replace(/[^\d+]/g, ""), wa = tel.startsWith("+") ? tel.slice(1) : (tel.length === 10 ? "225" + tel : tel);
  const rows = [["Programme", i.programme === "travail" ? "💼 Travail en Albanie" : "⚽ Football en Albanie"], ["Téléphone", i.telephone], ["Email", i.email || "—"],
    ["Né(e) le", i.dateNaissance], ["Sexe", i.sexe], ["Nationalité", i.nationalite], ["Ville", i.ville], ["Passeport valide", i.passeport],
    ...(i.programme === "travail" ? [["Métier", i.metier || "—"]] : [["Poste", i.poste], ["Licence pro", i.licencePro], ["Club", i.clubActuel || "—"]]),
    ["Jours d'appel", (i.joursAppel || []).join(", ")], ["Créneau", i.creneau], ["Bureau", i.bureau + (i.bureauDate ? " (" + fmt(new Date(i.bureauDate)) + ")" : "")],
    ["Parcours", { complet: "Inscription complète", plus_tard: "Pas pour le moment", non: "Non intéressé" }[i.parcours || "complet"]],
    ["Prêt à payer 50 000 F", i.pretPayer === false ? "Non" : "Oui"], ...(i.quandPret ? [["Prêt(e)", i.quandPret]] : []),
    ["Message", i.message || "—"], ["Inscrit le", fmtH(toDate(i.createdAt))], ["Source", `${i.source || "—"} · ${i.lien || ""}`]];
  const notes = [...(i.notes || [])].reverse();
  $("#drawerPanel").innerHTML = `
    <div class="dp-head"><div><h2>${esc(i.prenoms)} ${esc(i.nom)}</h2><span class="pill s-${i.statut}">${SL[i.statut]}</span></div><button class="btn" data-close>✕</button></div>
    <div class="acts"><a class="btn primary" href="tel:${esc(tel)}">📞 Appeler</a><a class="btn" target="_blank" rel="noopener" href="https://wa.me/${esc(wa)}">💬 WhatsApp</a></div>
    <dl class="dl">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
    <div class="box"><h3>Suivi du dossier</h3>
      <label>Statut<select id="dStat">${STATUTS.map(([v, l]) => `<option value="${v}"${v === i.statut ? " selected" : ""}>${l}</option>`).join("")}</select></label>
      <label id="dRdvW" style="margin-top:10px"${i.statut === "rdv_fixe" ? "" : " hidden"}>Date du rendez-vous<input type="date" id="dRdv" value="${esc(i.rdvDate || "")}"></label>
      <label style="margin-top:10px">Ajouter une note d'appel<textarea id="dNote" rows="2" placeholder="Ex. rappeler jeudi, a son passeport…"></textarea></label>
      <div class="acts"><button class="btn primary" id="dSave">Enregistrer</button></div><p class="msg" id="dMsg"></p>
      <div class="notes">${notes.map(n => `<div class="note">${esc(n.texte)}<small>${esc(n.auteur)} · ${fmtH(new Date(n.date))}</small></div>`).join("")}</div>
    </div>
    ${me.role === "admin" ? `<button class="btn danger" id="dDel">🗑 Supprimer cette inscription</button>` : ""}`;
  $("#drawer").hidden = false;
  $("#dStat").addEventListener("change", () => $("#dRdvW").hidden = $("#dStat").value !== "rdv_fixe");
  $("#dSave").addEventListener("click", async () => {
    const st = $("#dStat").value, note = $("#dNote").value.trim(), rdv = $("#dRdv").value, m = $("#dMsg");
    const upd = { updatedAt: serverTimestamp(), updatedBy: me.nom || me.email || me.uid };
    if (st !== i.statut) { upd.statut = st; upd.historique = arrayUnion({ de: i.statut, vers: st, auteur: me.nom || "", date: new Date().toISOString() }); }
    if (st === "rdv_fixe" && rdv !== (i.rdvDate || "")) upd.rdvDate = rdv;
    if (note) upd.notes = arrayUnion({ texte: note.slice(0, 500), auteur: me.nom || "", date: new Date().toISOString() });
    if (Object.keys(upd).length === 2) { m.textContent = "Rien à enregistrer."; m.className = "msg"; return; }
    try { await updateDoc(doc(db, "inscriptions_voyage", i.id), upd); m.textContent = "Enregistré ✓"; m.className = "msg ok"; }
    catch (err) { console.error(err); m.textContent = "Échec de l'enregistrement."; m.className = "msg err"; }
  });
  $("#dDel")?.addEventListener("click", async () => {
    if (!confirm(`Supprimer définitivement l'inscription de ${i.prenoms} ${i.nom} ?`)) return;
    try { await deleteDoc(doc(db, "inscriptions_voyage", i.id)); closeDetail(); } catch { alert("Suppression impossible."); }
  });
}

/* ---------- Export Excel (admin) ---------- */
$("#export").addEventListener("click", async () => {
  const L = filtered().map(i => ({
    "Date": fmtH(toDate(i.createdAt)), "Programme": i.programme, "Parcours": i.parcours || "complet", "Prêt à payer": i.pretPayer === false ? "Non" : "Oui", "Quand prêt": i.quandPret || "", "Statut": SL[i.statut], "Nom": i.nom, "Prénoms": i.prenoms,
    "Téléphone": i.telephone, "Email": i.email, "Né(e) le": i.dateNaissance, "Sexe": i.sexe, "Nationalité": i.nationalite, "Ville": i.ville,
    "Passeport": i.passeport, "Métier": i.metier, "Poste": i.poste, "Licence pro": i.licencePro, "Club": i.clubActuel,
    "Jours d'appel": (i.joursAppel || []).join(", "), "Créneau": i.creneau, "Bureau": i.bureau, "Date bureau": i.bureauDate, "RDV": i.rdvDate || "",
    "Notes": (i.notes || []).map(n => n.texte).join(" | "), "Message": i.message, "Source": i.source
  }));
  const name = `inscriptions-albanie-${iso(new Date())}`;
  try {
    if (!window.XLSX) await new Promise((ok, ko) => { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
    const ws = XLSX.utils.json_to_sheet(L), wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Inscriptions"); XLSX.writeFile(wb, name + ".xlsx");
  } catch {
    const cols = Object.keys(L[0] || { Vide: "" }), csv = [cols.join(";"), ...L.map(r => cols.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(";"))].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" })); a.download = name + ".csv"; a.click();
  }
});

/* ---------- Messages ---------- */
function renderMsg() {
  $("#badgeMsg").textContent = MSG.filter(m => !m.lu).length || "";
  $("#msgList").innerHTML = MSG.map(m => `<div class="card" style="margin:0">
    <h2><span>${m.lu ? "" : "🔵 "}${esc(m.nom)}${m.entreprise ? " · " + esc(m.entreprise) : ""}</span><small>${m.type === "projet" ? "Projet" : "Contact"} · ${fmtH(toDate(m.createdAt))}</small></h2>
    <p style="margin:0 0 6px"><b>${esc(m.objet || "")}</b></p><p style="margin:0 0 10px;white-space:pre-wrap">${esc(m.message)}</p>
    <div class="acts" style="margin:0"><a class="btn" href="mailto:${esc(m.email)}">✉️ ${esc(m.email)}</a>${m.telephone ? `<a class="btn" href="tel:${esc(m.telephone)}">📞 ${esc(m.telephone)}</a>` : ""}
    ${m.lu ? "" : `<button class="btn primary" data-read="${m.id}">Marquer comme lu</button>`}</div></div>`).join("") || `<p class="empty">Aucun message.</p>`;
}
document.addEventListener("click", async e => { const id = e.target.dataset?.read; if (id) await updateDoc(doc(db, "messages", id), { lu: true }).catch(() => {}); });


/* ---------- Équipe (admin) ---------- */
function renderTeam() {
  if (me?.role !== "admin") return;
  const role = r => r === "admin" ? "Admin général" : "Service client";
  $("#teamList").innerHTML = STAFF.map(s => `<div class="row" style="cursor:default"><div><span class="n">${esc(s.nom)}</span><small>${esc(s.email)}</small></div>
    <div class="c2"><span class="pill ${s.role === "admin" ? "s-rdv_fixe" : "s-appele"}">${role(s.role)}</span></div>
    <div class="c3"><span class="pill ${s.actif ? "s-dossier_ouvert" : "s-pas_interesse"}">${s.actif ? "Actif" : "Désactivé"}</span></div>
    <div>${s.id === me.uid ? "<small>Vous</small>" : `<button class="btn" data-toggle="${s.id}" data-actif="${s.actif}">${s.actif ? "Désactiver" : "Réactiver"}</button>`}</div></div>`).join("")
  + INV.map(v => `<div class="row" style="cursor:default"><div><span class="n">${esc(v.nom)}</span><small>${esc(v.email)}</small></div>
    <div class="c2"><span class="pill ${v.role === "admin" ? "s-rdv_fixe" : "s-appele"}">${role(v.role)}</span></div>
    <div class="c3"><span class="pill s-nouveau">Invitation en attente</span></div>
    <div><button class="btn danger" data-uninvite="${esc(v.id)}">Annuler</button></div></div>`).join("");
}
document.addEventListener("click", async e => {
  const id = e.target.dataset?.toggle;
  if (id) await updateDoc(doc(db, "staff", id), { actif: e.target.dataset.actif !== "true" }).catch(() => alert("Action impossible."));
  const inv = e.target.dataset?.uninvite;
  if (inv && confirm("Annuler cette invitation ?")) await deleteDoc(doc(db, "invitations", inv)).catch(() => alert("Action impossible."));
});
$("#teamForm").addEventListener("submit", async e => {
  e.preventDefault(); const f = e.target, m = $("#teamMsg"), email = f.email.value.trim().toLowerCase();
  if (STAFF.some(s => (s.email || "").toLowerCase() === email)) { m.textContent = "Cette personne a déjà un accès."; m.className = "msg err"; return; }
  try {
    await setDoc(doc(db, "invitations", email), { nom: f.nom.value.trim(), email, role: f.role.value, createdAt: serverTimestamp(), by: me.uid });
    m.textContent = `Invitation enregistrée. ${f.nom.value.trim()} n'a plus qu'à ouvrir bigbluafrica.com/admin et cliquer « Se connecter avec Google » avec ${email}.`;
    m.className = "msg ok"; f.reset();
  } catch (err) { console.error(err); m.textContent = "Invitation impossible."; m.className = "msg err"; }
});
