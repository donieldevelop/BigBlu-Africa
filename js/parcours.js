// Parcours Albanie étape par étape. La navigation fonctionne sans réseau ; Firebase est chargé en arrière-plan.
const FS = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
let fb = null;
const loadFb = () => fb ||= Promise.all([import("./firebase.js"), import(FS)]).then(([a, b]) => ({ db: a.db, ...b }));

const root = document.querySelector(".parcours");
const programme = root.dataset.programme;
let offre = "";   // poste choisi (travail : usine ou hôtel)
const nextBtn1 = root.querySelector('.p-step[data-step="1"] .p-next');
root.querySelectorAll("input[name=offre]").forEach(r => r.addEventListener("change", () => {
  offre = r.value; nextBtn1.disabled = false;
  const h = root.querySelector(".p-hint"); if (h) h.hidden = true;
}));
const steps = [...root.querySelectorAll(".p-step")];
const bar = document.querySelector(".p-bar span"), count = document.querySelector(".p-count");
const params = new URLSearchParams(location.search);
const source = (params.get("src") || "lien direct").slice(0, 60);
let sid; try { sid = sessionStorage.getItem("bb_sid") || Math.random().toString(36).slice(2, 12); sessionStorage.setItem("bb_sid", sid); } catch { sid = Math.random().toString(36).slice(2, 12); }
let cur = "1";
const vus = new Set();

// Statistiques anonymes : quelle étape a été atteinte (pour voir où les gens s'arrêtent).
async function trace(etape) {
  if (vus.has(etape)) return; vus.add(etape);
  try { const { db, collection, addDoc, serverTimestamp } = await loadFb();
    await addDoc(collection(db, "visites"), { programme, etape, sid, source, createdAt: serverTimestamp() }); } catch (e) { console.warn(e); }
}

function show(n) {
  cur = String(n);
  steps.forEach(s => s.hidden = s.dataset.step !== cur);
  const num = Number(cur);
  if (num >= 1 && num <= 4) { bar.style.width = num * 25 + "%"; count.innerHTML = `Étape <b>${num}</b> / 4`; }
  else { bar.style.width = "100%"; count.textContent = cur === "5" || cur === "fin" ? "Terminé ✓" : "Presque fini"; }
  window.scrollTo({ top: 0, behavior: "smooth" });
  const map = { "1": "avantages", "2": "procedure", "3": "documents", "4": "formulaire", "plus_tard": "choix_plus_tard", "non": "choix_non" };
  if (map[cur]) trace(map[cur]);
}
root.querySelectorAll(".p-next").forEach(b => b.addEventListener("click", () => show(Number(cur) + 1)));
root.querySelectorAll(".p-back:not(.p-go):not(a)").forEach(b => b.addEventListener("click", () => show(Number(cur) - 1)));
root.querySelectorAll(".p-go").forEach(b => b.addEventListener("click", () => show(b.dataset.go)));

const clean = v => (v || "").toString().trim().slice(0, 300);
const base = () => ({
  programme, nom: "", prenoms: "", dateNaissance: "", sexe: "", nationalite: "", ville: "", telephone: "", email: "", passeport: "",
  metier: "", poste: "", licencePro: "", clubActuel: "", joursAppel: [], creneau: "", bureau: "", bureauDate: "", message: "",
  offre, parcours: "", pretPayer: false, quandPret: "", lien: location.pathname, source, statut: "nouveau"
});
async function save(data, form) {
  const msg = form.querySelector(".message"), btn = form.querySelector("button[type=submit]"), label = btn.textContent;
  btn.disabled = true; btn.textContent = "Envoi en cours…"; msg.textContent = ""; msg.className = "message";
  try {
    const { db, collection, addDoc, serverTimestamp } = await loadFb();
    await addDoc(collection(db, "inscriptions_voyage"), { ...data, createdAt: serverTimestamp() });
    return true;
  } catch (err) {
    console.error(err); msg.textContent = "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez."; msg.className = "message err"; return false;
  } finally { btn.disabled = false; btn.textContent = label; }
}
function fin(titre, texte) { root.querySelector(".fin-titre").textContent = titre; root.querySelector(".fin-texte").innerHTML = texte; show("fin"); }

/* Inscription complète (personne prête) */
const form = root.querySelector(".p-form");
const bureau = form.bureau, bureauDate = form.querySelector(".bureau-date");
bureau.addEventListener("change", () => { const on = bureau.value === "À une date précise"; bureauDate.hidden = !on; bureauDate.querySelector("input").required = on; });
form.bureauDate.min = new Date().toISOString().slice(0, 10);
form.addEventListener("submit", async e => {
  e.preventDefault(); if (form.site_web.value) return;
  const f = new FormData(form), msg = form.querySelector(".message"), jours = f.getAll("joursAppel");
  if (!jours.length) { msg.textContent = "Indiquez au moins un jour où l'on peut vous appeler."; msg.className = "message err"; return; }
  const d = { ...base() };
  ["nom","prenoms","dateNaissance","sexe","nationalite","ville","telephone","email","passeport","metier","poste","licencePro","clubActuel","creneau","bureau","message"].forEach(k => d[k] = clean(f.get(k)));
  d.bureauDate = bureau.value === "À une date précise" ? clean(f.get("bureauDate")) : "";
  Object.assign(d, { joursAppel: jours, parcours: "complet", pretPayer: true, statut: "nouveau" });
  if (await save(d, form)) { root.querySelector(".merci-nom").textContent = d.prenoms || d.nom; show(5); }
});

/* Formulaires courts : « Pas pour le moment » et « Non, merci » */
root.querySelectorAll(".p-short").forEach(sf => sf.addEventListener("submit", async e => {
  e.preventDefault(); if (sf.site_web.value) return;
  const f = new FormData(sf), kind = sf.dataset.kind, msg = sf.querySelector(".message");
  const d = { ...base(), nom: clean(f.get("nom")), prenoms: clean(f.get("prenoms")), telephone: clean(f.get("telephone")) };
  if (kind === "non") {
    if (!d.telephone) { fin("Merci de votre visite !", "À bientôt sur <strong>VISION@FRICA</strong>."); return; }
    if (!d.nom) { msg.textContent = "Indiquez votre nom pour que l'on puisse vous recontacter."; msg.className = "message err"; return; }
    Object.assign(d, { parcours: "non", statut: "pas_interesse" });
    if (await save(d, sf)) fin("Merci, c'est noté !", "Nous vous informerons des prochaines opportunités par WhatsApp.");
  } else {
    Object.assign(d, { parcours: "plus_tard", quandPret: clean(f.get("quandPret")), statut: "plus_tard" });
    if (await save(d, sf)) fin(`Merci ${d.prenoms || d.nom} !`, `Un conseiller VISION@FRICA vous recontactera <strong>${d.quandPret === "Je ne sais pas encore" ? "un peu plus tard" : d.quandPret.toLowerCase()}</strong> pour lancer votre dossier.`);
  }
}));

show(1);
loadFb().catch(() => {});
