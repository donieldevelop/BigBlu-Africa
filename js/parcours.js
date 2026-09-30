// La navigation fonctionne sans réseau ; Firebase n'est chargé qu'au moment de l'envoi.
const FS = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const root = document.querySelector(".parcours");
const programme = root.dataset.programme;
const steps = [...root.querySelectorAll(".p-step")];
const bar = document.querySelector(".p-bar span"), count = document.querySelector(".p-count");
let cur = 1;

function show(n) {
  cur = n;
  steps.forEach(s => s.hidden = Number(s.dataset.step) !== n);
  const shown = Math.min(n, 4);
  bar.style.width = (n >= 5 ? 100 : shown * 25) + "%";
  count.innerHTML = n >= 5 ? "Inscription envoyée ✓" : `Étape <b>${shown}</b> / 4`;
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (n <= 4) history.replaceState(null, "", n > 1 ? `#etape-${n}` : location.pathname + location.search);
}
root.querySelectorAll(".p-next").forEach(b => b.addEventListener("click", () => show(cur + 1)));
root.querySelectorAll(".p-back").forEach(b => b.addEventListener("click", () => show(cur - 1)));

const form = root.querySelector(".p-form"), msg = form.querySelector(".message");
const bureau = form.bureau, bureauDate = form.querySelector(".bureau-date");
bureau.addEventListener("change", () => {
  const on = bureau.value === "À une date précise";
  bureauDate.hidden = !on; bureauDate.querySelector("input").required = on;
});
form.bureauDate.min = new Date().toISOString().slice(0, 10);

const clean = v => (v || "").toString().trim().slice(0, 300);
form.addEventListener("submit", async e => {
  e.preventDefault();
  if (form.site_web.value) return;
  const f = new FormData(form);
  const jours = f.getAll("joursAppel");
  if (!jours.length) { msg.textContent = "Indiquez au moins un jour où l'on peut vous appeler."; msg.className = "message err"; return; }
  const params = new URLSearchParams(location.search);
  const data = {
    programme, nom: clean(f.get("nom")), prenoms: clean(f.get("prenoms")), dateNaissance: clean(f.get("dateNaissance")),
    sexe: clean(f.get("sexe")), nationalite: clean(f.get("nationalite")), ville: clean(f.get("ville")),
    telephone: clean(f.get("telephone")), email: clean(f.get("email")), passeport: clean(f.get("passeport")),
    metier: clean(f.get("metier")), poste: clean(f.get("poste")), licencePro: clean(f.get("licencePro")), clubActuel: clean(f.get("clubActuel")),
    joursAppel: jours, creneau: clean(f.get("creneau")), bureau: clean(f.get("bureau")),
    bureauDate: bureau.value === "À une date précise" ? clean(f.get("bureauDate")) : "",
    message: clean(f.get("message")), lien: location.pathname, source: clean(params.get("src") || "lien direct"),
    statut: "nouveau", createdAt: null
  };
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true; btn.textContent = "Envoi en cours…"; msg.textContent = ""; msg.className = "message";
  try {
    const [{ db }, { collection, addDoc, serverTimestamp }] = await Promise.all([import("./firebase.js"), import(FS)]);
    data.createdAt = serverTimestamp();
    await addDoc(collection(db, "inscriptions_voyage"), data);
    root.querySelector(".merci-nom").textContent = data.prenoms || data.nom;
    show(5);
  } catch (err) {
    console.error(err);
    msg.textContent = "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez."; msg.className = "message err";
  } finally { btn.disabled = false; btn.textContent = "Envoyer mon inscription"; }
});
show(1);
