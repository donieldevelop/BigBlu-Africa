import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const clean = v => (v || "").toString().trim().slice(0, 2000);
document.querySelectorAll(".fb-form").forEach(form => {
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (form.site_web?.value) return;
    const f = new FormData(form), msg = form.querySelector(".message"), btn = form.querySelector("button[type=submit]");
    const data = { type: form.dataset.type, nom: clean(f.get("nom")).slice(0,120), entreprise: clean(f.get("entreprise")).slice(0,120),
      email: clean(f.get("email")).slice(0,120), telephone: clean(f.get("telephone")).slice(0,25), objet: clean(f.get("objet")).slice(0,120),
      message: clean(f.get("message")), lu: false, createdAt: serverTimestamp() };
    btn.disabled = true; msg.textContent = "Envoi en cours…"; msg.className = "message";
    try { await addDoc(collection(db, "messages"), data); form.reset(); msg.textContent = "Merci, votre message est bien envoyé. Nous revenons vers vous rapidement."; msg.className = "message ok"; }
    catch (err) { console.error(err); msg.textContent = "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez."; msg.className = "message err"; }
    finally { btn.disabled = false; }
  });
});
