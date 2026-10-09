# Génère les pages statiques du site à partir des fragments de src/.
# Utilisation : python3 build.py
import os, sys
sys.path.insert(0, "src")
from parcours import parcours


# --- Informations de l'entreprise (une valeur vide n'est pas affichée sur le site) ---
LEGAL = {
    "nom": "BIGBLU AFRICA",
    "structure_voyage": "VISION@FRICA",
    "forme": "",            # ex. SARL — à renseigner
    "rccm": "",             # numéro RCCM — à renseigner
    "capital": "",          # capital social — à renseigner
    "adresse": "Cocody Angré CNPS, Abidjan, Côte d'Ivoire",
    "tel_bureau": "+225 27 35 99 72 50",
    "tel_whatsapp": "+225 01 03 73 00 40",
    "directeur": "Diakité Gbaya Mohamed, Directeur Général",
    "maj": "7 octobre 2026",
}
def tel(n): return "tel:" + n.replace(" ", "")
def wa(n): return "https://wa.me/" + n.replace("+", "").replace(" ", "")

r = lambda f: open("src/" + f, encoding="utf-8").read()
NAV = [("/", "Accueil"), ("/a-propos", "À propos"), ("/domaines", "Domaines"), ("/structures", "Structures"), ("/voyage", "Voyage")]

def page(path, title, desc, body, active, extra_css="", scripts=""):
    nav = "".join(f'<a href="{u}"{" class=\"active\"" if u == active else ""}>{t}</a>' for u, t in NAV)
    nav += f'<a href="/contact" class="nav-btn{" active" if active == "/contact" else ""}">Contact</a>'
    css = '<link rel="stylesheet" href="/css/style.css">' + "".join(f'<link rel="stylesheet" href="/css/{c}.css">' for c in extra_css.split() if c)
    html = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://www.bigbluafrica.com/assets/{"albanie-affiche.webp" if "voyage" in path else "bigblu-logo.jpg"}">
<title>{title}</title>
{css}
</head>
<body>
<header class="header">
  <div class="container nav">
    <a href="/" class="brand"><img src="/assets/bigblu-logo.jpg" alt="BIGBLU AFRICA"></a>
    <button class="menu" aria-label="Menu">☰</button>
    <nav>{nav}</nav>
  </div>
</header>
<main>
{body}
</main>
<footer><div class="container footer"><div><div class="brand-text">BIGBLU <span>AFRICA</span></div><p>Concevoir • Connecter • Développer • Réaliser</p></div>
<div class="foot-info"><p>📍 {LEGAL["adresse"]}</p><p>📞 <a href="{tel(LEGAL["tel_bureau"])}">{LEGAL["tel_bureau"]}</a> · 💬 <a href="{wa(LEGAL["tel_whatsapp"])}" rel="noopener">{LEGAL["tel_whatsapp"]}</a></p></div>
<div class="foot-links"><a href="/mentions-legales">Mentions légales</a><a href="/mentions-legales#confidentialite">Confidentialité</a><p>© <span id="year"></span> BIGBLU AFRICA</p></div></div></footer>
<script src="/js/main.js"></script>
{scripts}
</body>
</html>
'''
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    open(path, "w", encoding="utf-8").write(html)


def trust_block():
    rows = [("📍", "Notre bureau", LEGAL["adresse"]),
            ("📞", "Téléphone du bureau", f'<a href="{tel(LEGAL["tel_bureau"])}">{LEGAL["tel_bureau"]}</a>'),
            ("💬", "WhatsApp VISION@FRICA", f'<a href="{wa(LEGAL["tel_whatsapp"])}" rel="noopener">{LEGAL["tel_whatsapp"]}</a>')]
    cards = "".join(f'<div class="trust-card"><span>{i}</span><div><small>{t}</small><strong>{v}</strong></div></div>' for i, t, v in rows)
    return f'''<section class="section light" id="nous-trouver"><div class="container">
  <div class="section-head"><p class="kicker">NOUS TROUVER</p><h2>Une entreprise bien réelle, à Abidjan.</h2><p>Venez nous rencontrer au bureau ou contactez-nous aux numéros officiels ci-dessous.</p></div>
  <div class="trust-grid">{cards}</div>
  <p class="trust-note">🔒 <strong>Un doute ?</strong> Avant toute démarche, appelez ou passez au bureau : nous répondons à toutes vos questions.</p>
</div></section>'''

def mentions_body():
    ident = [("Éditeur du site", LEGAL["nom"] + (" — " + LEGAL["forme"] if LEGAL["forme"] else "") + ", société ivoirienne"),
             ("Structure voyage", LEGAL["structure_voyage"] + ", activité de " + LEGAL["nom"]),
             ("Siège / bureau", LEGAL["adresse"]),
             ("Téléphone", f'{LEGAL["tel_bureau"]} (bureau) · {LEGAL["tel_whatsapp"]} (WhatsApp)')]
    if LEGAL["rccm"]: ident.append(("RCCM", LEGAL["rccm"]))
    if LEGAL["capital"]: ident.append(("Capital social", LEGAL["capital"]))
    ident += [("Directeur de la publication", LEGAL["directeur"]),
              ("Hébergement du site", "Vercel Inc. (États-Unis)"),
              ("Base de données", "Google Firebase / Cloud Firestore (Google LLC)")]
    dl = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in ident)
    return f'''<section class="section"><div class="container legal">
  <h2>Mentions légales</h2><dl class="legal-dl">{dl}</dl>
  <p>Les contenus de ce site (textes, logos, images) sont la propriété de {LEGAL["nom"]} ou de leurs auteurs. Toute reproduction sans autorisation est interdite.</p>
  <p>Les informations publiées sur les programmes (frais, délais, conditions) sont données à titre indicatif et peuvent évoluer selon les offres : elles sont confirmées lors de l'ouverture du dossier au bureau.</p>

  <h2 id="confidentialite">Politique de confidentialité</h2>
  <h3>Quelles données collectons-nous ?</h3>
  <p>Selon le formulaire que vous remplissez : votre nom complet, votre numéro de téléphone (WhatsApp), votre situation de passeport, votre métier ou vos informations sportives (poste, licence, club), vos disponibilités pour être rappelé(e), et le message éventuel que vous nous écrivez. Nous enregistrons aussi les étapes que vous atteignez dans le parcours, de façon anonyme, pour améliorer le service.</p>
  <h3>Pourquoi ?</h3>
  <p>Uniquement pour traiter votre demande : vous rappeler, fixer votre rendez-vous au bureau et suivre votre dossier. Nous ne vendons pas vos données et ne les transmettons pas à des tiers à des fins commerciales.</p>
  <h3>Qui y a accès ?</h3>
  <p>Le personnel habilité de {LEGAL["nom"]} / {LEGAL["structure_voyage"]}, via un espace protégé. Les données sont stockées chez notre prestataire technique (Google Firebase).</p>
  <h3>Combien de temps ?</h3>
  <p>Le temps nécessaire au traitement de votre dossier, puis pendant la durée strictement utile à nos obligations. Vous pouvez demander leur suppression à tout moment.</p>
  <h3>Vos droits</h3>
  <p>Conformément à la loi ivoirienne n° 2013-450 relative à la protection des données à caractère personnel, vous pouvez demander l'accès, la rectification ou la suppression de vos données en nous contactant au {LEGAL["tel_bureau"]} ou en vous rendant au bureau ({LEGAL["adresse"]}). L'autorité de contrôle est l'ARTCI.</p>
  <p class="legal-maj">Dernière mise à jour : {LEGAL["maj"]}.</p>
</div></section>'''

def head(k, t, x):
    return r("page-head.html").format(kicker=k, titre=t, texte=x)

apropos_teaser = r("apropos.html").replace('href="#mission"', 'href="/a-propos"').replace("Découvrir notre approche →", "En savoir plus sur BIGBLU AFRICA →")
FORMS = '<script type="module" src="/js/contact.js"></script>'
PARC = '<script type="module" src="/js/parcours.js"></script>'

page("index.html", "BIGBLU AFRICA — Concevoir • Connecter • Développer • Réaliser",
     "BIGBLU AFRICA — Concevoir, connecter, développer et réaliser des opportunités d'affaires en Afrique.",
     r("accueil.html") + apropos_teaser + r("home-voyage.html") + r("mission.html") + r("partenaires.html"), "/", "voyages")
page("a-propos.html", "À propos — BIGBLU AFRICA", "Qui est BIGBLU AFRICA : identité, approche et équipe dirigeante.",
     head("À PROPOS", "Qui sommes-nous ?", "Une société ivoirienne de conception, de développement et de réalisation de projets.")
     + r("apropos.html").replace('<a class="link" href="#mission">Découvrir notre approche →</a>', "") + r("mission.html") + r("equipe.html") + trust_block(), "/a-propos")
page("domaines.html", "Nos domaines — BIGBLU AFRICA", "Les domaines d'intervention de BIGBLU AFRICA.",
     head("NOS DOMAINES", "Une approche multisectorielle.", "Des pôles complémentaires pour accompagner les opportunités et les projets.") + r("domaines.html"), "/domaines")
page("structures.html", "Nos structures — BIGBLU AFRICA", "VISION@AFRICA et BIGBLU PHARMA PASS, les pôles spécialisés de BIGBLU AFRICA.",
     head("NOS STRUCTURES", "Des pôles spécialisés.", "Des filiales et activités dédiées à l'intermédiation, au voyage et à la santé.") + r("structures.html"), "/structures")
page("voyage/index.html", "Voyage — Cap sur l'Albanie | VISION@FRICA", "Travail et football en Albanie avec VISION@FRICA : choisissez votre programme et laissez-vous guider.",
     r("v-hero.html") + r("v-entree.html"), "/voyage", "voyages")
page("mentions-legales.html", "Mentions légales et confidentialité — BIGBLU AFRICA", "Mentions légales et politique de confidentialité de BIGBLU AFRICA et VISION@FRICA.",
     head("INFORMATIONS LÉGALES", "Mentions légales et confidentialité", "Qui nous sommes, et comment nous protégeons vos informations.") + mentions_body(), "")
page("contact.html", "Contact — BIGBLU AFRICA", "Contactez BIGBLU AFRICA ou soumettez votre projet.",
     head("CONTACT", "Parlons de votre projet.", "Écrivez-nous ou présentez votre projet à BIGBLU AFRICA.") + r("contact.html") + r("soumettre.html"), "/contact", "", FORMS)
page("voyage/albanie/travail.html", "Travail en Albanie — VISION@FRICA", "Travail en Albanie avec VISION@FRICA : recherche de contrat, procédure, documents et inscription en ligne.",
     parcours("travail"), "/voyage", "voyages parcours", PARC)
page("voyage/albanie/football.html", "Football en Albanie — VISION@FRICA", "Centre de formation de football en Albanie : avantages, procédure, documents et inscription en ligne.",
     parcours("football"), "/voyage", "voyages parcours", PARC)
print("Pages générées.")
