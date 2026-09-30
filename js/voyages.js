import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyC4diWmtqDYU1p0NPEJhQPufe2io-M_NgM",
  authDomain: "bigbluafrica.firebaseapp.com",
  projectId: "bigbluafrica",
  storageBucket: "bigbluafrica.firebasestorage.app",
  messagingSenderId: "19405508702",
  appId: "1:19405508702:web:c71e076be88df48adfe4cf"
});
const db = getFirestore(app);

const form = document.getElementById("inscription");
const msg = form.querySelector(".message");
const btn = form.querySelector("button[type=submit]");

function syncProgramme() {
  const p = form.programme.value;
  form.querySelectorAll("[data-for]").forEach(el => {
    const on = el.dataset.for === p;
    el.hidden = !on;
    el.querySelectorAll("input,select").forEach(i => { i.disabled = !on; });
  });
}
form.querySelectorAll("input[name=programme]").forEach(r => r.addEventListener("change", syncProgramme));
document.querySelectorAll("[data-choisir]").forEach(b => b.addEventListener("click", () => {
  const r = form.querySelector(`input[name=programme][value=${b.dataset.choisir}]`);
  if (r) { r.checked = true; syncProgramme(); }
}));
syncProgramme();

const clean = v => (v || "").toString().trim().slice(0, 300);

form.addEventListener("submit", async e => {
  e.preventDefault();
  if (form.site_web.value) return; // anti-robot
  if (!form.programme.value) { msg.textContent = "Choisissez d'abord un programme : Travail ou Football."; msg.className = "message err"; return; }
  const f = new FormData(form);
  const data = {
    programme: form.programme.value,
    nom: clean(f.get("nom")),
    prenoms: clean(f.get("prenoms")),
    dateNaissance: clean(f.get("dateNaissance")),
    sexe: clean(f.get("sexe")),
    nationalite: clean(f.get("nationalite")),
    telephone: clean(f.get("telephone")),
    email: clean(f.get("email")),
    ville: clean(f.get("ville")),
    passeport: clean(f.get("passeport")),
    metier: clean(f.get("metier")),
    poste: clean(f.get("poste")),
    clubActuel: clean(f.get("clubActuel")),
    licencePro: clean(f.get("licencePro")),
    disponibilite: clean(f.get("disponibilite")),
    message: clean(f.get("message")),
    statut: "nouveau",
    source: "site-web",
    createdAt: serverTimestamp()
  };
  btn.disabled = true; btn.textContent = "Envoi en cours…";
  msg.textContent = ""; msg.className = "message";
  try {
    await addDoc(collection(db, "inscriptions_voyage"), data);
    form.hidden = true;
    document.getElementById("merci").hidden = false;
    document.getElementById("merci-nom").textContent = data.prenoms || data.nom;
    document.getElementById("inscrire").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error(err);
    msg.textContent = "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez.";
    msg.className = "message err";
  } finally {
    btn.disabled = false; btn.textContent = "Envoyer mon inscription";
  }
});
